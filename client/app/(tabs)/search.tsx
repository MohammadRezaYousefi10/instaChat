import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  Alert,
} from "react-native";
import React, { useEffect, useState } from "react";
import type { Conversation, User as IUser } from "../../types";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { TextInput } from "react-native-gesture-handler";
import Avatar from "@/components/Avatar";
import { api, useApp } from "@/context/AppContext";
import { useTheme } from "@/context/ThemeContext";
import { getStyles } from "@/assets/styles/SearchScreen.styles";
import ContactsModal from "@/components/ContactsModal";
import { useStartChat } from "@/services/useStartChat";
import ContactsGate from "@/components/ContactsGate";

export default function search() {
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState<IUser[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const {setConversations , setSelectedConversation} = useApp();
  const {colors } = useTheme();
  const styles = getStyles(colors);
  const [showContacts, setShowContacts] = useState(false);
  const { startChat, loadingChat } = useStartChat();

  const handleuserchat = () => {
    console.log('hello')
  }

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const endpoint = search
        ? `/api/users/search?query=${search}`
        : "/api/users";
      const { data } = await api.get<{ success: boolean; users: IUser[] }>(
        endpoint,
      );
      if (data.success) setUsers(data.users);
      setLoading(false);
    } catch (error) {
      setTimeout(() => {
        fetchUsers;
      }, 1000);
    }finally{
      setLoading(false)
    }
  };

  useEffect(() => {
    const timer = setTimeout(fetchUsers, 1000);
    return () => clearTimeout(timer);
  }, [search]);

  /* const startChat = async (user: IUser) => {
    setLoading(true)
    try {
      const { data } = await api.get<{
        success: boolean;
        conversation: Conversation;
      }>(`/api/messages/conversations/with/${user._id}`);
      if (data.success) {
        console.log('data : ' , data)
        setSelectedConversation(data.conversation);
        setConversations((prev) =>
          (prev.some((c) =>
            c._id === data.conversation._id) ? prev : [data.conversation, ...prev]));
        router.push(`/chat/${data.conversation._id}`);
        setLoading(false)
      }
    } catch (err) {
      Alert.alert("Error" , "Failed to open conversation");
    }finally{
      setLoading(false)
    }
  }; */


  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      {/* header */}
      <View style={styles.header}>
        <Text style={styles.title}>Search</Text>
      <View style={styles.headerRight}>

        <TouchableOpacity onPress={() => setShowContacts(true)} >
        <Ionicons name="add" size={24} color={colors.onSurface} />
      </TouchableOpacity>
      </View>

      </View>

      {/* search */}
      <View style={styles.searchRow}>
        <Ionicons name="search" size={16} color={colors.outlineVariant} />
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder="Search by name, email or handle..."
          placeholderTextColor={colors.outlineVariant}
          autoCapitalize="none"
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

      {/* Results */}
      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={colors.primary} />
      ) : (
        <FlatList
          data={users}
          keyExtractor={(u) => u._id}
          contentContainerStyle={styles.list}
          renderItem={({ item:u }) => (
         
            
             <TouchableOpacity
              disabled={loading}
              style={styles.userRow}
              onPress={() => startChat(u)}
              activeOpacity={0.7}
            >
              <Avatar
                name={u.name}
                src={u.avatar}
                size={44}
                online={u.isOnline}
              />
              <View style={styles.userInfo}>
                <View style={styles.nameRow}>
                  <Text style={styles.userName}>{u.name}</Text>
                  <Text style={styles.userHandle}>@{u.handle}</Text>
                </View>
                <Text style={styles.userEmail} numberOfLines={1}>
                  {u.email}
                </Text>
              </View>
            </TouchableOpacity> 
          )}
          ListEmptyComponent={
            <Text style={styles.empty}>
              {search ? "No users found" : "Search for people to chat with"}
            </Text>
          }
        />
      )}
       {/* <ContactsModal
        visible={showContacts}
        onClose={() => setShowContacts(false)}
        onSelectUser={handleuserchat}
      /> */}
      <ContactsGate visible={showContacts} onClose={() => setShowContacts(false)} />
    </SafeAreaView>
  );
}
