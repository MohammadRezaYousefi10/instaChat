import { View, Text, TouchableOpacity, Image, Linking } from "react-native";
import React from "react";
import { Message } from "@/types";
import { LinearGradient } from "expo-linear-gradient";
import { useVideoPlayer, VideoView } from "expo-video";
import { formatTime } from "@/utils/formatTime";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/context/ThemeContext";
import { getStyles } from "@/assets/styles/Bubble.styles";
import ImageViewerModal from "./ImageViewerModal";
import MessageStatus2 from "./chat/MessageStatus";
import { chatService } from "@/services/chats/chat.service";

interface BubbleProps {
  msg: Message;
  isMine: boolean;
}

export default function Bubble({ msg, isMine }: BubbleProps) {
  const content = <BubbleContent msg={msg} isMine={isMine} />;

  const { colors } = useTheme();
  const styles = getStyles(colors);

  return (
    <View style={[styles.row, isMine ? styles.rowMe : styles.rowThem]}>
      {isMine ? (
        <LinearGradient
          colors={[colors.primary, colors.primaryDim]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.bubble, styles.bubbleMe]}
        >
          {content}
        </LinearGradient>
      ) : (
        <View style={[styles.bubble, styles.bubbleThem]}>{content}</View>
      )}
    </View>
  );
}

function BubbleContent({ msg, isMine }: { msg: Message; isMine: boolean }) {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  return (
    <View>
      {msg.mediaUrl && (
        <View style={styles.mediaWrapper}>
          {msg.mediaType === "image" ? (
            // onPress={() => Linking.openURL(msg.mediaUrl!)} when we open photo user go to this link
            <TouchableOpacity>
              <Image
                source={{ uri: msg.mediaUrl }}
                style={styles.mediaImage}
                resizeMode="cover"
              />
            </TouchableOpacity>
          ) : (
            <VideoPlayer uri={msg.mediaUrl} style={styles.mediaVideo} />
          )}
        </View>
      )}

      {msg.text && (
        <Text
          style={[
            styles.msgText,
            isMine ? styles.msgTextMe : styles.msgTextThem,
          ]}
        >
          {msg.text}
        </Text>
      )}

      <View
        style={[styles.footer, isMine ? styles.footerRight : styles.footerLeft]}
      >
        <Text
          style={[styles.timeText, isMine ? styles.timeMe : styles.timeThem]}
        >
          {formatTime(msg.createdAt)}
        </Text>
        {isMine && (
          <>
            {/* <Ionicons name={msg.read ? "checkmark-done" : "checkmark"} size={12} 
            color={msg.read ? colors.online : `${colors.onPrimary}88`}/> */}
            <MessageStatus2 status={msg.status} read={msg.read} />

            {msg.status === "failed" && (
              <TouchableOpacity onPress={() => chatService.retry(msg)}>
                <Ionicons name="refresh-outline" size={24} />
              </TouchableOpacity>
            )}
          </>
        )}
      </View>
    </View>
  );
}

function VideoPlayer({ uri, style }: { uri: string; style: any }) {
  const player = useVideoPlayer({ uri }, (p) => {
    p.loop = false;
  });
  return <VideoView player={player} style={style} nativeControls />;
}
