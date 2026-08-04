import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { getShowById, type TicketOption } from "@/data/shows";
import {
  calculateFinalTotal,
  calculateInsuranceAmount,
  calculateTicketSubtotal,
  sumSelectedQuantities,
  type ProtectionOption,
} from "@/lib/ticket-calculations";

type ShowTicketState = {
  stock: number;
  selectedQuantities: Record<string, number>;
  selectedProtection: ProtectionOption;
  lastPurchase: FinalizedPurchase | null;
};

export type CheckoutDraft = {
  showId: string;
  customerEmail: string;
  selectedProtection: ProtectionOption;
};

export type FinalizedPurchase = {
  showId: string;
  items: Array<{
    ticketId: string;
    quantity: number;
    unitPriceInCents: number;
  }>;
  protection: ProtectionOption;
  ticketSubtotalInCents: number;
  insuranceAmountInCents: number;
  finalTotalInCents: number;
  purchasedAt: string;
};

export type PrepareCheckoutResult =
  | {
      success: true;
    }
  | {
      success: false;
      reason: "EMPTY_CART" | "INVALID_EMAIL" | "SHOW_NOT_INITIALIZED";
    };

export type CheckoutResult =
  | {
      success: true;
      purchase: FinalizedPurchase;
      remainingStock: number;
    }
  | {
      success: false;
      reason: "EMPTY_CART" | "INSUFFICIENT_STOCK" | "SHOW_NOT_INITIALIZED";
    };

type PersistedLegacyShowState = {
  stock: number;
  selectedQuantity?: number;
  selectedQuantities?: Record<string, number>;
  selectedProtection?: ProtectionOption;
  lastPurchase?: FinalizedPurchase | null;
};

type TicketStore = {
  shows: Record<string, ShowTicketState>;
  checkoutDrafts: Record<string, CheckoutDraft>;
  initializeShow: (showId: string, initialStock: number) => void;
  incrementQuantity: (showId: string, ticketId: string) => void;
  decrementQuantity: (showId: string, ticketId: string) => void;
  setSelectedProtection: (
    showId: string,
    protection: ProtectionOption
  ) => void;
  setCustomerEmail: (showId: string, email: string) => void;
  prepareCheckout: (
    showId: string,
    email: string,
    protection: ProtectionOption
  ) => PrepareCheckoutResult;
  finalizePurchase: (
    showId: string,
    protection: ProtectionOption
  ) => CheckoutResult;
  resetStore: () => void;
};

// Persistência temporária por navegador.
// O estoque global deverá ser movido para o backend quando houver vendas reais.
function normalizeSelectedQuantities(
  selectedQuantities: Record<string, number> | undefined
) {
  if (!selectedQuantities) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(selectedQuantities).filter(([, quantity]) => quantity > 0)
  );
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function getShowTickets(showId: string): TicketOption[] | null {
  return getShowById(showId)?.tickets ?? null;
}

function normalizeShowState(
  state: PersistedLegacyShowState | ShowTicketState
): ShowTicketState {
  const selectedQuantities = normalizeSelectedQuantities(
    "selectedQuantities" in state ? state.selectedQuantities : undefined
  );

  return {
    stock: state.stock,
    selectedQuantities,
    selectedProtection:
      "selectedProtection" in state &&
      state.selectedProtection === "ticket-with-insurance"
        ? "ticket-with-insurance"
        : "ticket-only",
    lastPurchase:
      "lastPurchase" in state && state.lastPurchase
        ? state.lastPurchase
        : null,
  };
}

function migratePersistedState(
  persistedState: unknown
): {
  shows: Record<string, ShowTicketState>;
  checkoutDrafts: Record<string, CheckoutDraft>;
} {
  if (!persistedState || typeof persistedState !== "object") {
    return { shows: {}, checkoutDrafts: {} };
  }

  const rawShows = "shows" in persistedState ? persistedState.shows : undefined;
  const rawCheckoutDrafts =
    "checkoutDrafts" in persistedState ? persistedState.checkoutDrafts : undefined;

  const legacyShows = rawShows as Record<string, unknown> | undefined;
  const legacyDrafts = rawCheckoutDrafts as Record<string, unknown> | undefined;

  const shows = legacyShows
    ? Object.fromEntries(
        Object.entries(legacyShows).map(([showId, state]) => [
          showId,
          normalizeShowState(state as PersistedLegacyShowState),
        ])
      )
    : {};

  const checkoutDrafts = legacyDrafts
    ? Object.fromEntries(
        Object.entries(legacyDrafts)
          .map(([showId, draft]) => {
            const nextDraft = draft as Partial<CheckoutDraft> | undefined;

            if (
              !nextDraft ||
              typeof nextDraft.customerEmail !== "string" ||
              typeof nextDraft.selectedProtection !== "string"
            ) {
              return null;
            }

            return [
              showId,
              {
                showId,
                customerEmail: nextDraft.customerEmail,
                selectedProtection:
                  nextDraft.selectedProtection === "ticket-with-insurance"
                    ? "ticket-with-insurance"
                    : "ticket-only",
              },
            ] as const;
          })
          .filter((item): item is readonly [string, CheckoutDraft] => item !== null)
      )
    : {};

  return { shows, checkoutDrafts };
}

function getShowState(state: TicketStore, showId: string) {
  return state.shows[showId];
}

function buildPurchase(
  showId: string,
  showState: ShowTicketState,
  protection: ProtectionOption
) {
  const tickets = getShowTickets(showId);

  if (!tickets) {
    return null;
  }

  const items = tickets
    .map((ticket) => {
      const quantity = showState.selectedQuantities[ticket.id] ?? 0;

      if (quantity <= 0) {
        return null;
      }

      return {
        ticketId: ticket.id,
        quantity,
        unitPriceInCents: ticket.priceInCents,
      };
    })
    .filter(
      (item): item is { ticketId: string; quantity: number; unitPriceInCents: number } =>
        Boolean(item)
    );

  const ticketSubtotalInCents = calculateTicketSubtotal(
    tickets,
    showState.selectedQuantities
  );
  const insuranceAmountInCents =
    protection === "ticket-with-insurance"
      ? calculateInsuranceAmount(ticketSubtotalInCents)
      : 0;
  const finalTotalInCents = calculateFinalTotal(ticketSubtotalInCents, protection);

  return {
    showId,
    items,
    protection,
    ticketSubtotalInCents,
    insuranceAmountInCents,
    finalTotalInCents,
    purchasedAt: new Date().toISOString(),
  } satisfies FinalizedPurchase;
}

export const useTicketStore = create<TicketStore>()(
  persist(
    (set) => ({
      shows: {},
      checkoutDrafts: {},
      initializeShow: (showId, initialStock) => {
        set((state) => {
          const currentShow = state.shows[showId];

          if (currentShow) {
            return {
              shows: {
                ...state.shows,
                [showId]: {
                  ...currentShow,
                  selectedProtection:
                    currentShow.selectedProtection ?? "ticket-only",
                  lastPurchase: currentShow.lastPurchase ?? null,
                },
              },
            };
          }

          return {
            shows: {
              ...state.shows,
              [showId]: {
                stock: initialStock,
                selectedQuantities: {},
                selectedProtection: "ticket-only",
                lastPurchase: null,
              },
            },
          };
        });
      },
      incrementQuantity: (showId, ticketId) => {
        set((state) => {
          const currentShow = getShowState(state, showId);

          if (!currentShow) {
            return {};
          }

          const totalSelected = sumSelectedQuantities(
            currentShow.selectedQuantities
          );

          if (totalSelected >= currentShow.stock) {
            return {};
          }

          return {
            shows: {
              ...state.shows,
              [showId]: {
                ...currentShow,
                selectedQuantities: {
                  ...currentShow.selectedQuantities,
                  [ticketId]:
                    (currentShow.selectedQuantities[ticketId] ?? 0) + 1,
                },
              },
            },
          };
        });
      },
      decrementQuantity: (showId, ticketId) => {
        set((state) => {
          const currentShow = getShowState(state, showId);
          const currentQuantity = currentShow?.selectedQuantities[ticketId] ?? 0;

          if (!currentShow || currentQuantity <= 0) {
            return {};
          }

          const nextSelectedQuantities = {
            ...currentShow.selectedQuantities,
          };

          if (currentQuantity === 1) {
            delete nextSelectedQuantities[ticketId];
          } else {
            nextSelectedQuantities[ticketId] = currentQuantity - 1;
          }

          return {
            shows: {
              ...state.shows,
              [showId]: {
                ...currentShow,
                selectedQuantities: nextSelectedQuantities,
              },
            },
          };
        });
      },
      setSelectedProtection: (showId, protection) => {
        set((state) => {
          const currentShow = getShowState(state, showId);

          if (!currentShow) {
            return {};
          }

          return {
            shows: {
              ...state.shows,
              [showId]: {
                ...currentShow,
                selectedProtection: protection,
              },
            },
          };
        });
      },
      setCustomerEmail: (showId, email) => {
        set((state) => {
          const currentDraft = state.checkoutDrafts[showId];

          if (!currentDraft) {
            const currentShow = getShowState(state, showId);

            if (!currentShow) {
              return {};
            }

            return {
              checkoutDrafts: {
                ...state.checkoutDrafts,
                [showId]: {
                  showId,
                  customerEmail: normalizeEmail(email),
                  selectedProtection: currentShow.selectedProtection,
                },
              },
            };
          }

          return {
            checkoutDrafts: {
              ...state.checkoutDrafts,
              [showId]: {
                ...currentDraft,
                customerEmail: normalizeEmail(email),
              },
            },
          };
        });
      },
      prepareCheckout: (showId, email, protection) => {
        let result: PrepareCheckoutResult = {
          success: false,
          reason: "SHOW_NOT_INITIALIZED",
        };

        const normalizedEmail = normalizeEmail(email);

        set((state) => {
          const currentShow = getShowState(state, showId);

          if (!currentShow) {
            result = {
              success: false,
              reason: "SHOW_NOT_INITIALIZED",
            };
            return {};
          }

          if (!isValidEmail(normalizedEmail)) {
            result = {
              success: false,
              reason: "INVALID_EMAIL",
            };
            return {};
          }

          const totalSelected = sumSelectedQuantities(
            currentShow.selectedQuantities
          );

          if (totalSelected <= 0) {
            result = {
              success: false,
              reason: "EMPTY_CART",
            };
            return {};
          }

          result = {
            success: true,
          };

          return {
            shows: {
              ...state.shows,
              [showId]: {
                ...currentShow,
                selectedProtection: protection,
              },
            },
            checkoutDrafts: {
              ...state.checkoutDrafts,
              [showId]: {
                showId,
                customerEmail: normalizedEmail,
                selectedProtection: protection,
              },
            },
          };
        });

        return result;
      },
      finalizePurchase: (showId, protection) => {
        let result: CheckoutResult = {
          success: false,
          reason: "SHOW_NOT_INITIALIZED",
        };

        set((state) => {
          const currentShow = getShowState(state, showId);

          if (!currentShow) {
            result = {
              success: false,
              reason: "SHOW_NOT_INITIALIZED",
            };
            return {};
          }

          const totalSelected = sumSelectedQuantities(
            currentShow.selectedQuantities
          );

          if (totalSelected <= 0) {
            result = {
              success: false,
              reason: "EMPTY_CART",
            };
            return {};
          }

          if (totalSelected > currentShow.stock) {
            result = {
              success: false,
              reason: "INSUFFICIENT_STOCK",
            };
            return {};
          }

          const purchase = buildPurchase(showId, currentShow, protection);

          if (!purchase) {
            result = {
              success: false,
              reason: "SHOW_NOT_INITIALIZED",
            };
            return {};
          }

          result = {
            success: true,
            purchase,
            remainingStock: currentShow.stock - totalSelected,
          };

          return {
            shows: {
              ...state.shows,
              [showId]: {
                stock: currentShow.stock - totalSelected,
                selectedQuantities: {},
                selectedProtection: "ticket-only",
                lastPurchase: purchase,
              },
            },
          };
        });

        return result;
      },
      resetStore: () => {
        set({ shows: {}, checkoutDrafts: {} });
      },
    }),
    {
      name: "show-ticket-store",
      version: 4,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        shows: state.shows,
        checkoutDrafts: state.checkoutDrafts,
      }),
      migrate: (persistedState) => migratePersistedState(persistedState),
      skipHydration: true,
    }
  )
);
