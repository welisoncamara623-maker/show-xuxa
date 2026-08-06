"use client";

/* eslint-disable react-hooks/set-state-in-effect */

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Check,
  Copy,
  LoaderCircle,
  QrCode,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";

import { SectionTitle } from "@/components/SectionTitle";
import type { TicketOption } from "@/data/shows";
import { type ProtectionOption } from "@/lib/ticket-calculations";
import { getSelectedTicketLines } from "@/lib/checkout-calculations";
import type {
  PixPayment,
  PixPaymentStatusResponse,
} from "@/services/payments/blackcat/types";

import { PixExpirationTimer } from "./PixExpirationTimer";

type PixCheckoutSectionProps = {
  showId: string;
  customerEmail: string;
  selectedProtection: ProtectionOption;
  selectedQuantities: Record<string, number>;
  tickets: TicketOption[];
  onPaymentConfirmed: () => Promise<boolean> | boolean;
};

type PixCheckoutStatus =
  | "creating"
  | "pending"
  | "paid"
  | "expired"
  | "cancelled"
  | "refunded"
  | "error";

type CreatePixCheckoutResponse = {
  orderId: string;
  paymentId: string;
  transactionId: string;
  status: "pending";
  amountInCents: number;
  copyPasteCode: string;
  qrCodeImage: string;
  expiresAt: string;
};

type CreatePixCheckoutResponseData = CreatePixCheckoutResponse & {
  payment?: PixPayment;
  ticketSubtotalInCents: number;
  insuranceAmountInCents: number;
  finalTotalInCents: number;
  statusUrl: string;
};

type CreatePixCheckoutApiResponse = {
  success: boolean;
  data?: CreatePixCheckoutResponseData;
  error?: string;
};

type StoredPixCheckout = {
  checkoutKey: string;
  payment: PixPayment;
};

const PIX_STORAGE_PREFIX = "show-da-xuxa:pix-checkout";

function parseValidDate(
  value: string | number | Date | null | undefined
): Date | null {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const date = value instanceof Date ? value : new Date(value);

  return Number.isFinite(date.getTime()) ? date : null;
}

function mapPaymentStatusLabel(status: PixCheckoutStatus) {
  if (status === "paid") {
    return "Pagamento confirmado";
  }

  if (status === "expired") {
    return "Pix expirado";
  }

  if (status === "refunded") {
    return "Pagamento estornado";
  }

  if (status === "cancelled") {
    return "Pagamento cancelado";
  }

  if (status === "error") {
    return "Falha no Pix";
  }

  return "Aguardando pagamento";
}

function mapPixStatusToCheckoutStatus(
  status: PixPayment["status"]
): PixCheckoutStatus {
  if (status === "paid") {
    return "paid";
  }

  if (status === "expired") {
    return "expired";
  }

  if (status === "refunded") {
    return "refunded";
  }

  if (status === "failed") {
    return "error";
  }

  return "pending";
}

function normalizeSelectedQuantities(
  selectedQuantities: Record<string, number>
) {
  return Object.entries(selectedQuantities)
    .filter(([, quantity]) => quantity > 0)
    .sort(([leftTicketId], [rightTicketId]) =>
      leftTicketId.localeCompare(rightTicketId)
    );
}

function buildCheckoutKey(
  showId: string,
  customerEmail: string,
  selectedProtection: ProtectionOption,
  selectedQuantities: Record<string, number>
) {
  return JSON.stringify({
    showId,
    customerEmail: customerEmail.trim().toLowerCase(),
    selectedProtection,
    selectedQuantities: normalizeSelectedQuantities(selectedQuantities),
  });
}

function storageKey(checkoutKey: string) {
  return `${PIX_STORAGE_PREFIX}:${btoa(checkoutKey)}`;
}

function isExpiredAt(expiresAt: string | undefined) {
  const date = parseValidDate(expiresAt);

  if (!date) {
    return true;
  }

  return date.getTime() <= Date.now();
}

function buildPaymentFromResponse(
  response: CreatePixCheckoutResponseData
): PixPayment {
  const payment = response.payment;

  if (payment) {
    return payment;
  }

  return {
    provider: "blackcat",
    providerPaymentId: response.paymentId,
    transactionId: response.transactionId,
    status: response.status,
    amountInCents: response.amountInCents,
    copyPasteCode: response.copyPasteCode,
    qrCodeImage: response.qrCodeImage,
    qrCodeBase64: response.qrCodeImage,
    expiresAt: response.expiresAt,
  };
}

function readStoredCheckout(checkoutKey: string) {
  if (typeof window === "undefined") {
    return null;
  }

  const rawValue = window.localStorage.getItem(storageKey(checkoutKey));

  if (!rawValue) {
    return null;
  }

  try {
    const parsed = JSON.parse(rawValue) as Partial<StoredPixCheckout>;

    if (!parsed.checkoutKey || !parsed.payment) {
      return null;
    }

    if (parsed.checkoutKey !== checkoutKey) {
      return null;
    }

    return {
      checkoutKey: parsed.checkoutKey,
      payment: parsed.payment,
    } satisfies StoredPixCheckout;
  } catch {
    return null;
  }
}

function saveStoredCheckout(checkoutKey: string, payment: PixPayment) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(
    storageKey(checkoutKey),
    JSON.stringify({
      checkoutKey,
      payment,
    } satisfies StoredPixCheckout)
  );
}

function clearStoredCheckout(checkoutKey: string) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(storageKey(checkoutKey));
}

export function PixCheckoutSection({
  showId,
  customerEmail,
  selectedProtection,
  selectedQuantities,
  tickets,
  onPaymentConfirmed,
}: PixCheckoutSectionProps) {
  const [payment, setPayment] = useState<PixPayment | null>(null);
  const [checkoutStatus, setCheckoutStatus] =
    useState<PixCheckoutStatus>("creating");
  const [isHydrated, setIsHydrated] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isPolling, setIsPolling] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const onPaymentConfirmedRef = useRef(onPaymentConfirmed);
  const createRequestRef = useRef<AbortController | null>(null);
  const pollRequestRef = useRef<AbortController | null>(null);
  const currentTransactionIdRef = useRef<string | null>(null);
  const hasRequestedPixRef = useRef(false);
  const hasConfirmedPaymentRef = useRef(false);

  const selectedLines = useMemo(
    () => getSelectedTicketLines(tickets, selectedQuantities),
    [selectedQuantities, tickets]
  );

  const checkoutKey = useMemo(
    () =>
      buildCheckoutKey(
        showId,
        customerEmail,
        selectedProtection,
        selectedQuantities
      ),
    [customerEmail, selectedProtection, selectedQuantities, showId]
  );

  const statusLabel = mapPaymentStatusLabel(checkoutStatus);
  const isLoadingState = checkoutStatus === "creating" && !payment;
  const canCopyPayment =
    Boolean(payment?.copyPasteCode) &&
    checkoutStatus !== "expired" &&
    checkoutStatus !== "cancelled" &&
    checkoutStatus !== "refunded";

  useEffect(() => {
    onPaymentConfirmedRef.current = onPaymentConfirmed;
  }, [onPaymentConfirmed]);

  useEffect(() => {
    setPayment(null);
    setCheckoutStatus("creating");
    setErrorMessage(null);
    setAnnouncement(null);
    setCopied(false);
    setIsCreating(false);
    setIsPolling(false);
    currentTransactionIdRef.current = null;
    hasRequestedPixRef.current = false;
    hasConfirmedPaymentRef.current = false;

    createRequestRef.current?.abort();
    pollRequestRef.current?.abort();
  }, [checkoutKey]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const storedCheckout = readStoredCheckout(checkoutKey);

    if (storedCheckout?.payment) {
      const storedPayment = storedCheckout.payment;
      const storedTransactionId =
        storedPayment.transactionId ?? storedPayment.providerPaymentId;
      const storedExpired = isExpiredAt(storedPayment.expiresAt);

      if (!storedExpired) {
        setPayment(storedPayment);
        setCheckoutStatus(mapPixStatusToCheckoutStatus(storedPayment.status));
        currentTransactionIdRef.current = storedTransactionId;
        hasRequestedPixRef.current = true;
        setAnnouncement("Pix gerado.");
      } else {
        setPayment({
          ...storedPayment,
          status: "expired",
        });
        setCheckoutStatus("expired");
        currentTransactionIdRef.current = storedTransactionId;
        hasRequestedPixRef.current = true;
      }
    }

    setIsHydrated(true);
  }, [checkoutKey]);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    if (!selectedLines.length) {
      return;
    }

    if (payment?.status === "pending") {
      return;
    }

    if (payment?.status === "paid") {
      return;
    }

    if (payment?.status === "expired") {
      return;
    }

    if (hasRequestedPixRef.current) {
      return;
    }

    hasRequestedPixRef.current = true;
    void createPixPayment("auto");

    return () => {
      createRequestRef.current?.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkoutKey, isHydrated, payment?.status, selectedLines.length]);

  useEffect(() => {
    if (!payment || payment.status !== "pending") {
      return;
    }

    const transactionId = payment.transactionId ?? payment.providerPaymentId;
    currentTransactionIdRef.current = transactionId;

    let isActive = true;
    let timeoutId: number | undefined;

    const stopPolling = () => {
      if (timeoutId) {
        window.clearTimeout(timeoutId);
        timeoutId = undefined;
      }

      pollRequestRef.current?.abort();
      setIsPolling(false);
    };

    const syncPaymentStatus = async () => {
      const controller = new AbortController();
      pollRequestRef.current = controller;

      try {
        setIsPolling(true);

        const response = await fetch(
          `/api/shows/${showId}/checkout/pix?transactionId=${encodeURIComponent(
            transactionId
          )}`,
          {
            cache: "no-store",
            signal: controller.signal,
          }
        );

        const payload = (await response.json()) as {
          success: boolean;
          data?: PixPaymentStatusResponse;
          error?: string;
        };

        const data = payload.data;

        if (
          !isActive ||
          controller.signal.aborted ||
          !response.ok ||
          !payload.success ||
          !data
        ) {
          stopPolling();
          return;
        }

        const currentTransactionId = currentTransactionIdRef.current;
        const responseTransactionId =
          data.transactionId ?? data.providerPaymentId;

        if (responseTransactionId !== currentTransactionId) {
          stopPolling();
          return;
        }

        setPayment((current) =>
          current
            ? {
                ...current,
                transactionId: responseTransactionId,
                providerPaymentId: responseTransactionId,
                status: data.status,
                amountInCents: data.amountInCents,
                expiresAt: data.expiresAt ?? current.expiresAt,
                paidAt: data.paidAt ?? current.paidAt,
                endToEndId: data.endToEndId ?? current.endToEndId,
              }
            : current
        );

        if (data.status === "paid") {
          setCheckoutStatus("paid");
          stopPolling();

          if (!hasConfirmedPaymentRef.current) {
            hasConfirmedPaymentRef.current = true;
            if (payment) {
              saveStoredCheckout(checkoutKey, {
                ...payment,
                status: "paid",
                transactionId: responseTransactionId,
                providerPaymentId: responseTransactionId,
                amountInCents: data.amountInCents,
                expiresAt: data.expiresAt ?? payment.expiresAt,
                paidAt: data.paidAt,
                endToEndId: data.endToEndId,
              });
            }
            const confirmed = await onPaymentConfirmedRef.current();

            if (!confirmed) {
              hasConfirmedPaymentRef.current = false;
              setCheckoutStatus("error");
              setErrorMessage(
                "O pagamento foi confirmado, mas não foi possível concluir a compra."
              );
              setAnnouncement(
                "O pagamento foi confirmado, mas não foi possível concluir a compra."
              );
            } else {
              setAnnouncement("Pagamento confirmado.");
            }
          }

          return;
        }

        if (data.status === "expired") {
          setCheckoutStatus("expired");
          setAnnouncement("Pix expirado.");
          stopPolling();
          return;
        }

        if (data.status === "refunded") {
          setCheckoutStatus("refunded");
          setAnnouncement("Pagamento estornado.");
          stopPolling();
          return;
        }

        if (data.status === "failed") {
          setCheckoutStatus("error");
          setAnnouncement("O pagamento não foi concluído.");
          setErrorMessage("O pagamento não foi concluído. Gere um novo Pix.");
          stopPolling();
          return;
        }

        timeoutId = window.setTimeout(syncPaymentStatus, 5000);
      } catch {
        if (!controller.signal.aborted && isActive) {
          setCheckoutStatus("error");
          setErrorMessage("Não foi possível consultar o status do Pix.");
          setAnnouncement("Não foi possível consultar o status do Pix.");
          stopPolling();
        }
      }
    };

    timeoutId = window.setTimeout(syncPaymentStatus, 4000);

    return () => {
      isActive = false;
      stopPolling();
    };
  }, [checkoutKey, payment, showId]);

  const persistPayment = (nextPayment: PixPayment) => {
    setPayment(nextPayment);
    setCheckoutStatus(mapPixStatusToCheckoutStatus(nextPayment.status));
    currentTransactionIdRef.current =
      nextPayment.transactionId ?? nextPayment.providerPaymentId;
    saveStoredCheckout(checkoutKey, nextPayment);
  };

  async function createPixPayment(mode: "auto" | "manual") {
    if (createRequestRef.current) {
      createRequestRef.current.abort();
    }

    const controller = new AbortController();
    createRequestRef.current = controller;

    setErrorMessage(null);
    setAnnouncement(null);
    setCopied(false);
    setIsCreating(true);
    setCheckoutStatus("creating");

    try {
      const response = await fetch(`/api/shows/${showId}/checkout/pix`, {
        method: "POST",
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
        },
        signal: controller.signal,
        body: JSON.stringify({
          customerEmail,
          selectedProtection,
          selectedQuantities,
        }),
      });

      const payload = (await response.json()) as CreatePixCheckoutApiResponse;

      if (
        controller.signal.aborted ||
        !response.ok ||
        !payload.success ||
        !payload.data
      ) {
        throw new Error(payload.error ?? "Não foi possível gerar o Pix.");
      }

      const nextPayment = buildPaymentFromResponse(payload.data);

      if (controller.signal.aborted) {
        return;
      }

      persistPayment(nextPayment);
      setCheckoutStatus("pending");
      setAnnouncement("Pix gerado.");
      hasRequestedPixRef.current = true;
      hasConfirmedPaymentRef.current = false;

      if (mode === "manual") {
        pollRequestRef.current?.abort();
      }
    } catch (error) {
      if (controller.signal.aborted) {
        return;
      }

      setCheckoutStatus("error");
      setAnnouncement("Não conseguimos gerar o Pix.");
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Ocorreu um problema ao preparar o pagamento. Tente novamente em alguns instantes."
      );
    } finally {
      if (createRequestRef.current === controller) {
        createRequestRef.current = null;
      }

      setIsCreating(false);
    }
  }

  const handleCopyPaste = async () => {
    if (!payment?.copyPasteCode) {
      return;
    }

    await navigator.clipboard.writeText(payment.copyPasteCode);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  const handleGenerateNewPix = () => {
    if (isCreating) {
      return;
    }

    clearStoredCheckout(checkoutKey);
    setPayment(null);
    setCheckoutStatus("creating");
    setErrorMessage(null);
    setAnnouncement(null);
    setCopied(false);
    hasRequestedPixRef.current = true;
    hasConfirmedPaymentRef.current = false;
    currentTransactionIdRef.current = null;
    pollRequestRef.current?.abort();
    void createPixPayment("manual");
  };

  const handleExpire = () => {
    if (checkoutStatus === "expired") {
      return;
    }

    pollRequestRef.current?.abort();
    setCheckoutStatus("expired");
    setAnnouncement("Pix expirado.");

    setPayment((current) => {
      if (!current) {
        return current;
      }

      const nextPayment = {
        ...current,
        status: "expired" as const,
      };

      saveStoredCheckout(checkoutKey, nextPayment);
      return nextPayment;
    });
  };

  const showExpiredState = checkoutStatus === "expired";
  const showErrorState = checkoutStatus === "error";
  const showLoadingState = isLoadingState && !showExpiredState && !showErrorState;
  const currentPayment = payment;
  const showPaymentState =
    currentPayment?.status === "pending" &&
    !showLoadingState &&
    !showExpiredState &&
    !showErrorState;

  return (
    <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_10px_24px_rgba(15,23,42,0.05)] sm:p-6">
      <SectionTitle title="Pagamento via Pix" />

      <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1.18fr)_minmax(0,0.82fr)] lg:items-start">
        <div className="rounded-[24px] border border-dashed border-slate-200 bg-slate-50 px-5 py-6">
          <div className="space-y-4 rounded-[20px] bg-white/80 p-4 sm:p-5">
            <div className="flex items-center gap-2 text-slate-600">
              <ShieldCheck className="h-4 w-4 text-[#1e9bf0]" aria-hidden="true" />
              <span className="text-[0.9rem] font-medium">
                Pagamento exclusivo via Pix
              </span>
            </div>

            {showLoadingState ? (
              <div
                role="status"
                aria-live="polite"
                className="flex min-h-[260px] flex-col items-center justify-center rounded-[20px] border border-slate-200 bg-white px-6 py-8 text-center"
              >
                <LoaderCircle
                  aria-hidden="true"
                  className="size-8 animate-spin text-[#1e9bf0]"
                />
                <p className="mt-4 text-[1rem] font-semibold tracking-[-0.03em] text-slate-950">
                  Estamos preparando seu Pix
                </p>
                <p className="mt-2 max-w-sm text-[0.92rem] leading-6 text-slate-500">
                  Aguarde alguns instantes enquanto geramos o QR Code e o código
                  de pagamento.
                </p>
                <p className="mt-2 text-[0.88rem] leading-6 text-slate-500">
                  Não feche esta página.
                </p>
              </div>
            ) : null}

            {showPaymentState ? (
              <>
                <div className="rounded-[20px] border border-slate-200 bg-white p-4">
                  {payment?.qrCodeImage ?? payment?.qrCodeBase64 ? (
                    <div className="mx-auto flex max-w-[260px] items-center justify-center">
                      <Image
                        src={payment.qrCodeImage ?? payment.qrCodeBase64 ?? ""}
                        alt="QR Code Pix"
                        width={260}
                        height={260}
                        unoptimized
                        className="h-auto w-full object-contain"
                      />
                    </div>
                  ) : (
                    <div className="flex min-h-[260px] items-center justify-center rounded-[18px] bg-slate-50 text-center">
                      <div className="max-w-xs">
                        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[24px] bg-sky-50 text-[#1e9bf0]">
                          <QrCode className="h-9 w-9" aria-hidden="true" />
                        </div>
                        <p className="mt-4 text-[1rem] font-semibold tracking-[-0.03em] text-slate-950">
                          QR Code Pix
                        </p>
                        <p className="mt-1 text-[0.92rem] leading-6 text-slate-500">
                          A cobrança foi criada e o QR Code já está disponível.
                        </p>
                      </div>
                    </div>
                )}
              </div>

                {payment?.copyPasteCode ? (
                  <div className="space-y-3 rounded-[20px] bg-slate-50 px-4 py-4">
                    <p className="text-[0.84rem] font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Pix copia e cola
                    </p>
                    <div className="rounded-[16px] border border-slate-200 bg-white px-3 py-3">
                      <p className="break-all text-[0.88rem] leading-6 text-slate-700">
                        {payment.copyPasteCode}
                      </p>
                    </div>

                    {canCopyPayment ? (
                      <button
                        type="button"
                        onClick={handleCopyPaste}
                        className="inline-flex h-11 items-center justify-center gap-2 rounded-[14px] bg-[#1e9bf0] px-4 text-[0.92rem] font-medium text-white transition-all hover:bg-[#1787da] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2"
                      >
                        {copied ? (
                          <Check className="h-4 w-4" aria-hidden="true" />
                        ) : (
                          <Copy className="h-4 w-4" aria-hidden="true" />
                        )}
                        <span>{copied ? "Copiado" : "Copiar código"}</span>
                      </button>
                    ) : null}
                  </div>
                ) : null}

                {payment?.expiresAt ? (
                  <PixExpirationTimer
                    expiresAt={payment.expiresAt}
                    onExpire={handleExpire}
                  />
                ) : null}
              </>
            ) : null}

            {showExpiredState ? (
              <div
                role="status"
                aria-live="polite"
                className="rounded-[20px] border border-amber-200 bg-amber-50 px-5 py-6 text-center"
              >
                <p className="text-[1rem] font-semibold tracking-[-0.03em] text-slate-950">
                  Este Pix expirou
                </p>
                <p className="mt-2 text-[0.92rem] leading-6 text-slate-600">
                  Por segurança, o código anterior não pode mais ser utilizado.
                  Gere um novo Pix para continuar.
                </p>
                <button
                  type="button"
                  onClick={handleGenerateNewPix}
                  aria-label="Gerar um novo código Pix"
                  className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-[16px] bg-[#1e9bf0] px-4 text-[0.92rem] font-medium text-white transition-all hover:bg-[#1787da] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={isCreating}
                >
                  <RefreshCw
                    aria-hidden="true"
                    className={`h-4 w-4 ${isCreating ? "animate-spin" : ""}`}
                  />
                  <span>{isCreating ? "Gerando novo Pix..." : "Gerar novo Pix"}</span>
                </button>
              </div>
            ) : null}

            {showErrorState ? (
              <div
                role="status"
                aria-live="polite"
                className="rounded-[20px] border border-rose-200 bg-rose-50 px-5 py-6 text-center"
              >
                <p className="text-[1rem] font-semibold tracking-[-0.03em] text-slate-950">
                  Não conseguimos gerar o Pix
                </p>
                <p className="mt-2 text-[0.92rem] leading-6 text-slate-600">
                  Ocorreu um problema ao preparar o pagamento. Tente novamente em
                  alguns instantes.
                </p>
                <button
                  type="button"
                  onClick={handleGenerateNewPix}
                  aria-label="Gerar um novo código Pix"
                  className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-[16px] bg-[#1e9bf0] px-4 text-[0.92rem] font-medium text-white transition-all hover:bg-[#1787da] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={isCreating}
                >
                  <RefreshCw
                    aria-hidden="true"
                    className={`h-4 w-4 ${isCreating ? "animate-spin" : ""}`}
                  />
                  <span>{isCreating ? "Tentando novamente..." : "Tentar novamente"}</span>
                </button>
              </div>
            ) : null}
          </div>
        </div>

        <div className="space-y-4 rounded-[24px] bg-slate-50 px-5 py-6">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-slate-600">
              <ShieldCheck className="h-4 w-4 text-[#1e9bf0]" aria-hidden="true" />
              <span className="text-[0.9rem] font-medium">{statusLabel}</span>
            </div>

            {checkoutStatus === "pending" && payment?.expiresAt ? (
              <span className="rounded-full bg-white px-3 py-1 text-[0.76rem] font-semibold uppercase tracking-[0.18em] text-slate-500">
                QR ativo
              </span>
            ) : null}
          </div>

          <div className="space-y-3">
            <div className="flex gap-3 rounded-[18px] bg-white px-4 py-3">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sky-50 text-[0.78rem] font-semibold text-[#1e9bf0]">
                1
              </span>
              <p className="text-[0.92rem] leading-6 text-slate-600">
                Abra o aplicativo do seu banco.
              </p>
            </div>

            <div className="flex gap-3 rounded-[18px] bg-white px-4 py-3">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sky-50 text-[0.78rem] font-semibold text-[#1e9bf0]">
                2
              </span>
              <p className="text-[0.92rem] leading-6 text-slate-600">
                Escaneie o QR Code ou copie e cole o código Pix.
              </p>
            </div>

            <div className="flex gap-3 rounded-[18px] bg-white px-4 py-3">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sky-50 text-[0.78rem] font-semibold text-[#1e9bf0]">
                3
              </span>
              <p className="text-[0.92rem] leading-6 text-slate-600">
                Após o pagamento, sua compra será concluída automaticamente.
              </p>
            </div>
          </div>

          {errorMessage ? (
            <p
              role="alert"
              className="rounded-[18px] border border-rose-200 bg-rose-50 px-4 py-3 text-[0.9rem] leading-6 text-rose-700"
            >
              {errorMessage}
            </p>
          ) : null}
        </div>
      </div>

      <p role="status" aria-live="polite" className="sr-only">
        {announcement}
      </p>

      {isPolling ? (
        <p className="mt-4 text-center text-[0.9rem] leading-6 text-slate-500">
          Aguardando confirmação do pagamento na BlackCat...
        </p>
      ) : null}
    </section>
  );
}
