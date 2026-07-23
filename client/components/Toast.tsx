// client/components/Toast.tsx
import React, { useEffect, useRef, useState, useCallback } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/context/ThemeContext";
import { getStyles } from "@/assets/styles/Toast.styles";

type ToastOptions = {
  duration?: number;
  icon?: keyof typeof Ionicons.glyphMap;
};

type Listener = (message: string, options?: ToastOptions) => void;
let listener: Listener | null = null;

// از هر جای اپ صداش کن: toast.show("Image Saved")
export const toast = {
  show: (message: string, options?: ToastOptions) => {
    listener?.(message, options);
  },
};

export default function ToastHost() {
    const {colors} = useTheme()
    const styles = getStyles(colors)
  const [message, setMessage] = useState<string | null>(null);
  const [icon, setIcon] = useState<keyof typeof Ionicons.glyphMap | undefined>();
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.9);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hide = useCallback(() => {
    opacity.value = withTiming(0, { duration: 200 });
    scale.value = withTiming(0.9, { duration: 200 }, (finished) => {
      if (finished) runOnJS(setMessage)(null);
    });
  }, []);

  useEffect(() => {
    listener = (msg, options) => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setIcon(options?.icon);
      setMessage(msg);
      opacity.value = withTiming(1, { duration: 200 });
      scale.value = withTiming(1, { duration: 200 });
      timeoutRef.current = setTimeout(hide, options?.duration ?? 2000);
    };
    return () => {
      listener = null;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [hide]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  if (!message) return null;

  return (
    <View style={styles.overlay} pointerEvents="none">
      <Animated.View style={[styles.bubble, animatedStyle]}>
        {icon && <Ionicons name={icon} size={22} color="#fff" style={styles.icon} />}
        <Text style={styles.text}>{message}</Text>
      </Animated.View>
    </View>
  );
}

