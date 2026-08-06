import QRCode from "qrcode";

import type { BlackCatCreateSaleResponseFromSchema } from "./schemas";
import type { PixPayment } from "./types";

const PIX_EXPIRATION_MINUTES = 15;
const PIX_EXPIRATION_MS = PIX_EXPIRATION_MINUTES * 60 * 1000;

type BlackCatCreateSaleSuccessResponse = Extract<
  BlackCatCreateSaleResponseFromSchema,
  { success: true }
>;

function normalizeOptionalString(value: string | null | undefined) {
  const normalized = value?.trim();

  return normalized ? normalized : undefined;
}

function normalizeQrCodeImage(
  paymentData: BlackCatCreateSaleSuccessResponse["data"]["paymentData"]
) {
  if (!paymentData) {
    return undefined;
  }

  const qrCodeBase64 = normalizeOptionalString(paymentData.qrCodeBase64);

  if (qrCodeBase64) {
    return qrCodeBase64;
  }

  if (paymentData.qrCode?.startsWith("data:")) {
    return paymentData.qrCode;
  }

  return undefined;
}

async function generateQrCodeImage(copyPasteCode: string) {
  return QRCode.toDataURL(copyPasteCode, {
    errorCorrectionLevel: "M",
    margin: 1,
    scale: 8,
  });
}

function buildFallbackExpiration() {
  return new Date(Date.now() + PIX_EXPIRATION_MS).toISOString();
}

export async function normalizeBlackCatPixPayment(
  response: BlackCatCreateSaleSuccessResponse
): Promise<PixPayment> {
  const paymentData = response.data.paymentData;
  const copyPasteCode = normalizeOptionalString(
    paymentData?.copyPaste
  );
  const qrCodeImage =
    normalizeQrCodeImage(paymentData) ??
    (copyPasteCode ? await generateQrCodeImage(copyPasteCode) : undefined);

  return {
    provider: "blackcat",
    providerPaymentId: response.data.transactionId,
    transactionId: response.data.transactionId,
    status:
      response.data.status === "PAID"
        ? "paid"
        : response.data.status === "CANCELLED"
          ? "expired"
          : "pending",
    amountInCents: response.data.amount,
    copyPasteCode: copyPasteCode ?? "",
    qrCodeImage,
    qrCodeBase64: qrCodeImage,
    expiresAt:
      normalizeOptionalString(paymentData?.expiresAt) ?? buildFallbackExpiration(),
  };
}
