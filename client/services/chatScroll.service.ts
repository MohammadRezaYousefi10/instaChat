/* import { useHighlightStore } from "@/store";
import { Message } from "@/types";
import { FlatList } from "react-native";

class ChatScrollService {
  private flatList: FlatList<Message> | null = null;

  register(ref: FlatList<Message>) {
    this.flatList = ref;
  }

  jump(id: string) {
    const index = useMessageRegistryStore.getState().ids[id];

    if (index === undefined) return false;

    this.flatList?.scrollToIndex({
      index,

      animated: true,

      viewPosition: 0.4,
    });

    useHighlightStore.getState().highlight(id);

    return true;
  }
}

export const chatScrollService = new ChatScrollService();
 */