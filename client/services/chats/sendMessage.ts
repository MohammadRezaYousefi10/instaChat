import { api } from "@/services/api/api";
import { Message } from "@/types";

export interface SendMessageRequest {
  receiverId?: string;

  conversationId?: string;

  text?: string;

  mediaUri?: string | null;

  mediaMime?: string;
  mediaName?: string;
  clientId: string;
  replyToId?: string;
}

export interface SendMessageResponse {
  success: boolean;

  message: Message;

  conversationId: string;
}

export async function sendMessage({
  receiverId,

  conversationId,

  text,

  mediaUri,

  mediaMime,

  mediaName,
  clientId,
  replyToId,
}: SendMessageRequest) {
  const formData = new FormData();
  if (receiverId) formData.append("receiverId", receiverId);
  if (conversationId) formData.append("conversationId", conversationId);
  formData.append("clientId", clientId);
  if (text?.trim()) formData.append("text", text.trim());

  if (mediaUri) {
    formData.append("file", {
      uri: mediaUri,

      type: mediaMime,

      name: mediaName,
    } as any);
  }
  if (replyToId) {
    formData.append("replyToId", replyToId);
  }

  const { data } = await api.post<SendMessageResponse>(
    "/api/messages/send",

    formData,

    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );
  console.log("data when we sending replay message ", data);
  return data;
}
