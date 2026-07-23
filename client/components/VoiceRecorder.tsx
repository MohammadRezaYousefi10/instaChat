import React, { useRef, useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  PanResponder,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Audio } from "expo-av"; // اگر SDK جدیدتر داری و expo-audio نصب کردی، بگو تا نسخه‌ی معادل رو بدم

/**
 * VoiceRecorder
 * ------------------------------------------------------------
 * رفتار دقیقاً شبیه تلگرام:
 *  - Press & Hold روی میکروفون => شروع ضبط
 *  - رها کردن انگشت (بدون قفل/کنسل) => ضبط تموم میشه و بلافاصله ارسال میشه
 *  - کشیدن انگشت به چپ بیشتر از یک آستانه => کنسل (فایل حذف میشه)
 *  - کشیدن انگشت به بالا بیشتر از یک آستانه => قفل میشه (دست آزاد)، بعدش
 *    خودت با دکمه‌ی ارسال/سطل‌آشغال تصمیم می‌گیری
 *
 * Props:
 *  - onSend(uri: string, durationMs: number, mimeType: string): وقتی ویس آماده ارسال باشه
 *  - onCancel(): اختیاری، وقتی ضبط کنسل بشه
 *  - colors: آبجکت رنگ‌های تم فعلی (از useTheme)
 *  - disabled: اختیاری، غیرفعال کردن دکمه
 */

type VoiceRecorderProps = {
  onSend: (uri: string, durationMs: number, mimeType: string) => void;
  onCancel?: () => void;
  colors: {
    primary: string;
    primaryContainer: string;
    onSurfaceVariant: string;
    surface?: string;
    error?: string;
    outlineVariant?: string;
  };
  disabled?: boolean;
};

const CANCEL_THRESHOLD = -90; // px به چپ
const LOCK_THRESHOLD = -80; // px به بالا

function formatDuration(ms: number) {
  const totalSec = Math.floor(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function VoiceRecorder({
  onSend,
  onCancel,
  colors,
  disabled,
}: VoiceRecorderProps) {
  const [phase, setPhase] = useState<"idle" | "recording" | "locked">("idle");
  const [durationMs, setDurationMs] = useState(0);

  const recordingRef = useRef<Audio.Recording | null>(null);
  const startTimeRef = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const cancelledRef = useRef(false);
  const lockedRef = useRef(false);

  // انیمیشن‌ها
  const dragX = useRef(new Animated.Value(0)).current;
  const dragY = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(1)).current;

  // پالس قرمز روی دکمه‌ی میکروفون هنگام ضبط
  useEffect(() => {
    if (phase === "recording" || phase === "locked") {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, {
            toValue: 1.35,
            duration: 550,
            useNativeDriver: true,
          }),
          Animated.timing(pulse, {
            toValue: 1,
            duration: 550,
            useNativeDriver: true,
          }),
        ]),
      );
      loop.start();
      return () => loop.stop();
    }
    pulse.setValue(1);
  }, [phase]);

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const startTimer = () => {
    startTimeRef.current = Date.now();
    stopTimer();
    timerRef.current = setInterval(() => {
      setDurationMs(Date.now() - startTimeRef.current);
    }, 200);
  };

  const resetGesture = () => {
    Animated.parallel([
      Animated.spring(dragX, { toValue: 0, useNativeDriver: true }),
      Animated.spring(dragY, { toValue: 0, useNativeDriver: true }),
    ]).start();
  };

  const startRecording = useCallback(async () => {
    try {
      const perm = await Audio.requestPermissionsAsync();
      if (!perm.granted) return;

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY,
      );
      recordingRef.current = recording;
      cancelledRef.current = false;
      lockedRef.current = false;
      setDurationMs(0);
      setPhase("recording");
      startTimer();
    } catch (err) {
      console.warn("Failed to start recording", err);
    }
  }, []);

  const finishRecording = useCallback(
    async (shouldSend: boolean) => {
      stopTimer();
      const recording = recordingRef.current;
      recordingRef.current = null;
      resetGesture();
      setPhase("idle");

      if (!recording) return;

      try {
        await recording.stopAndUnloadAsync();
        const uri = recording.getURI();
        const finalDuration = Date.now() - startTimeRef.current;

        if (shouldSend && uri && finalDuration > 500) {
          onSend(uri, finalDuration, "audio/m4a");
        } else {
          onCancel?.();
        }
      } catch (err) {
        console.warn("Failed to stop recording", err);
      }
    },
    [onSend, onCancel],
  );

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !disabled,
      onMoveShouldSetPanResponder: () => phase !== "idle",
      onPanResponderGrant: () => {
        if (!disabled) startRecording();
      },
      onPanResponderMove: (_, gesture) => {
        if (phase === "idle" || lockedRef.current) return;

        // فقط اجازه بده به چپ (کنسل) یا بالا (قفل) بره
        const x = Math.min(0, gesture.dx);
        const y = Math.min(0, gesture.dy);
        dragX.setValue(x);
        dragY.setValue(y);

        if (y < LOCK_THRESHOLD) {
          lockedRef.current = true;
          setPhase("locked");
          resetGesture();
        }
      },
      onPanResponderRelease: (_, gesture) => {
        if (phase === "idle") return;

        if (lockedRef.current) {
          // قفل شده: چیزی رو تموم نکن، منتظر دکمه‌ی ارسال/حذف بمون
          return;
        }

        if (gesture.dx < CANCEL_THRESHOLD) {
          cancelledRef.current = true;
          finishRecording(false);
        } else {
          finishRecording(true);
        }
      },
      onPanResponderTerminate: () => {
        if (phase !== "idle" && !lockedRef.current) {
          finishRecording(false);
        }
      },
    }),
  ).current;

  useEffect(() => {
    return () => {
      stopTimer();
      recordingRef.current?.stopAndUnloadAsync().catch(() => {});
    };
  }, []);

  // ---------- حالت آیدل: فقط دکمه‌ی میکروفون ----------
  if (phase === "idle") {
    return (
      <View {...panResponder.panHandlers}>
        <LinearGradient
          colors={[colors.primary, colors.primaryContainer]}
          style={[styles.sendBtn, disabled && { opacity: 0.5 }]}
        >
          <Ionicons name="mic" size={18} color="#fff" />
        </LinearGradient>
      </View>
    );
  }

  // ---------- حالت در حال ضبط (نگه داشته) یا قفل شده ----------
  const showCancelHint = phase === "recording";

  return (
    <View style={styles.recordingRow}>
      {phase === "locked" && (
        <TouchableOpacity
          onPress={() => finishRecording(false)}
          style={styles.iconBtn}
        >
          <Ionicons name="trash-outline" size={20} color={colors.error || "#e53935"} />
        </TouchableOpacity>
      )}

      <View style={styles.timerWrap}>
        <View style={[styles.recDot, { backgroundColor: colors.error || "#e53935" }]} />
        <Text style={[styles.timerText, { color: colors.onSurfaceVariant }]}>
          {formatDuration(durationMs)}
        </Text>
      </View>

      {showCancelHint ? (
        <Animated.View
          style={[
            styles.cancelHint,
            { transform: [{ translateX: dragX }] },
          ]}
        >
          <Ionicons
            name="chevron-back"
            size={14}
            color={colors.onSurfaceVariant}
          />
          <Text style={[styles.cancelText, { color: colors.onSurfaceVariant }]}>
            برای لغو بکش
          </Text>
        </Animated.View>
      ) : (
        <View style={{ flex: 1 }} />
      )}

      {showCancelHint && (
        <Animated.View
          style={[styles.lockWrap, { transform: [{ translateY: dragY }] }]}
        >
          <Ionicons
            name="lock-closed-outline"
            size={16}
            color={colors.onSurfaceVariant}
          />
          <Ionicons
            name="chevron-up"
            size={12}
            color={colors.onSurfaceVariant}
            style={{ marginTop: -2 }}
          />
        </Animated.View>
      )}

      <Animated.View
        {...(phase === "recording" ? panResponder.panHandlers : {})}
        style={{ transform: [{ scale: pulse }] }}
      >
        <LinearGradient
          colors={[colors.primary, colors.primaryContainer]}
          style={styles.sendBtn}
        >
          <Ionicons
            name={phase === "locked" ? "send" : "mic"}
            size={18}
            color="#fff"
          />
        </LinearGradient>
      </Animated.View>

      {phase === "locked" && (
        <TouchableOpacity
          onPress={() => finishRecording(true)}
          style={styles.iconBtn}
        >
          <Ionicons name="send" size={18} color={colors.primary} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  sendBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  recordingRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 8,
  },
  timerWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  recDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  timerText: {
    fontSize: 13,
    fontVariant: ["tabular-nums"],
  },
  cancelHint: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  cancelText: {
    fontSize: 12,
  },
  lockWrap: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 4,
  },
  iconBtn: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
});
