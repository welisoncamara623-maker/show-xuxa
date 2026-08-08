import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ProtectionSuccessSection } from "@/components/protection/ProtectionSuccessSection";
import { getShowById, shows } from "@/data/shows";

type SuccessPageProps = PageProps<"/shows/[slug]/success">;

export function generateStaticParams() {
  return shows.map((show) => ({
    slug: show.id,
  }));
}

export async function generateMetadata(
  props: SuccessPageProps
): Promise<Metadata> {
  const { slug } = await props.params;
  const show = getShowById(slug);

  if (!show) {
    return {
      title: "Compra finalizada",
    };
  }

  return {
    title: `${show.city} | Compra finalizada`,
    description: `Resumo da compra finalizada para ${show.city}.`,
  };
}

export default async function SuccessPage(props: SuccessPageProps) {
  const { slug } = await props.params;
  const show = getShowById(slug);

  if (!show) {
    notFound();
  }

  return (
    <main className="flex-1 bg-white py-8 sm:py-10">
      <ProtectionSuccessSection
        showId={show.id}
        showName={show.eventName}
        backHref={`/shows/${show.id}`}
      />
    </main>
  );
}
