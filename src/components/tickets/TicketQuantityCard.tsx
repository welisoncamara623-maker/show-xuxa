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
      className="flex min-h-[108px] flex-col justify-between gap-2.5 px-0 py-0 sm:min-h-[104px]"
    >
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-[0.72rem] font-semibold uppercase tracking-[0.08em] text-slate-500">
          {category}
          <Tag
            className="h-3 w-3 rotate-12 text-[#f59e0b]"
            aria-hidden="true"
          />
        </span>
      </div>

      {description ? (
        <p className="max-w-[34rem] text-[0.78rem] leading-5 tracking-[-0.01em] text-slate-500 sm:text-[0.82rem]">
          {description}
        </p>
      ) : null}

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
        <p className="text-[0.94rem] font-semibold tracking-[-0.03em] text-slate-950 sm:text-[0.98rem]">
          {formatCurrencyBRL(fromCents(priceInCents))}
        </p>

        <div className="flex items-center justify-between gap-2 sm:justify-end sm:gap-2">
          <button
            type="button"
            aria-label="Diminuir quantidade de ingressos"
            disabled={!canDecrease}
            onClick={onDecrement}
            className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-slate-300 bg-white text-slate-500 transition-all hover:border-slate-400 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Minus className="h-4 w-4" aria-hidden="true" />
          </button>

          <div
            aria-live="polite"
            className="min-w-8 text-center text-[0.95rem] font-medium tabular-nums text-slate-600 sm:text-[0.98rem]"
          >
            {quantity}
          </div>

          <button
            type="button"
            aria-label="Aumentar quantidade de ingressos"
            disabled={!canIncrease}
            onClick={onIncrement}
            className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#f8b400] text-white shadow-none transition-all hover:bg-[#eda800] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-[#f4d06b] disabled:opacity-60"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}
