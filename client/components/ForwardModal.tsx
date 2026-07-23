// client/components/ForwardModal.tsx
import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  Modal,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TextInput,
  Image,
  Dimensions,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { api, useApp } from "@/context/AppContext";
import { Conversation, Message } from "@/types";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
// import { Colors } from "@/constants/Colors";
import { feedback } from "@/services/feedback";
import { useTheme } from "@/context/ThemeContext";
import { getForwardStyles } from "@/assets/styles/ForwardModal.styles";
import { SafeAreaView } from "react-native-safe-area-context";
import { BottomSheetModal, BottomSheetView } from "@gorhom/bottom-sheet";
import AppBottomSheet from "./AppBottomSheet";
import { toast } from "./Toast";
import { LinearGradient } from "expo-linear-gradient";
import { sendMessage } from "@/services/chat";

const { width } = Dimensions.get("window");
const NUM_COLUMNS = 4;
const ITEM_SIZE = width / NUM_COLUMNS;
const AVATAR_SIZE = 62;

interface Props {
  visible: boolean;
  imageUri: string | null;
  onClose: () => void;
}

export default function ForwardModal({ visible, imageUri, onClose }: Props) {
  const { conversations, setConversations, sendWsEvent } = useApp(); // فرض: آرایه‌ای از {_id, participant:{name, avatar}}

  const { colors } = useTheme();
  const styles = getForwardStyles(colors);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Conversation[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(false);
  const [modalGoUp, setModalGoUp] = useState("55%");

  const list: Conversation[] = conversations ?? [];

  const fetchConversation = () => {
    setLoading(true);
    api
      .get<{ success: boolean; conversations: Conversation[] }>(
        "/api/messages/conversations",
      )
      .then(({ data }) => {
        if (data.success) setConversations(data.conversations);
        setLoading(false);
      })
      .catch(() => {
        setTimeout(fetchConversation, 1000);
      });
  };

  useEffect(() => {
    fetchConversation();
  }, []);

  const filteredList = useMemo(() => {
    if (!query.trim()) return list;
    return list.filter((c) =>
      c.participant?.name?.toLowerCase().includes(query.toLowerCase()),
    );
  }, [query, list]);

  const isSelected = (id: string) => selected.some((s) => s._id === id);

  const toggleSelect = (item: Conversation) => {
    setSelected((prev) =>
      prev.some((s) => s._id === item._id)
        ? prev.filter((s) => s._id !== item._id)
        : [...prev, item],
    );
  };

  const subtitle = useMemo(() => {
    if (selected.length === 0) return "Select";
    const names = selected.map((s) => s.participant?.name).filter(Boolean);
    if (names.length <= 2) return names.join("، ");
    return `${names.slice(0, 2).join("، ")} , ${names.length - 2} Other `;
  }, [selected]);

  const resetAndClose = () => {
    Keyboard.dismiss();
    setSelected([]);
    setText("");
    setQuery("");
    onClose();
    setModalGoUp("55%");
    setLoading(false);
  };

  /* const handleShare = async () => {
      if (!imageUri) return;
      setLoading(true)
      try {
        let localUri = imageUri;
        if (imageUri.startsWith("http")) {
          const fileUri = FileSystem.cacheDirectory + "avatar_share.jpg";
          const { uri } = await FileSystem.downloadAsync(imageUri, fileUri);
          localUri = uri;
        }

     

  
        const isAvailable = await Sharing.isAvailableAsync();
        if (!isAvailable) {
          Alert.alert("Error", "Sharing is not available on this device.");
          return;
        }
        await Sharing.shareAsync(localUri);
      } catch (err) {
        console.error("share error:", err);
        Alert.alert("Error", "Sharing encountered a problem.");
      }finally{
        setLoading(false)
      }
    }; */

  const handleSend = async () => {
    if (selected.length === 0 || !imageUri) return;
    setSending(true);
    try {
      await Promise.all(
        selected.map(async (conv) => {
          /* const formData = new FormData();
          formData.append("receiverId", conv._id);
          formData.append("conversationId", conv._id);
          formData.append("type", "image");
          if (text.trim()) formData.append("text", text.trim());
          formData.append("file", {
            uri: imageUri,
            type: "image/jpeg",
            name: "shared.jpg",
          } as any);

          const { data } = await api.post<{
            success: boolean;
            message: Message;
          }>("/api/messages/send", formData, {
            headers: { "Content-Type": "multipart/form-data" },
          }); */
          const data = await sendMessage({
                      receiverId: conv._id,
                      text,
                      mediaUri : imageUri,
                      mediaMime : "image/jpeg",
                      mediaName : "shared.jpg",
              });
          if (!data.success) return;   
          
            const target = { receiverId: conv!._id };
            sendWsEvent({ type: "message", ...target, payload: data.message });
            toast.show("Sent", { icon: "checkmark-circle" });
          
        }),
      );
      feedback.success(); // بعد از ارسال موفق پیام

      resetAndClose();
    } catch (err: any) {
      //toast.show("Sending failed.", { icon: "close" });
      Alert.alert("Error", err?.response?.data?.message || "Sending failed.");
    } finally {
      setSending(false);
    }
  };

  const renderItem = ({ item }: { item: Conversation }) => {
    const selectedItem = isSelected(item._id);
    return (
      <TouchableOpacity
        style={styles.gridItem}
        activeOpacity={0.7}
        onPress={() => toggleSelect(item)}
      >
        <View style={styles.avatarWrapper}>
          <View
            style={[
              styles.avatarRing,
              selectedItem && styles.avatarRingSelected,
            ]}
          >
            {item.participant?.avatar ? (
              <Image
                source={{ uri: item.participant.avatar }}
                style={styles.avatarImage}
              />
            ) : (
              <View style={[styles.avatarImage, styles.avatarFallback]}>
                <Text style={styles.avatarFallbackText}>
                  {item.participant?.name?.charAt(0)?.toUpperCase() ?? "?"}
                </Text>
              </View>
            )}
          </View>
          {selectedItem && (
            <View style={styles.checkBadge}>
              <Ionicons name="checkmark" size={12} color="#fff" />
            </View>
          )}
        </View>
        <Text style={styles.gridItemName} numberOfLines={2}>
          {item.participant?.name ?? "user"}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    // visible={visible} transparent onRequestClose={resetAndClose}

    //<Modal visible={visible} transparent onRequestClose={resetAndClose}>

    <AppBottomSheet
      visible={visible}
      onClose={resetAndClose}
      snapPoints={[modalGoUp, "95%"]}
    >
      <Pressable style={{ flex: 1 }} onPress={Keyboard.dismiss}>
        {/* <TouchableWithoutFeedback onPress={resetAndClose}>
       <KeyboardAvoidingView
        style={styles.forwardOverlay}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} >  */}
        <View >
          {/* header */}
          <View style={styles.header}>
            {/* {loading ? (
                <ActivityIndicator color={colors.primary} />
              ) : (
                <TouchableOpacity style={styles.headerIconBtn} onPress={handleShare}>

                <Ionicons name="share-outline" size={20} color="#0A84FF" />
            </TouchableOpacity>
              )} */}

            <View style={styles.headerCenter}>
              <Text style={styles.headerTitle}>Send to</Text>
              <Text style={styles.headerSubtitle} numberOfLines={1}>
                {subtitle}
              </Text>
            </View>

            {/*    <TouchableOpacity style={styles.headerIconBtn}>
              <Ionicons name="close" onPress={onClose} size={20} color="#0A84FF" />
            </TouchableOpacity> */}
          </View>

          {/* search input */}
          <View style={styles.searchBox}>
            <Ionicons name="search" size={16} color="#8E8E93" />
            <TextInput
              style={styles.searchInput}
              placeholder="search..."
              placeholderTextColor="#8E8E93"
              value={query}
              onChangeText={setQuery}
              returnKeyType="search"
              onFocus={() => setModalGoUp("95%")}
              keyboardAppearance={
                colors.surface === "#121314" ? "dark" : "light"
              }
            />
          </View>

          {/* grid */}
          <FlatList
            data={filteredList}
            keyExtractor={(item) => item._id}
            renderItem={renderItem}
            numColumns={NUM_COLUMNS}
            contentContainerStyle={styles.gridContent}
            keyboardShouldPersistTaps="handled"
            ListEmptyComponent={
              <Text style={styles.empty}>Conversation not found</Text>
            }
          />

          {/* comment input */}
          {selected.length > 0 && (
            <View style={styles.commentBox}>
              <TextInput
                style={styles.commentInput}
                placeholder="Add a comment..."
                placeholderTextColor="#8E8E93"
                value={text}
                onChangeText={setText}
                onFocus={() => setModalGoUp("95%")}
                returnKeyType="done"
                keyboardAppearance={
                  colors.surface === "#121314" ? "dark" : "light"
                }
              />
            </View>
          )}
          {/* send button */}

          <TouchableOpacity
            style={[
              styles.sendBtn,
              selected.length === 0 && styles.sendBtnDisabled,
            ]}
            disabled={selected.length === 0 || sending}
            onPress={handleSend}
          >
            {sending ? (
              <ActivityIndicator color={colors.primary} />
            ) : (
              <>
        
                <Text style={styles.sendBtnText}>Send</Text>
                {selected.length > 0 && (
                  <View style={styles.sendBadge}>
                    <Text style={styles.sendBadgeText}>
                      {selected.length}
                    </Text>
                  </View>
                )}
              </>
            )}
          </TouchableOpacity>

          {/* 
            <TouchableOpacity
            style={[
              styles.sendBtn,
              selected.length === 0 && styles.sendBtnDisabled,
            ]}
            disabled={selected.length === 0 || sending}
            onPress={handleSend}>
               
            {sending ? (
              <ActivityIndicator color="#0A84FF" />
            ) : (
              <>
                <Text style={styles.sendBtnText}>Send</Text>
                {selected.length > 0 && (
                  <View style={styles.sendBadge}>
                    <Text style={styles.sendBadgeText}>{selected.length}</Text>
                  </View>
                )}
              </>
                  )}
             
                  </TouchableOpacity> */}

          {/* cancel button */}
          <TouchableOpacity style={styles.cancelBtn} onPress={resetAndClose}>
            <Text style={styles.cancelBtnText}>Cancel</Text>
          </TouchableOpacity>
        </View>
        {/* </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
      </TouchableWithoutFeedback>  */}
      </Pressable>
    </AppBottomSheet>
  );
}
