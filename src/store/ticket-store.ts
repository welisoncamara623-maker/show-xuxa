import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import {
  sumSelectedQuantities,
  type ProtectionOption,
} from "@/lib/ticket-calculations";
import type { PixPayment } from "@/services/payments/blackcat/types";

export type LocalOrderStatus =
  | "awaiting_payment"
  | "paid"
  | "cancelled"
  | "refunded";

export type LocalOrderItem = {
  ticketId: string;
  sector: string;
  category: string;
  quantity: number;
  unitPriceInCents: number;
  lineTotalInCents: number;
};

export type CheckoutDraft = {
  orderId: string;
  showId: string;
  customerEmail: string;
  protection: ProtectionOption;
  createdAt: string;
};

export type LocalOrder = {
  id: string;
  showId: string;
  transactionId: string;
  customerEmail: string;
  protection: ProtectionOption;
  items: LocalOrderItem[];
  status: LocalOrderStatus;
  createdAt: string;
};

export type CompletedOrder = {
  id: string;
  showId: string;
  customerEmail: string;
  items: LocalOrderItem[];
  protection: ProtectionOption;
  ticketSubtotalInCents: number;
  insuranceInCents: number;
  finalTotalInCents: number;
  transactionId: string;
  completedAt: string;
  emailStatus: "sent" | "unknown";
};

type ShowTicketState = {
  stock: number;
  selectedQuantities: Record<string, number>;
  selectedProtection: ProtectionOption;
  customerEmail: string;
  processedOrderIds: string[];
  checkoutDraft: CheckoutDraft | null;
  activePayment: (PixPayment & { orderId: string }) | null;
  localOrder: LocalOrder | null;
  lastCompletedOrder: CompletedOrder | null;
};

export type PrepareCheckoutResult =
  | {
      success: true;
      orderId: string;
    }
  | {
      success: false;
      reason: "EMPTY_CART" | "INVALID_EMAIL" | "SHOW_NOT_INITIALIZED";
    };

type TicketStore = {
  shows: Record<string, ShowTicketState>;
  hasHydrated: boolean;
  initializeShow: (showId: string, initialStock?: number) => void;
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
  registerLocalOrder: (showId: string, order: LocalOrder) => void;
  setActivePayment: (
    showId: string,
    payment: (PixPayment & { orderId: string }) | null
  ) => void;
  confirmLocalPurchase: (
    showId: string,
    orderId: string,
    totalQuantity: number
  ) => void;
  setLastCompletedOrder: (
    showId: string,
    order: CompletedOrder | null
  ) => void;
  resetStore: () => void;
};

// Persistência local temporária.
// Sem banco, o estoque não é compartilhado entre usuários.
function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function getShowState(state: TicketStore, showId: string) {
  return state.shows[showId];
}

function createDefaultShowState(initialStock = 5000): ShowTicketState {
  return {
    stock: initialStock,
    selectedQuantities: {},
    selectedProtection: "ticket-only",
    customerEmail: "",
    processedOrderIds: [],
    checkoutDraft: null,
    activePayment: null,
    localOrder: null,
    lastCompletedOrder: null,
  };
}

function ensureShowState(
  currentState: Record<string, ShowTicketState>,
  showId: string,
  initialStock = 5000
) {
  const currentShow = currentState[showId];

  if (currentShow) {
    return currentState;
  }

  return {
    ...currentState,
    [showId]: createDefaultShowState(initialStock),
  };
}

export const useTicketStore = create<TicketStore>()(
  persist(
    (set) => ({
      shows: {},
      hasHydrated: false,
      initializeShow: (showId, initialStock = 5000) => {
        set((state) => ({
          shows: ensureShowState(state.shows, showId, initialStock),
        }));
      },
      incrementQuantity: (showId, ticketId) => {
        set((state) => {
          const currentShow = getShowState(state, showId);

          if (!currentShow) {
            return {
              shows: ensureShowState(state.shows, showId),
            };
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
            return {
              shows: ensureShowState(state.shows, showId),
            };
          }

          return {
            shows: {
              ...state.shows,
              [showId]: {
                ...currentShow,
                selectedProtection: protection,
                checkoutDraft: currentShow.checkoutDraft
                  ? {
                      ...currentShow.checkoutDraft,
                      protection,
                    }
                  : currentShow.checkoutDraft,
              },
            },
          };
        });
      },
      setCustomerEmail: (showId, email) => {
        const normalizedEmail = normalizeEmail(email);

        set((state) => {
          const currentShow = getShowState(state, showId);

          if (!currentShow) {
            return {
              shows: {
                ...ensureShowState(state.shows, showId),
                [showId]: {
                  ...createDefaultShowState(),
                  customerEmail: normalizedEmail,
                },
              },
            };
          }

          return {
            shows: {
              ...state.shows,
              [showId]: {
                ...currentShow,
                customerEmail: normalizedEmail,
                checkoutDraft: currentShow.checkoutDraft
                  ? {
                      ...currentShow.checkoutDraft,
                      customerEmail: normalizedEmail,
                    }
                  : currentShow.checkoutDraft,
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
            return {
              shows: ensureShowState(state.shows, showId),
            };
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

          const orderId = globalThis.crypto?.randomUUID?.() ?? crypto.randomUUID();

          result = {
            success: true,
            orderId,
          };

          return {
            shows: {
              ...state.shows,
              [showId]: {
                ...currentShow,
                selectedProtection: protection,
                customerEmail: normalizedEmail,
                checkoutDraft: {
                  orderId,
                  showId,
                  customerEmail: normalizedEmail,
                  protection,
                  createdAt: new Date().toISOString(),
                },
                activePayment: null,
              },
            },
          };
        });

        return result;
      },
      registerLocalOrder: (showId, order) => {
        set((state) => {
          const currentShow = getShowState(state, showId);

          if (!currentShow) {
            return {
              shows: ensureShowState(state.shows, showId),
            };
          }

          return {
            shows: {
              ...state.shows,
              [showId]: {
                ...currentShow,
                localOrder: order,
              },
            },
          };
        });
      },
      setActivePayment: (showId, payment) => {
        set((state) => {
          const currentShow = getShowState(state, showId);

          if (!currentShow) {
            return {
              shows: ensureShowState(state.shows, showId),
            };
          }

          return {
            shows: {
              ...state.shows,
              [showId]: {
                ...currentShow,
                activePayment: payment,
              },
            },
          };
        });
      },
      confirmLocalPurchase: (showId, orderId, totalQuantity) => {
        set((state) => {
          const currentShow = getShowState(state, showId);

          if (!currentShow) {
            return {};
          }

          if (currentShow.processedOrderIds.includes(orderId)) {
            return {};
          }

          if (totalQuantity <= 0) {
            return {};
          }

          const nextStock = Math.max(currentShow.stock - totalQuantity, 0);

          return {
            shows: {
              ...state.shows,
              [showId]: {
                ...currentShow,
                stock: nextStock,
                selectedQuantities: {},
                selectedProtection: "ticket-only",
                customerEmail: "",
                checkoutDraft:
                  currentShow.checkoutDraft?.orderId === orderId
                    ? null
                    : currentShow.checkoutDraft,
                activePayment: null,
                localOrder: null,
                processedOrderIds: [
                  ...currentShow.processedOrderIds,
                  orderId,
                ],
              },
            },
          };
        });
      },
      setLastCompletedOrder: (showId, order) => {
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
                lastCompletedOrder: order,
              },
            },
          };
        });
      },
      resetStore: () => {
        set({ shows: {} });
      },
    }),
    {
      name: "show-ticket-store",
      storage: createJSONStorage(() => localStorage),
      version: 3,
      migrate: () => ({
        shows: {},
      }),
      partialize: (state) => ({
        shows: state.shows,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.hasHydrated = true;
        }
      },
    }
  )
);
