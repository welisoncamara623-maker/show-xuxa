import { NextResponse } from "next/server";
import { z } from "zod";

const webhookHeadersSchema = z.object({
  event: z.string().min(1),
  source: z.literal("blackcat-api"),
});

const webhookBodySchema = z.object({
  event: z.string().min(1),
  timestamp: z.string().min(1),
  transactionId: z.string().min(1).optional(),
  status: z.string().min(1).optional(),
  amount: z.number().int().nonnegative().optional(),
});

export async function POST(request: Request) {
  const headers = webhookHeadersSchema.safeParse({
    event: request.headers.get("X-Webhook-Event"),
    source: request.headers.get("X-Webhook-Source"),
  });

  if (!headers.success) {
    return NextResponse.json(
      { success: false, error: "INVALID_WEBHOOK_HEADERS" },
      { status: 400 }
    );
  }

  const body = await request.json().catch(() => null);
  const parsedBody = webhookBodySchema.safeParse(body);

  if (!parsedBody.success) {
    return NextResponse.json(
      { success: false, error: "INVALID_WEBHOOK_BODY" },
      { status: 400 }
    );
  }

  // A confirmação real será consultada no checkout pelo status da transação.
  return NextResponse.json({ success: true }, { status: 200 });
}
