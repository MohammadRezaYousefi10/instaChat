import { create } from "zustand";
import type { Message } from "@/types";

interface MessageActionState {

    visible: boolean;

    message?: Message;

    open(message: Message): void;

    close(): void;

}

export const useMessageActionStore = create<MessageActionState>((set) => ({

    visible: false,

    message: undefined,

    open(message) {

        set({
            visible: true,
            message,
        });

    },

    close() {

        set({
            visible: false,
            message: undefined,
        });

    },

}));