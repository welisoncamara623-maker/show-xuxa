import "server-only";

import { z } from "zod";

import { blackCatFetchJson } from "./blackcat-client";
import { BlackCatResponseValidationError } from "./errors";
import {
  blackCatCreateSaleResponseSchema,
  type BlackCatCreateSaleResponseFromSchema,
} from "./schemas";
import type {
  BlackCatCreatePixCustomer,
  BlackCatCreateSaleRequest,
  CreatePixPaymentInput,
  PixPayment,
} from "./types";

const DEFAULT_PIX_EXPIRES_IN_DAYS = 2;

const createPixPaymentInputSchema = z.object({
  orderId: z.string().min(1),
  customer: z.object({
    email: z.string().email(),
    name: z.string().min(1).optional(),
    phone: z.string().min(1).optional(),
    document: z
      .object({
        number: z.string().min(1),
        type: z.enum(["cpf", "cnpj"]),
      })
      .optional(),
  }),
  amountInCents: z.number().int().positive(),
  description: z.string().min(1),
  items: z
    .array(
      z.object({
        title: z.string().min(1),
        unitPriceInCents: z.number().int().positive(),
        quantity: z.number().int().positive(),
        tangible: z.boolean().optional(),
      })
    )
    .min(1),
  postbackUrl: z.string().url(),
  expiresInDays: z.number().int().positive().optional(),
});

function mapStatus(status: BlackCatCreateSaleResponseFromSchema["data"]["status"]): PixPayment["status"] {
  if (status === "PAID") {
    return "paid";
  }

  if (status === "CANCELLED") {
    return "expired";
  }

  return "pending";
}

function buildFallbackCustomerName(email: string) {
  const localPart = email.split("@")[0]?.replace(/[._-]+/g, " ").trim();

  if (!localPart) {
    return "Cliente do evento";
  }

  return localPart
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word[0]?.toUpperCase() + word.slice(1))
    .join(" ");
}

function normalizeDigits(value: string) {
  return value.replace(/\D/g, "");
}

function buildCpfBase(seed: string) {
  const digits = normalizeDigits(seed);
  const padded = `${digits}00000000000`.slice(0, 9);
  const numbers = padded.split("").map(Number);

  const firstCheckDigit =
    ((numbers.reduce((sum, digit, index) => sum + digit * (10 - index), 0) * 10) %
      11) %
    10;
  const secondNumbers = [...numbers, firstCheckDigit];
  const secondCheckDigit =
    ((secondNumbers.reduce((sum, digit, index) => sum + digit * (11 - index), 0) *
      10) %
      11) %
    10;

  return `${padded}${firstCheckDigit}${secondCheckDigit}`;
}

function buildFallbackCustomer(
  email: string,
  orderId: string
): BlackCatCreatePixCustomer {
  const phoneDigits = normalizeDigits(orderId).padEnd(11, "9").slice(0, 11);

  return {
    name: buildFallbackCustomerName(email),
    email,
    phone: phoneDigits,
    document: {
      number: buildCpfBase(orderId),
      type: "cpf",
    },
  };
}

export async function createBlackCatPixPayment(
  input: CreatePixPaymentInput
): Promise<PixPayment> {
  const parsedInput = createPixPaymentInputSchema.parse(input);
  const customer = buildFallbackCustomer(
    parsedInput.customer.email,
    parsedInput.orderId
  );

  const requestBody: BlackCatCreateSaleRequest = {
    amount: parsedInput.amountInCents,
    currency: "BRL",
    paymentMethod: "pix",
    items: parsedInput.items.map((item) => ({
      title: item.title,
      unitPrice: item.unitPriceInCents,
      quantity: item.quantity,
      tangible: item.tangible ?? false,
    })),
    customer: {
      ...customer,
      name: parsedInput.customer.name ?? customer.name,
      phone: parsedInput.customer.phone ?? customer.phone,
      document: parsedInput.customer.document ?? customer.document,
    },
    pix: {
      expiresInDays: parsedInput.expiresInDays ?? DEFAULT_PIX_EXPIRES_IN_DAYS,
    },
    postbackUrl: parsedInput.postbackUrl,
    metadata: parsedInput.description,
    externalRef: parsedInput.orderId,
  };

  const rawResponse: unknown = await blackCatFetchJson<unknown>(
    "/sales/create-sale",
    {
      method: "POST",
      body: JSON.stringify(requestBody),
    }
  );

  const parsedResponse = blackCatCreateSaleResponseSchema.safeParse(rawResponse);

  if (!parsedResponse.success) {
    throw new BlackCatResponseValidationError(
      "A resposta da BlackCat não corresponde ao contrato esperado."
    );
  }

  const paymentData = parsedResponse.data.data.paymentData;

  return {
    provider: "blackcat",
    providerPaymentId: parsedResponse.data.data.transactionId,
    status: mapStatus(parsedResponse.data.data.status),
    amountInCents: parsedResponse.data.data.amount,
    copyPasteCode: paymentData?.copyPaste ?? "",
    qrCodeImageUrl: paymentData?.qrCode,
    qrCodeBase64: paymentData?.qrCodeBase64,
    expiresAt: paymentData?.expiresAt,
  };
}
