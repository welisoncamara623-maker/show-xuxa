import Link from "next/link";

export default function TicketInsuranceTermsPage() {
  return (
    <main className="flex-1 bg-white py-10 sm:py-14">
      <section className="mx-auto w-full max-w-3xl px-4 sm:px-6 lg:px-0">
        <div className="rounded-[28px] border border-slate-200 bg-white px-5 py-8 text-center shadow-[0_10px_28px_rgba(15,23,42,0.06)] sm:px-8 sm:py-10">
          <p className="text-[0.76rem] font-semibold uppercase tracking-[0.24em] text-slate-500">
            Termos
          </p>
          <h1 className="mt-3 text-[1.8rem] font-semibold tracking-[-0.05em] text-slate-950 sm:text-[2.1rem]">
            Termos e condições do Seguro Ingresso Protegido
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-[0.98rem] leading-7 text-slate-600">
            Conteúdo provisório para a etapa de proteção do ingresso. Esta
            página será preenchida futuramente com os termos oficiais do plano.
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex items-center justify-center rounded-[16px] bg-[#1e9bf0] px-5 py-3 text-[0.95rem] font-medium text-white shadow-[0_10px_24px_rgba(30,155,240,0.28)] transition-all hover:bg-[#1787da] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2"
          >
            Voltar para a Home
          </Link>
        </div>
      </section>
    </main>
  );
}
