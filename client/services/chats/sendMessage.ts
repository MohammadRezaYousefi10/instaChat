import { api } from "@/services/api/api";
import { usePendingStore } from "@/store/pendingStore";
import { Message } from "@/types";

export interface SendMessageRequest {
  receiverId?: string;

  conversationId?: string;

  text?: string;

  mediaUri?: string | null;

  mediaMime?: string;
  mediaName?: string;
  clientId:string;
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
  clientId
}: SendMessageRequest) {
  const formData = new FormData();
  if (receiverId) formData.append("receiverId", receiverId);
  if (conversationId) formData.append("conversationId", conversationId);
   formData.append("clientId" , clientId ); 
  if (text?.trim()) formData.append("text", text.trim());

  if (mediaUri) {
    formData.append("file", {
      uri: mediaUri,

      type: mediaMime,

      name: mediaName,
    } as any);
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


  return data;
}
