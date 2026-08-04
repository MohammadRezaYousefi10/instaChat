import { MessageDeliveredEvent } from "../socket.types";

export function handleDeliveredEvent(
    event: MessageDeliveredEvent
){

    console.log(
        "DELIVERED",
        event.messageId
    );

}