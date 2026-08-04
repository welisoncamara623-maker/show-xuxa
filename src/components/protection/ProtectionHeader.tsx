import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";

type ProtectionHeaderProps = {
  showName: string;
  backHref: string;
};

export function ProtectionHeader({ showName, backHref }: ProtectionHeaderProps) {
  return (
    <header className="space-y-5 text-center">
      <div className="flex justify-center">
        <Link
          href={backHref}
          className="inline-flex items-center gap-2 text-[0.92rem] font-medium text-sky-700 transition-colors hover:text-sky-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          <span>Voltar ao evento</span>
        </Link>
      </div>

      <div className="mx-auto max-w-2xl space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full bg-sky-50 px-4 py-1.5 text-[0.76rem] font-semibold uppercase tracking-[0.22em] text-sky-700">
          <ShieldCheck className="h-4 w-4" aria-hidden="true" />
          <span>Proteção</span>
        </div>

        <h1 className="text-[1.8rem] font-semibold tracking-[-0.05em] text-slate-950 sm:text-[2.25rem]">
          Nós recomendamos o{" "}
          <span className="text-[#1e9bf0]">Seguro Ingresso Protegido</span>
        </h1>

        <p className="mx-auto max-w-xl text-[0.98rem] leading-7 tracking-[-0.015em] text-slate-600 sm:text-[1.02rem]">
          Proteja seu ingresso e tenha seu dinheiro de volta em casos de
          emergências cobertas pelo plano.
        </p>

        <p className="text-[0.95rem] font-medium tracking-[-0.02em] text-slate-500">
          {showName}
        </p>
      </div>
    </header>
  );
}
