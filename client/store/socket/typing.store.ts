import { create } from "zustand";
import type { TypingState } from "../types";


interface TypingStore {
  typing: TypingState;

  setTyping: (
    conversationId: string,
    userId: string,
    isTyping: boolean
  ) => void;

  clearConversation: (
    conversationId: string
  ) => void;

  clear: () => void;
}

export const useTypingStore = create<TypingStore>((set) => ({
  typing: {},

  setTyping: (conversationId, userId, isTyping) =>
    set((state) => ({
      typing: {
        ...state.typing,
        [conversationId]: {
          ...(state.typing[conversationId] ?? {}),
          [userId]: isTyping,
        },
      },
    })),

  clearConversation: (conversationId) =>
    set((state) => {
      const next = { ...state.typing };
      delete next[conversationId];
      return { typing: next };
    }),

  clear: () =>
    set({
      typing: {},
    }),
}));