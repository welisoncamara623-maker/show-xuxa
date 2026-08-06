"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

import type { TicketOption } from "@/data/shows";
import { fromCents, formatCurrencyBRL } from "@/lib/currency";
import {
  calculateFinalTotal,
  calculateInsuranceAmount,
  calculateTicketSubtotal,
  sumSelectedQuantities,
  type ProtectionOption,
} from "@/lib/ticket-calculations";
import { useTicketStore } from "@/store/ticket-store";

import { CustomerEmailModal } from "../checkout/CustomerEmailModal";
import { ProtectionBenefits } from "./ProtectionBenefits";
import { ProtectionConfirmBar } from "./ProtectionConfirmBar";
import { ProtectionHeader } from "./ProtectionHeader";
import { ProtectionOptionCard } from "./ProtectionOptionCard";
import { ProtectionSummary } from "./ProtectionSummary";

type ProtectionPurchaseSectionProps = {
  showId: string;
  showName: string;
  tickets: TicketOption[];
};

export function ProtectionPurchaseSection({
  showId,
  showName,
  tickets,
}: ProtectionPurchaseSectionProps) {
  const router = useRouter();
  const confirmButtonRef = useRef<HTMLButtonElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const showState = useTicketStore((state) => state.shows[showId]);
  const checkoutEmail = useTicketStore(
    (state) => state.checkoutDrafts[showId]?.customerEmail ?? ""
  );
  const setSelectedProtection = useTicketStore(
    (state) => state.setSelectedProtection
  );
  const prepareCheckout = useTicketStore((state) => state.prepareCheckout);

  const selectedQuantities = showState?.selectedQuantities ?? {};
  const selectedProtection = showState?.selectedProtection ?? "ticket-only";
  const totalSelected = sumSelectedQuantities(selectedQuantities);
  const ticketSubtotalInCents = calculateTicketSubtotal(
    tickets,
    selectedQuantities
  );
  const insuranceAmountInCents =
    selectedProtection === "ticket-with-insurance"
      ? calculateInsuranceAmount(ticketSubtotalInCents)
      : 0;
  const totalWithInsuranceInCents =
    ticketSubtotalInCents + insuranceAmountInCents;
  const finalTotalInCents = calculateFinalTotal(
    ticketSubtotalInCents,
    selectedProtection
  );
  const hasSelection = totalSelected > 0;
  const draftEmail = checkoutEmail || undefined;

  const handleProtectionChange = (value: ProtectionOption) => {
    if (isSubmitting) {
      return;
    }

    setSelectedProtection(showId, value);
    setModalError(null);
  };

  const handleOpenEmailModal = () => {
    if (isSubmitting || !hasSelection) {
      return;
    }

    setModalError(null);
    setEmailModalOpen(true);
  };

  const handleCloseEmailModal = () => {
    if (isSubmitting) {
      return;
    }

    setEmailModalOpen(false);
    setModalError(null);
  };

  const handleEmailConfirm = async (email: string) => {
    if (!hasSelection) {
      return false;
    }

    setIsSubmitting(true);
    setModalError(null);

    const result = prepareCheckout(showId, email, selectedProtection);

    if (result.success) {
      setEmailModalOpen(false);
      setIsSubmitting(false);
      router.push(`/shows/${showId}/checkout`);
      return true;
    }

    if (result.reason === "EMPTY_CART") {
      setModalError(
        "Nenhum ingresso foi selecionado. Volte ao evento para escolher seus ingressos."
      );
    } else if (result.reason === "SHOW_NOT_INITIALIZED") {
      setModalError("Não foi possível localizar a compra atual.");
    } else {
      setModalError("Digite um e-mail válido para continuar.");
    }

    setIsSubmitting(false);
    return false;
  };

  if (!hasSelection) {
    return (
      <section className="mx-auto w-full max-w-3xl px-4 sm:px-6 lg:px-0">
        <ProtectionHeader showName={showName} backHref={`/shows/${showId}`} />

        <div className="mx-auto mt-8 max-w-2xl rounded-[24px] border border-slate-200 bg-white px-5 py-6 text-center shadow-[0_10px_24px_rgba(15,23,42,0.06)]">
          <p className="text-[1rem] font-semibold tracking-[-0.03em] text-slate-950 sm:text-[1.08rem]">
            Nenhum ingresso foi selecionado.
          </p>
          <p className="mt-2 text-[0.95rem] leading-6 text-slate-600 sm:text-[1rem]">
            Volte ao evento para escolher seus ingressos.
          </p>
        </div>
      </section>
    );
  }

  const protectionCards = [
    {
      value: "ticket-with-insurance" as const,
      title: "Ingressos + Seguro",
      totalInCents: totalWithInsuranceInCents,
      description: "Mais tranquilidade para o seu próximo evento.",
      badge: "Recomendado",
      children: (
        <>
          <div className="space-y-1 rounded-[18px] bg-slate-50 px-4 py-3">
            <p className="text-[0.9rem] leading-6 text-slate-600">
              Ingressos:{" "}
              <span className="font-medium text-slate-950">
                {formatCurrencyBRL(fromCents(ticketSubtotalInCents))}
              </span>
            </p>
            <p className="text-[0.9rem] leading-6 text-slate-600">
              Seguro (10%):{" "}
              <span className="font-medium text-slate-950">
                {formatCurrencyBRL(fromCents(insuranceAmountInCents))}
              </span>
            </p>
          </div>

          <ProtectionBenefits
            items={[
              "Proteção para situações cobertas pelo plano",
              "Possibilidade de solicitar reembolso conforme as condições",
              "Adicione proteção por 10% do valor dos ingressos",
            ]}
          />
        </>
      ),
    },
    {
      value: "ticket-only" as const,
      title: "Somente ingressos",
      totalInCents: ticketSubtotalInCents,
      description: "Continuar sem proteção adicional",
      children: null,
    },
  ];

  return (
    <section className="mx-auto w-full max-w-3xl px-4 sm:px-6 lg:px-0">
      <div className="space-y-8">
        <ProtectionHeader showName={showName} backHref={`/shows/${showId}`} />

        <fieldset className="space-y-4">
          <legend className="sr-only">Escolha uma opção de proteção</legend>

          {protectionCards.map((card) => (
            <ProtectionOptionCard
              key={card.value}
              name={`protection-${showId}`}
              value={card.value}
              title={card.title}
              totalInCents={card.totalInCents}
              description={card.description}
              badge={card.badge}
              selected={selectedProtection === card.value}
              onSelect={handleProtectionChange}
            >
              {card.children}
            </ProtectionOptionCard>
          ))}
        </fieldset>

        <div className="space-y-4">
          <div className="flex justify-center">
            <Link
              href="/terms/ticket-insurance"
              className="text-[0.92rem] font-medium text-sky-700 underline decoration-1 underline-offset-4 transition-colors hover:text-sky-800"
            >
              Termos e condições do Seguro Ingresso Protegido
            </Link>
          </div>

          <div className="space-y-4">
            <ProtectionSummary
              tickets={tickets}
              selectedQuantities={selectedQuantities}
              selectedProtection={selectedProtection}
            />

            <ProtectionConfirmBar
              totalInCents={finalTotalInCents}
              disabled={!hasSelection}
              isLoading={isSubmitting}
              buttonRef={confirmButtonRef}
              onConfirm={handleOpenEmailModal}
            />
          </div>
        </div>

        {emailModalOpen ? (
          <CustomerEmailModal
            open={emailModalOpen}
            defaultEmail={draftEmail}
            submitting={isSubmitting}
            submitError={modalError}
            returnFocusRef={confirmButtonRef}
            onClose={handleCloseEmailModal}
            onConfirm={handleEmailConfirm}
          />
        ) : null}
      </div>
    </section>
  );
}
