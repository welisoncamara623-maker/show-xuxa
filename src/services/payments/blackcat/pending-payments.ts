import type { PixPayment } from "./types";

type PendingPixPaymentRecord = {
  checkoutKey: string;
  orderId: string;
  payment: PixPayment;
  createdAt: string;
};

const pendingPayments = new Map<string, PendingPixPaymentRecord>();

function parseExpiration(value: string | undefined) {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  return Number.isFinite(date.getTime()) ? date : null;
}

function isReusablePayment(payment: PixPayment) {
  const expiresAt = parseExpiration(payment.expiresAt);

  if (!expiresAt) {
    return false;
  }

  return expiresAt.getTime() > Date.now();
}

export function findReusablePendingPixPayment(checkoutKey: string) {
  const record = pendingPayments.get(checkoutKey);

  if (!record) {
    return null;
  }

  if (!isReusablePayment(record.payment)) {
    pendingPayments.delete(checkoutKey);
    return null;
  }

  return record;
}

export function storePendingPixPayment(record: PendingPixPaymentRecord) {
  pendingPayments.set(record.checkoutKey, record);
  return record;
}

export function clearPendingPixPayment(checkoutKey: string) {
  pendingPayments.delete(checkoutKey);
}
