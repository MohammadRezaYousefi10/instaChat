import { create } from "zustand";
import { Message, MessageStatus } from "@/types";

interface MessagePagination {
  hasMore: boolean;

  loading: boolean;
}

interface MessageStore {
  [x: string]: any;
  messages: Record<string, Message[]>;
  pagination: Record<string, MessagePagination>;

  setMessages: (conversationId: string, messages: Message[]) => void;

  addMessage: (conversationId: string, message: Message) => void;

  appendMessage: (conversationId: string, message: Message) => void;

  prependMessages: (
    conversationId: string,
    newMessages: Message[],
    hasMore: boolean,
  ) => void;

  setInitialMessages: (
    conversationId: string,
    messages: Message[],
    hasMore: boolean,
  ) => void;
  setPaginationLoading: (conversationId: string, loading: boolean) => void;
  setPaginationHasMore: (conversationId: string, hasMore: boolean) => void;

  //pagination: Record<string, MessagePagination>;

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

  markFailed: (clientId: string) => void;

  replaceOptimisticMessage: (
    conversationId: string,

    clientId: string,

    message: Message,
  ) => void;

  replaceMessage: (
    conversationId: string,
    tempId: string,
    message: Message,
  ) => void;
}

export const useMessageStore = create<MessageStore>((set, get) => ({
  messages: {},
  pagination: {},

  /* setMessages: (conversationId, messages) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [conversationId]: messages,
      },
    })), */
  setMessages: (conversationId, messages) =>
    set((state) => ({
      messages: {
        ...state.messages,

        [conversationId]: messages,
      },

      pagination: {
        ...state.pagination,

        [conversationId]: {
          hasMore: state.pagination[conversationId]?.hasMore ?? true,

          loading: false,
        },
      },
    })),

  addMessage: (conversationId, message) =>
    set((state) => {
      const current = state.messages[conversationId] ?? [];

      const duplicate = current.some((m) => {
        if (m._id === message._id) {
          return true;
        }

        if (message.clientId && m.clientId === message.clientId) {
          return true;
        }

        return false;
      });

      if (duplicate) {
        return state;
      }

      return {
        messages: {
          ...state.messages,

          [conversationId]: [message, ...current],
        },
      };
    }),
  appendMessage: (conversationId, message) =>
    set((state) => {
      const current = state.messages[conversationId] ?? [];

      const existingIndex = current.findIndex((item) => {
        if (item._id === message._id) {
          return true;
        }

        if (message.clientId && item.clientId === message.clientId) {
          return true;
        }

        return false;
      });

      if (existingIndex !== -1) {
        const updated = [...current];

        updated[existingIndex] = {
          ...updated[existingIndex],

          ...message,
        };

        return {
          messages: {
            ...state.messages,

            [conversationId]: updated,
          },
        };
      }

      return {
        messages: {
          ...state.messages,

          [conversationId]: [...current, message],
        },
      };
    }),

  /* prependMessages: (conversationId, messages) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [conversationId]: [
          ...messages,
          ...(state.messages[conversationId] ?? []),
        ],
      },
    })), */
  /* prependMessages: (conversationId, newMessages, hasMore) =>
    set((state) => {
      const current = state.messages[conversationId] ?? [];

      const existingIds = new Set(current.map((message) => message._id));

      const existingClientIds = new Set(
        current.map((message) => message.clientId).filter(Boolean),
      );

      const uniqueMessages = newMessages.filter((message) => {
        if (existingIds.has(message._id)) {
          return false;
        }

        if (message.clientId && existingClientIds.has(message.clientId)) {
          return false;
        }

        return true;
      });

      return {
        messages: {
          ...state.messages,

          [conversationId]: [...uniqueMessages, ...current],
        },

        pagination: {
          ...state.pagination,

          [conversationId]: {
            hasMore,

            loading: false,
          },
        },
      };
    }), */
  prependMessages: (conversationId, newMessages, hasMore) =>
    set((state) => {
      const current = state.messages[conversationId] ?? [];

      const existingIds = new Set(current.map((message) => message._id));

      const existingClientIds = new Set(
        current.map((message) => message.clientId).filter(Boolean),
      );

      const uniqueMessages = newMessages.filter((message) => {
        if (existingIds.has(message._id)) {
          return false;
        }

        if (message.clientId && existingClientIds.has(message.clientId)) {
          return false;
        }

        return true;
      });

      // Backend:
      // oldest -> newest
      //
      // چون Store ما:
      // newest -> oldest
      //
      // باید reverse کنیم.

      const reversed = [...uniqueMessages].reverse();

      return {
        messages: {
          ...state.messages,

          [conversationId]: [...current, ...reversed],
        },

        pagination: {
          ...state.pagination,

          [conversationId]: {
            hasMore,

            loading: false,
          },
        },
      };
    }),

  setInitialMessages: (
    conversationId: string,
    messages: Message[],
    hasMore: boolean,
  ) =>
    set((state) => ({
      messages: {
        ...state.messages,

        [conversationId]: messages,
      },

      pagination: {
        ...state.pagination,

        [conversationId]: {
          hasMore,

          loading: false,
        },
      },
    })),
  setPaginationLoading: (conversationId, loading) =>
    set((state) => ({
      pagination: {
        ...state.pagination,

        [conversationId]: {
          hasMore: state.pagination[conversationId]?.hasMore ?? true,

          loading,
        },
      },
    })),
  setPaginationHasMore: (conversationId, hasMore) =>
    set((state) => ({
      pagination: {
        ...state.pagination,

        [conversationId]: {
          hasMore,

          loading: state.pagination[conversationId]?.loading ?? true,
        },
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
  replaceOptimisticMessage: (conversationId, clientId, message) =>
    set((state) => {
      const current = state.messages[conversationId];

      if (!current) {
        return state;
      }

      const index = current.findIndex((m) => m.clientId === clientId);

      if (index === -1) {
        return {
          messages: {
            ...state.messages,

            [conversationId]: [...current, message],
          },
        };
      }

      const updated = [...current];

      updated[index] = message;

      return {
        messages: {
          ...state.messages,

          [conversationId]: updated,
        },
      };
    }),
  replaceMessage: (conversationId, tempId, message) =>
    set((state) => {
      const current = state.messages[conversationId] ?? [];

      const index = current.findIndex(
        (m) =>
          m._id === tempId || (m.isTemp && m.clientId === message.clientId),
      );

      if (index === -1) {
        // اگر Optimistic پیدا نشد
        // پیام واقعی را اضافه نکنیم
        // اگر از قبل وجود دارد.

        const exists = current.some(
          (m) =>
            m._id === message._id ||
            (message.clientId && m.clientId === message.clientId),
        );

        if (exists) {
          return state;
        }

        return {
          messages: {
            ...state.messages,

            [conversationId]: [...current, message],
          },
        };
      }

      const next = [...current];

      next[index] = {
        ...message,

        isTemp: false,

        status: message.status ?? "sent",
      };

      return {
        messages: {
          ...state.messages,

          [conversationId]: next,
        },
      };
    }),
}));
