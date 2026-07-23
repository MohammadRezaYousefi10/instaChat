import { Message } from "@/types";

interface CreateTempMessageParams {

  senderId: string;

  receiverId: string;

  conversationId: string;

  text?: string;

  mediaUri?: string | null;

  mediaType?: "image" | "video";
  clientId?:string
}
 // const clientId = crypto.randomUUID();

export function createTempMessage({

  senderId,

  receiverId,

  conversationId,

  text,

  mediaUri,

  mediaType,
  clientId
}: CreateTempMessageParams): Message {
   
  return {

    _id: `temp-${Date.now()}`,
    clientId,
    sender: senderId,

    receiver: receiverId,

    conversationId,

    text: text ?? "",

    mediaUrl: mediaUri ?? "",

    mediaType,

    read: false,

    createdAt: new Date().toISOString(),

    status: "sending",

    isTemp: true,

  };

}