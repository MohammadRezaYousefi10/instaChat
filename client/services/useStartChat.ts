// client/hooks/useStartChat.ts
import { useState } from "react";
import { Alert } from "react-native";
import { router } from "expo-router";
import { api, useApp } from "@/context/AppContext";
import { Conversation,  User as IUser } from "@/types";
import { useConversationStore } from "@/store/conversationStore";
import { conversationService } from "./chats/conversation.service";

export function useStartChat() {
  const { setConversations, setSelectedConversation  } = useApp();
  const [loadingChat, setLoadingChat] = useState(false);

  const startChat = async (user: IUser) => {
    setLoadingChat(true);
    try {
      const { data } = await api.get<{
        success: boolean;
        conversation: Conversation;
      }>(`/api/messages/conversations/with/${user._id}`);

      if (data.success) {
        setSelectedConversation(data.conversation);
        /* setConversations((prev) =>
          prev.some((c) => c._id === data.conversation._id)
            ? prev
            : [data.conversation, ...prev]
        ); */
        //setConversations(data.conversation);
        await conversationService.fetch();
        router.push(`/chat/${data.conversation._id}`);
      }
    } catch (err) {
      Alert.alert("Error", "Failed to open conversation");
    } finally {
      setLoadingChat(false);
    }
  };

  return { startChat, loadingChat };
}