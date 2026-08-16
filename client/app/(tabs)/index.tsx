import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import React, { useEffect, useState } from "react";
import { Conversation, UserStory } from "@/types";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
// import { styles } from "@/assets/styles/MessagesScreen.styles";
import { Ionicons } from "@expo/vector-icons";
// import { Colors } from "@/constants/Colors";
import { FlatList, TextInput } from "react-native-gesture-handler";
import StoriesBar from "@/components/StoriesBar";
import StoryViewer from "@/components/StoryViewer";
import ConvoItem from "@/components/ConvoItem";
import { useApp } from "@/context/AppContext";
import { useTheme } from "@/context/ThemeContext";
import { getStyles } from "@/assets/styles/MessagesScreen.styles";
import { conversationService } from "@/services/chats/conversation.service";
import { useConnection } from "@/hooks/useConnection";
import { LinearGradient } from "expo-linear-gradient";
import { SvgXml } from "react-native-svg";
import { useConversationStore, useSelectionStore } from "@/store";

export default function MessageScreen() {
  const { height } = Dimensions.get("window");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedStory, setSelectedStory] = useState<UserStory | null>(null);
  //const { setSelectedConversation } = useApp();
  const conversationStore = useConversationStore.getState();
  const conversations = useConversationStore((state) => state.conversations);

  /* const usersTyping = useTypingStore.getState().typing;
  console.log('user typing : ' , usersTyping) */

  const { status } = useConnection();
  const router = useRouter();

  const { colors } = useTheme();
  const styles = getStyles(colors);
  const svgMarkup = `<svg width="63" height="70" viewBox="0 0 63 70" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M33.817 52.382c0-15.988 12.96-28.948 28.948-28.948v17.585c0 15.987-12.96 28.948-28.948 28.948zm-4.869 0c0-15.988-12.96-28.948-28.948-28.948v17.585c0 15.987 12.96 28.948 28.948 28.948z" fill="#fff"/>
  <g clip-path="url(#a)">
    <path d="M31.487 0c0 8.764 7.049 15.881 15.786 15.992l.207.001-.207.001c-8.737.11-15.786 7.228-15.786 15.992 0-8.833-7.16-15.993-15.993-15.993 8.833 0 15.993-7.16 15.993-15.993" fill="#fff"/>
  </g>
  <defs>
    <clipPath id="a">
      <path fill="#fff" d="M15.494 0H47.48v31.986H15.494z"/>
    </clipPath>
  </defs>
</svg>`;

  const fetchConversation = async () => {
    setLoading(true);
    try {
      const perfectConversation = await conversationService.fetch();
      //setLoading(false);
      conversationStore.setConversations(perfectConversation);
    } catch (error) {
      setTimeout(fetchConversation, 1000);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversation();
  }, []);

  const lowerSearch = search.toLowerCase();
  const filtered = search
    ? conversations.filter(
        (c) =>
          c.participant?.name.toLowerCase().includes(lowerSearch) ||
          c.participant?.handle.toLowerCase().includes(lowerSearch),
      )
    : conversations;

  const openConvo = (c: Conversation) => {
    conversationStore.setSelectedConversation(c);
    router.push(`/chat/${c._id}`);
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      {/* header */}
      <View style={styles.header}>
        {/*         <View style={styles.logoRow}>
         */}

        {/*         <Text style={styles.title}>Conversations</Text>*/}
        <Text style={styles.title}>
          {status}
          {(status === "connecting" || status === "reconnecting") && (
            <Text>...</Text>
          )}

          {(status === "connecting" || status === "reconnecting") && (
            <ActivityIndicator color={colors.primary} />
          )}
        </Text>
        <View style={styles.headerRight}>
          {/* <View style={styles.badge}>
            <Text style={styles.badgeText}>{conversations.length}</Text>
          </View> */}
          <LinearGradient
            colors={[colors.primary, colors.primaryContainer]}
            style={styles.logoBox}
          >
            <SvgXml xml={svgMarkup} width="50%" height="50%" />
          </LinearGradient>
        </View>
      </View>

      {/* search */}
      <View style={styles.searchRow}>
        <Ionicons name="search" size={16} color={colors.outlineVariant} />
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder="Search Conversations..."
          placeholderTextColor={colors.outlineVariant}
          keyboardAppearance={colors.surface === "#121314" ? "dark" : "light"}
        />
        {search.length > 0 && (
          <TouchableOpacity
            onPress={() => {
              setSearch("");
            }}
          >
            <Ionicons
              name="close-circle"
              size={16}
              color={colors.outlineVariant}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* stories */}
      <StoriesBar onViewStoty={(us) => setSelectedStory(us)} />

      {selectedStory && (
        <StoryViewer
          userStory={selectedStory}
          onClose={() => setSelectedStory(null)}
        />
      )}
      {/* Divider */}

      <View style={styles.divider} />
      {/* Conversation list */}

      <FlatList
        data={filtered}
        keyExtractor={(c) => c._id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <ConvoItem
            convo={item}
            selected={true}
            onPress={() => openConvo(item)}
          />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons
              name="chatbubbles-outline"
              size={44}
              color={colors.outlineVariant}
            />
            <Text style={styles.emptyTitle}>No conversations yet</Text>
            <Text style={styles.emptySubtitle}>
              Go to search to start chatting
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}
