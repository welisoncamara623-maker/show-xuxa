import { Check, ShieldCheck } from "lucide-react";
import type { ReactNode } from "react";

import type { ProtectionOption } from "@/lib/ticket-calculations";
import { fromCents, formatCurrencyBRL } from "@/lib/currency";

type ProtectionOptionCardProps = {
  name: string;
  value: ProtectionOption;
  title: string;
  totalInCents: number;
  description: string;
  badge?: string;
  selected: boolean;
  onSelect: (value: ProtectionOption) => void;
  children?: ReactNode;
};

export function ProtectionOptionCard({
  name,
  value,
  title,
  totalInCents,
  description,
  badge,
  selected,
  onSelect,
  children,
}: ProtectionOptionCardProps) {
  const inputId = `${name}-${value}`;

  return (
    <label
      htmlFor={inputId}
      className="group block cursor-pointer outline-none focus-within:ring-2 focus-within:ring-sky-500 focus-within:ring-offset-2"
    >
      <input
        id={inputId}
        type="radio"
        name={name}
        checked={selected}
        onChange={() => onSelect(value)}
        className="sr-only"
      />

      <div
        className={`relative overflow-hidden rounded-[24px] border bg-white p-4 text-left shadow-[0_10px_26px_rgba(15,23,42,0.06)] transition-all sm:p-5 ${
          selected
            ? "border-sky-500 ring-1 ring-sky-500/20"
            : "border-slate-200 hover:border-slate-300"
        }`}
      >
        <div className="absolute right-4 top-4">
          <span
            className={`flex h-6 w-6 items-center justify-center rounded-full border transition-all ${
              selected
                ? "border-sky-500 bg-sky-500 text-white"
                : "border-slate-300 bg-white text-transparent group-hover:border-slate-400"
            }`}
            aria-hidden="true"
          >
            <Check className="h-3.5 w-3.5" />
          </span>
        </div>

        <div className="space-y-4 pr-10 sm:pr-12">
          <div className="space-y-3">
            {badge ? (
              <span className="inline-flex rounded-full bg-sky-50 px-3 py-1 text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-sky-700">
                {badge}
              </span>
            ) : null}

            <div className="space-y-1.5">
              <div className="flex items-start gap-2">
                <ShieldCheck
                  className={`mt-0.5 h-5 w-5 shrink-0 ${
                    selected ? "text-[#1e9bf0]" : "text-slate-400"
                  }`}
                  aria-hidden="true"
                />
                <div className="space-y-0.5">
                  <h3 className="text-[1.18rem] font-semibold tracking-[-0.04em] text-slate-950 sm:text-[1.3rem]">
                    {title}
                  </h3>
                  <p className="text-[0.95rem] font-semibold tracking-[-0.03em] text-slate-950 sm:text-[1.02rem]">
                    {formatCurrencyBRL(fromCents(totalInCents))}
                  </p>
                </div>
              </div>

              <p className="text-[0.9rem] leading-6 tracking-[-0.01em] text-slate-500 sm:text-[0.94rem]">
                {description}
              </p>
            </div>
          </div>

          {children ? <div className="space-y-3">{children}</div> : null}
        </div>
      </div>
    </label>
  );
}
