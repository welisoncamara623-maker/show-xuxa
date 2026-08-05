import "server-only";

import { blackCatFetchJson } from "./blackcat-client";
import { BlackCatResponseValidationError } from "./errors";
import { blackCatTransactionStatusResponseSchema } from "./schemas";
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

export async function getBlackCatPixPaymentStatus(
  transactionId: string
): Promise<PixPaymentStatusResponse> {
  const rawResponse = await blackCatFetchJson<unknown>(
    `/sales/${transactionId}/status`,
    {
      method: "GET",
    }
  );

  const parsedResponse =
    blackCatTransactionStatusResponseSchema.safeParse(rawResponse);

  if (!parsedResponse.success) {
    throw new BlackCatResponseValidationError(
      "A resposta de status da BlackCat não corresponde ao contrato esperado."
    );
  }

  return {
    provider: "blackcat",
    providerPaymentId: parsedResponse.data.data.transactionId,
    status: mapStatus(parsedResponse.data.data.status),
    amountInCents: parsedResponse.data.data.amount,
    paidAt: parsedResponse.data.data.paidAt,
    endToEndId: parsedResponse.data.data.endToEndId,
  };
}
