import { Minus, Plus, Tag } from "lucide-react";

import { fromCents, formatCurrencyBRL } from "@/lib/currency";

type TicketQuantityCardProps = {
  ticketId: string;
  name: string;
  category: string;
  priceInCents: number;
  description?: string;
  quantity: number;
  availableStock: number;
  disabled: boolean;
  onIncrement: () => void;
  onDecrement: () => void;
};

export function TicketQuantityCard({
  ticketId,
  name,
  category,
  priceInCents,
  description,
  quantity,
  availableStock,
  disabled,
  onIncrement,
  onDecrement,
}: TicketQuantityCardProps) {
  const canIncrease = !disabled && availableStock > 0;
  const canDecrease = !disabled && quantity > 0;

  return (
    <article
      data-ticket-id={ticketId}
      className="overflow-hidden rounded-[20px] border border-slate-200 bg-white shadow-[0_8px_22px_rgba(15,23,42,0.08)]"
    >
      <div className="px-4 py-4 sm:px-5 sm:py-5">
        <div className="space-y-3">
          <div className="space-y-1.5">
            <h3 className="text-[1.05rem] font-semibold uppercase tracking-[-0.05em] text-slate-950 sm:text-[1.18rem]">
              {name}
            </h3>

            <div className="flex items-center gap-1.5 text-[0.78rem] font-medium uppercase tracking-[-0.02em] text-slate-500 sm:text-[0.84rem]">
              <span>{category}</span>
              <Tag
                className="h-3.5 w-3.5 rotate-12 text-[#f59e0b]"
                aria-hidden="true"
              />
            </div>

            {description ? (
              <p className="max-w-[30rem] text-[0.82rem] leading-5 tracking-[-0.01em] text-slate-500 sm:text-[0.86rem]">
                {description}
              </p>
            ) : null}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            <p className="text-[0.96rem] font-semibold tracking-[-0.03em] text-slate-950 sm:text-[1.02rem]">
              {formatCurrencyBRL(fromCents(priceInCents))}
            </p>

            <div className="flex items-center justify-between gap-3 sm:justify-end sm:gap-2">
              <button
                type="button"
                aria-label={`Diminuir quantidade de ingressos para ${category.toLowerCase()}`}
                disabled={!canDecrease}
                onClick={onDecrement}
                className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-slate-300 bg-white text-slate-500 transition-all hover:border-slate-400 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Minus className="h-4 w-4" aria-hidden="true" />
              </button>

              <div
                aria-live="polite"
                className="min-w-8 text-center text-lg font-medium tabular-nums text-slate-600"
              >
                {quantity}
              </div>

              <button
                type="button"
                aria-label={`Aumentar quantidade de ingressos para ${category.toLowerCase()}`}
                disabled={!canIncrease}
                onClick={onIncrement}
                className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#f8b400] text-white shadow-[0_8px_16px_rgba(248,180,0,0.26)] transition-all hover:bg-[#eda800] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-[#f4d06b] disabled:opacity-60"
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="h-px bg-slate-200" aria-hidden="true" />
    </article>
  );
}
