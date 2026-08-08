import "server-only";

import { getResendConfig } from "./resend/config";
import { getResendClient } from "./resend/resend-client";
import { renderPurchaseConfirmationEmailHtml } from "./render-purchase-confirmation-email";

export type SendPurchaseConfirmationInput = {
  orderId: string;
  customerEmail: string;
  customerName?: string;
  eventName: string;
  city: string;
  venue: string;
  eventDate: string;
  eventTime: string;
  items: Array<{
    sector: string;
    category: string;
    quantity: number;
    unitPriceInCents: number;
    lineTotalInCents: number;
  }>;
  protectionLabel: string;
  insuranceInCents: number;
  finalTotalInCents: number;
};

export type SendPurchaseConfirmationResult =
  | {
      success: true;
      emailId: string;
    }
  | {
      success: false;
      reason: "RESEND_ERROR";
    };

function getResendErrorDetails(error: unknown) {
  if (!error || typeof error !== "object") {
    return {
      message: "unknown_error",
      code: undefined as string | undefined,
    };
  }

  const record = error as {
    message?: unknown;
    code?: unknown;
    statusCode?: unknown;
  };

  const message =
    typeof record.message === "string" && record.message.trim()
      ? record.message.trim()
      : "unknown_error";

  const code =
    typeof record.code === "string" && record.code.trim()
      ? record.code.trim()
      : typeof record.statusCode === "string" && record.statusCode.trim()
        ? record.statusCode.trim()
        : typeof record.statusCode === "number"
          ? `HTTP_${record.statusCode}`
          : undefined;

  return {
    message,
    code,
  };
}

export async function sendPurchaseConfirmationEmail(
  input: SendPurchaseConfirmationInput
): Promise<SendPurchaseConfirmationResult> {
  try {
    const resend = getResendClient();
    const { fromEmail } = getResendConfig();
    const html = await renderPurchaseConfirmationEmailHtml(input);

    const { data, error } = await resend.emails.send(
      {
        from: fromEmail,
        to: [input.customerEmail],
        subject: "Compra confirmada — Xuxa Tour 2026",
        html,
      },
      {
        idempotencyKey: `purchase-confirmation/${input.orderId}`,
      }
    );

    if (error || !data?.id) {
      const errorDetails = getResendErrorDetails(error);

      console.warn("[resend] purchase confirmation email failed", {
        orderId: input.orderId,
        message: errorDetails.message,
        code: errorDetails.code ?? "missing_email_id",
      });
      return {
        success: false,
        reason: "RESEND_ERROR",
      };
    }

    return {
      success: true,
      emailId: data.id,
    };
  } catch (error) {
    const errorDetails = getResendErrorDetails(error);

    console.warn("[resend] purchase confirmation email exception", {
      orderId: input.orderId,
      message: errorDetails.message,
      code: errorDetails.code ?? "unknown_error",
    });
    return {
      success: false,
      reason: "RESEND_ERROR",
    };
  }
}
