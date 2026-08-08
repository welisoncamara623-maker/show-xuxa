import { CreditCard } from "lucide-react";

import { PageBackButton } from "@/components/navigation/PageBackButton";

type CheckoutHeaderProps = {
  backHref: string;
  city: string;
};

export function CheckoutHeader({ backHref, city }: CheckoutHeaderProps) {
  return (
    <header className="space-y-5 text-left">
      <div className="flex flex-col items-start gap-4">
        <PageBackButton fallbackHref={backHref} />

        <div className="mx-auto max-w-2xl space-y-3 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-sky-50 px-4 py-1.5 text-[0.76rem] font-semibold uppercase tracking-[0.22em] text-sky-700">
            <CreditCard className="h-4 w-4" aria-hidden="true" />
            <span>Checkout</span>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#1e9bf0] sm:text-base">
              {city}
            </p>
            <h1 className="text-[1.55rem] font-semibold tracking-[-0.05em] text-slate-950 sm:text-[2rem]">
              Finalize sua compra
            </h1>
          </div>
        </div>
      </div>
    </header>
  );
}
