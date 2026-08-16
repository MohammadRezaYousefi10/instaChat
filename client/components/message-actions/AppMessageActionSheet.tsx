import AppBottomSheet from "@/components/AppBottomSheet";

import { useMessageActionStore } from "@/store";

import MessageActionHeader from "./MessageActionHeader";
import MessageActionItem from "./MessageActionItem";

import { messageActionService } from "@/services/message-actions/messageAction.service";
import React from "react";

export default function AppMessageActionSheet() {
  const { visible, message, close } = useMessageActionStore();

  console.log("AppMessageActionSheet ", visible, message, close);
  if (!message) return null;

  return (
    <AppBottomSheet visible={visible} onClose={close} snapPoints={["55%"]}>
      <MessageActionHeader />

      <MessageActionItem
        title="Reply"
        onPress={() => {
          messageActionService.reply(message);

          close();
        }}
      />

      <MessageActionItem
        title="Copy"
        onPress={() => {
          messageActionService.copy(message);

          close();
        }}
      />

      <MessageActionItem
        title="Forward"
        onPress={() => {
          messageActionService.forward([message]);

          close();
        }}
      />

      <MessageActionItem
        title="Delete"
        onPress={() => {
          messageActionService.delete([message]);

          close();
        }}
      />
    </AppBottomSheet>
  );
}
