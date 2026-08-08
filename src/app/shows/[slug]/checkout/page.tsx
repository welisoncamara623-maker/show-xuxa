import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CheckoutPurchaseSection } from "@/components/checkout/CheckoutPurchaseSection";
import { getShowById, shows } from "@/data/shows";

type CheckoutPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return shows.map((show) => ({
    slug: show.id,
  }));
}

export async function generateMetadata(
  props: CheckoutPageProps
): Promise<Metadata> {
  const { slug } = await props.params;
  const show = getShowById(slug);

  if (!show) {
    return {
      title: "Checkout Pix",
    };
  }

  return {
    title: `${show.city} | Checkout Pix`,
    description: `Checkout Pix da compra de ${show.city}.`,
  };
}

export default async function CheckoutPage(props: CheckoutPageProps) {
  const { slug } = await props.params;
  const show = getShowById(slug);

  if (!show) {
    notFound();
  }

  return (
    <main className="flex-1 bg-white py-8 sm:py-10">
      <CheckoutPurchaseSection
        showId={show.id}
        city={show.city}
        stadium={show.stadium}
        date={show.card.date}
        month={show.card.month}
        year={show.card.year}
        weekDay={show.card.weekDay}
        hour={show.card.hour}
        tickets={show.tickets}
      />
    </main>
  );
}
