import { create } from "zustand";
import { Message, MessageStatus } from "@/types";

interface MessageStore {
  messages: Record<string, Message[]>;

  setMessages: (conversationId: string, messages: Message[]) => void;

  addMessage: (conversationId: string, message: Message) => void;

  prependMessages: (conversationId: string, messages: Message[]) => void;

  replaceTempMessage: (
    conversationId: string,
    tempId: string,
    message: Message,
  ) => void;

  updateStatus: (
    conversationId: string,
    messageId: string,
    status: MessageStatus,
  ) => void;

  updateMessage: (conversationId: string, message: Message) => void;

  removeMessage: (conversationId: string, messageId: string) => void;

  clearConversation: (conversationId: string) => void;

  clearAll: () => void;

  getConversationMessages: (conversationId: string) => Message[];

  replaceByClientId: (
    conversationId: string,
    clientId: string,
    message: Message,
  ) => void;

  confirmMessage: (
    clientId: string,

    serverMessage: any,
  ) => void;

  markFailed : (
    clientId: string,

  ) => void
}

export const useMessageStore = create<MessageStore>((set, get) => ({
  messages: {},

  setMessages: (conversationId, messages) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [conversationId]: messages,
      },
    })),

  addMessage: (conversationId, message) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [conversationId]: [...(state.messages[conversationId] ?? []), message],
      },
    })),

  prependMessages: (conversationId, messages) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [conversationId]: [
          ...messages,
          ...(state.messages[conversationId] ?? []),
        ],
      },
    })),

  replaceTempMessage: (conversationId, tempId, message) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [conversationId]: (state.messages[conversationId] ?? []).map((item) =>
          item._id === tempId ? message : item,
        ),
      },
    })),

  updateStatus: (conversationId, messageId, status) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [conversationId]: (state.messages[conversationId] ?? []).map((item) =>
          item._id === messageId
            ? {
                ...item,
                status,
              }
            : item,
        ),
      },
    })),

  updateMessage: (conversationId, message) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [conversationId]: (state.messages[conversationId] ?? []).map((item) =>
          item._id === message._id ? message : item,
        ),
      },
    })),

  removeMessage: (conversationId, messageId) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [conversationId]: (state.messages[conversationId] ?? []).filter(
          (item) => item._id !== messageId,
        ),
      },
    })),

  clearConversation: (conversationId) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [conversationId]: [],
      },
    })),

  clearAll: () =>
    set({
      messages: {},
    }),

  getConversationMessages: (conversationId) => {
    return get().messages[conversationId] ?? [];
  },

  replaceByClientId: (conversationId, clientId, message) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [conversationId]: (state.messages[conversationId] ?? []).map((item) =>
          item.clientId === clientId ? message : item,
        ),
      },
    })),

  confirmMessage: (
    clientId,

    serverMessage,
  ) =>
    set((state) => {
      const next = {
        ...state.messages,
      };

      for (const cid in next) {
        next[cid] = next[cid].map((m) => {
          if (m.clientId !== clientId) return m;

          return {
            ...m,

            ...serverMessage,
          };
        });
      }

      return {
        messages: next,
      };
    }),

  markFailed: (clientId) =>
    set((state) => {
      const messages = {
        ...state.messages,
      };

      for (const id in messages) {
        messages[id] = messages[id].map((m) =>
          m.clientId === clientId
            ? {
                ...m,

                status: "failed",
              }
            : m,
        );
      }

      return {
        messages,
      };
    }),
}));
