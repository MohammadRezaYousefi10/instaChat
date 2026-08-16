import { useCallback } from "react";

import { chatService } from "@/services/chats/chat.service";
import { useMessageStore } from "@/store";

export function useMessagePagination(conversationId?: string) {
  const loadMore = useCallback(async (): Promise<boolean> => {
    if (!conversationId) {
      return false;
    }

    const store = useMessageStore.getState();

    const pagination = store.pagination[conversationId];

    if (pagination?.loading || pagination?.hasMore === false) {
      return false;
    }

    const messages = store.messages[conversationId] ?? [];

    if (!messages.length) {
      return false;
    }

    // چون Store:
    // newest -> oldest

    const oldestMessage = messages[messages.length - 1];

    store.setPaginationLoading(conversationId, true);

    try {
      const result = await chatService.fetchMessages(conversationId, {
        before: oldestMessage._id,

        limit: 30,
      });

      store.prependMessages(conversationId, result.messages, result.hasMore);

      return result.messages.length > 0;
    } catch (error) {
      store.setPaginationLoading(conversationId, false);

      console.error("loadMore messages error:", error);

      return false;
    }
  }, [conversationId]);

  return {
    loadMore,
  };
}
