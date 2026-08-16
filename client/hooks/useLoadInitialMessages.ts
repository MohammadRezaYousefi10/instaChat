import { chatService } from "@/services/chats/chat.service";
import { useConversationStore, useMessageStore } from "@/store";
import { useCallback, useEffect } from "react";

const loadInitialMessages = useCallback(async () => {
   const selectedConversation = useConversationStore(
      (state) => state.selectedConversation,
    );

  const conversationId = selectedConversation?._id;

  if (!conversationId) {
    return;
  }

  const store = useMessageStore.getState();

  const existing = store.messages[conversationId];

  if (existing?.length) {
    return;
  }

  store.setPaginationLoading(conversationId, true);

  try {
    const result = await chatService.fetchMessages(conversationId, {
      limit: 30,
    });

    store.setInitialMessages(conversationId, result.messages, result.hasMore);
  } catch (error) {
    store.setPaginationLoading(conversationId, false);

    console.error("Initial messages error:", error);
  }
}, []);

useEffect(() => {

  loadInitialMessages();

}, [
  loadInitialMessages,
]);
