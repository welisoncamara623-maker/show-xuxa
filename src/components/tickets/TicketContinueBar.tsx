import { ArrowRight, LoaderCircle } from "lucide-react";

import type { TicketOption } from "@/data/shows";
import { fromCents, formatCurrencyBRL } from "@/lib/currency";
import { calculateTicketSubtotal, sumSelectedQuantities } from "@/lib/ticket-calculations";

type TicketContinueBarProps = {
  tickets: TicketOption[];
  selectedQuantities: Record<string, number>;
  isLoading: boolean;
  disabled: boolean;
  onContinue: () => void;
};

export function TicketContinueBar({
  tickets,
  selectedQuantities,
  isLoading,
  disabled,
  onContinue,
}: TicketContinueBarProps) {
  const totalSelected = sumSelectedQuantities(selectedQuantities);
  const subtotal = calculateTicketSubtotal(tickets, selectedQuantities);
  const summary =
    totalSelected > 0
      ? `${totalSelected} ${totalSelected === 1 ? "Ingresso" : "Ingressos"}, ${formatCurrencyBRL(fromCents(subtotal))}`
      : "Selecione seus ingressos";

  return (
    <button
      type="button"
      aria-label={`Continuar para proteção. ${summary}`}
      onClick={onContinue}
      disabled={disabled || isLoading || totalSelected <= 0}
      className="flex min-h-12 w-full items-center justify-center gap-2.5 rounded-[16px] bg-[#1e9bf0] px-4 py-3.5 text-[0.95rem] font-medium text-white shadow-[0_10px_24px_rgba(30,155,240,0.28)] transition-all hover:bg-[#1787da] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-sky-400/70"
    >
      {isLoading ? (
        <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
      ) : (
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      )}

      <span className="text-center leading-none">
        {isLoading ? "Carregando..." : `Continuar — ${summary}`}
      </span>
    </button>
  );
}
