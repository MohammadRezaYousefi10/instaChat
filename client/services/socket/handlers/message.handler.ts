import { MessageEvent } from "../socket.types";

import { useMessageStore } from "@/store";
import { useConversationStore } from "@/store";

export function handleMessageEvent(event: MessageEvent) {
  const message = event.payload;

  useMessageStore.getState().appendMessage(message.conversationId, message);

  useConversationStore
    .getState()
    .updateLastMessage(message.conversationId, message);

}
