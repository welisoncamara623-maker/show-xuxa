"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import type { TicketOption } from "@/data/shows";
import { sumSelectedQuantities } from "@/lib/ticket-calculations";
import { useTicketStore } from "@/store/ticket-store";

import { TicketContinueBar } from "./TicketContinueBar";
import { TicketQuantityCard } from "./TicketQuantityCard";

type TicketPurchaseSectionProps = {
  showId: string;
  initialStock: number;
  tickets: TicketOption[];
};

function TicketPurchaseSkeleton() {
  return (
    <div className="mx-auto w-full max-w-[590px] px-4 sm:px-6 lg:px-0">
      <div className="space-y-3.5" aria-hidden="true">
        <div className="h-[124px] rounded-[20px] border border-slate-200 bg-slate-100/70 shadow-[0_10px_28px_rgba(15,23,42,0.04)] animate-pulse" />
        <div className="h-[112px] rounded-[20px] border border-slate-200 bg-slate-100/70 shadow-[0_10px_28px_rgba(15,23,42,0.04)] animate-pulse" />
        <div className="h-[54px] rounded-[16px] bg-slate-100/70 animate-pulse" />
      </div>
    </div>
  );
}

export function TicketPurchaseSection({
  showId,
  initialStock,
  tickets,
}: TicketPurchaseSectionProps) {
  const router = useRouter();
  const [hasHydrated, setHasHydrated] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  const showState = useTicketStore((state) => state.shows[showId]);
  const initializeShow = useTicketStore((state) => state.initializeShow);
  const incrementQuantity = useTicketStore((state) => state.incrementQuantity);
  const decrementQuantity = useTicketStore((state) => state.decrementQuantity);
  const selectedQuantities = showState?.selectedQuantities ?? {};
  const stock = showState?.stock ?? 0;
  const totalSelected = sumSelectedQuantities(selectedQuantities);
  const remainingStock = Math.max(stock - totalSelected, 0);
  const isReady = hasHydrated && Boolean(showState);

  useEffect(() => {
    let isActive = true;

    void Promise.resolve(useTicketStore.persist.rehydrate()).then(() => {
      if (isActive) {
        setHasHydrated(true);
      }
    });

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    if (hasHydrated) {
      initializeShow(showId, initialStock);
    }
  }, [hasHydrated, initialStock, initializeShow, showId]);

  const handleIncrement = (ticketId: string) => {
    if (!isReady || isNavigating || remainingStock <= 0) {
      return;
    }

    incrementQuantity(showId, ticketId);
  };

  const handleDecrement = (ticketId: string) => {
    if (!isReady || isNavigating) {
      return;
    }

    decrementQuantity(showId, ticketId);
  };

  const handleContinue = () => {
    if (!isReady || isNavigating || totalSelected <= 0) {
      return;
    }

    setIsNavigating(true);
    router.push(`/shows/${showId}/protection`);
  };

  if (!isReady) {
    return <TicketPurchaseSkeleton />;
  }

  return (
    <section className="mx-auto w-full max-w-[590px] px-4 sm:px-6 lg:px-0">
      <div className="space-y-3.5">
        {tickets.map((ticket) => (
          <TicketQuantityCard
            key={ticket.id}
            ticketId={ticket.id}
            name={ticket.name}
            category={ticket.category}
            priceInCents={ticket.priceInCents}
            description={ticket.description}
            quantity={selectedQuantities[ticket.id] ?? 0}
            availableStock={remainingStock}
            disabled={isNavigating}
            onIncrement={() => handleIncrement(ticket.id)}
            onDecrement={() => handleDecrement(ticket.id)}
          />
        ))}

        <TicketContinueBar
          tickets={tickets}
          selectedQuantities={selectedQuantities}
          isLoading={isNavigating}
          disabled={isNavigating}
          onContinue={handleContinue}
        />
      </div>
    </section>
  );
}
