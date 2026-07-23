import { View, Text, TouchableOpacity, ActivityIndicator, Dimensions } from "react-native";
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
import { api, useApp } from "@/context/AppContext";
import { useTheme } from "@/context/ThemeContext";
import { getStyles } from "@/assets/styles/MessagesScreen.styles";

export default function MessageScreen() {
     

  const { height } = Dimensions.get("window");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedStory, setSelectedStory] = useState<UserStory | null>(null);
  const {setSelectedConversation , conversations , setConversations , selectedConversation }= useApp();

  const router = useRouter();

  const { colors } = useTheme();
  const styles = getStyles(colors);

  const fetchConversation = () => {
    setLoading(true);
    api.get<{success :boolean; conversations:Conversation[]}>("/api/messages/conversations").then(({data}) => {
      if(data.success) setConversations(data.conversations)
        setLoading(false)
    }).catch(()=>{
      setTimeout(fetchConversation , 1000);
    })
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
    setSelectedConversation(c)
    router.push(`/chat/${c._id}`);
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      {/* header */}
      <View style={styles.header}>
        <Text style={styles.title}>Conversations</Text>
        <View style={styles.headerRight}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{conversations.length}</Text>
          </View>
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
          keyboardAppearance={colors.surface === '#121314' ? 'dark' : 'light'}
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
      {loading ? (
        <ActivityIndicator style={{ height: height,  }} color={colors.primary} />
      ) : (
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
      )}
      
    </SafeAreaView>
  );
}
