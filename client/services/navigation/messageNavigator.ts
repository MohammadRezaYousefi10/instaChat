import type { Message } from "@/types";

export function findMessageIndex(
  messages: Message[],
  messageId: string
): number {

  return messages.findIndex(
    (message) =>
      message._id === messageId
  );

}