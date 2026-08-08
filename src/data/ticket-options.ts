export type TicketOption = {
  id: string;
  sector: string;
  category: "MEIA" | "INTEIRA";
  priceInCents: number;
  description?: string;
};

export const DEFAULT_TICKET_OPTIONS = [
  {
    id: "upper-seat-half",
    sector: "CADEIRA SUPERIOR",
    category: "MEIA",
    priceInCents: 100,
    description:
      "Obrigatória a apresentação de documento que comprove o direito à meia-entrada.",
  },
  {
    id: "upper-seat-full",
    sector: "CADEIRA SUPERIOR",
    category: "INTEIRA",
    priceInCents: 19500,
  },
  {
    id: "floor-half",
    sector: "PISTA",
    category: "MEIA",
    priceInCents: 14750,
    description:
      "Obrigatória a apresentação de documento que comprove o direito à meia-entrada.",
  },
  {
    id: "floor-full",
    sector: "PISTA",
    category: "INTEIRA",
    priceInCents: 29500,
  },
  {
    id: "lower-seat-half",
    sector: "CADEIRA INFERIOR",
    category: "MEIA",
    priceInCents: 18250,
    description:
      "Obrigatória a apresentação de documento que comprove o direito à meia-entrada.",
  },
  {
    id: "lower-seat-full",
    sector: "CADEIRA INFERIOR",
    category: "INTEIRA",
    priceInCents: 36500,
  },
  {
    id: "premium-floor-half",
    sector: "PISTA PREMIUM",
    category: "MEIA",
    priceInCents: 29750,
    description:
      "Obrigatória a apresentação de documento que comprove o direito à meia-entrada.",
  },
  {
    id: "premium-floor-full",
    sector: "PISTA PREMIUM",
    category: "INTEIRA",
    priceInCents: 59500,
  },
] satisfies readonly TicketOption[];

export const DEFAULT_TICKET_SECTORS = [
  "CADEIRA SUPERIOR",
  "PISTA",
  "CADEIRA INFERIOR",
  "PISTA PREMIUM",
] as const;
