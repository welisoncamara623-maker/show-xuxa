import { CalendarDays, MapPin } from "lucide-react";

import { SectionTitle } from "@/components/SectionTitle";

type CheckoutEventSummaryProps = {
  stadium: string;
  date: string;
  month: string;
  year: string;
  weekDay: string;
  hour: string;
};

export function CheckoutEventSummary({
  stadium,
  date,
  month,
  year,
  weekDay,
  hour,
}: CheckoutEventSummaryProps) {
  return (
    <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_10px_24px_rgba(15,23,42,0.05)] sm:p-6">
      <SectionTitle title="Resumo do evento" />

      <div className="mt-4 space-y-2.5 text-center">
        <div className="grid gap-2 sm:grid-cols-2">
          <div className="rounded-[18px] bg-slate-50 px-4 py-2.5">
            <div className="flex items-center justify-center gap-2 text-slate-600">
              <CalendarDays className="h-4 w-4" aria-hidden="true" />
              <span className="text-[0.88rem] font-medium leading-5">
                {date} {month} {year} • {weekDay}. {hour}
              </span>
            </div>
          </div>

          <div className="rounded-[18px] bg-slate-50 px-4 py-2.5">
            <div className="flex items-center justify-center gap-2 text-slate-600">
              <MapPin className="h-4 w-4" aria-hidden="true" />
              <span className="text-[0.88rem] font-medium leading-5">
                {stadium}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
