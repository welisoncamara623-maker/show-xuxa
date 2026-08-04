import Link from "next/link";
import { ArrowLeft, CreditCard } from "lucide-react";

type CheckoutHeaderProps = {
  backHref: string;
  city: string;
  eventName: string;
};

export function CheckoutHeader({
  backHref,
  city,
  eventName,
}: CheckoutHeaderProps) {
  return (
    <header className="space-y-5 text-center">
      <div className="flex justify-center">
        <Link
          href={backHref}
          className="inline-flex items-center gap-2 text-[0.92rem] font-medium text-sky-700 transition-colors hover:text-sky-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          <span>Voltar</span>
        </Link>
      </div>

      <div className="mx-auto max-w-2xl space-y-3">
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
          <p className="text-[0.95rem] font-medium tracking-[-0.02em] text-slate-500">
            {eventName}
          </p>
        </div>
      </div>
    </header>
  );
}
