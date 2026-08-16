import { create } from "zustand";

interface ChatScrollState {
  targetMessageId?: string;

  jumpToMessage(id: string): void;

  clearTarget(): void;
}

export const useChatScrollStore = create<ChatScrollState>((set) => ({
  targetMessageId: undefined,

  jumpToMessage(id) {
    set({
      targetMessageId: id,
    });
  },

  clearTarget() {
    set({
      targetMessageId: undefined,
    });
  },
}));
