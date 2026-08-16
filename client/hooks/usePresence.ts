import { EMPTY_PRESENCE } from "@/constants/store";
import { usePresenceStore } from "@/store";

export function usePresence(userId: string) {
  return usePresenceStore((state) => state.presence[userId] ?? EMPTY_PRESENCE);
}
