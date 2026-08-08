"use client";

import { CheckCircle2 } from "lucide-react";

import { PageBackButton } from "@/components/navigation/PageBackButton";
import { formatCurrencyBRL, fromCents } from "@/lib/currency";
import { useTicketStore } from "@/store/ticket-store";

type ProtectionSuccessSectionProps = {
  showId: string;
  showName: string;
  backHref: string;
};

function maskEmail(email: string) {
  const [localPart, domain] = email.split("@");

  if (!localPart || !domain) {
    return email;
  }

  const maskedLocal = `${localPart.slice(0, 2)}***`;
  const domainParts = domain.split(".");
  const host = domainParts[0] ?? "";
  const tld = domainParts[domainParts.length - 1] ?? "";
  const maskedHost = host ? `${host.slice(0, 1)}***` : "***";

  return `${maskedLocal}@${maskedHost}.${tld || "com"}`;
}

export function ProtectionSuccessSection({
  showId,
  showName,
  backHref,
}: ProtectionSuccessSectionProps) {
  const completedOrder = useTicketStore(
    (state) => state.shows[showId]?.lastCompletedOrder ?? null
  );

  if (!completedOrder) {
    return (
      <section className="mx-auto w-full max-w-3xl px-4 sm:px-6 lg:px-0">
        <div className="flex flex-col items-start gap-4">
          <PageBackButton fallbackHref={backHref} />

          <div className="w-full rounded-[28px] border border-slate-200 bg-white px-5 py-8 shadow-[0_10px_28px_rgba(15,23,42,0.06)] sm:px-8 sm:py-10">
            <div className="text-center">
              <CheckCircle2
                className="mx-auto h-12 w-12 text-emerald-500"
                aria-hidden="true"
              />
              <h1 className="mt-4 text-[1.7rem] font-semibold tracking-[-0.05em] text-slate-950 sm:text-[2rem]">
                Compra realizada com sucesso! 🎉
              </h1>
              <p className="mx-auto mt-3 max-w-xl text-[0.98rem] leading-7 text-slate-600">
                Seu pagamento foi confirmado para {showName}.
              </p>
              <p className="mx-auto mt-2 max-w-xl text-[0.98rem] leading-7 text-slate-600">
                Os dados do pedido não puderam ser recarregados neste navegador.
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const hasInsurance = completedOrder.insuranceInCents > 0;

  return (
    <section className="mx-auto w-full max-w-3xl px-4 sm:px-6 lg:px-0">
      <div className="flex flex-col items-start gap-4">
        <PageBackButton fallbackHref={backHref} />

        <div className="w-full rounded-[28px] border border-slate-200 bg-white px-5 py-8 shadow-[0_10px_28px_rgba(15,23,42,0.06)] sm:px-8 sm:py-10">
          <div className="text-center">
            <CheckCircle2
              className="mx-auto h-12 w-12 text-emerald-500"
              aria-hidden="true"
            />
            <h1 className="mt-4 text-[1.7rem] font-semibold tracking-[-0.05em] text-slate-950 sm:text-[2rem]">
              Compra realizada com sucesso! 🎉
            </h1>
            <p className="mx-auto mt-3 max-w-xl text-[0.98rem] leading-7 text-slate-600">
              Seu pagamento foi confirmado para {showName}.
            </p>
            <p className="mx-auto mt-2 max-w-xl text-[0.98rem] leading-7 text-slate-600">
              E-mail de confirmação:{" "}
              <span className="font-medium text-slate-950">
                {maskEmail(completedOrder.customerEmail)}
              </span>
            </p>
            <p className="mx-auto mt-2 max-w-xl text-[0.98rem] leading-7 text-slate-600">
              Status do e-mail:{" "}
              <span className="font-medium text-slate-950">
                {completedOrder.emailStatus === "sent" ? "Enviado" : "Pendente"}
              </span>
            </p>
          </div>

          <div className="mt-8 space-y-4 rounded-[24px] bg-slate-50 px-4 py-5">
            <div className="space-y-2">
              {completedOrder.items.map((item) => (
                <div key={item.ticketId} className="space-y-1">
                  <p className="text-[0.95rem] leading-6 text-slate-700">
                    {item.quantity} × {item.sector}
                  </p>
                  <p className="text-[0.92rem] leading-6 text-slate-500">
                    {item.category} •{" "}
                    {formatCurrencyBRL(fromCents(item.unitPriceInCents))} cada
                  </p>
                  <p className="text-[0.95rem] leading-6 text-slate-700">
                    {formatCurrencyBRL(fromCents(item.lineTotalInCents))}
                  </p>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between gap-4 text-[0.95rem] text-slate-600">
              <span>Subtotal</span>
              <span className="font-medium text-slate-950">
                {formatCurrencyBRL(
                  fromCents(completedOrder.ticketSubtotalInCents)
                )}
              </span>
            </div>

            {hasInsurance ? (
              <div className="flex items-center justify-between gap-4 text-[0.95rem] text-slate-600">
                <span>Seguro</span>
                <span className="font-medium text-slate-950">
                  {formatCurrencyBRL(fromCents(completedOrder.insuranceInCents))}
                </span>
              </div>
            ) : null}

            <div className="flex items-center justify-between gap-4 border-t border-slate-200 pt-3 text-[1rem]">
              <span className="font-semibold text-slate-950">Total</span>
              <span className="text-[1.08rem] font-semibold tracking-[-0.03em] text-slate-950">
                {formatCurrencyBRL(fromCents(completedOrder.finalTotalInCents))}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
