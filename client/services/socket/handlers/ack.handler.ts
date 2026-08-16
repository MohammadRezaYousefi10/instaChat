import { MessageAckEvent } from "../socket.types";

import { useMessageStore , usePendingStore , useReplyStore} from "@/store";



export function handleAckEvent(event: MessageAckEvent) {
  console.log("handleAckEvent", event);

  usePendingStore.getState().remove(event.clientId);
  useReplyStore.getState().clearReply();

  useMessageStore.getState().confirmMessage(event.clientId, {
    _id: event.messageId,
    status: "sent",
    createdAt: event.createdAt,
  });
}
