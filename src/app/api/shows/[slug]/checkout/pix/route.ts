import { createHash, randomUUID } from "crypto";

import { NextResponse } from "next/server";
import { z } from "zod";

import { getShowById } from "@/data/shows";
import {
  calculateFinalTotal,
  calculateInsuranceAmount,
  calculateTicketSubtotal,
} from "@/lib/ticket-calculations";
import { getSelectedTicketLines } from "@/lib/checkout-calculations";
import { createBlackCatPixPayment } from "@/services/payments/blackcat/create-pix-payment";
import { BlackCatResponseValidationError } from "@/services/payments/blackcat/errors";
import { getBlackCatPixPaymentStatus } from "@/services/payments/blackcat/get-payment";
import {
  findReusablePendingPixPayment,
  storePendingPixPayment,
} from "@/services/payments/blackcat/pending-payments";
import type { PixPayment } from "@/services/payments/blackcat/types";

const checkoutPixRequestSchema = z.object({
  customerEmail: z.string().email(),
  selectedProtection: z.enum(["ticket-only", "ticket-with-insurance"]),
  selectedQuantities: z.record(z.string(), z.number().int().nonnegative()),
});

type CheckoutPixRouteContext = {
  params: Promise<{
    slug: string;
  }>;
};

type CreatePixCheckoutResponse = {
  orderId: string;
  paymentId: string;
  transactionId: string;
  status: "pending";
  amountInCents: number;
  copyPasteCode: string;
  qrCodeImage: string;
  expiresAt: string;
};

function normalizeSelectedQuantities(
  selectedQuantities: Record<string, number>
) {
  return Object.entries(selectedQuantities)
    .filter(([, quantity]) => quantity > 0)
    .sort(([leftTicketId], [rightTicketId]) =>
      leftTicketId.localeCompare(rightTicketId)
    );
}

function buildCheckoutKey(
  showId: string,
  customerEmail: string,
  selectedProtection: string,
  selectedQuantities: Record<string, number>
) {
  const signature = JSON.stringify({
    showId,
    customerEmail: customerEmail.trim().toLowerCase(),
    selectedProtection,
    selectedQuantities: normalizeSelectedQuantities(selectedQuantities),
  });

  return createHash("sha256").update(signature).digest("hex");
}

function buildCreatePixCheckoutResponse(
  orderId: string,
  payment: PixPayment
): CreatePixCheckoutResponse {
  return {
    orderId,
    paymentId: payment.providerPaymentId,
    transactionId: payment.transactionId,
    status: "pending",
    amountInCents: payment.amountInCents,
    copyPasteCode: payment.copyPasteCode,
    qrCodeImage: payment.qrCodeImage ?? payment.qrCodeBase64 ?? "",
    expiresAt:
      payment.expiresAt ?? new Date(Date.now() + 15 * 60 * 1000).toISOString(),
  };
}

function buildStatusUrl(request: Request, slug: string, transactionId: string) {
  const url = new URL(request.url);
  url.pathname = `/api/shows/${slug}/checkout/pix`;
  url.searchParams.set("transactionId", transactionId);
  return url.toString();
}

function buildWebhookUrl(request: Request) {
  return new URL("/api/payments/blackcat/webhook", request.url).toString();
}

export async function POST(request: Request, context: CheckoutPixRouteContext) {
  const { slug } = await context.params;
  const show = getShowById(slug);

  if (!show) {
    return NextResponse.json(
      { success: false, error: "SHOW_NOT_FOUND" },
      { status: 404 }
    );
  }

  const body = await request.json().catch(() => null);
  const parsedBody = checkoutPixRequestSchema.safeParse(body);

  if (!parsedBody.success) {
    return NextResponse.json(
      { success: false, error: "INVALID_PAYLOAD" },
      { status: 400 }
    );
  }

  const selectedLines = getSelectedTicketLines(
    show.tickets,
    parsedBody.data.selectedQuantities
  );

  if (selectedLines.length <= 0) {
    return NextResponse.json(
      { success: false, error: "EMPTY_CART" },
      { status: 400 }
    );
  }

  const ticketSubtotalInCents = calculateTicketSubtotal(
    show.tickets,
    parsedBody.data.selectedQuantities
  );
  const insuranceAmountInCents =
    parsedBody.data.selectedProtection === "ticket-with-insurance"
      ? calculateInsuranceAmount(ticketSubtotalInCents)
      : 0;
  const finalTotalInCents = calculateFinalTotal(
    ticketSubtotalInCents,
    parsedBody.data.selectedProtection
  );

  const checkoutKey = buildCheckoutKey(
    slug,
    parsedBody.data.customerEmail,
    parsedBody.data.selectedProtection,
    parsedBody.data.selectedQuantities
  );
  const existingPayment = findReusablePendingPixPayment(checkoutKey);

  if (existingPayment) {
    return NextResponse.json(
      {
        success: true,
        data: {
          ...buildCreatePixCheckoutResponse(
            existingPayment.orderId,
            existingPayment.payment
          ),
          payment: existingPayment.payment,
          ticketSubtotalInCents,
          insuranceAmountInCents,
          finalTotalInCents,
          statusUrl: buildStatusUrl(
            request,
            slug,
            existingPayment.payment.providerPaymentId
          ),
        },
      },
      {
        status: 201,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  }

  const orderId = randomUUID();
  const webhookUrl = buildWebhookUrl(request);
  const payment = await createBlackCatPixPayment({
    orderId,
    customer: {
      email: parsedBody.data.customerEmail.trim().toLowerCase(),
    },
    amountInCents: finalTotalInCents,
    description: `${show.eventName} - ${show.city}`,
    items: [
      ...selectedLines.map((line) => ({
        title: `${line.sector} - ${line.category}`,
        unitPriceInCents: line.unitPriceInCents,
        quantity: line.quantity,
        tangible: false,
      })),
      ...(insuranceAmountInCents > 0
        ? [
            {
              title: "Seguro Ingresso Protegido",
              unitPriceInCents: insuranceAmountInCents,
              quantity: 1,
              tangible: false,
            },
          ]
        : []),
    ],
    postbackUrl: webhookUrl,
  });

  const responseData = buildCreatePixCheckoutResponse(orderId, payment);

  storePendingPixPayment({
    checkoutKey,
    orderId,
    payment,
    createdAt: new Date().toISOString(),
  });

  return NextResponse.json(
    {
      success: true,
      data: {
        ...responseData,
        payment,
        ticketSubtotalInCents,
        insuranceAmountInCents,
        finalTotalInCents,
        statusUrl: buildStatusUrl(request, slug, payment.providerPaymentId),
      },
    },
    {
      status: 201,
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}

export async function GET(request: Request, context: CheckoutPixRouteContext) {
  const { slug } = await context.params;
  const show = getShowById(slug);

  if (!show) {
    return NextResponse.json(
      { success: false, error: "SHOW_NOT_FOUND" },
      { status: 404 }
    );
  }

  const url = new URL(request.url);
  const transactionId = url.searchParams.get("transactionId");

  if (!transactionId) {
    return NextResponse.json(
      { success: false, error: "MISSING_TRANSACTION_ID" },
      { status: 400 }
    );
  }

  try {
    const payment = await getBlackCatPixPaymentStatus(transactionId);

    return NextResponse.json(
      {
        success: true,
        data: payment,
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    const isValidationError = error instanceof BlackCatResponseValidationError;

    return NextResponse.json(
      {
        success: false,
        error: isValidationError
          ? "BLACKCAT_STATUS_RESPONSE_INVALID"
          : "BLACKCAT_STATUS_UNAVAILABLE",
      },
      {
        status: 502,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  }
}
