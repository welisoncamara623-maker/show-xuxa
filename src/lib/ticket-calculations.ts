import type { TicketOption } from "@/data/shows";
import { formatCurrencyBRL, fromCents, toCents } from "@/lib/currency";

export type ProtectionOption = "ticket-only" | "ticket-with-insurance";

export const INSURANCE_RATE = 0.1;

export function sumSelectedQuantities(
  selectedQuantities: Record<string, number>
) {
  return Object.values(selectedQuantities).reduce(
    (total, quantity) => total + quantity,
    0
  );
}

export function calculateTicketSubtotal(
  tickets: TicketOption[],
  selectedQuantities: Record<string, number>
) {
  return tickets.reduce(
    (total, ticket) =>
      total + ticket.priceInCents * (selectedQuantities[ticket.id] ?? 0),
    0
  );
}

export function calculateInsuranceAmount(ticketSubtotalInCents: number) {
  return Math.round(ticketSubtotalInCents * INSURANCE_RATE);
}

export function calculateFinalTotal(
  ticketSubtotalInCents: number,
  protection: ProtectionOption
) {
  if (protection === "ticket-with-insurance") {
    return ticketSubtotalInCents + calculateInsuranceAmount(ticketSubtotalInCents);
  }

  return ticketSubtotalInCents;
}

export function roundCurrency(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function formatTicketSummary(quantity: number, label: string) {
  return `${quantity} ${quantity === 1 ? "ingresso" : "ingressos"} ${label.toLowerCase()}`;
}

export function formatProtectionTotal(total: number) {
  return formatCurrencyBRL(fromCents(toCents(roundCurrency(total))));
}
