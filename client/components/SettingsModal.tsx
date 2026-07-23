import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Switch, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "@/context/ThemeContext";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { getStyles } from "@/assets/styles/Settings.styles";
import AppBottomSheet from "./AppBottomSheet";


interface Props {
  visible: boolean;
  onClose: () => void;
}

const STORAGE_KEY = "app_settings_v1";

interface Settings {
  darkMode: boolean;
  batterySaver: boolean;
  showLastSeen: boolean;
}

const defaultSettings: Settings = {
  darkMode: false,
  batterySaver: false,
  showLastSeen: true,
};

export default function SettingsModal() {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const { isDark, toggleTheme, colors } = useTheme();
  const [batterySaver, setBatterySaver] = useState(false);
  const [showLastSeen, setShowLastSeen] = useState(true);
  const [showMe, setShowMe] = useState(true);

  const styles = getStyles(colors)
  const router = useRouter()

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) setSettings({ ...defaultSettings, ...JSON.parse(raw) });
      } catch (err) {
        console.error("load settings error:", err);
      }
    })();
  }, []);

  const updateSetting = async (key: keyof Settings, value: boolean) => {
    const next = { ...settings, [key]: value };
    setSettings(next);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      // در صورت نیاز، همینجا می‌تونی به بک‌اند هم sync کنی:
      // await api.patch("/api/users/settings", next);
    } catch (err) {
      console.error("save settings error:", err);
    }
  };

  

    return ( 

    <SafeAreaView edges={["top"]}  style={[styles.container, { backgroundColor: colors.surface }]} >
    
       {/* <View style={[styles.container, { backgroundColor: colors.surface }]}>  */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color={colors.onSurface} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.onSurface }]}>Settings</Text>
          <View style={{ width: 26 }} />
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <Row
            icon="moon-outline"
            label="Dark mode"
            desc="Display app with dark theme"
            value={isDark}
            onChange={toggleTheme}
            colors={colors}
          />
          <Row
            icon="battery-charging-outline"
            label="Battery Saver Mode"
            desc="Reducing the frequency of map location updates and animations."
            value={batterySaver}
            onChange={setBatterySaver}
            colors={colors}
          />
        </ScrollView>


           {/*  <AppBottomSheet visible={showMe}  onClose={() => setShowMe(false)}>

            </AppBottomSheet> */}
    </SafeAreaView>
  );
}

function Row({ icon, label, desc, value, onChange, colors }: any) {
   const styles = getStyles(colors)
  return (
    <View style={[styles.row, { borderBottomColor: colors.surfaceHigh }]}>
      <View style={[styles.rowIcon, { backgroundColor: colors.surfaceHigh }]}>
        <Ionicons name={icon} size={20} color={colors.onSurfaceVariant} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.rowLabel, { color: colors.onSurface }]}>{label}</Text>
        <Text style={[styles.rowDesc, { color: colors.onSurfaceVariant }]}>{desc}</Text>
      </View>
      <Switch value={value} onValueChange={onChange} />
    </View>
  );
}



