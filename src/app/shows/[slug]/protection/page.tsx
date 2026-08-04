import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ProtectionPurchaseSection } from "@/components/protection/ProtectionPurchaseSection";
import { getShowById, shows } from "@/data/shows";

type ProtectionPageProps = PageProps<"/shows/[slug]/protection">;

export function generateStaticParams() {
  return shows.map((show) => ({
    slug: show.id,
  }));
}

export async function generateMetadata(
  props: ProtectionPageProps
): Promise<Metadata> {
  const { slug } = await props.params;
  const show = getShowById(slug);

  if (!show) {
    return {
      title: "Proteção do ingresso",
    };
  }

  return {
    title: `${show.city} | Proteção do ingresso`,
    description: `Escolha a proteção para os ingressos de ${show.city}.`,
  };
}

export default async function ProtectionPage(props: ProtectionPageProps) {
  const { slug } = await props.params;
  const show = getShowById(slug);

  if (!show) {
    notFound();
  }

  return (
    <main className="flex-1 bg-white py-8 sm:py-10">
      <ProtectionPurchaseSection
        showId={show.id}
        showName={show.eventName}
        tickets={show.tickets}
      />
    </main>
  );
}
