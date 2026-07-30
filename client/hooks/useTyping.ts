import { EMPTY_TYPING } from "@/constants/store";
import { useTypingStore } from "@/store/typingStore";


export function useTyping(conversationId: string) {
  return useTypingStore(
    (state) => state.typing[conversationId] ?? EMPTY_TYPING
  );
}