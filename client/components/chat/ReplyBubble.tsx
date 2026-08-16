import { memo, useCallback } from "react";
import { Pressable, Text, View } from "react-native";

import { Message, ReplyTo } from "@/types";
import React from "react";
import { useChat } from "@/hooks/useSendMessage";
import { messageNavigator } from "@/services/navigation/navigator";
import { useHighlightStore, useMessageStore } from "@/store";
import { findMessageIndex } from "@/services/navigation/messageNavigator";

interface Props {
  reply: ReplyTo;
  conversationId: string;
}

function ReplyBubble({ reply, conversationId }: Props) {
  if (!reply || !conversationId) return;

  const { messages } = useChat(conversationId);

  if (!messages) return;
  

  return (
    // chatScrollService.jump(reply._id)
    <Pressable
      onPress={() => {
        console.log('replay pressed ')
        const found = messageNavigator.jumpTo(messages, reply._id);

        if (found) {
          useHighlightStore.getState().highlight(reply._id);
        }
      }}
    >
      <View
        style={{
          borderLeftWidth: 3,
          borderLeftColor: "#3B82F6",

          paddingHorizontal: 8,
          paddingVertical: 6,

          marginBottom: 6,

          backgroundColor: "#F2F4F7",

          borderRadius: 8,
        }}
      >
        {/* <Text
          style={{
            fontWeight: "700",
          }}
        >
          {reply.sender}
        </Text> */}

        {reply.text ? (
          <Text numberOfLines={1}>{reply.text}</Text>
        ) : (
          <Text>{reply.mediaType === "image" ? "📷 Photo" : "🎥 Video"}</Text>
        )}
      </View>
    </Pressable>
  );
}

export default memo(ReplyBubble);
