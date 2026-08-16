import { Message } from "@/types";

export function findMessageIndex(messages: Message[], id: string) {
  return messages.findIndex((message) => {
    return message._id === id || message.clientId === id;
  });
}
