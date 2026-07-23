// client/components/ContactsModal.tsx
import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
  Linking,
  Pressable,
  Keyboard,
} from "react-native";
import * as Contacts from "expo-contacts";
import { Ionicons } from "@expo/vector-icons";
import { BottomSheetFlatList, BottomSheetSectionList } from "@gorhom/bottom-sheet";
import AppBottomSheet from "./AppBottomSheet";
import { api, useApp } from "@/context/AppContext";
import { useTheme } from "@/context/ThemeContext";
import { normalizePhoneNumber, getCountryFromE164 } from "@/utils/phone";
import { buildContactSections, ContactSection } from "@/utils/contactGrouping";
import { sendInvite } from "@/services/invite";
import {RegisteredUser , DeviceContact} from "@/types"



interface Props {
  visible: boolean;
  onClose: () => void;
  onSelectUser: (user: RegisteredUser) => void;
}

export default function ContactsModal({ visible, onClose, onSelectUser }: Props) {
  const { colors } = useTheme();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [contacts, setContacts] = useState<DeviceContact[]>([]);
  const {auth} = useApp();
  const user = auth.user;

  useEffect(() => {
    if (visible) loadContacts();
  }, [visible]);

  const loadContacts = async () => {
    setLoading(true);
    setPermissionDenied(false);
    try {
      const { status } = await Contacts.requestPermissionsAsync();
      if (status !== "granted") {
        setPermissionDenied(true);
        return;
      }

      const { data } = await Contacts.getContactsAsync({
        fields: [Contacts.Fields.PhoneNumbers],
      });

      const defaultCountry =  getCountryFromE164(user?.phone) ?? "IR" // یا از user.phone خودت با getCountryFromE164 بگیر

      const deviceContacts: DeviceContact[] = data
        .filter((c) => c.phoneNumbers && c.phoneNumbers.length > 0)
        .map((c) => {
          const rawNumber = c.phoneNumbers![0].number ?? "";
          const normalized = normalizePhoneNumber(rawNumber, defaultCountry);
          return {
            id: c.id!,
            name: c.name ?? "Unknown",
            phone: normalized ?? rawNumber,
            isNormalized: !!normalized,
          };
        })
        .filter((c) => c.isNormalized);

      const phones = deviceContacts.map((c) => c.phone);
      const res = await api.post<{ success: boolean; registered: RegisteredUser[] }>(
        "/api/contacts/sync",
        { phones }
      );

      const registeredMap = new Map(res.data.registered.map((u) => [u.phone, u]));
      const merged = deviceContacts.map((c) => ({ ...c, registered: registeredMap.get(c.phone) }));

      setContacts(merged);
    } catch (err) {
      console.error("contacts sync error:", err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    if (!query.trim()) return contacts;
    return contacts.filter((c) => c.name.toLowerCase().includes(query.toLowerCase()));
  }, [query, contacts]);

  const sections: ContactSection[] = useMemo(() => buildContactSections(filtered), [filtered]);

  const renderItem = ({ item }: { item: DeviceContact }) => {
    const isRegistered = !!item.registered;
    return (
      <TouchableOpacity
        style={[styles.row , {
  padding: 14 , borderRadius:12}]}
        activeOpacity={0.7}
        onPress={() => {
          if (item.registered) {
            onSelectUser(item.registered);
            onClose();
          } else {
            sendInvite(item.phone);
          }
        }}
      >
        {item.registered?.avatar ? (
          <Image source={{ uri: item.registered.avatar }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarFallback, { backgroundColor: colors.outlineVariant }]}>
            <Text style={styles.avatarFallbackText}>{item.name.charAt(0).toUpperCase()}</Text>
          </View>
        )}
    
        <View style={{ flex: 1 }}>
          <Text style={[styles.name, { color: colors.onSurface }]}>{item.name}</Text>
          <Text style={[styles.sub, { color: colors.outlineVariant }]}>
            {isRegistered ? `@${item.registered!.handle}` : item.phone}
          </Text>
        </View>

        {!isRegistered && (
          <Text style={[styles.inviteText, { color: colors.primary }]}>Invite</Text>
        )}
      </TouchableOpacity>
    );
  };

  const renderSectionHeader = ({ section }: { section: ContactSection }) => (
    
    <View >
      {section.groupTitle && (
        <Text style={[styles.groupHeader, { color: colors.onSurfaceVariant }]}>{section.groupTitle}</Text>
      )}
      <View style={[styles.letterHeader, { backgroundColor: colors.onSurfaceVariant }]}>
        <Text style={[styles.letterHeaderText, { color: colors.outlineVariant }]}>
          {section.letter}
        </Text>
      </View>
    </View>
  );

  return (
    <AppBottomSheet visible={visible} onClose={onClose} snapPoints={["75%" , "95%"]}>
        <Pressable
                style={{ flex: 1 }}
                onPress={Keyboard.dismiss}
              >
      <View style={[styles.container ]}>
        <Text style={[styles.title, { color: colors.onSurface }]}>Contacts</Text>

        <View style={[styles.searchBox, { backgroundColor: colors.surfaceHigh }]}>
          <Ionicons name="search" size={16} color={colors.outlineVariant} />
          <TextInput
            style={[styles.searchInput, { color: colors.onSurface }]}
            placeholder="Search..."
            placeholderTextColor={colors.outlineVariant}
            value={query}
            onChangeText={setQuery}
          />

          {query.length > 0 && (
                    <TouchableOpacity
                      onPress={() => {
                        setQuery("");
                      }}
                    >
                      <Ionicons
                        name="close-circle"
                        size={16}
                        color={colors.outlineVariant}
                      />
                    </TouchableOpacity>
                  )}
          
        </View>

        {loading ? (
          <ActivityIndicator style={{ marginTop: 40 }} color={colors.primary} />
        ) : permissionDenied ? (
          <View style={styles.centerMessage}>
            <Text style={[styles.messageText, { color: colors.onSurface }]}>
              Access to contacts is required.
            </Text>
            <TouchableOpacity onPress={() => Linking.openSettings()}>
              <Text style={{ color: colors.primary, marginTop: 8 }}>Open Settings</Text>
            </TouchableOpacity>
          </View>
        ) : (
          
           <BottomSheetSectionList
           sections={sections}
            keyExtractor={(item, index) => item.id + index}
            renderItem={renderItem}
            renderSectionHeader={renderSectionHeader}
            //style={{backgroundColor: "#fff" , borderRadius:8 , paddingHorizontal:10}}
            renderSectionFooter={() => (
          <View style={{ height: 12 }} />
        )}
            keyboardShouldPersistTaps="handled"
            stickySectionHeadersEnabled={false}
            
            ListEmptyComponent={
              <Text style={[styles.messageText, { color: colors.outlineVariant, marginTop: 40 }]}>
                No contacts found
              </Text>
            }
          /> 
        )} 
      </View>
      </Pressable>
    </AppBottomSheet>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 16, paddingTop: 8 },
  title: { fontSize: 18, fontWeight: "700", marginBottom: 12 , margin:"auto"},
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 6,
    marginBottom: 12,
  },
  searchInput: { flex: 1, fontSize: 15 },
  groupHeader: { fontSize: 13, fontWeight: "700",
     marginTop: 16, marginBottom: 16, textTransform: "uppercase" ,opacity: 0.6  },
  fieldLabel: { fontSize: 10, fontWeight: "800", letterSpacing: 1, opacity: 0.6 },

  letterHeader: { paddingVertical: 4, paddingHorizontal: 8, borderRadius: 6, alignSelf: "flex-start", marginBottom: 4 },
  letterHeaderText: { fontSize: 13, fontWeight: "700" },
  row: { flexDirection: "row", alignItems: "center", paddingVertical: 10, gap: 12 },
  avatar: { width: 46, height: 46, borderRadius: 23 },
  avatarFallback: { justifyContent: "center", alignItems: "center" },
  avatarFallbackText: { color: "#fff", fontWeight: "700" },
  name: { fontSize: 16, fontWeight: "600" },
  sub: { fontSize: 13, marginTop: 2 },
  inviteText: { fontSize: 14, fontWeight: "600" },
  centerMessage: { alignItems: "center", marginTop: 60 },
  messageText: { fontSize: 14, textAlign: "center" },
});