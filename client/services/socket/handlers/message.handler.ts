import { MessageEvent } from "../socket.types";

import { useMessageStore } from "@/store/messageStore";
import { useConversationStore } from "@/store/conversationStore";

export function handleMessageEvent(
    event: MessageEvent
) {

    const message = event.payload;

    useMessageStore
        .getState()
        .addMessage(
            message.conversationId,
            message
        );

    useConversationStore
        .getState()
        .updateLastMessage(
            message.conversationId,
            message
        );

}