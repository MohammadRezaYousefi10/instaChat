import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useVideoPlayer, VideoView } from "expo-video";

import { Message } from "@/types";

import {
  useSelectionStore,
  useMessageActionStore,
  useHighlightStore,
} from "@/store";

import { chatService } from "@/services/chats/chat.service";

import ReplyBubble from "./chat/ReplyBubble";
import MessageStatus2 from "./chat/MessageStatus";
import { getStyles } from "@/assets/styles/Bubble.styles";
import { useTheme } from "@/context/ThemeContext";

// ======================================================
// Types
// ======================================================

interface BubbleProps {
  msg: Message;
  isMine: boolean;

  /**
   * Jump to the original message of a reply.
   *
   * ChatScreen is responsible for:
   * - finding the message
   * - loading older messages
   * - scrolling
   * - highlighting
   */
  onJumpToReply?: (messageId: string) => void;
}

// ======================================================
// Bubble
// ======================================================

export default function Bubble({ msg, isMine, onJumpToReply }: BubbleProps) {
  const { colors } = useTheme();
  const styles = getStyles(colors);

  const selected = useSelectionStore((state) => state.isSelected(msg._id));

  const content = (
    <BubbleContent msg={msg} isMine={isMine} onJumpToReply={onJumpToReply} />
  );

  return (
    <View
      style={[
        styles.row,

        isMine ? styles.rowMe : styles.rowThem,

        {
          backgroundColor: selected ? "#D8ECFF" : undefined,
        },
      ]}
    >
      {isMine ? (
        <LinearGradient
          colors={[colors.primary, colors.primaryDim]}
          start={{
            x: 0,
            y: 0,
          }}
          end={{
            x: 1,
            y: 1,
          }}
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

// ======================================================
// Bubble Content
// ======================================================

interface BubbleContentProps {
  msg: Message;
  isMine: boolean;
  onJumpToReply?: (messageId: string) => void;
}

function BubbleContent({ msg, isMine, onJumpToReply }: BubbleContentProps) {
  const { colors } = useTheme();
  const styles = getStyles(colors);

  // ----------------------------------------------------
  // Selection Store
  // ----------------------------------------------------

  const selectionEnabled = useSelectionStore((state) => state.enabled);

  const toggleSelection = useSelectionStore((state) => state.toggle);

  const enterSelection = useSelectionStore((state) => state.enter);

  // ----------------------------------------------------
  // Message Action Store
  // ----------------------------------------------------

  const openMessageActions = useMessageActionStore((state) => state.open);

  // ----------------------------------------------------
  // Highlight
  // ----------------------------------------------------

  const highlighted = useHighlightStore((state) => state.messageId === msg._id);

  // ----------------------------------------------------
  // Reply Message ID
  // ----------------------------------------------------

  /**
   * Depending on your backend/interface,
   * replyTo may contain:
   *
   * replyTo.messageId
   *
   * or:
   *
   * replyTo._id
   *
   * We support both here so Bubble
   * doesn't become tightly coupled to
   * one shape.
   */

  const replyMessageId = msg.replyTo?._id ?? msg.replyTo?._id;

  // ====================================================
  // Render
  // ====================================================

  return (
    <View
      style={[
        highlighted && {
          opacity: 0.65,
        },
      ]}
    >
      {/* ==================================================
          Reply Preview
          ================================================== */}

      {msg.replyTo && (
        <TouchableOpacity
          activeOpacity={0.75}
          disabled={!replyMessageId}
          onPress={() => {
            if (!replyMessageId) {
              return;
            }

            onJumpToReply?.(replyMessageId);
          }}
        >
          <ReplyBubble
            reply={msg.replyTo}
            conversationId={msg.conversationId}
          />
        </TouchableOpacity>
      )}

      {/* ==================================================
          Message Content
          ================================================== */}

      <TouchableOpacity
        activeOpacity={0.85}
        onLongPress={() => {
          // ----------------------------------------------
          // Selection mode already enabled
          // ----------------------------------------------

          if (selectionEnabled) {
            toggleSelection(msg._id);

            return;
          }

          // ----------------------------------------------
          // Enter selection mode
          // ----------------------------------------------

          enterSelection(msg._id);

          // ----------------------------------------------
          // Open message actions
          // ----------------------------------------------

          openMessageActions(msg);
        }}
        onPress={() => {
          if (!selectionEnabled) {
            return;
          }

          toggleSelection(msg._id);
        }}
      >
        {/* ==================================================
            Media
            ================================================== */}

        {msg.mediaUrl && (
          <View style={styles.mediaWrapper}>
            {msg.mediaType === "image" ? (
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => {
                  // Later:
                  // open ImageViewer
                }}
              >
                <Image
                  source={{
                    uri: msg.mediaUrl,
                  }}
                  style={styles.mediaImage}
                  resizeMode="cover"
                />
              </TouchableOpacity>
            ) : (
              <VideoPlayer uri={msg.mediaUrl} style={styles.mediaVideo} />
            )}
          </View>
        )}

        {/* ==================================================
            Text
            ================================================== */}

        {!!msg.text && (
          <Text
            style={[
              styles.msgText,

              isMine ? styles.msgTextMe : styles.msgTextThem,
            ]}
          >
            {msg.text}
          </Text>
        )}

        {/* ==================================================
            Footer
            ================================================== */}

        <View
          style={[
            styles.footer,

            isMine ? styles.footerRight : styles.footerLeft,
          ]}
        >
          {/* ----------------------------------------------
              Time
              ---------------------------------------------- */}

          <Text
            style={[styles.timeText, isMine ? styles.timeMe : styles.timeThem]}
          >
            {formatTime(msg.createdAt)}
          </Text>

          {/* ----------------------------------------------
              Status
              ---------------------------------------------- */}

          {isMine && (
            <>
              <MessageStatus2 status={msg.status} read={msg.read} />

              {/* ------------------------------------------
                  Retry
                  ------------------------------------------ */}

              {msg.status === "failed" && (
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => chatService.retry(msg)}
                >
                  <Ionicons
                    name="refresh-outline"
                    size={22}
                    color={colors.onPrimary}
                  />
                </TouchableOpacity>
              )}
            </>
          )}
        </View>
      </TouchableOpacity>
    </View>
  );
}

// ======================================================
// Video Player
// ======================================================

interface VideoPlayerProps {
  uri: string;
  style: any;
}

function VideoPlayer({ uri, style }: VideoPlayerProps) {
  const player = useVideoPlayer(
    {
      uri,
    },
    (p) => {
      p.loop = false;
    },
  );

  return <VideoView player={player} style={style} nativeControls />;
}

// ======================================================
// Time Formatter
// ======================================================

function formatTime(date: string) {
  try {
    return new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}
