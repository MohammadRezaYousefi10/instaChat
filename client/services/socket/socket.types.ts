import { Message } from "@/types";
import { SocketEventType } from "./socket.events";

export interface MessageEvent {

    type: SocketEventType.MESSAGE;

    payload: Message;

}

export interface TypingEvent {

    type: SocketEventType.TYPING;

    senderId: string;

    conversationId: string;

    isTyping: boolean;

}

export interface OnlineStatusEvent {

    type: SocketEventType.ONLINE_STATUS;

    userId: string;

    isOnline: boolean;

    lastSeen?: string;

}

export interface MessageReadEvent {

    type: SocketEventType.MESSAGE_READ;

    conversationId: string;

    messageId: string;

    userId: string;

}

export interface MessageDeliveredEvent {

    type: SocketEventType.MESSAGE_DELIVERED;

    conversationId: string;

    messageId: string;

    userId: string;

}

export interface PingEvent {

    type: SocketEventType.PING;

}

export interface PongEvent {

    type: SocketEventType.PONG;

}

export interface MessageAckEvent{

type:SocketEventType.MESSAGE_ACK;

clientId:string;

messageId:string;

createdAt:string;

}

export type SocketEvent =

    | MessageEvent

    | TypingEvent

    | OnlineStatusEvent

    | MessageReadEvent

    | MessageDeliveredEvent

    | PingEvent

    | PongEvent
    
    | MessageAckEvent;