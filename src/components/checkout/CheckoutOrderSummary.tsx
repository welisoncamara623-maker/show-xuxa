import { ShieldCheck } from "lucide-react";

import { SectionTitle } from "@/components/SectionTitle";
import { fromCents, formatCurrencyBRL } from "@/lib/currency";
import type { ProtectionOption } from "@/lib/ticket-calculations";

type CheckoutOrderSummaryProps = {
  customerEmail: string;
  onEditEmail: () => void;
  selectedProtection: ProtectionOption;
  ticketSubtotalInCents: number;
  insuranceAmountInCents: number;
  finalTotalInCents: number;
};

export function CheckoutOrderSummary({
  customerEmail,
  onEditEmail,
  selectedProtection,
  ticketSubtotalInCents,
  insuranceAmountInCents,
  finalTotalInCents,
}: CheckoutOrderSummaryProps) {
  const protectionLabel =
    selectedProtection === "ticket-with-insurance"
      ? "Seguro Ingresso Protegido"
      : "Somente ingressos";

  return (
    <section className="rounded-[24px] border border-slate-200 bg-slate-50/80 p-5 shadow-[0_10px_24px_rgba(15,23,42,0.05)] sm:p-6">
      <SectionTitle title="Resumo do pedido" />

      <div className="mt-5 space-y-4">
        <div className="flex flex-col gap-3 rounded-[18px] bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="text-[0.84rem] font-semibold uppercase tracking-[0.18em] text-slate-500">
              E-mail de confirmação
            </p>
            <p className="truncate text-[0.98rem] font-medium tracking-[-0.02em] text-slate-950">
              {customerEmail}
            </p>
          </div>

          <button
            type="button"
            onClick={onEditEmail}
            className="inline-flex h-9 items-center justify-center self-start rounded-[12px] border border-slate-300 bg-white px-3 text-[0.82rem] font-medium text-slate-700 transition-all hover:border-slate-400 hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2"
          >
            Editar
          </button>
        </div>

        <div className="space-y-3 border-t border-slate-200 pt-4">
          <div className="flex items-center justify-between gap-4 text-[0.95rem] text-slate-600">
            <span>Subtotal</span>
            <span className="font-medium text-slate-950">
              {formatCurrencyBRL(fromCents(ticketSubtotalInCents))}
            </span>
          </div>

          {selectedProtection === "ticket-with-insurance" ? (
            <div className="flex items-center justify-between gap-4 text-[0.95rem] text-slate-600">
              <span className="inline-flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-[#1e9bf0]" aria-hidden="true" />
                <span>{protectionLabel}</span>
              </span>
              <span className="font-medium text-slate-950">
                {formatCurrencyBRL(fromCents(insuranceAmountInCents))}
              </span>
            </div>
          ) : null}

          <div className="flex items-center justify-between gap-4 border-t border-slate-200 pt-3">
            <span className="text-[1rem] font-semibold text-slate-950">
              Total
            </span>
            <span className="text-[1.15rem] font-semibold tracking-[-0.03em] text-slate-950">
              {formatCurrencyBRL(fromCents(finalTotalInCents))}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
