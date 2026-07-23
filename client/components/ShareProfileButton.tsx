import React from "react";
import { TouchableOpacity, Text, StyleSheet, Share, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/context/ThemeContext";
import { getStyles } from "@/assets/styles/ShareProfile.styles";

interface Props {
  id: string;
  name: string;
  handle: string;
}

// این مسیر باید دقیقاً با ساختار فایل client/app/user/[id].tsx یکی باشه
// const PROFILE_BASE_URL = "https://persianSnapChat.ir/user";
const PROFILE_BASE_URL = "http://localhost:8081";

export default function ShareProfileButton({ id, name, handle }: Props) {
  const {colors} = useTheme();
  const styles = getStyles(colors)
  const handleShare = async () => {
    try {
      const link = `${PROFILE_BASE_URL}/${id}`;
      await Share.share({
        message: `Chat with ${name} (@${handle})\n`,
        url: link, // روی iOS جدا از متن، به‌صورت لینک واقعی attach می‌شه
      });
    } catch (err) {
      console.error("share profile error:", err);
      Alert.alert("خطا", "Profile sharing failed.");
    }
  };

  return (
    <TouchableOpacity style={styles.btn} onPress={handleShare}>
      <Text style={styles.text}>Share profile</Text>
      <Ionicons name="share-outline" size={18} color={colors.primary} />
    </TouchableOpacity>
  );
}

