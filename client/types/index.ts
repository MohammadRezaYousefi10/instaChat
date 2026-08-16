export interface User {
  _id: string;
  name: string;
  email: string;
  handle: string;
  phone?: string;
  avatar?: string;
  bio?: string;
  isOnline: boolean;
  lastSeen: string;
}

/* export interface Message {
    _id: string;
    sender: string;
    receiver: string;
    text?: string;
    mediaUrl?: string;
    mediaType?: "image" | "video";
    read: boolean;
    createdAt: string;
    conversationId: string;
    status?: MessageStatus;
    isTemp?: boolean;
} */

    export interface SendParams {
      senderId: string;
      receiverId: string;
      conversationId: string;
      text?: string;
      mediaUri?: string | null;
      mediaMime?: string;
      mediaName?: string;
      clientId: string;
      status?: MessageStatus;
      replyToId?: string;
    }

export interface ReplyTo {
  _id: string;

  sender: string;

  text?: string;

  mediaType?: "image" | "video";

  isDeleted: false;
}
export type MessageStatus =
  | "pending"
  | "queued"
  | "sending"
  | "sent"
  | "delivered"
  | "read"
  | "failed";

export interface MessagesPage {
  messages: Message[];
  hasMore: boolean;
}

export interface Message {
  _id: string;
  sender: string;
  receiver: string;
  text?: string;
  mediaUrl?: string;
  mediaType?: "image" | "video";
  read: boolean;
  createdAt: string;
  conversationId: string;
  status?: MessageStatus;
  isTemp?: boolean;
  clientId?: string;
  replyTo?: ReplyTo;
}

export interface Conversation {
  _id: string;
  participant?: User; // For 1-on-1 chats
  lastMessage?: Message;
  updatedAt: string;
}

export interface Story {
  _id: string;
  user: User;
  mediaUrl: string;
  mediaType: "image" | "video";
  createdAt: string;
}

export interface UserStory {
  user: User;
  stories: Story[];
}

export interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
}

export interface WsEvent {
  type: string;
  payload?: any;
  senderId?: string;
  isTyping?: boolean;
  userId?: string;
  isOnline?: boolean;
  user?: User;
  conversationId?: string;
  [key: string]: any;
}

export interface RegisteredUser {
  _id: string;
  name: string;
  handle: string;
  avatar?: string;
  phone: string;
}

export interface DeviceContact {
  id: string;
  name: string;
  phone: string;
  isNormalized: boolean;
  registered?: RegisteredUser;
}
