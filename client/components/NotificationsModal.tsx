import React, { useEffect, useState } from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet, Switch , Linking  } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Notifications from "expo-notifications";
//import { Colors } from "@/constants/Colors";
import { api } from "@/services/api/api";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/context/ThemeContext";
import { getStyles } from "@/assets/styles/Notification.styles";
import { useRouter } from "expo-router";
import { feedback } from "@/services/feedback";

interface Props {
  visible: boolean;
  onClose: () => void;
}

export default function NotificationsModal() {

  const [enabled, setEnabled] = useState(false);
  const router = useRouter();
  const {colors} = useTheme();
  const styles = getStyles(colors)

  useEffect(() => {
    (async () => {
      const { status } = await Notifications.getPermissionsAsync();
      setEnabled(status === "granted");
    })();
  }, []);

  const handleToggle = async (value: boolean) => {
    if (value) {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status === "granted") {
        setEnabled(true);
        try {
          const tokenResult = await Notifications.getExpoPushTokenAsync();
          console.log(tokenResult)
          await api.post("/api/users/push-token", { token: tokenResult.data });
        } catch (err) {
          console.error("push token error:", err);
        }
      } else {
        setEnabled(false);
      }
    } else {
      // iOS/Android اجازه نمی‌دن از داخل اپ پرمیشن رو Off کنی؛ باید کاربر رو به تنظیمات سیستم هدایت کرد
      setEnabled(false);
      //Linking?.openSettings?.();
    }
  };

  const sendNotifHere = () => {
    
// Second, call scheduleNotificationAsync()
if(enabled){


Notifications.scheduleNotificationAsync({
  content: {
    title: 'Look at that notification',
    body: "I'm so proud of myself!",
  },
  trigger: null,
});
} else {
  console.log('not enable to send notif')
  //Linking?.openSettings?.();
}
  }

  return (
    <SafeAreaView edges={["top"]}  style={[styles.container, { backgroundColor: colors.surface }]} >
    {/* <Modal visible={visible} animationType="slide" onRequestClose={onClose}> */}
      {/* <View style={styles.container}> */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color={colors.onSurface} />
          </TouchableOpacity>
          <Text style={styles.title}>Notifications</Text>
          <View style={{ width: 26 }} />
        </View>

        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={styles.rowLabel}>Allow notifications</Text>
            <Text style={styles.rowDesc}>Get notified when you have a nearby message or contact.</Text>
          </View>
          <Switch value={enabled} onValueChange={handleToggle} />
        </View>
      {/* </View> */}
     {/* <TouchableOpacity onPress={() => sendNotifHere()}>

      <Text>
        Send notif
      </Text>
    </TouchableOpacity>  */}
      </SafeAreaView>
    
  );
}

