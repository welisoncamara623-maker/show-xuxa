"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import type { TicketOption } from "@/data/shows";
import { DEFAULT_TICKET_SECTORS } from "@/data/ticket-options";
import { sumSelectedQuantities } from "@/lib/ticket-calculations";
import { useTicketStore } from "@/store/ticket-store";

import { SectionTitle } from "../SectionTitle";
import { TicketContinueBar } from "./TicketContinueBar";
import { TicketSectorGroup } from "./TicketSectorGroup";

type TicketPurchaseSectionProps = {
  showId: string;
  initialStock: number;
  tickets: TicketOption[];
};

function TicketPurchaseSkeleton() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-0">
      <div className="space-y-6" aria-hidden="true">
        <div className="h-12 rounded-[18px] bg-slate-100/70 animate-pulse" />
        <div className="grid gap-4 lg:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-[210px] rounded-[24px] border border-slate-200 bg-slate-100/70 shadow-[0_10px_28px_rgba(15,23,42,0.04)] animate-pulse"
            />
          ))}
        </div>
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

  const selectedQuantities = showState?.selectedQuantities ?? {};
  const stock = showState?.stock ?? 0;
  const totalSelected = sumSelectedQuantities(selectedQuantities);
  const remainingStock = Math.max(stock - totalSelected, 0);
  const isReady = hasHydrated && Boolean(showState);

  const ticketsBySector = useMemo(
    () =>
      DEFAULT_TICKET_SECTORS.map((sector) => ({
        sector,
        tickets: tickets.filter((ticket) => ticket.sector === sector),
      })),
    [tickets]
  );

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
    <section className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-0">
      <div className="rounded-[28px] border border-slate-200 bg-slate-50/70 p-4 shadow-[0_12px_30px_rgba(15,23,42,0.05)] sm:p-6 lg:p-7">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <SectionTitle title="Ingressos" />
        </div>

        {remainingStock <= 0 ? (
          <p className="mt-5 text-[0.95rem] font-medium text-slate-500">
            Ingressos esgotados
          </p>
        ) : null}

        <div className="mt-6 grid gap-4 xl:grid-cols-2">
          {ticketsBySector.map(({ sector, tickets: sectorTickets }) => (
            <TicketSectorGroup
              key={sector}
              sector={sector}
              tickets={sectorTickets}
              quantities={selectedQuantities}
              availableStock={remainingStock}
              disabled={isNavigating}
              onIncrement={handleIncrement}
              onDecrement={handleDecrement}
            />
          ))}
        </div>

        <div className="mt-6">
          <TicketContinueBar
            tickets={tickets}
            selectedQuantities={selectedQuantities}
            isLoading={isNavigating}
            disabled={isNavigating}
            onContinue={handleContinue}
          />
        </div>
      </div>
    </section>
  );
}
