import {
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  FlatList,
  Image,
  TextInput,
  Alert,
  Keyboard,
} from "react-native";
import {
  useAudioRecorder,
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
  useAudioRecorderState,
} from "expo-audio";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { formatTime } from "@/utils/formatTime";
import Avatar from "@/components/Avatar";
import Bubble from "@/components/Bubble";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { useApp } from "@/context/AppContext";
import { feedback } from "@/services/feedback";
import { useTheme } from "@/context/ThemeContext";
import { getStyles } from "@/assets/styles/ChatScreen.styles";

//import { sendMessage } from "@/services/chat";
import { useChat } from "@/hooks/useSendMessage";
//import { useSendMessage } from "@/hooks/useSendMessage";
import * as Crypto from "expo-crypto";
import { conversationService } from "@/services/chats/conversation.service";
import { usePresence } from "@/hooks/usePresence";
import { useTyping } from "@/hooks/useTyping";
import {
  useTypingStore,
  useHighlightStore,
  useMessageStore,
  useConversationStore,
  useReplyStore,
  useChatScrollStore,
  usePresenceStore,
} from "@/store";
import { SocketEventType } from "@/services/socket/socket.events";
import { useSocket } from "@/providers/SocketProvider";
import { api } from "@/services/api/api";
import AppMessageActionSheet from "@/components/message-actions/AppMessageActionSheet";
import ReplyPreview from "@/components/chat/ReplyPreview";

import { Message } from "@/types";
import { messageNavigator } from "@/services/navigation/navigator";
import { chatService } from "@/services/chats/chat.service";
import { useMessagePagination } from "@/hooks/useMessagePagination";
import { findMessageIndex } from "@/services/navigation/messageNavigator";

export default function chatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  //const {send}= useSendMessage();
  const router = useRouter();
  let {
    auth,
    //messages,
    //users,
    //selectedConversation,
    //setSelectedConversation,
    //typingUsers,
    //setConversations,
    //setMessages,
    //sendWsEvent,
  } = useApp();
  const user = auth.user;

  const selectedConversation = useConversationStore(
    (state) => state.selectedConversation,
  );
  //const setSelectedConversation = useConversationStore(state => state.setSelectedConversation);
  const { sendWsEvent } = useSocket();

  const conversationStore = useConversationStore.getState();
  /* const conversation =
  useConversationStore(
    state =>
      state.conversations.find(
        c =>
          c._id === conversationId
      )
  ); */

  const { messages, send } = useChat(selectedConversation!._id);

  //const { setMessages, addMessage, getConversationMessages } = useMessageStore();

  const store = useMessageStore.getState();
  //const loadMore = useMessagePagination(selectedConversation!._id).loadMore;
  const { loadMore } = useMessagePagination(id);
  const [highlightedMessageId, setHighlightedMessageId] = useState<
    string | null
  >(null);

  const { colors } = useTheme();
  const styles = getStyles(colors);

  const { targetMessageId, clearTarget } = useChatScrollStore();

  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mediaMime, setMediaMime] = useState<string>("image/jpeg");
  const [mediaName, setMediaName] = useState<string>("media.jpg");
  const [mediaUri, setMediaUri] = useState<string | null>(null);

  //const flatListRef = useRef<FlatList>(null);
  const flatListRef = useRef<FlatList<Message>>(null);
  useEffect(() => {
    if (!flatListRef.current) {
      return;
    }

    messageNavigator.register(flatListRef.current);

    return () => {
      messageNavigator.unregister();
    };
  }, []);
  const typingTimerRef = useRef<ReturnType<typeof setTimeout>>(null);

  const partner = selectedConversation?.participant;

  if (!partner) return;

  const presence = usePresence(partner._id);
  const isOnline = usePresenceStore(
    (state) => state.presence[partner._id]?.online ?? false,
  );
  console.log("isOnline : ", isOnline);

  /* console.log('presence' , presence)
  console.log('presence' , presence.online)
  console.log('user' , partner.name)
  console.log('online' , partner.isOnline) */

  // Load messages for this conversation
  useEffect(() => {
    console.log("fetching...");
    if (!id) return router.back();
    setLoading(true);
    const fetchMessages = async () => {
      try {
        const result = await chatService.fetchMessages(id, { limit: 30 });
        //const messages = [...result.messages].reverse();
        store.setMessages(id, result.messages);
        setLoading(false);
      } catch (err) {
        console.log(err);
        setTimeout(fetchMessages, 1000);
      }
    };
    fetchMessages();
  }, [id]);

  useEffect(() => {
    if (!targetMessageId) return;

    const index = messages.findIndex((m) => m._id === targetMessageId);

    if (index === -1) return;

    flatListRef.current?.scrollToIndex({
      index,

      animated: true,
    });
    useHighlightStore.getState().highlight(targetMessageId);
    clearTarget();
  }, [targetMessageId]);

  const ref = useRef<View>(null);
  const messageRefs = useRef(new Map<string, View>());

  /* useEffect(() => {
    if (flatListRef.current) {
      chatScrollService.register(flatListRef.current);
    }
  }, []); */
  const scrollToMessage = useCallback(
    (index: number) => {
      const message = useMessageStore.getState().messages[id!]?.[index];

      if (!message) {
        return;
      }

      setHighlightedMessageId(message._id);

      requestAnimationFrame(() => {
        flatListRef.current?.scrollToIndex({
          index,
          animated: true,
          viewPosition: 0.5,
        });
      });

      setTimeout(() => {
        setHighlightedMessageId(null);
      }, 1500);
    },
    [id],
  );

  const jumpToReply = useCallback(
    async (messageId: string) => {
      if (!id) {
        return;
      }

      while (true) {
        const store = useMessageStore.getState();

        const messages = store.messages[id] ?? [];

        const index = messages.findIndex(
          (message) =>
            message._id === messageId || message.clientId === messageId,
        );

        // پیدا شد
        if (index !== -1) {
          scrollToMessage(index);

          return;
        }

        const pagination = store.pagination[id];

        // چیزی برای Load کردن نیست
        if (pagination?.loading || pagination?.hasMore === false) {
          console.log("Reply message not found");

          return;
        }

        const loaded = await loadMore();

        if (!loaded) {
          return;
        }
      }
    },
    [id, loadMore, scrollToMessage],
  );

  function deletChat() {
    const msg = `Delete this chat? This cannot be undone.`;
    Alert.alert("Delete Chat", msg, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            //const { data } = await api.delete(`/api/messages/conversations/${selectedConversation?._id}`);
            router.back();
            await conversationService.deleteConversation(
              selectedConversation!._id,
            );
            /* if (data.success) {
              //setConversations((prev) => prev.filter((c) => c._id !== selectedConversation?._id));
              conversationStore.removeConversation(selectedConversation!._id);
              } */
            //setSelectedConversation(null);
          } catch (error) {
            Alert.alert("Error", "Failed to delete chat");
          }
        },
      },
    ]);
  }

  const pagination = useMessageStore((state) =>
    selectedConversation._id
      ? state.pagination[selectedConversation._id]
      : undefined,
  );

  const pickMedia = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission needed", "Allow photo access to send media.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images", "videos"],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      setMediaUri(asset.uri);
      setMediaMime(asset.mimeType || "image/jpeg");
      setMediaName(
        asset.fileName ||
          (asset.mimeType?.startsWith("video") ? "video.mp4" : "photo.jpg"),
      );
    }
  };

  const handleSend = async () => {
    //if ((!text.trim() && !mediaUri) || !selectedConversation) return;
    if ((!text.trim() && !mediaUri) || !partner || !user) return;
    setSending(true);
    try {
      const clientId = Crypto.randomUUID();
      const replyMessage = useReplyStore.getState().message;

      const message = await send({
        senderId: user._id,
        receiverId: partner._id,
        conversationId: selectedConversation._id,
        text,
        mediaUri,
        mediaMime,
        mediaName,
        clientId,
        status: "pending",
        replyToId: replyMessage?._id,
      });
      //setText("");

      if (message) {
        console.log("sending web socket", message);
        console.log("selectedConversation ", selectedConversation);
        /* sendWsEvent({
    type: "message",
    receiverId: partner._id,
    payload: message,
  }); */
        const target = { receiverId: partner!._id };
        sendWsEvent({
          type: SocketEventType.MESSAGE,
          ...target,
          payload: message,
        });
        //socketService.send({type: SocketEventType.MESSAGE , ...target , payload: message})

        //setMessages(selectedConversation._id, messages);
        //addMessage(selectedConversation._id, message);

        conversationStore.updateLastMessage(selectedConversation._id, message);

        //useMessageStore.getState().updateMessage(selectedConversation._id, message)
        //setText("");
        //setMediaUri(null);
        feedback.success();
      }

      /* const formData = new FormData();
      formData.append("receiverId" , partner!._id);
      if(text.trim()) formData.append("text" , text.trim());
      if(mediaUri){
        formData.append("file" , {uri: mediaUri , type : mediaMime , name: mediaName} as any);
      }

      const {data} = await api.post<{success:boolean , message:Message}>("/api/messages/send" , formData , {
        headers: {"Content-Type" : "multipart/form-data"}
      }) */
      /*    const data = await sendMessage({
            receiverId: partner._id,
            text,
            mediaUri,
            mediaMime,
            mediaName,
        });

      if (!data.success) return;
      if(data.success) {
        setMessages((prev)=> [...prev , data.message]);
        const target = {receiverId : partner!._id}
        sendWsEvent({type:"message" , ...target , payload: data.message});
        setText("");
        setMediaUri(null)
      }
      feedback.success() */

      setText("");

      setMediaUri(null);
    } catch (err: any) {
      Alert.alert(
        "Error",
        err?.response?.data?.message || "Failed to send message",
      );
      setText("");
      setMediaUri(null);
      feedback.error();
    } finally {
      //setLoading(false)
      setSending(false);
    }
  };

  const insets = useSafeAreaInsets();
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  // ردیابی وضعیت کیبورد برای padding دینامیک
  useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      () => setKeyboardVisible(true),
    );
    const hideSub = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      () => setKeyboardVisible(false),
    );
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  // ---- ضبط صدا ----
  /* const [isRecording, setIsRecording] = useState(false);
const [recordingDuration, setRecordingDuration] = useState(0);
const recordingRef = useRef<Audio.Recording | null>(null);
const durationIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null); */

  /* const formatDuration = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
};

const startRecording = async () => {
  try {
    const { status } = await Audio.requestPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("دسترسی لازم است", "برای ضبط صدا، اجازه دسترسی به میکروفون بدهید.");
      return;
    }

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });

    const { recording } = await Audio.Recording.createAsync(
      Audio.RecordingOptionsPresets.HIGH_QUALITY
    );
    recordingRef.current = recording;
    setIsRecording(true);
    setRecordingDuration(0);

    durationIntervalRef.current = setInterval(() => {
      setRecordingDuration((prev) => prev + 1);
    }, 1000);
  } catch (err) {
    console.error("startRecording error:", err);
    Alert.alert("خطا", "شروع ضبط صدا با مشکل مواجه شد");
  }
};

const cancelRecording = async () => {
  try {
    if (durationIntervalRef.current) clearInterval(durationIntervalRef.current);
    await recordingRef.current?.stopAndUnloadAsync();
    recordingRef.current = null;
    setIsRecording(false);
    setRecordingDuration(0);
  } catch (err) {
    console.error("cancelRecording error:", err);
  }
};

const sendRecording = async () => {
  try {
    if (durationIntervalRef.current) clearInterval(durationIntervalRef.current);
    await recordingRef.current?.stopAndUnloadAsync();
    const uri = recordingRef.current?.getURI();
    recordingRef.current = null;
    setIsRecording(false);

    if (!uri) return;

    setSending(true);
    const formData = new FormData();
    formData.append("conversationId", selectedConversation!._id); // متغیر conversationId خودت
    formData.append("type", "voice");
    formData.append("duration", String(recordingDuration));
    formData.append("audio", {
      uri,
      type: "audio/m4a",
      name: "voice.m4a",
    } as any);

    await api.post("/api/messages", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    feedback.success();
    setRecordingDuration(0);
  } catch (err: any) {
    feedback.error();
    Alert.alert("خطا", err?.response?.data?.message || "ارسال ویس ناموفق بود");
  } finally {
    setSending(false);
  }
};

useEffect(() => {
  return () => {
    if (durationIntervalRef.current) clearInterval(durationIntervalRef.current);
    recordingRef.current?.stopAndUnloadAsync().catch(() => {});
  };
}, []); */

  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(audioRecorder);

  const record = async () => {
    await audioRecorder.prepareToRecordAsync();
    audioRecorder.record();
  };

  const stopRecording = async () => {
    // The recording will be available on `audioRecorder.uri`.
    await audioRecorder.stop();
  };

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };
  const sendRecording = () => {
    console.log("audioRecorder ", audioRecorder);
  };

  useEffect(() => {
    (async () => {
      const status = await AudioModule.requestRecordingPermissionsAsync();
      if (!status.granted) {
        Alert.alert("Permission to access microphone was denied");
      }

      setAudioModeAsync({
        playsInSilentMode: true,
        allowsRecording: true,
      });
    })();
  }, []);

  const handleTyping = (val: string) => {
    setText(val);
    const target = { receiverId: partner!._id };
    if (!target.receiverId) return;
    useTypingStore
      .getState()
      .setTyping(selectedConversation._id, user!._id, true);

    sendWsEvent({ type: SocketEventType.TYPING, ...target, isTyping: true });

    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      useTypingStore.getState().clearConversation(selectedConversation._id);
      sendWsEvent({ type: SocketEventType.TYPING, ...target, isTyping: false });
    }, 1500);
  };

  // typing indicator helpers
  /* const typingEntries = Object.entries(typingUsers).filter(
    ([uid, isTyping]) => {
      if (!isTyping || uid === auth.user?._id) return false;
      return partner?._id === uid;
    },
  ); */
  const typingUsers = useTyping(selectedConversation._id);

  //console.log("selectedConversation ", selectedConversation._id);
  //console.log("typing users ", typingUsers);

  const isPartnerTyping = typingUsers[partner._id] === true;
  //console.log("isPartnerTyping", isPartnerTyping);
  const isTyping = useTypingStore(
    (state) => state.typing[partner._id] ?? false,
  );
  console.log("isTyping ", isTyping);

  if (!selectedConversation) {
    return (
      <SafeAreaView style={styles.safe}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={colors.onSurface} />
        </TouchableOpacity>
        <View style={styles.emptyState}>
          <Ionicons
            name="chatbubbles-outline"
            size={52}
            color={colors.outlineVariant}
          />
          <text style={styles.emptyText}>Conversation not found</text>
        </View>
      </SafeAreaView>
    );
  }

  const headerName = partner!.name;
  const headerAvatar = partner!.avatar;
  const headerSub =
    isOnline || partner!.isOnline
      ? "Online"
      : partner!.lastSeen
        ? `Last seen ${formatTime(partner.lastSeen)}`
        : "Offline";

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        style={styles.kav}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        // keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        {/* header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
          >
            <Ionicons name="chevron-back" size={24} color={colors.onSurface} />
          </TouchableOpacity>

          <Avatar
            name={headerName}
            src={headerAvatar}
            size={38}
            online={isOnline}
          />

          <View style={styles.headerInfo}>
            <Text style={styles.headerName} numberOfLines={1}>
              {headerName}
            </Text>
            <Text style={styles.headerHandle}>@{partner?.handle}</Text>
            <Text
              style={[styles.headerSub, isOnline && { color: colors.online }]}
            >
              {headerSub}
            </Text>
          </View>

          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.backBtn}>
              <Ionicons
                name="call-outline"
                size={20}
                color={colors.onSurfaceVariant}
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.backBtn}>
              <Ionicons
                name="videocam-outline"
                size={20}
                color={colors.onSurfaceVariant}
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.backBtn} onPress={deletChat}>
              <Ionicons
                name="trash-outline"
                size={20}
                color={colors.onSurfaceVariant}
              />
            </TouchableOpacity>
          </View>
        </View>
        {/* main */}
        {/* Messages */}
        {pagination?.loading && (
          <ActivityIndicator
            color={colors.primary}
            style={{
              marginVertical: 8,
            }}
          />
        )}
        {loading ? (
          <ActivityIndicator style={{ flex: 1 }} color={colors.primary} />
        ) : (
          <FlatList
            data={messages}
            ref={flatListRef}
            /* onScrollToIndexFailed={(info) => {
              setTimeout(() => {
                flatListRef.current?.scrollToIndex({
                  index: info.index,

                  animated: true,
                });
              }, 300);
            }} */
            onScrollToIndexFailed={(info) => {
              const wait = Math.min(100 + info.averageItemLength * 2, 500);

              setTimeout(() => {
                flatListRef.current?.scrollToIndex({
                  index: info.index,
                  animated: true,
                  viewPosition: 0.5,
                });
              }, wait);
            }}
            keyExtractor={(m) => m._id}
            contentContainerStyle={styles.messageList}
            inverted
            onEndReached={loadMore}
            onEndReachedThreshold={0.2}
            maintainVisibleContentPosition={{
              minIndexForVisible: 1,
            }}
            renderItem={({ item: msg, index }) => {
              const isMine = msg.sender === auth.user?._id;
              const prev = messages[index - 1];
              // const next = messages[index + 1];

              const showGap = !prev || prev.sender !== msg.sender;
              //const showGap = !prev || prev.sender !== msg.sender;

              const isHighlighted = highlightedMessageId === msg._id;

              return (
                <View
                  style={[
                    showGap && index > 0 ? { marginTop: 10 } : undefined,
                    isHighlighted && {
                      borderRadius: 12,
                      opacity: 0.7,
                    },
                  ]}
                >
                  <Bubble
                    msg={msg}
                    isMine={isMine}
                    onJumpToReply={msg.replyTo?._id ? jumpToReply : undefined}
                  />
                </View>
              );
            }}
            /* onContentSizeChange={() =>
              flatListRef.current?.scrollToEnd({ animated: true })
            } */
          />
        )}
        {/* typing indicator */}
        {/* {typingEntries.length > 0 && (
          <View style={styles.typingRow}>
            {typingEntries.map(([uid]) => {
              const u = users.find((x) => x._id === uid) || partner;
              return (
                <Text key={uid} style={styles.typingText}>
                  {u!.name || "Someone"} is typing...
                </Text>
              );
            })}
          </View>
        )}  */}
        {isTyping && (
          <View style={styles.typingRow}>
            return (
            <Text style={styles.typingText}>
              {partner!.name || "Someone"} is typing...
            </Text>
            );
          </View>
        )}
        {/*  <Text>
    {presence.online
        ? "Online"
        : "Offline"}

        
</Text>   */}
        {/* input bar */}
        <ReplyPreview
          onPress={() => {
            if (useReplyStore.getState().message?._id) {
              jumpToReply(useReplyStore.getState().message!._id);
            }
          }}
        />
        <View style={styles.inputBar}>
          {!recorderState.isRecording && (
            <TouchableOpacity style={styles.attachBtn} onPress={pickMedia}>
              <Ionicons
                name="image-outline"
                size={22}
                color={colors.onSurfaceVariant}
              />
            </TouchableOpacity>
          )}
          {/* Media preview */}
          {mediaUri && !recorderState.isRecording && (
            <View style={styles.mediaPreview}>
              <Image source={{ uri: mediaUri }} style={styles.mediaThumb} />
              <TouchableOpacity
                style={styles.mediaRemove}
                onPress={() => setMediaUri(null)}
              >
                <Ionicons name="close-circle" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          )}
          {/*   <View style={styles.inputRow}> */}

          {recorderState.isRecording ? (
            /* ---- حالت در حال ضبط ---- */
            <View style={styles.recordingRow}>
              <TouchableOpacity
                style={styles.recordActionBtn}
                onPress={stopRecording}
              >
                <Ionicons name="trash-outline" size={22} color={colors.error} />
              </TouchableOpacity>

              <View style={styles.recordingIndicator}>
                <View style={styles.recordingDot} />
                <Text
                  style={[styles.recordingTimer, { color: colors.onSurface }]}
                >
                  {formatDuration(recorderState.durationMillis)}
                </Text>
              </View>

              <TouchableOpacity
                style={styles.recordActionBtn}
                onPress={sendRecording}
                disabled={sending}
              >
                <LinearGradient
                  colors={[colors.primary, colors.primaryContainer]}
                  style={styles.sendBtn}
                >
                  {sending ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Ionicons name="checkmark" size={18} color="#fff" />
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <TextInput
                style={styles.textInput}
                value={text}
                onChangeText={handleTyping}
                placeholder="Message..."
                placeholderTextColor={colors.outlineVariant}
                multiline
                maxLength={2000}
                autoCapitalize="none"
                keyboardAppearance={
                  colors.surface === "#121314" ? "dark" : "light"
                }
              />

              {text.trim() || mediaUri ? (
                <TouchableOpacity
                  disabled={(!text.trim() && !mediaUri) || sending}
                  activeOpacity={0.85}
                  onPress={handleSend}
                >
                  <LinearGradient
                    colors={[colors.primary, colors.primaryContainer]}
                    style={[
                      styles.sendBtn,
                      !text.trim() && !mediaUri && styles.sendBtnDisabled,
                    ]}
                  >
                    {/* {sending ? (
                      <ActivityIndicator color="#fff" size="small" />
                    ) :  */}

                    <Ionicons name="send" size={16} color="#fff" />
                  </LinearGradient>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity activeOpacity={0.85} onPress={record}>
                  <LinearGradient
                    colors={[colors.primary, colors.primaryContainer]}
                    style={styles.sendBtn}
                  >
                    <Ionicons name="mic" size={18} color="#fff" />
                  </LinearGradient>
                </TouchableOpacity>
              )}
            </>
          )}
        </View>
        <AppMessageActionSheet />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
