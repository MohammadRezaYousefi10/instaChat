import { useCallback } from "react";
import { useMessageStore } from "@/store/messageStore";
import { chatService } from "@/services/chats/chat.service";
import { EMPTY_MESSAGES } from "@/constants/store";


export function useChat(conversationId: string) {
  const messages = useMessageStore(
    useCallback(
      (state) => state.messages[conversationId] ?? EMPTY_MESSAGES,
      [conversationId]
    )
  );

  const send = chatService.send.bind(chatService);

  return {
    messages,
    send,
  };
}