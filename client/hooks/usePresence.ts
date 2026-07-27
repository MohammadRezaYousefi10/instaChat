import { usePresenceStore } from "@/store/presenceStore";

export function usePresence(userId: string) {

    return usePresenceStore(
        state =>
            state.presence[userId] ?? {
                online: false
            }
    );
    
}