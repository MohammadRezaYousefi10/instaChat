import { MessageReadEvent } from "../socket.types";

export function handleReadEvent(
    event: MessageReadEvent
){

    console.log(
        "READ",
        event.messageId
    );

}