"use client";

import { CheckCircle2 } from "lucide-react";

import type { TicketOption } from "@/data/shows";
import { formatCurrencyBRL, fromCents } from "@/lib/currency";
import { PageBackButton } from "@/components/navigation/PageBackButton";
import { useTicketStore } from "@/store/ticket-store";

type ProtectionSuccessSectionProps = {
  showId: string;
  showName: string;
  backHref: string;
  tickets: TicketOption[];
};

function formatPurchaseItem(quantity: number, label: string) {
  return `${quantity} ${quantity === 1 ? "ingresso" : "ingressos"} ${label.toLowerCase()}`;
}

export function ProtectionSuccessSection({
  showId,
  showName,
  backHref,
  tickets,
}: ProtectionSuccessSectionProps) {
  const purchase = useTicketStore((state) => state.shows[showId]?.lastPurchase ?? null);

  if (!purchase) {
    return (
      <section className="mx-auto w-full max-w-3xl px-4 sm:px-6 lg:px-0">
        <div className="flex flex-col items-start gap-4">
          <PageBackButton fallbackHref={backHref} />

          <div className="mx-auto w-full rounded-[28px] border border-slate-200 bg-white px-5 py-8 text-center shadow-[0_10px_28px_rgba(15,23,42,0.06)] sm:px-8 sm:py-10">
            <CheckCircle2 className="mx-auto h-12 w-12 text-slate-300" aria-hidden="true" />
            <h1 className="mt-4 text-[1.7rem] font-semibold tracking-[-0.05em] text-slate-950">
              Compra concluída
            </h1>
            <p className="mt-3 text-[0.98rem] leading-7 text-slate-600">
              Não encontramos um resumo recente dessa compra.
            </p>
          </div>
        </div>
      </section>
    );
  }

  const purchasedItems = purchase.items
    .map((item) => {
      const ticket = tickets.find((ticketOption) => ticketOption.id === item.ticketId);

      return {
        ...item,
        label: ticket ? `${ticket.sector} - ${ticket.category}` : item.ticketId,
      };
    })
    .filter((item) => item.quantity > 0);

  return (
    <section className="mx-auto w-full max-w-3xl px-4 sm:px-6 lg:px-0">
      <div className="flex flex-col items-start gap-4">
        <PageBackButton fallbackHref={backHref} />

        <div className="w-full rounded-[28px] border border-slate-200 bg-white px-5 py-8 shadow-[0_10px_28px_rgba(15,23,42,0.06)] sm:px-8 sm:py-10">
          <div className="text-center">
            <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500" aria-hidden="true" />
            <h1 className="mt-4 text-[1.7rem] font-semibold tracking-[-0.05em] text-slate-950 sm:text-[2rem]">
              Compra finalizada com sucesso!
            </h1>
            <p className="mx-auto mt-2 max-w-xl text-[0.98rem] leading-7 text-slate-600">
              Seus ingressos foram reservados para {showName}.
            </p>
          </div>

          <div className="mt-8 space-y-4 rounded-[24px] bg-slate-50 px-4 py-5">
            <div className="space-y-2">
              {purchasedItems.map((item) => (
                <p
                  key={item.ticketId}
                  className="text-[0.95rem] leading-6 text-slate-700"
                >
                  {formatPurchaseItem(item.quantity, item.label)}
                </p>
              ))}
            </div>

            <div className="flex items-center justify-between gap-4 text-[0.95rem] text-slate-600">
              <span>Subtotal</span>
              <span className="font-medium text-slate-950">
                {formatCurrencyBRL(fromCents(purchase.ticketSubtotalInCents))}
              </span>
            </div>

            {purchase.protection === "ticket-with-insurance" ? (
              <div className="flex items-center justify-between gap-4 text-[0.95rem] text-slate-600">
                <span>Seguro</span>
                <span className="font-medium text-slate-950">
                  {formatCurrencyBRL(fromCents(purchase.insuranceAmountInCents))}
                </span>
              </div>
            ) : null}

            <div className="flex items-center justify-between gap-4 border-t border-slate-200 pt-3 text-[1rem]">
              <span className="font-semibold text-slate-950">Total</span>
              <span className="text-[1.08rem] font-semibold tracking-[-0.03em] text-slate-950">
                {formatCurrencyBRL(fromCents(purchase.finalTotalInCents))}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
