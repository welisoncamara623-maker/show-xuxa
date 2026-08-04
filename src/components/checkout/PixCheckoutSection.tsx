import { QrCode, ShieldCheck } from "lucide-react";

import { SectionTitle } from "@/components/SectionTitle";
export function PixCheckoutSection() {
  return (
    <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_10px_24px_rgba(15,23,42,0.05)] sm:p-6">
      <SectionTitle title="Pagamento via Pix" />

      <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] lg:items-start">
        <div className="rounded-[24px] border border-dashed border-slate-200 bg-slate-50 px-5 py-6">
          <div className="flex h-full min-h-[260px] items-center justify-center rounded-[20px] bg-white/80">
            <div className="text-center">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[24px] bg-sky-50 text-[#1e9bf0]">
                <QrCode className="h-9 w-9" aria-hidden="true" />
              </div>

              <p className="mt-4 text-[1rem] font-semibold tracking-[-0.03em] text-slate-950">
                QR Code Pix
              </p>
              <p className="mt-1 max-w-xs text-[0.92rem] leading-6 text-slate-500">
                A cobrança será gerada quando a integração BlackCat estiver
                ativa no servidor.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4 rounded-[24px] bg-slate-50 px-5 py-6">
          <div className="flex items-center gap-2 text-slate-600">
            <ShieldCheck className="h-4 w-4 text-[#1e9bf0]" aria-hidden="true" />
            <span className="text-[0.9rem] font-medium">
              Pagamento exclusivo via Pix
            </span>
          </div>

          <div className="space-y-3">
            <div className="flex gap-3 rounded-[18px] bg-white px-4 py-3">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sky-50 text-[0.78rem] font-semibold text-[#1e9bf0]">
                1
              </span>
              <p className="text-[0.92rem] leading-6 text-slate-600">
                Abra o aplicativo do seu banco.
              </p>
            </div>

            <div className="flex gap-3 rounded-[18px] bg-white px-4 py-3">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sky-50 text-[0.78rem] font-semibold text-[#1e9bf0]">
                2
              </span>
              <p className="text-[0.92rem] leading-6 text-slate-600">
                Escaneie o QR Code assim que ele estiver disponível.
              </p>
            </div>

            <div className="flex gap-3 rounded-[18px] bg-white px-4 py-3">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sky-50 text-[0.78rem] font-semibold text-[#1e9bf0]">
                3
              </span>
              <p className="text-[0.92rem] leading-6 text-slate-600">
                Confirme o pagamento para concluir a compra.
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
