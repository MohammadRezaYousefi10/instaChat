import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { PendingMessage } from "../types";

interface PendingStore {
  pending: Record<string, PendingMessage>;

  add: (message: PendingMessage) => void;

  remove: (clientId: string) => void;

  clear: () => void;

  has: (clientId: string) => boolean;

  get: (clientId: string) => PendingMessage | undefined;

  getAll: () => PendingMessage[];

  incrementRetry: (clientId: string) => void;

  updateNextRetry: (clientId: string, nextRetryAt: number) => void;
}

export const usePendingStore = create<PendingStore>()(
  persist(
    (set, get) => ({
      pending: {},

      add: (message) =>
        set((state) => ({
          pending: {
            ...state.pending,

            [message.clientId]: message,
          },
        })),

      remove: (clientId) =>
        set((state) => {
          const pending = {
            ...state.pending,
          };

          delete pending[clientId];

          return {
            pending,
          };
        }),

      clear: () =>
        set({
          pending: {},
        }),

      has: (clientId) => !!get().pending[clientId],

      get: (clientId) => get().pending[clientId],

      getAll: () => Object.values(get().pending),

      incrementRetry: (clientId) =>
        set((state) => {
          const pending = {
            ...state.pending,
          };

          const message = pending[clientId];

          if (!message) return state;

          pending[clientId] = {
            ...message,

            retryCount: message.retryCount + 1,
          };

          return {
            pending,
          };
        }),

      updateNextRetry: (
        clientId,

        nextRetryAt,
      ) =>
        set((state) => {
          const pending = {
            ...state.pending,
          };

          const message = pending[clientId];

          if (!message) return state;

          pending[clientId] = {
            ...message,

            nextRetryAt,
          };

          return {
            pending,
          };
        }),
    }),

    {
      name: "pending-messages",

      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
