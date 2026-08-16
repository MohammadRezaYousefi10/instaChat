import { create } from "zustand";

interface HighlightState {

  messageId:
    string | null;

  highlight(
    messageId: string
  ): void;

  clear(): void;

}

export const useHighlightStore =
create<HighlightState>((set) => ({

  messageId: null,

  highlight(messageId) {

    set({
      messageId,
    });

  },

  clear() {

    set({
      messageId: null,
    });

  },

}));