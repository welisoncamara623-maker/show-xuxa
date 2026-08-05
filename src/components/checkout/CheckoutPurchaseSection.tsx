"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import type { TicketOption } from "@/data/shows";
import { PageBackButton } from "@/components/navigation/PageBackButton";
import { useTicketStore } from "@/store/ticket-store";
import {
  calculateFinalTotal,
  calculateInsuranceAmount,
  calculateTicketSubtotal,
  sumSelectedQuantities,
  type ProtectionOption,
} from "@/lib/ticket-calculations";

import { CustomerEmailModal } from "./CustomerEmailModal";
import { CheckoutEventSummary } from "./CheckoutEventSummary";
import { CheckoutHeader } from "./CheckoutHeader";
import { CheckoutOrderSummary } from "./CheckoutOrderSummary";
import { CheckoutSteps } from "./CheckoutSteps";
import { PixCheckoutSection } from "./PixCheckoutSection";

type CheckoutPurchaseSectionProps = {
  showId: string;
  city: string;
  eventName: string;
  stadium: string;
  date: string;
  month: string;
  year: string;
  weekDay: string;
  hour: string;
  tickets: TicketOption[];
};

function CheckoutSkeleton() {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-0">
      <div className="space-y-4" aria-hidden="true">
        <div className="h-[180px] animate-pulse rounded-[24px] border border-slate-200 bg-slate-100/70 shadow-[0_10px_24px_rgba(15,23,42,0.05)]" />
        <div className="h-[220px] animate-pulse rounded-[24px] border border-slate-200 bg-slate-100/70 shadow-[0_10px_24px_rgba(15,23,42,0.05)]" />
        <div className="h-[200px] animate-pulse rounded-[24px] border border-slate-200 bg-slate-100/70 shadow-[0_10px_24px_rgba(15,23,42,0.05)]" />
        <div className="h-[190px] animate-pulse rounded-[24px] border border-slate-200 bg-slate-100/70 shadow-[0_10px_24px_rgba(15,23,42,0.05)]" />
      </div>
    </div>
  );
}

function EmptyCheckoutState({ showId }: { showId: string }) {
  return (
    <section className="mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-0">
      <div className="flex flex-col items-start gap-4">
        <PageBackButton fallbackHref={`/shows/${showId}/protection`} />

        <div className="mx-auto w-full max-w-2xl rounded-[28px] border border-slate-200 bg-white px-5 py-8 text-center shadow-[0_10px_24px_rgba(15,23,42,0.06)] sm:px-8 sm:py-10">
          <p className="text-[1rem] font-semibold tracking-[-0.03em] text-slate-950 sm:text-[1.08rem]">
            Seu checkout ainda não está pronto.
          </p>
          <p className="mt-2 text-[0.95rem] leading-6 text-slate-600 sm:text-[1rem]">
            Volte ao evento para selecionar os ingressos e confirmar a proteção
            antes de seguir para o pagamento.
          </p>
        </div>
      </div>
    </section>
  );
}

export function CheckoutPurchaseSection({
  showId,
  city,
  eventName,
  stadium,
  date,
  month,
  year,
  weekDay,
  hour,
  tickets,
}: CheckoutPurchaseSectionProps) {
  const router = useRouter();
  const [hasHydrated, setHasHydrated] = useState(false);
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [isSavingEmail, setIsSavingEmail] = useState(false);

  const showState = useTicketStore((state) => state.shows[showId]);
  const checkoutDraft = useTicketStore((state) => state.checkoutDrafts[showId]);
  const setCustomerEmail = useTicketStore((state) => state.setCustomerEmail);

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

  const selectedQuantities = showState?.selectedQuantities ?? {};
  const totalSelected = sumSelectedQuantities(selectedQuantities);
  const draftEmail = checkoutDraft?.customerEmail?.trim() ?? "";
  const selectedProtection: ProtectionOption =
    checkoutDraft?.selectedProtection ??
    showState?.selectedProtection ??
    "ticket-only";

  const ticketSubtotalInCents = calculateTicketSubtotal(
    tickets,
    selectedQuantities
  );
  const insuranceAmountInCents =
    selectedProtection === "ticket-with-insurance"
      ? calculateInsuranceAmount(ticketSubtotalInCents)
      : 0;
  const finalTotalInCents = calculateFinalTotal(
    ticketSubtotalInCents,
    selectedProtection
  );

  const hasCheckoutData =
    hasHydrated &&
    Boolean(showState) &&
    totalSelected > 0 &&
    Boolean(draftEmail) &&
    Boolean(checkoutDraft);

  const handleEditEmail = () => {
    if (!hasCheckoutData || isSavingEmail) {
      return;
    }

    setEmailModalOpen(true);
  };

  const handleCloseModal = () => {
    if (isSavingEmail) {
      return;
    }

    setEmailModalOpen(false);
  };

  const handleConfirmEmail = async (email: string) => {
    if (!hasCheckoutData) {
      return false;
    }

    setIsSavingEmail(true);
    setCustomerEmail(showId, email);
    setIsSavingEmail(false);
    setEmailModalOpen(false);
    return true;
  };

  const handlePaymentConfirmed = async () => {
    const result = useTicketStore
      .getState()
      .finalizePurchase(showId, selectedProtection);

    if (!result.success) {
      return false;
    }

    router.push(`/shows/${showId}/success`);
    return true;
  };

  if (!hasHydrated) {
    return <CheckoutSkeleton />;
  }

  if (!hasCheckoutData) {
    return <EmptyCheckoutState showId={showId} />;
  }

  return (
    <section className="mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-0">
      <div className="space-y-6">
        <CheckoutHeader
          backHref={`/shows/${showId}/protection`}
          city={city}
          eventName={eventName}
        />

        <CheckoutSteps activeStep={3} />

        <div className="space-y-6">
          <CheckoutEventSummary
            city={city}
            eventName={eventName}
            stadium={stadium}
            date={date}
            month={month}
            year={year}
            weekDay={weekDay}
            hour={hour}
          />

          <CheckoutOrderSummary
            customerEmail={draftEmail}
            onEditEmail={handleEditEmail}
            selectedProtection={selectedProtection}
            ticketSubtotalInCents={ticketSubtotalInCents}
            insuranceAmountInCents={insuranceAmountInCents}
            finalTotalInCents={finalTotalInCents}
          />

          <PixCheckoutSection
            showId={showId}
            customerEmail={draftEmail}
            selectedProtection={selectedProtection}
            selectedQuantities={selectedQuantities}
            tickets={tickets}
            onPaymentConfirmed={handlePaymentConfirmed}
          />
        </div>
      </div>

      {emailModalOpen ? (
        <CustomerEmailModal
          open={emailModalOpen}
          defaultEmail={draftEmail}
          submitting={isSavingEmail}
          onClose={handleCloseModal}
          onConfirm={handleConfirmEmail}
        />
      ) : null}
    </section>
  );
}
