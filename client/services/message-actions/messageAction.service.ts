import * as Clipboard from "expo-clipboard";
import { Message } from "@/types";
import { useReplyStore } from "@/store";

class MessageActionService {
  async copy(message: Message) {
    //Clipboard.setString(message.text ?? "");
    await Clipboard.setStringAsync(message.text ?? "");
  }

  reply(message: Message) {
    useReplyStore.getState().setReply(message);
  }

  forward(messages: Message[]) {}

  edit(message: Message) {}

  delete(messages: Message[]) {}

  pin(message: Message) {}

  seen(message: Message) {}
}

export const messageActionService = new MessageActionService();
