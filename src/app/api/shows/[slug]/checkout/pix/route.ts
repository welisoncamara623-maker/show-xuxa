import { randomUUID } from "crypto";

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
import { getBlackCatPixPaymentStatus } from "@/services/payments/blackcat/get-payment";

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
    expiresInDays: 2,
  });

  return NextResponse.json(
    {
      success: true,
      data: {
        orderId,
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
}
