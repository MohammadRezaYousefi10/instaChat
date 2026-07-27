import { create } from "zustand";
import { Conversation, Message, User } from "@/types";

interface ConversationStore {
  conversations: Conversation[];
  selectedConversation?: Conversation | null;

  setConversations: (items: Conversation[]) => void;
  addConversation: (item: Conversation) => void;
  updateConversation: (item: Conversation) => void;
  removeConversation: (id: string) => void;

  setSelectedConversation: (
    conversation?: Conversation | null | undefined
  ) => void;

  updateLastMessage: (
    conversationId: string,
    lastMessage: Message // Conversation["lastMessage"]
  ) => void;

  moveToTop: (conversationId: string) => void;

  updateParticipantStatus: (
    userId: string,
    isOnline: boolean
) => void;

updateParticipant: (
    user: User
) => void;

updateSelectedParticipant: (user: User) => void;

clearSelectedConversation: (
    conversationId: string
) => void;

 

  clear: () => void;
}

export const useConversationStore = create<ConversationStore>((set) => ({

  conversations: [],
  selectedConversation: null,

  setConversations: (items) =>
    set({ conversations: items }),

  addConversation: (item) =>
    set((state) => ({
      conversations: [
        item,
        ...state.conversations,
      ],
    })),

  updateConversation: (item) =>
    set((state) => ({
      conversations:
        state.conversations.map((c) =>
          c._id === item._id
            ? item
            : c
        ),
    })),

  removeConversation: (id) =>
    set((state) => ({
      conversations:
        state.conversations.filter(
          (c) => c._id !== id
        ),
    })),

  setSelectedConversation: (conversation)=>
        set({
          selectedConversation: conversation,
        }),


  updateLastMessage: (
  conversationId: string,
  lastMessage:  Message 
) =>
  set((state) => {

    const exists = state.conversations.some(
      (c) => c._id === conversationId
    );

    if (!exists) {
      return state;
    }

    const conversations = state.conversations
      .map((c) =>
        c._id === conversationId
          ? {
              ...c,
              lastMessage,
              updatedAt: lastMessage.createdAt,
            }
          : c
      )
      .sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() -
          new Date(a.updatedAt).getTime() // اینجا هم باگت رو اصلاح کردم
      );

    return {
      conversations
    };
  }),

  moveToTop: (conversationId) =>
    set((state) => {

      const current =
        state.conversations.find(
          (c) => c._id === conversationId
        );

      if (!current)
        return state;

      return {
        conversations: [
          current,
          ...state.conversations.filter(
            (c) =>
              c._id !== conversationId
          ),
        ],
      };

    }),

    updateParticipantStatus: (
    userId,
    isOnline
) =>
    set((state) => ({
        conversations: state.conversations.map((c) => {
            if (c.participant?._id !== userId) {
                return c;
            }

            return {
                ...c,
                participant: {
                    ...c.participant,
                    isOnline,
                },
            };
        }),
    })),

    updateParticipant: (user) =>
    set((state) => ({
        conversations: state.conversations.map((c) => {
            if (c.participant?._id !== user._id) {
                return c;
            }

            return {
                ...c,
                participant: user,
            };
        }),
    })),

    updateSelectedParticipant: (user) =>
    set((state) => {
        if (
            !state.selectedConversation ||
            state.selectedConversation.participant?._id !== user._id
        ) {
            return state;
        }

        return {
            selectedConversation: {
                ...state.selectedConversation,
                participant: user,
            },
        };
    }),

    clearSelectedConversation: (
    conversationId
) =>
    set((state) => {
        if (
            state.selectedConversation?._id !==
            conversationId
        ) {
            return state;
        }

        return {
            selectedConversation: null,
        };
    }),



  clear: () =>
    set({
      conversations: [],
      selectedConversation: undefined,
    }),

}));