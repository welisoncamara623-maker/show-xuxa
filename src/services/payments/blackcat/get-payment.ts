import "server-only";

import { blackCatFetchJson } from "./blackcat-client";
import { BlackCatResponseValidationError } from "./errors";
import { blackCatPaymentStatusResponseSchema } from "./schemas";
import type { PixPaymentStatusResponse } from "./types";

function mapStatus(
  status: "PENDING" | "PAID" | "CANCELLED" | "REFUNDED"
): PixPaymentStatusResponse["status"] {
  if (status === "PAID") {
    return "paid";
  }

  if (status === "CANCELLED") {
    return "expired";
  }

  if (status === "REFUNDED") {
    return "refunded";
  }

  return "pending";
}

function normalizeOptionalString(value: string | null | undefined) {
  const normalized = value?.trim();

  return normalized ? normalized : undefined;
}

function describeStatusResponse(value: unknown) {
  if (!value || typeof value !== "object") {
    return {
      type: typeof value,
      hasData: false,
    };
  }

  const record = value as Record<string, unknown>;
  const data = record.data;

  if (!data || typeof data !== "object") {
    return {
      success: record.success,
      hasData: false,
    };
  }

  const dataRecord = data as Record<string, unknown>;

  return {
    success: record.success,
    hasData: true,
    dataKeys: Object.keys(dataRecord),
    status: dataRecord.status,
    hasPaidAt: dataRecord.paidAt !== undefined && dataRecord.paidAt !== null,
    hasEndToEndId:
      dataRecord.endToEndId !== undefined && dataRecord.endToEndId !== null,
  };
}

export async function getBlackCatPixPaymentStatus(
  transactionId: string
): Promise<PixPaymentStatusResponse> {
  const rawResponse = await blackCatFetchJson<unknown>(
    `sales/${transactionId}/status`,
    {
      method: "GET",
    }
  );

  console.info("[blackcat] status response", describeStatusResponse(rawResponse));

  const parsedResponse =
    blackCatPaymentStatusResponseSchema.safeParse(rawResponse);

  if (!parsedResponse.success) {
    console.warn("[blackcat] invalid status response", {
      response: describeStatusResponse(rawResponse),
      issues: parsedResponse.error.issues.map((issue) => ({
        path: issue.path.join("."),
        code: issue.code,
      })),
    });

    throw new BlackCatResponseValidationError(
      "A resposta de status da BlackCat não corresponde ao contrato esperado."
    );
  }

  const payment = parsedResponse.data.data;

  return {
    provider: "blackcat",
    providerPaymentId: payment.transactionId,
    transactionId: payment.transactionId,
    status: mapStatus(payment.status),
    amountInCents: payment.amount,
    paidAt: normalizeOptionalString(payment.paidAt),
    endToEndId: normalizeOptionalString(payment.endToEndId),
  };
}
