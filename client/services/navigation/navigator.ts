import type { FlatList } from "react-native";

import type { Message } from "@/types";

import { findMessageIndex } from "./messageNavigator";

class MessageNavigator {
  private list: FlatList<Message> | null = null;

  register(list: FlatList<Message>) {
    this.list = list;
  }

  unregister() {
    this.list = null;
  }

  jumpTo(messages: Message[], messageId: string): boolean {
    const index = findMessageIndex(messages, messageId);

    if (index === -1) {
      return false;
    }

    this.list?.scrollToIndex({
      index,

      animated: true,

      viewPosition: 0.4,
    });

    return true;
  }

  
  
}

export const messageNavigator = new MessageNavigator();
