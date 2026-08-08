import { SectionTitle } from "@/components/SectionTitle";

type CheckoutOrderSummaryProps = {
  customerEmail: string;
  onEditEmail: () => void;
};

export function CheckoutOrderSummary({
  customerEmail,
  onEditEmail,
}: CheckoutOrderSummaryProps) {
  return (
    <section className="rounded-[24px] border border-slate-200 bg-slate-50/80 p-5 shadow-[0_10px_24px_rgba(15,23,42,0.05)] sm:p-6">
      <SectionTitle title="Resumo do pedido" />

      <div className="mt-5">
        <div className="flex items-center justify-between gap-4 rounded-[18px] bg-white px-4 py-3">
          <div className="min-w-0 flex-1">
            <p className="text-[0.84rem] font-semibold uppercase tracking-[0.18em] text-slate-500">
              E-mail:
            </p>

            <p className="truncate text-[0.98rem] font-medium tracking-[-0.02em] text-slate-950">
              {customerEmail}
            </p>
          </div>

          <button
            type="button"
            onClick={onEditEmail}
            className="inline-flex h-9 shrink-0 items-center justify-center rounded-[12px] border border-slate-300 bg-white px-3 text-[0.82rem] font-medium text-slate-700 transition-all hover:border-slate-400 hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2"
          >
            Editar
          </button>
        </div>
      </div>
    </section>
  );
}
