import { create } from "zustand";

export interface ReplyTarget {
  _id: string;

  sender: string;

  text?: string;

  mediaType?: "image" | "video";
}

interface ReplyState {
  message: ReplyTarget | null;

  setReply(message: ReplyTarget): void;

  clearReply(): void;
}

export const useReplyStore = create<ReplyState>((set) => ({
  message: null,

  setReply(message) {
    set({
      message,
    });
  },

  clearReply() {
    set({
      message: null,
    });
  },
}));
