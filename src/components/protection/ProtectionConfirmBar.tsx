import { Check, LoaderCircle } from "lucide-react";
import type { RefObject } from "react";

import { fromCents, formatCurrencyBRL } from "@/lib/currency";

type ProtectionConfirmBarProps = {
  totalInCents: number;
  disabled: boolean;
  isLoading: boolean;
  buttonRef?: RefObject<HTMLButtonElement | null>;
  onConfirm: () => void;
};

export function ProtectionConfirmBar({
  totalInCents,
  disabled,
  isLoading,
  buttonRef,
  onConfirm,
}: ProtectionConfirmBarProps) {
  const summary = formatCurrencyBRL(fromCents(totalInCents));

  return (
    <button
      ref={buttonRef}
      type="button"
      aria-label={`Selecionar opção. ${summary}`}
      onClick={onConfirm}
      disabled={disabled || isLoading}
      className="mx-auto flex w-full items-center justify-center gap-2.5 rounded-[16px] bg-[#1e9bf0] px-4 py-3.5 text-[0.95rem] font-medium text-white shadow-[0_10px_24px_rgba(30,155,240,0.28)] transition-all hover:bg-[#1787da] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-sky-400/70 lg:max-w-[520px]"
    >
      {isLoading ? (
        <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
      ) : (
        <Check className="h-4 w-4" aria-hidden="true" />
      )}

      <span className="text-center leading-none">
        {isLoading ? "Carregando..." : `Selecionar opção — ${summary}`}
      </span>
    </button>
  );
}
