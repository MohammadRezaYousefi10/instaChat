import { OnlineStatusEvent } from "../socket.types";

import { usePresenceStore } from "@/store/presenceStore";
import { useConversationStore } from "@/store/conversationStore";

export function handlePresenceEvent(
    event: OnlineStatusEvent
) {

    if (event.isOnline) {

        usePresenceStore
            .getState()
            .setOnline(
                event.userId
            );

    }

    else {

        usePresenceStore
            .getState()
            .setOffline(

                event.userId,

                event.lastSeen

            );

    }

    useConversationStore
        .getState()
        .updateParticipantStatus(

            event.userId,

            event.isOnline

        );

}