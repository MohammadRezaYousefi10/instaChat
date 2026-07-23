import { createTempMessage } from "@/utils/createTempMessage";
import { useMessageStore } from "@/store/messageStore";
import { sendMessage } from "./sendMessage";
import * as Crypto from 'expo-crypto';
import { outboxService } from "./outbox.service";
import { Message } from "@/types";

interface SendParams {
  senderId: string;
  receiverId: string;
  conversationId: string;
  text?: string;
  mediaUri?: string | null;
  mediaMime?: string;
  mediaName?: string;
  clientId:string;
}

const clientId = Crypto.randomUUID();



class ChatService {
  async send(params: SendParams) {
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
        clientId
    });

    store.addMessage(params.conversationId, tempMessage);
    
    try {
      
 

      const result = await sendMessage(params);
   
    
      store.replaceTempMessage(
        params.conversationId,
        tempMessage._id,
        {
          ...result.message,
          status: "sent",
        }
      );

      return result.message;
    } catch (error) {
      store.updateStatus(
        params.conversationId,
        tempMessage._id,
        "failed"
      );

      throw error;
    }
  }

   async retry(message: Message) {

    const store = useMessageStore.getState();

    store.updateStatus(
        message.conversationId,
        message._id,
        "sending"
    );

    return this.performSend(
        message
    );

}



private async performSend(
    message: Message
){

    const store = useMessageStore.getState();

    try{

        const response =
            await sendMessage({
                receiverId:message.receiver,
                conversationId: message.conversationId,
                text:message.text,
                mediaUri: message.mediaUrl,
                mediaMime:
                message.mediaType==="video"
                        ? "video/mp4"
                        : "image/jpeg",
                mediaName: "upload",
                clientId: message.clientId!
            });

        store.replaceByClientId(

            message.conversationId,

            message.clientId!,

            {

                ...response.message,

                status:"sent"

            }

        );

        return response.message;

    }

    catch(error){

        store.updateStatus(

            message.conversationId,

            message._id,

            "failed"

        );

        throw error;

    }

}


}





export const chatService = new ChatService();