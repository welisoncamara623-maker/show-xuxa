import type { TicketOption } from "@/data/shows";

export type CheckoutTicketLine = {
  ticketId: string;
  sector: string;
  category: TicketOption["category"];
  quantity: number;
  unitPriceInCents: number;
  lineTotalInCents: number;
};

export function getSelectedTicketLines(
  tickets: TicketOption[],
  selectedQuantities: Record<string, number>
) {
  return tickets
    .map((ticket): CheckoutTicketLine | null => {
      const quantity = selectedQuantities[ticket.id] ?? 0;

      if (quantity <= 0) {
        return null;
      }

      return {
        ticketId: ticket.id,
        sector: ticket.sector,
        category: ticket.category,
        quantity,
        unitPriceInCents: ticket.priceInCents,
        lineTotalInCents: ticket.priceInCents * quantity,
      };
    })
    .filter((item): item is CheckoutTicketLine => item !== null);
}

export function getSelectedTicketsCount(
  selectedQuantities: Record<string, number>
) {
  return Object.values(selectedQuantities).reduce(
    (total, quantity) => total + quantity,
    0
  );
}
