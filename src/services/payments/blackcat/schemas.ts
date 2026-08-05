import { z } from "zod";

export const blackCatCreateSaleResponseSchema = z.object({
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
    paymentData: z
      .object({
        qrCode: z.string().min(1).optional(),
        qrCodeBase64: z.string().min(1).optional(),
        copyPaste: z.string().min(1).optional(),
        expiresAt: z.string().min(1).optional(),
      })
      .optional(),
  }),
});

export const blackCatTransactionStatusResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    transactionId: z.string().min(1),
    status: z.enum(["PENDING", "PAID", "CANCELLED", "REFUNDED"]),
    paymentMethod: z.string().min(1),
    amount: z.number().int().nonnegative(),
    netAmount: z.number().int().nonnegative(),
    fees: z.number().int().nonnegative(),
    paidAt: z.string().min(1).optional(),
    endToEndId: z.string().min(1).optional(),
  }),
});

export type BlackCatCreateSaleResponseFromSchema = z.infer<
  typeof blackCatCreateSaleResponseSchema
>;

export type BlackCatTransactionStatusResponseFromSchema = z.infer<
  typeof blackCatTransactionStatusResponseSchema
>;
