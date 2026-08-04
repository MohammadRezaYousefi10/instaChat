import {
    SocketEvent,
} from "./socket.types";

import {
    SocketEventType,
} from "./socket.events";

import {

    handleMessageEvent,

    handleTypingEvent,

    handlePresenceEvent,

    handleReadEvent,

    handleDeliveredEvent,

    handleAckEvent

} from "./handlers";

const handlers : any = {

    [SocketEventType.MESSAGE]:
        handleMessageEvent,

    [SocketEventType.TYPING]:
        handleTypingEvent,

    [SocketEventType.ONLINE_STATUS]:
        handlePresenceEvent,

    [SocketEventType.MESSAGE_READ]:
        handleReadEvent,

    [SocketEventType.MESSAGE_DELIVERED]:
        handleDeliveredEvent,
    [SocketEventType.PONG]:
        console.log("Pong colled"),
    [SocketEventType.MESSAGE_ACK]:
        handleAckEvent
    

};

export function dispatchSocketEvent(

    event: SocketEvent

){

    const handler = handlers[event.type];

    if (!handler) {
        console.warn("Unknown socket event", event);
        return;
    }

    handler(event as never);

 /*    switch(event.type){

        case SocketEventType.MESSAGE:

            handleMessageEvent(event);

            break;

        case SocketEventType.TYPING:

            handleTypingEvent(event);

            break;

        case SocketEventType.ONLINE_STATUS:

            handlePresenceEvent(event);

            break;

        case SocketEventType.MESSAGE_READ:

            handleReadEvent(event);

            break;

        case SocketEventType.MESSAGE_DELIVERED:

            handleDeliveredEvent(event);

            break;

        default:

            console.warn(

                "Unknown socket event",

                event

            ); */

    

}