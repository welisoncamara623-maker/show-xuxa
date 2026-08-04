import Link from "next/link";
import { ShowCardArrowIcon, ShowCardAvailabilityIcon } from "../icons/ShowCardIcons";


type ShowCardProps = {
  id: string;
  city: string;
  eventName: string;
  venue: string;
  date: string;
  month: string;
  year: string;
  weekDay: string;
  hour: string;
  available: boolean;
  href: string;
};

export function ShowCard({
  id,
  city,
  eventName,
  venue,
  date,
  month,
  year,
  weekDay,
  hour,
  available,
  href,
}: ShowCardProps) {
  return (
    <Link
      href={href}
      aria-label={`Abrir detalhes de ${city}`}
      data-show-id={id}
      className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#f5f6f8]"
    >
      <article className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-[0_8px_20px_rgba(15,23,42,0.08)] transition-all duration-300 group-hover:-translate-y-0.5 group-hover:shadow-[0_14px_28px_rgba(15,23,42,0.12)]">
        <div className="grid min-h-33.5 grid-cols-[clamp(74px,16vw,134px)_minmax(0,1fr)_clamp(40px,4.5vw,52px)]">
          <div className="flex items-center justify-center border-r border-slate-200 bg-white px-2 py-3.5 text-center">
            <div className="space-y-0.5">
              <div className="text-[1.95rem] font-semibold leading-none tracking-tighter text-[#1e9bf0] sm:text-[2.1rem]">
                {date}
              </div>
              <div className="text-[0.72rem] font-medium leading-tight text-slate-900 sm:text-[0.82rem]">
                {month} {year}
              </div>
              <div className="text-[0.72rem] leading-tight text-slate-900 sm:text-[0.82rem]">
                {weekDay}. {hour}
              </div>
            </div>
          </div>

          <div className="flex min-w-0 flex-col justify-center gap-0.5 px-3 py-3.5 sm:px-4.5">
            <p className="truncate text-[0.9rem] font-semibold uppercase tracking-[-0.03em] text-slate-950 sm:text-[1.05rem]">
              {city}
            </p>
            <p className="truncate text-[0.74rem] uppercase tracking-[-0.015em] text-slate-500 sm:text-[0.88rem]">
              {eventName}
            </p>
            <p className="truncate text-[0.74rem] uppercase tracking-[-0.01em] text-slate-600 sm:text-[0.86rem]">
              {venue}
            </p>

            <div className="mt-1 flex items-center gap-1 text-[0.74rem] font-medium text-[#1e9bf0] sm:text-[0.86rem]">
              <span>{available ? "Disponível" : "Indisponível"}</span>
              {available ? (
                <ShowCardAvailabilityIcon className="h-3.5 w-3.5 shrink-0 text-[#f59e0b]" />
              ) : null}
            </div>
          </div>

          <div className="flex items-center justify-center bg-[#1e9bf0] text-white transition-colors duration-300 group-hover:bg-[#1787da]">
            <ShowCardArrowIcon className="h-5.5 w-5.5 transition-transform duration-300 group-hover:translate-x-1" />
          </div>
        </div>
      </article>
    </Link>
  );
}
