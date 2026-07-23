// app/(tabs)/privacy.tsx  (یا مسیر فعلیت)
import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { api, useApp } from "@/context/AppContext";
import { useTheme } from "@/context/ThemeContext";
import PrivacyOptionSheet, { PrivacyLevel } from "@/components/PrivacyOptionSheet";
import { toast } from "@/components/Toast";
import { getStyles } from "@/assets/styles/Privacy.styles";
import { getCachedPrivacy, setCachedPrivacy } from "@/services/privacyStore";

type PrivacyField = "phoneNumber" | "lastSeen" | "profilePhoto" | "bio" | "calls";

interface PrivacySettings {
  phoneNumber: PrivacyLevel;
  lastSeen: PrivacyLevel;
  profilePhoto: PrivacyLevel;
  bio: PrivacyLevel;
  calls: PrivacyLevel;
}

const ROWS: { field: PrivacyField; label: string }[] = [
  { field: "phoneNumber", label: "Phone Number" },
  { field: "lastSeen", label: "Last Seen & Online" },
  { field: "profilePhoto", label: "Profile Photos" },
  { field: "bio", label: "Bio" },
  { field: "calls", label: "Calls" },
];

const LEVEL_LABEL: Record<PrivacyLevel, string> = {
  everyone: "Everybody",
  contacts: "My Contacts",
  nobody: "Nobody",
};

export default function PrivacyScreen() {
  const { colors } = useTheme();
  const styles = getStyles(colors)
  const [privacy, setPrivacy] = useState<PrivacySettings | null>(null);
  const [activeField, setActiveField] = useState<PrivacyField | null>(null);
  const [loading, setLoading] = useState(true);
  const {logout } = useApp();
  

   useEffect(() => {
    (async () => {
      // ۱. اول از کش، بدون هیچ اسپینر
      const cached = await getCachedPrivacy();
      if (cached) setPrivacy(cached);
      if(!cached){
      // ۲. پشت صحنه از سرور sync کن (اگه تغییری از جای دیگه بوده بروز میشه)
      try {
        const { data } = await api.get<{ success: boolean; privacy: PrivacySettings }>("/api/privacy");
        if (data.success) {
          setPrivacy(data.privacy);
          setCachedPrivacy(data.privacy);
        }
      } catch {
        console.log("Somthing went wrong")
      }
              
      }
    })();
  }, []);

const handleSelect = async (field: PrivacyField, value: PrivacyLevel) => {
    console.log('field ' , field)
    console.log('value ' , value)
    if (!privacy) return;
    const updated = { ...privacy, [field]: value };
    setPrivacy(updated); // optimistic UI
    await setCachedPrivacy(updated); // فوری توی حافظه ذخیره شد

    try {
      await api.patch("/api/privacy", { field, value });
      
    } catch {
      toast.show("Update failed");
      // اختیاری: صف retry بسازی برای وقتی نت وصل شد
    }
  };

  if (!privacy) return null; // فقط بار اول (اگه کش هم خالی بود) یه لحظه چیزی نشون نمیده



  
  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete account",
      "This action is irreversible. All your information, messages, and photos will be permanently deleted. Are you sure?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete account",
          style: "destructive",
          onPress: async () => {
            try {
              await api.delete("/api/users/me");
              await logout();
            } catch (err: any) {
              Alert.alert("Error", err?.response?.data?.message || "Account deletion failed.");
            }
          },
        },
      ]
    );
  };


  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.surface }]} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={26} color={colors.onSurface} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.onSurface }]}>Privacy and Security</Text>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>

      
         <TouchableOpacity style={styles.linkRow} >
            <Ionicons name="ban-outline" size={20} color={colors.onSurfaceVariant} />
            <Text style={styles.linkText}>Blocked Users</Text>
            <View style={styles.badge}>
                        <Text style={styles.badgeText}>4</Text>
              </View>
            <Ionicons name="chevron-forward" size={16} color={colors.outlineVariant} />
          </TouchableOpacity>

        <Text style={[styles.sectionLabel, { color: colors.outlineVariant }]}>PRIVACY</Text>

        <View style={[styles.card]}>
          {ROWS.map((row, index) => (
            <TouchableOpacity
              key={row.field}
              style={[
                styles.row,
                index < ROWS.length - 1 && {
                  borderBottomWidth: StyleSheet.hairlineWidth,
                  borderBottomColor: colors.outlineVariant,
                },
              ]}
              onPress={() => setActiveField(row.field)}
            >
              <Text style={[styles.rowLabel, { color: colors.onSurface }]}>{row.label}</Text>
              <View style={styles.rowRight}>
                <Text style={[styles.rowValue, { color: colors.onSurfaceVariant }]}>
                  {LEVEL_LABEL[privacy[row.field]]}
                </Text>
                <Ionicons name="chevron-forward" size={18} color={colors.outlineVariant} />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[styles.footerNote, { color: colors.outlineVariant }]}>
          You can restrict which users are allowed to see this information.
        </Text>
      </ScrollView>

      <PrivacyOptionSheet
        visible={!!activeField}
        title={ROWS.find((r) => r.field === activeField)?.label ?? ""}
        value={activeField ? privacy[activeField] : "everyone"}
        onClose={() => setActiveField(null)}
        onSelect={(value) => activeField && handleSelect(activeField, value)}
      />
    </SafeAreaView>
  );
}


  