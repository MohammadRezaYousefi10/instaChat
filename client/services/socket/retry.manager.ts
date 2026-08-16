import { socketService } from "./socket.service";
import { usePendingStore } from "@/store";
import { MAX_MESSAGE_AGE, MAX_RETRY } from "./retry.constants";
import { chatService } from "@/services/chats/chat.service";
import { Message } from "@/types";
import { SocketConnectionStatus } from "./socket.connection";

class RetryManager {
  private timer: ReturnType<typeof setInterval> | null = null;

  start() {
    if (this.timer) return;

    this.timer = setInterval(() => {
      this.retry();
    }, 1000);
  }

  stop() {
    if (this.timer) {
      clearInterval(this.timer);

      this.timer = null;
    }
  }

  private async retry() {
    if (socketService.status !== SocketConnectionStatus.CONNECTED) return;
    //console.log('retry Manager')

    const store = usePendingStore.getState();

    const now = Date.now();

    //console.log('message ' , store.getAll())
    for (const message of store.getAll()) {
      if (now - message.createdAt > MAX_MESSAGE_AGE) {
        console.log("message1 ", message);
        store.remove(message.clientId);
        continue;
      }

      const delay = Math.min(3000 * Math.pow(2, message.retryCount), 60000);
      message.nextRetryAt = Date.now() + delay;

      /*  if (delay >= MAX_RETRY) {
        useMessageStore.getState().markFailed(message.clientId);
        console.log('marked faild ')
        continue;
      } */

      if (message.nextRetryAt > now) continue;

      try {
        const payload: Message = {
          _id: message.clientId, // فعلاً تا ACK بیاد
          clientId: message.clientId,
          sender: message.senderId,
          receiver: message.receiverId,
          conversationId: message.conversationId,

          text: message.text,

          mediaUrl: message.mediaUri, // فعلاً همین مقدار را نگه دار
          mediaType: message.mediaType?.startsWith("video") ? "video" : "image",

          read: false,

          createdAt: new Date(message.createdAt).toISOString(),

          status: "pending",

          isTemp: true,
        };

        console.log("payload retry Manager", payload);

        await chatService.retry(payload);

        store.incrementRetry(message.clientId);
      } catch {}
    }
  }
}

export const retryManager = new RetryManager();
