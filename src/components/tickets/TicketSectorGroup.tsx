import type { TicketOption } from "@/data/shows";

import { TicketQuantityCard } from "./TicketQuantityCard";

type TicketSectorGroupProps = {
  sector: string;
  tickets: TicketOption[];
  quantities: Record<string, number>;
  availableStock: number;
  disabled: boolean;
  onIncrement: (ticketId: string) => void;
  onDecrement: (ticketId: string) => void;
};

function toSectorId(sector: string) {
  return sector
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");
}

export function TicketSectorGroup({
  sector,
  tickets,
  quantities,
  availableStock,
  disabled,
  onIncrement,
  onDecrement,
}: TicketSectorGroupProps) {
  return (
    <section
      aria-labelledby={`sector-${toSectorId(sector)}`}
      className="rounded-[16px] border border-slate-200 bg-white p-4 sm:p-5"
    >
      <div className="flex flex-col gap-3">
        <h3
          id={`sector-${toSectorId(sector)}`}
          className="text-[1rem] font-semibold uppercase tracking-[-0.04em] text-slate-950 sm:text-[1.08rem]"
        >
          {sector}
        </h3>

        <div className="grid gap-3">
          {tickets.map((ticket) => (
            <TicketQuantityCard
              key={ticket.id}
              ticket={ticket}
              quantity={quantities[ticket.id] ?? 0}
              availableStock={availableStock}
              disabled={disabled}
              onIncrement={() => onIncrement(ticket.id)}
              onDecrement={() => onDecrement(ticket.id)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
