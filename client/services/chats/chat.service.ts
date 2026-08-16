import { createTempMessage } from "@/utils/createTempMessage";
import { useMessageStore, usePendingStore } from "@/store";
import { sendMessage } from "./sendMessage";
import * as Crypto from "expo-crypto";
import { Message, MessagesPage, SendParams } from "@/types";
import { api } from "../api/api";

const clientId = Crypto.randomUUID();

class ChatService {
  async send(params: SendParams) {
    console.log("params : ", params);

    const store = useMessageStore.getState();
    const tempMessage = createTempMessage({
      senderId: params.senderId,
      receiverId: params.receiverId,
      conversationId: params.conversationId,
      text: params.text,
      mediaUri: params.mediaUri,
      mediaType: params.mediaMime?.startsWith("video")
        ? "video"
        : params.mediaUri
          ? "image"
          : undefined,
      clientId,
      status: params.status,
    });

    store.addMessage(params.conversationId, tempMessage);
    /* store.replaceMessage(
  conversationId,
  optimisticMessage._id,
  data.message
); */

    usePendingStore.getState().add({
      clientId,
      conversationId: params.conversationId,
      receiverId: params.receiverId,

      text: params.text,
      status: params.status ?? "failed",
      mediaUri: params.mediaUri ?? "",
      mediaType: params.mediaMime?.startsWith("video")
        ? "video"
        : params.mediaUri
          ? "image"
          : undefined,

      createdAt: Date.now(),

      retryCount: 0,

      nextRetryAt: Date.now(),
      senderId: params.senderId,
      replyToId: params.replyToId,
    });

    try {
      const result = await sendMessage(params);
      //usePendingStore.add(clientId);

      store.replaceOptimisticMessage(
        result.conversationId,
        params.clientId,
        result.message,
      );

      store.replaceTempMessage(params.conversationId, tempMessage._id, {
        ...result.message,
        status: "sent",
      });

      usePendingStore.getState().remove(params.clientId);

      return result.message;
    } catch (error) {
      console.log("send faild ");
      store.updateStatus(params.conversationId, tempMessage._id, "failed");

      throw error;
    }
  }

  async retry(message: Message) {
    console.log("retrying Sending Message ", message);

    const store = useMessageStore.getState();

    store.updateStatus(message.conversationId, message._id, "pending");

    return this.performSend(message);
  }

  private async performSend(message: Message) {
    const store = useMessageStore.getState();

    const clientId = message.clientId;
    if(!clientId) return;

    try {
      const response = await sendMessage({
        receiverId: message.receiver,
        conversationId: message.conversationId,
        text: message.text,
        mediaUri: message.mediaUrl,
        mediaMime: message.mediaType === "video" ? "video/mp4" : "image/jpeg",
        mediaName: "upload",
        clientId,
        replyToId: message.replyTo?._id,
      });

      store.replaceByClientId(
        message.conversationId,

        message.clientId!,

        {
          ...response.message,

          status: "sent",
        },
      );

      return response.message;
    } catch (error) {
      console.log("performSend faild ", error);
      store.updateStatus(
        message.conversationId,

        message._id,

        "failed",
      );

      throw error;
    }
  }

  async fetchMessages(
    conversationId: string,
    options?: {
      before?: string;
      limit?: number;
    },
  ): Promise<MessagesPage> {
    const params: Record<string, string | number> = {
      limit: options?.limit ?? 30,
    };

    if (options?.before) {
      params.before = options.before;
    }

    const { data } = await api.get<{
      success: boolean;
      messages: Message[];
      hasMore: boolean;
    }>(`/api/messages/conversations/${conversationId}/messages`, {
      params,
    });

    console.log("data : ", data);

    if (!data.success) {
      throw new Error("Failed to fetch messages");
    }
    const messages = [...data.messages].reverse();
    return {
      messages: messages,

      hasMore: data.hasMore,
    };
  }
}

export const chatService = new ChatService();
