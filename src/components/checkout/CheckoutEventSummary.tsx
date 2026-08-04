import { CalendarDays, MapPin } from "lucide-react";

import { SectionTitle } from "@/components/SectionTitle";

type CheckoutEventSummaryProps = {
  city: string;
  eventName: string;
  stadium: string;
  date: string;
  month: string;
  year: string;
  weekDay: string;
  hour: string;
};

export function CheckoutEventSummary({
  city,
  eventName,
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

      <div className="mt-5 space-y-4 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#1e9bf0]">
          {city}
        </p>
        <h2 className="text-[1.35rem] font-semibold tracking-[-0.05em] text-slate-950 sm:text-[1.55rem]">
          {eventName}
        </h2>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-[18px] bg-slate-50 px-4 py-3">
            <div className="flex items-center justify-center gap-2 text-slate-600">
              <CalendarDays className="h-4 w-4" aria-hidden="true" />
              <span className="text-[0.9rem] font-medium">
                {date} {month} {year} • {weekDay}. {hour}
              </span>
            </div>
          </div>

          <div className="rounded-[18px] bg-slate-50 px-4 py-3">
            <div className="flex items-center justify-center gap-2 text-slate-600">
              <MapPin className="h-4 w-4" aria-hidden="true" />
              <span className="text-[0.9rem] font-medium">{stadium}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
