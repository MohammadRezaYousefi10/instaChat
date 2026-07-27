import { Conversation, Message } from "@/types";
import { useConversationStore } from "@/store/conversationStore";
import { api } from "@/context/AppContext";

interface ConversationResponse {
  success: boolean;
  conversations: Conversation[];
}

class ConversationService {
  /**
   * دریافت تمام گفتگوها
   */
  async fetch(): Promise<Conversation[]> {
    const { data } =
      await api.get<ConversationResponse>(
        "/api/messages/conversations"
      );

    if (!data.success) {
      throw new Error("Failed to fetch conversations");
    }
    // console.log('data.conversations ' , data.conversations)

    useConversationStore.getState().setConversations(data.conversations);

    return data.conversations;
  }

  /**
   * همگام سازی مجدد
   */
  async sync() {
    return this.fetch();
  }

  /**
   * حذف گفتگو
   */
  async deleteConversation(
    conversationId: string
  ) {
    console.log('deleting conversation with id ' , conversationId)
    const { data } = await api.delete<{
      success: boolean;
    }>(
      `/api/messages/conversations/${conversationId}`
    );

    if (!data.success) {
      throw new Error("Delete conversation failed");
    }

    const store =
      useConversationStore.getState();

    store.removeConversation(conversationId);

    store.clearSelectedConversation(
      conversationId
    );

    return true;
  }

  /**
   * بروزرسانی آخرین پیام
   */
  updateLastMessage(
    conversationId: string,
    message: Message
  ) {
    const store =
      useConversationStore.getState();

    const exists =
      store.conversations.some(
        (c) => c._id === conversationId
      );

    if (!exists) {
      return this.sync();
    }

    store.updateLastMessage(
      conversationId,
      message
    );

    store.moveToTop(conversationId);
  }

  /**
   * اضافه کردن Conversation جدید
   */
  add(
    conversation: Conversation
  ) {
    useConversationStore
      .getState()
      .addConversation(conversation);
  }

  /**
   * بروزرسانی Conversation
   */
  update(
    conversation: Conversation
  ) {
    useConversationStore
      .getState()
      .updateConversation(conversation);
  }

  /**
   * انتخاب Conversation
   */
  select(
    conversation: Conversation | null
  ) {
    useConversationStore
      .getState()
      .setSelectedConversation(
        conversation
      );
  }

  /**
   * پاک کردن کل Store
   * هنگام Logout استفاده می‌شود.
   */
  clear() {
    useConversationStore
      .getState()
      .clear();
  }
}

export const conversationService =
  new ConversationService();