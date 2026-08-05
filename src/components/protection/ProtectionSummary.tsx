import type { TicketOption } from "@/data/shows";
import { fromCents, formatCurrencyBRL } from "@/lib/currency";
import {
  calculateInsuranceAmount,
  calculateTicketSubtotal,
  formatTicketSummary,
  sumSelectedQuantities,
  type ProtectionOption,
} from "@/lib/ticket-calculations";

type ProtectionSummaryProps = {
  tickets: TicketOption[];
  selectedQuantities: Record<string, number>;
  selectedProtection: ProtectionOption;
};

export function ProtectionSummary({
  tickets,
  selectedQuantities,
  selectedProtection,
}: ProtectionSummaryProps) {
  const totalSelected = sumSelectedQuantities(selectedQuantities);
  const ticketSubtotalInCents = calculateTicketSubtotal(
    tickets,
    selectedQuantities
  );
  const insuranceAmount =
    selectedProtection === "ticket-with-insurance"
      ? calculateInsuranceAmount(ticketSubtotalInCents)
      : 0;
  const finalTotalInCents = ticketSubtotalInCents + insuranceAmount;

  const selectedItems = tickets
    .map((ticket) => {
      const quantity = selectedQuantities[ticket.id] ?? 0;

      if (quantity <= 0) {
        return null;
      }

      return formatTicketSummary(
        quantity,
        `${ticket.sector} - ${ticket.category}`
      );
    })
    .filter((item): item is string => Boolean(item));

  return (
    <aside className="rounded-[24px] border border-slate-200 bg-slate-50/80 p-5 shadow-[0_10px_24px_rgba(15,23,42,0.05)]">
      <div className="space-y-4">
        <div className="space-y-1">
          <p className="text-[0.76rem] font-semibold uppercase tracking-[0.22em] text-slate-500">
            Resumo
          </p>
          <p className="text-[1.02rem] font-semibold tracking-[-0.03em] text-slate-950">
            {totalSelected} {totalSelected === 1 ? "ingresso selecionado" : "ingressos selecionados"}
          </p>
        </div>

        <div className="space-y-3 border-t border-slate-200 pt-4">
          {selectedItems.length > 0 ? (
            <div className="space-y-1.5">
              {selectedItems.map((item) => (
                <p key={item} className="text-[0.92rem] leading-6 text-slate-600">
                  {item}
                </p>
              ))}
            </div>
          ) : null}

          <div className="flex items-center justify-between gap-3 text-[0.95rem] text-slate-600">
            <span>Ingresso(s)</span>
            <span className="font-medium text-slate-950">
              {formatCurrencyBRL(fromCents(ticketSubtotalInCents))}
            </span>
          </div>

          {selectedProtection === "ticket-with-insurance" ? (
            <div className="flex items-center justify-between gap-3 text-[0.95rem] text-slate-600">
              <span>Seguro (10%)</span>
              <span className="font-medium text-slate-950">
                {formatCurrencyBRL(fromCents(insuranceAmount))}
              </span>
            </div>
          ) : null}

          <div className="flex items-center justify-between gap-3 border-t border-slate-200 pt-3 text-[1rem]">
            <span className="font-semibold text-slate-950">Total</span>
            <span className="text-[1.08rem] font-semibold tracking-[-0.03em] text-slate-950">
              {formatCurrencyBRL(fromCents(finalTotalInCents))}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
