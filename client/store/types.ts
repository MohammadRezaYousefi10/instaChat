import { MessageStatus } from "@/types";

export interface PendingMessage {
  clientId: string;
  conversationId: string;
  createdAt: number;
  retryCount: number;
  nextRetryAt: number;
  senderId: string;
  receiverId: string;
  text?: string;
  status: MessageStatus;
  mediaUri?: string;
  mediaType?: string;
  replyToId?: string;
  //mediaName?: string;
}

export interface UserPresence {
  online: boolean;

  lastSeen?: string;
}


export interface TypingState {
  [conversationId: string]: {
    [userId: string]: boolean;
  };
}