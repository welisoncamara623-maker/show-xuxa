"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Copy, LoaderCircle, QrCode, ShieldCheck } from "lucide-react";

import { SectionTitle } from "@/components/SectionTitle";
import type { TicketOption } from "@/data/shows";
import { formatCurrencyBRL, fromCents } from "@/lib/currency";
import {
  calculateFinalTotal,
  calculateTicketSubtotal,
  type ProtectionOption,
} from "@/lib/ticket-calculations";
import {
  getSelectedTicketLines,
  type CheckoutTicketLine,
} from "@/lib/checkout-calculations";
import type {
  PixPayment,
  PixPaymentStatusResponse,
} from "@/services/payments/blackcat/types";

type PixCheckoutSectionProps = {
  showId: string;
  customerEmail: string;
  selectedProtection: ProtectionOption;
  selectedQuantities: Record<string, number>;
  tickets: TicketOption[];
  onPaymentConfirmed: () => Promise<boolean> | boolean;
};

function formatDateTime(value?: string) {
  if (!value) {
    return null;
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

function mapPaymentStatusLabel(status: PixPayment["status"]) {
  if (status === "paid") {
    return "Pagamento confirmado";
  }

  if (status === "expired") {
    return "Pix expirado";
  }

  if (status === "refunded") {
    return "Pagamento estornado";
  }

  if (status === "failed") {
    return "Falha no pagamento";
  }

  return "Aguardando pagamento";
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
  const [isCreating, setIsCreating] = useState(false);
  const [isPolling, setIsPolling] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const onPaymentConfirmedRef = useRef(onPaymentConfirmed);

  const selectedLines = useMemo(
    () => getSelectedTicketLines(tickets, selectedQuantities),
    [selectedQuantities, tickets]
  );

  const ticketSubtotalInCents = calculateTicketSubtotal(
    tickets,
    selectedQuantities
  );
  const finalTotalInCents = calculateFinalTotal(
    ticketSubtotalInCents,
    selectedProtection
  );

  useEffect(() => {
    onPaymentConfirmedRef.current = onPaymentConfirmed;
  }, [onPaymentConfirmed]);

  useEffect(() => {
    if (!payment || payment.status !== "pending") {
      return;
    }

    let active = true;
    let timeoutId: number | undefined;

    const pollStatus = async () => {
      try {
        setIsPolling(true);

        const response = await fetch(
          `/api/shows/${showId}/checkout/pix?transactionId=${encodeURIComponent(
            payment.providerPaymentId
          )}`,
          {
            cache: "no-store",
          }
        );

        const payload = (await response.json()) as {
          success: boolean;
          data?: PixPaymentStatusResponse;
          error?: string;
        };

        const data = payload.data;

        if (!response.ok || !payload.success || !data) {
          throw new Error("Não foi possível consultar o status do Pix.");
        }

        setPayment((current) =>
          current
            ? {
                ...current,
                status: data.status,
                amountInCents: data.amountInCents,
                expiresAt: data.expiresAt ?? current.expiresAt,
              }
            : current
        );

        if (data.status === "paid") {
          const confirmed = await onPaymentConfirmedRef.current();

          if (!confirmed) {
            setErrorMessage(
              "O pagamento foi confirmado, mas não foi possível concluir a compra."
            );
          }

          setIsPolling(false);
          return;
        }

        if (data.status === "expired" || data.status === "failed" || data.status === "refunded") {
          setErrorMessage("O pagamento não foi concluído. Gere um novo Pix.");
          setIsPolling(false);
          return;
        }

        if (active) {
          timeoutId = window.setTimeout(pollStatus, 5000);
        }
      } catch {
        if (active) {
          timeoutId = window.setTimeout(pollStatus, 5000);
        }
      }
    };

    timeoutId = window.setTimeout(pollStatus, 4000);

    return () => {
      active = false;

      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [payment, showId]);

  const handleGeneratePix = async () => {
    if (isCreating || selectedLines.length <= 0) {
      return;
    }

    setIsCreating(true);
    setErrorMessage(null);
    setCopied(false);

    try {
      const response = await fetch(`/api/shows/${showId}/checkout/pix`, {
        method: "POST",
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customerEmail,
          selectedProtection,
          selectedQuantities,
        }),
      });

      const payload = (await response.json()) as {
        success: boolean;
        data?: {
          orderId: string;
          payment: PixPayment;
          ticketSubtotalInCents: number;
          insuranceAmountInCents: number;
          finalTotalInCents: number;
          statusUrl: string;
        };
        error?: string;
      };

      if (!response.ok || !payload.success || !payload.data) {
        throw new Error("Não foi possível gerar o Pix. Tente novamente.");
      }

      setPayment(payload.data.payment);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Não foi possível gerar o Pix. Tente novamente."
      );
    } finally {
      setIsCreating(false);
    }
  };

  const handleCopyPaste = async () => {
    if (!payment?.copyPasteCode) {
      return;
    }

    await navigator.clipboard.writeText(payment.copyPasteCode);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  const isActionDisabled = isCreating || isPolling || selectedLines.length <= 0;
  const showGenerateButton = !payment || payment.status === "expired";
  const statusLabel = payment ? mapPaymentStatusLabel(payment.status) : null;
  const totalSelectedTickets = selectedLines.reduce(
    (total: number, line: CheckoutTicketLine) => total + line.quantity,
    0
  );

  return (
    <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_10px_24px_rgba(15,23,42,0.05)] sm:p-6">
      <SectionTitle title="Pagamento via Pix" />

      <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] lg:items-start">
        <div className="rounded-[24px] border border-dashed border-slate-200 bg-slate-50 px-5 py-6">
          <div className="space-y-4 rounded-[20px] bg-white/80 p-4 sm:p-5">
            <div className="flex items-center gap-2 text-slate-600">
              <ShieldCheck className="h-4 w-4 text-[#1e9bf0]" aria-hidden="true" />
              <span className="text-[0.9rem] font-medium">
                Pagamento exclusivo via Pix
              </span>
            </div>

            <div className="rounded-[20px] border border-slate-200 bg-white p-4">
              {payment?.qrCodeBase64 ? (
                <div className="mx-auto flex max-w-[260px] items-center justify-center">
                  <Image
                    src={payment.qrCodeBase64}
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
                      {showGenerateButton ? "Gerar QR Code Pix" : "QR Code Pix"}
                    </p>
                    <p className="mt-1 text-[0.92rem] leading-6 text-slate-500">
                      {showGenerateButton
                        ? "Clique no botão abaixo para criar a cobrança na BlackCat."
                        : "A cobrança foi criada e o QR Code já está disponível."}
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
              </div>
            ) : null}

            {payment?.expiresAt ? (
              <p className="text-[0.88rem] leading-6 text-slate-500">
                Expira em{" "}
                <span className="font-medium text-slate-700">
                  {formatDateTime(payment.expiresAt)}
                </span>
              </p>
            ) : null}

            {showGenerateButton ? (
              <button
                type="button"
                onClick={handleGeneratePix}
                disabled={isActionDisabled}
                className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-[16px] bg-[#1e9bf0] px-4 py-3.5 text-[0.95rem] font-medium text-white shadow-[0_10px_24px_rgba(30,155,240,0.28)] transition-all hover:bg-[#1787da] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-sky-400/70"
              >
                {isCreating ? (
                  <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
                ) : null}
                <span>{isCreating ? "Gerando Pix..." : "Gerar Pix"}</span>
              </button>
            ) : null}
          </div>
        </div>

        <div className="space-y-4 rounded-[24px] bg-slate-50 px-5 py-6">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-slate-600">
              <ShieldCheck className="h-4 w-4 text-[#1e9bf0]" aria-hidden="true" />
              <span className="text-[0.9rem] font-medium">
                Aguardando confirmação
              </span>
            </div>

            {statusLabel ? (
              <span className="rounded-full bg-white px-3 py-1 text-[0.76rem] font-semibold uppercase tracking-[0.18em] text-slate-500">
                {statusLabel}
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

          <div className="rounded-[18px] border border-sky-100 bg-sky-50 px-4 py-3">
            <p className="text-[0.9rem] leading-6 text-slate-600">
              <span className="font-semibold text-slate-950">
                {totalSelectedTickets}{" "}
                {totalSelectedTickets === 1
                  ? "ingresso"
                  : "ingressos"}
              </span>{" "}
              selecionados. Total atual:{" "}
              <span className="font-semibold text-slate-950">
                {formatCurrencyBRL(fromCents(finalTotalInCents))}
              </span>
            </p>
          </div>
        </div>
      </div>

      {isPolling ? (
        <p className="mt-4 text-center text-[0.9rem] leading-6 text-slate-500">
          Aguardando confirmação do pagamento na BlackCat...
        </p>
      ) : null}
    </section>
  );
}
