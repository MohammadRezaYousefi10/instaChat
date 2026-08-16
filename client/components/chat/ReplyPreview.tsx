import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useReplyStore } from "@/store";
import React from "react";

interface Props {
  onPress : any
}

export default function ReplyPreview({ onPress }: Props) {
  const store = useReplyStore.getState();

  if (!store.message) return null;

  return (
    <View
      style={{
        borderLeftWidth: 3,
        borderLeftColor: "#4F8EF7",

        paddingVertical: 8,
        paddingHorizontal: 12,

        backgroundColor: "#F5F5F5",

        flexDirection: "row",

        alignItems: "center",

        justifyContent: "space-between",
      }}
    >
      <View
        style={{
          flex: 1,
        }}
      >
        <Text
          style={{
            fontWeight: "600",
          }}
        >
          Replying to
        </Text>

        {store.message.text ? (
          <Text numberOfLines={1}>{store.message.text}</Text>
        ) : (
          <Text>
            {store.message.mediaType === "image" ? "📷 Photo" : "🎥 Video"}
          </Text>
        )}
      </View>

      <TouchableOpacity onPress={store.clearReply}>
        <Ionicons name="close" size={22} />
      </TouchableOpacity>
    </View>
  );
}
