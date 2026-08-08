import { NextResponse } from "next/server";
import { z } from "zod";

import { getShowById } from "@/data/shows";
import { calculateInsuranceAmount, calculateTicketSubtotal } from "@/lib/ticket-calculations";
import { getSelectedTicketLines } from "@/lib/checkout-calculations";
import {
  sendPurchaseConfirmationEmail,
  type SendPurchaseConfirmationResult,
} from "@/services/email/send-purchase-confirmation";
import { getBlackCatPixPaymentStatus } from "@/services/payments/blackcat/get-payment";

export const runtime = "nodejs";

const confirmCheckoutRequestSchema = z.object({
  orderId: z.string().min(1),
  transactionId: z.string().min(1),
  customerEmail: z.string().email(),
  selectedProtection: z.enum(["ticket-only", "ticket-with-insurance"]),
  selectedQuantities: z.record(z.string(), z.number().int().nonnegative()),
});

type CheckoutConfirmRouteContext = {
  params: Promise<{
    slug: string;
  }>;
};

export async function POST(request: Request, context: CheckoutConfirmRouteContext) {
  const { slug } = await context.params;
  const show = getShowById(slug);

  if (!show) {
    return NextResponse.json(
      { paymentConfirmed: false, emailSent: false, error: "SHOW_NOT_FOUND" },
      { status: 404 }
    );
  }

  const body = await request.json().catch(() => null);
  const parsedBody = confirmCheckoutRequestSchema.safeParse(body);

  if (!parsedBody.success) {
    return NextResponse.json(
      { paymentConfirmed: false, emailSent: false, error: "INVALID_PAYLOAD" },
      { status: 400 }
    );
  }

  const payment = await getBlackCatPixPaymentStatus(parsedBody.data.transactionId);

  if (payment.status !== "paid") {
    return NextResponse.json(
      {
        paymentConfirmed: false,
        emailSent: false,
        error: "PAYMENT_NOT_PAID",
      },
      { status: 409 }
    );
  }

  const selectedLines = getSelectedTicketLines(
    show.tickets,
    parsedBody.data.selectedQuantities
  );

  if (selectedLines.length <= 0) {
    return NextResponse.json(
      {
        paymentConfirmed: false,
        emailSent: false,
        error: "EMPTY_CART",
      },
      { status: 400 }
    );
  }

  const ticketSubtotalInCents = calculateTicketSubtotal(
    show.tickets,
    parsedBody.data.selectedQuantities
  );
  const insuranceInCents =
    parsedBody.data.selectedProtection === "ticket-with-insurance"
      ? calculateInsuranceAmount(ticketSubtotalInCents)
      : 0;
  const finalTotalInCents = ticketSubtotalInCents + insuranceInCents;

  if (payment.amountInCents !== finalTotalInCents) {
    return NextResponse.json(
      {
        paymentConfirmed: false,
        emailSent: false,
        error: "AMOUNT_MISMATCH",
      },
      { status: 409 }
    );
  }

  let emailResult: SendPurchaseConfirmationResult = {
    success: false as const,
    reason: "RESEND_ERROR" as const,
  };

  try {
    emailResult = await sendPurchaseConfirmationEmail({
      orderId: parsedBody.data.orderId,
      customerEmail: parsedBody.data.customerEmail,
      eventName: show.eventName,
      city: show.city,
      venue: show.stadium,
      eventDate: `${show.card.date} ${show.card.month} ${show.card.year}`,
      eventTime: `${show.card.weekDay} ${show.card.hour}`,
      items: selectedLines.map((line) => ({
        sector: line.sector,
        category: line.category,
        quantity: line.quantity,
        unitPriceInCents: line.unitPriceInCents,
        lineTotalInCents: line.lineTotalInCents,
      })),
      protectionLabel:
        parsedBody.data.selectedProtection === "ticket-with-insurance"
          ? "Seguro Ingresso Protegido"
          : "Somente ingressos",
      insuranceInCents,
      finalTotalInCents,
    });
  } catch (error) {
    console.warn("[checkout-confirm] email confirmation failed", {
      orderId: parsedBody.data.orderId,
      reason: error instanceof Error ? error.message : "unknown_error",
    });
  }

  const completedAt = new Date().toISOString();

  return NextResponse.json(
    {
      paymentConfirmed: true,
      emailSent: emailResult.success,
      order: {
        id: parsedBody.data.orderId,
        showId: show.id,
        customerEmail: parsedBody.data.customerEmail,
        items: selectedLines.map((line) => ({
          ticketId: line.ticketId,
          sector: line.sector,
          category: line.category,
          quantity: line.quantity,
          unitPriceInCents: line.unitPriceInCents,
          lineTotalInCents: line.lineTotalInCents,
        })),
        protection: parsedBody.data.selectedProtection,
        ticketSubtotalInCents,
        insuranceInCents,
        finalTotalInCents,
        transactionId: parsedBody.data.transactionId,
        completedAt,
        emailStatus: emailResult.success ? "sent" : "unknown",
      },
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}
