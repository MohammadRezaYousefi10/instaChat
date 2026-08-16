import { TypingEvent } from "../socket.types";

import { useTypingStore } from "@/store";

export function handleTypingEvent(event: TypingEvent) {
  useTypingStore.getState().setTyping(
    event.conversationId,

    event.senderId,

    event.isTyping,
  );
}
