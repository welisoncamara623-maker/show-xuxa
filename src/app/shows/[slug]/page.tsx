import type { Metadata } from "next";
import { MapPin } from "lucide-react";
import { notFound } from "next/navigation";

import { RatingRow } from "@/components/RatingRow";
import { SectionTitle } from "@/components/SectionTitle";
import { ShowBanner } from "@/components/shows/ShowBanner";
import { ShowPageHeader } from "@/components/shows/ShowPageHeader";
import { TicketPurchaseSection } from "@/components/tickets/TicketPurchaseSection";
import { getShowById, shows } from "@/data/shows";

type ShowPageProps = PageProps<"/shows/[slug]">;

export function generateStaticParams() {
  return shows.map((show) => ({
    slug: show.id,
  }));
}

export async function generateMetadata(
  props: ShowPageProps
): Promise<Metadata> {
  const { slug } = await props.params;
  const show = getShowById(slug);

  if (!show) {
    return {
      title: "Show não encontrado",
    };
  }

  return {
    title: `${show.city} | ${show.eventName}`,
    description: show.aboutDescription,
  };
}

export default async function ShowDetailsPage(props: ShowPageProps) {
  const { slug } = await props.params;
  const show = getShowById(slug);

  if (!show) {
    notFound();
  }

  return (
    <main className="flex-1 bg-white py-6 sm:py-8">
      <div className="space-y-10 sm:space-y-12">
        <ShowPageHeader city={show.city} eventName={show.eventName} />

        <ShowBanner src={show.bannerImage} alt={show.bannerImageAlt} />

        <TicketPurchaseSection
          showId={show.id}
          initialStock={show.initialStock}
          tickets={show.tickets}
        />

        <section className="mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-0">
          <SectionTitle title={show.stadium} />

          <div className="mt-4 space-y-1">
            <RatingRow
              label={show.stadiumRatingLabel}
              rating={show.stadiumRating}
              maxRating={5}
            />

            <p className="text-base text-slate-600 sm:text-[1.05rem]">
              Informações e regras{" "}
              <a
                href={show.fanReportHref}
                className="font-medium text-sky-700 underline decoration-1 underline-offset-4 transition-colors hover:text-sky-800"
              >
                FanReport
              </a>
            </p>
          </div>
        </section>

        <section className="mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-0">
          <SectionTitle title="Endereço" />

          <div className="mt-4 space-y-3">
            <p className="text-[1rem] leading-7 text-slate-600 sm:text-[1.05rem]">
              {show.address}
            </p>

            <a
              href={show.googleMapsHref}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-[1rem] font-medium text-sky-700 underline decoration-1 underline-offset-4 transition-colors hover:text-sky-800 sm:text-[1.05rem]"
            >
              <MapPin className="h-4 w-4" aria-hidden="true" />
              <span>Abrir no Google Maps</span>
            </a>
          </div>
        </section>

        <section className="mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-0">
          <div className="space-y-2">
            {show.ratings.map((rating) => (
              <RatingRow
                key={rating.label}
                label={rating.label}
                rating={rating.rating}
                maxRating={rating.maxRating}
              />
            ))}
          </div>
        </section>

        <section className="mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-0">
          <SectionTitle title="Sobre o Evento" />

          <div className="mx-auto mt-8 max-w-3xl text-center sm:mt-10">
            <p className="text-[0.98rem] font-semibold leading-7 tracking-[-0.02em] text-slate-600 sm:text-[1.1rem]">
              {show.aboutTitle}
            </p>
            <p className="mx-auto mt-5 max-w-3xl text-[0.96rem] italic leading-7 tracking-[-0.015em] text-slate-500 sm:text-[1.02rem]">
              {show.aboutDescription}
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
