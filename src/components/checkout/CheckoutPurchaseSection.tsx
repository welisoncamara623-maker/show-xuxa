"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import type { TicketOption } from "@/data/shows";
import { PageBackButton } from "@/components/navigation/PageBackButton";
import { useTicketStore } from "@/store/ticket-store";
import {
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
  stadium: string;
  date: string;
  month: string;
  year: string;
  weekDay: string;
  hour: string;
  tickets: TicketOption[];
};

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
  stadium,
  date,
  month,
  year,
  weekDay,
  hour,
  tickets,
}: CheckoutPurchaseSectionProps) {
  const router = useRouter();
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [isSavingEmail, setIsSavingEmail] = useState(false);

  const showState = useTicketStore((state) => state.shows[showId]);
  const setCustomerEmail = useTicketStore((state) => state.setCustomerEmail);
  const checkoutDraft = useTicketStore(
    (state) => state.shows[showId]?.checkoutDraft ?? null
  );
  const setLastCompletedOrder = useTicketStore(
    (state) => state.setLastCompletedOrder
  );
  const confirmLocalPurchase = useTicketStore(
    (state) => state.confirmLocalPurchase
  );

  const selectedQuantities = showState?.selectedQuantities ?? {};
  const totalSelected = sumSelectedQuantities(selectedQuantities);
  const draftEmail = showState?.customerEmail?.trim() ?? "";
  const selectedProtection: ProtectionOption =
    showState?.selectedProtection ?? "ticket-only";
  const orderId = checkoutDraft?.orderId ?? "";

  const hasCheckoutData =
    Boolean(showState) &&
    totalSelected > 0 &&
    Boolean(draftEmail) &&
    Boolean(showState?.customerEmail) &&
    Boolean(orderId);

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

  const handlePaymentConfirmed = async (input: {
    orderId: string;
    transactionId: string;
  }) => {
    if (!input.orderId || !input.transactionId) {
      return false;
    }

    const response = await fetch(`/api/shows/${showId}/checkout/confirm`, {
      method: "POST",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        orderId: input.orderId,
        transactionId: input.transactionId,
        customerEmail: draftEmail,
        selectedProtection,
        selectedQuantities,
      }),
    });

    const payload = (await response.json()) as
      | {
          paymentConfirmed: true;
          emailSent: boolean;
          order: {
            id: string;
            showId: string;
            customerEmail: string;
            items: Array<{
              ticketId: string;
              sector: string;
              category: string;
              quantity: number;
              unitPriceInCents: number;
              lineTotalInCents: number;
            }>;
            protection: ProtectionOption;
            ticketSubtotalInCents: number;
            insuranceInCents: number;
            finalTotalInCents: number;
            transactionId: string;
            completedAt: string;
            emailStatus: "sent" | "unknown";
          };
        }
      | {
          paymentConfirmed: false;
          emailSent: false;
          error?: string;
        };

    if (!response.ok || !("paymentConfirmed" in payload) || !payload.paymentConfirmed) {
      return false;
    }

    const totalQuantity = sumSelectedQuantities(selectedQuantities);

    confirmLocalPurchase(showId, input.orderId, totalQuantity);
    setLastCompletedOrder(showId, payload.order);

    router.push(
      `/shows/${showId}/success?orderId=${encodeURIComponent(input.orderId)}`
    );
    return true;
  };

  if (!hasCheckoutData) {
    return <EmptyCheckoutState showId={showId} />;
  }

  return (
    <section className="mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-0">
      <div className="space-y-6">
        <CheckoutHeader
          backHref={`/shows/${showId}/protection`}
          city={city}
        />

        <CheckoutSteps activeStep={3} />

        <div className="space-y-6">
          <CheckoutEventSummary
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
          />

          <PixCheckoutSection
            showId={showId}
            orderId={orderId}
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
