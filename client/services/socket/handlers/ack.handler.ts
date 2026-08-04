import { MessageAckEvent } from "../socket.types";

import { useMessageStore } from "@/store/messageStore";

import { usePendingStore } from "@/store/pendingStore";

export function handleAckEvent(event: MessageAckEvent) {
    console.log('handleAckEvent' , event)
  usePendingStore.getState().remove(event.clientId);

  useMessageStore.getState().confirmMessage(event.clientId,
    {
        _id: event.messageId,
        status: "sent",
        createdAt: event.createdAt,
      },
    );
}
