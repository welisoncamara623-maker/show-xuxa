import type { TicketOption } from "@/data/shows";
import { Minus, Plus, Tag } from "lucide-react";

import { fromCents, formatCurrencyBRL } from "@/lib/currency";

type TicketQuantityCardProps = {
  ticket: TicketOption;
  quantity: number;
  availableStock: number;
  disabled: boolean;
  onIncrement: () => void;
  onDecrement: () => void;
};

export function TicketQuantityCard({
  ticket,
  quantity,
  availableStock,
  disabled,
  onIncrement,
  onDecrement,
}: TicketQuantityCardProps) {
  const { id, category, priceInCents, description } = ticket;
  const canIncrease = !disabled && availableStock > 0;
  const canDecrease = !disabled && quantity > 0;

  return (
    <div
      data-ticket-id={id}
      className="flex flex-col gap-4 px-4 py-4 sm:px-5 sm:py-5"
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-[0.73rem] font-semibold uppercase tracking-[0.16em] text-slate-500">
          {category}
          <Tag
            className="h-3.5 w-3.5 rotate-12 text-[#f59e0b]"
            aria-hidden="true"
          />
        </span>
      </div>

      {description ? (
        <p className="max-w-[34rem] text-[0.82rem] leading-5 tracking-[-0.01em] text-slate-500 sm:text-[0.86rem]">
          {description}
        </p>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <p className="text-[0.96rem] font-semibold tracking-[-0.03em] text-slate-950 sm:text-[1.02rem]">
          {formatCurrencyBRL(fromCents(priceInCents))}
        </p>

        <div className="flex items-center justify-between gap-3 sm:justify-end sm:gap-2">
          <button
            type="button"
            aria-label="Diminuir quantidade de ingressos"
            disabled={!canDecrease}
            onClick={onDecrement}
            className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-slate-300 bg-white text-slate-500 transition-all hover:border-slate-400 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Minus className="h-4 w-4" aria-hidden="true" />
          </button>

          <div
            aria-live="polite"
            className="min-w-8 text-center text-base font-medium tabular-nums text-slate-600 sm:text-[1.05rem]"
          >
            {quantity}
          </div>

          <button
            type="button"
            aria-label="Aumentar quantidade de ingressos"
            disabled={!canIncrease}
            onClick={onIncrement}
            className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#f8b400] text-white shadow-none transition-all hover:bg-[#eda800] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-[#f4d06b] disabled:opacity-60"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}
