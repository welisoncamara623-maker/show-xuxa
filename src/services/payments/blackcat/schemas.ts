import { z } from "zod";

const blackCatPaymentDataSchema = z.object({
  qrCode: z.string().min(1).optional(),
  qrCodeBase64: z.string().nullable().optional(),
  copyPaste: z.string().trim().min(1),
  expiresAt: z.string().nullable().optional(),
});

const blackCatCreateSaleSuccessSchema = z.object({
  success: z.literal(true),
  data: z.object({
    transactionId: z.string().min(1),
    status: z.enum(["PENDING", "PAID", "CANCELLED"]),
    paymentMethod: z.string().min(1),
    amount: z.number().int().nonnegative(),
    netAmount: z.number().int().nonnegative(),
    fees: z.number().int().nonnegative(),
    invoiceUrl: z.string().url().optional(),
    createdAt: z.string().min(1),
    paymentData: blackCatPaymentDataSchema.optional(),
  }),
});

const blackCatCreateSaleErrorSchema = z.object({
  success: z.literal(false),
  message: z.string().min(1),
  error: z.string().min(1).optional(),
  code: z.string().min(1).optional(),
});

export const blackCatCreateSaleResponseSchema = z.discriminatedUnion("success", [
  blackCatCreateSaleSuccessSchema,
  blackCatCreateSaleErrorSchema,
]);

export const blackCatPaymentStatusResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    transactionId: z.string().min(1),
    status: z.enum(["PENDING", "PAID", "CANCELLED", "REFUNDED"]),
    paymentMethod: z.string().min(1),
    amount: z.number().int().nonnegative(),
    netAmount: z.number().int().nonnegative(),
    fees: z.number().int().nonnegative(),
    paidAt: z.string().nullable().optional(),
    endToEndId: z.string().nullable().optional(),
  }),
});

export const blackCatTransactionStatusResponseSchema =
  blackCatPaymentStatusResponseSchema;

export type BlackCatCreateSaleResponseFromSchema = z.infer<
  typeof blackCatCreateSaleResponseSchema
>;

export type BlackCatTransactionStatusResponseFromSchema = z.infer<
  typeof blackCatPaymentStatusResponseSchema
>;
