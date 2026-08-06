"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import type { TicketOption } from "@/data/shows";
import { DEFAULT_TICKET_SECTORS } from "@/data/ticket-options";
import { sumSelectedQuantities } from "@/lib/ticket-calculations";
import { useTicketStore } from "@/store/ticket-store";

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
              className="h-[210px] rounded-[16px] border border-slate-200 bg-slate-100/70 animate-pulse"
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
  const [isNavigating, setIsNavigating] = useState(false);

  const showState = useTicketStore((state) => state.shows[showId]);
  const initializeShow = useTicketStore((state) => state.initializeShow);
  const incrementQuantity = useTicketStore((state) => state.incrementQuantity);
  const decrementQuantity = useTicketStore((state) => state.decrementQuantity);

  useEffect(() => {
    initializeShow(showId, initialStock);
  }, [initializeShow, initialStock, showId]);

  const selectedQuantities = showState?.selectedQuantities ?? {};
  const stock = showState?.stock ?? 0;
  const totalSelected = sumSelectedQuantities(selectedQuantities);
  const remainingStock = Math.max(stock - totalSelected, 0);

  const ticketsBySector = useMemo(
    () =>
      DEFAULT_TICKET_SECTORS.map((sector) => ({
        sector,
        tickets: tickets.filter((ticket) => ticket.sector === sector),
      })),
    [tickets]
  );

  const handleIncrement = (ticketId: string) => {
    if (!showState || isNavigating || remainingStock <= 0) {
      return;
    }

    incrementQuantity(showId, ticketId);
  };

  const handleDecrement = (ticketId: string) => {
    if (!showState || isNavigating) {
      return;
    }

    decrementQuantity(showId, ticketId);
  };

  const handleContinue = () => {
    if (!showState || isNavigating || totalSelected <= 0) {
      return;
    }

    setIsNavigating(true);
    router.push(`/shows/${showId}/protection`);
  };

  if (!showState) {
    return <TicketPurchaseSkeleton />;
  }

  return (
    <section className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-0">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <h2 className="text-[1.15rem] font-semibold tracking-[-0.04em] text-slate-950 sm:text-[1.35rem]">
          Ingressos
        </h2>
      </div>

      {remainingStock <= 0 ? (
        <p className="mt-5 text-[0.95rem] font-medium text-slate-500">
          Ingressos esgotados
        </p>
      ) : null}

      <div className="mt-5 grid gap-4 xl:grid-cols-2">
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

      <div className="mt-5">
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
