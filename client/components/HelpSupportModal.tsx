// client/components/HelpSupportModal.tsx
import React from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet, Linking } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";
import AppBottomSheet from "./AppBottomSheet";

interface Props {
  visible: boolean;
  onClose: () => void;
}

export default function HelpSupportModal({ visible, onClose }: Props) {
  return (
    <AppBottomSheet visible={visible} onClose={onClose} snapPoints={["35%"]}>
    {/* <Modal visible={visible} animationType="slide" onRequestClose={onClose} transparent> */}
   
      <View style={styles.overlay}>
        <View style={styles.sheet}>
         

          <Text style={styles.text}>
           If you encounter a serious issue or have a question about how to use InstaChat,
            our support team is ready to assist you. To get in touch, you can visit the
            official support website.
          </Text>

          <TouchableOpacity
            style={styles.linkBtn}
            onPress={() => Linking.openURL("https://persianSnapChat.ir/support")}
          >
            <Ionicons name="globe-outline" size={18} color="#fff" />
            <Text style={styles.linkBtnText}>Visit the support center</Text>
          </TouchableOpacity>
        </View>
      </View>
    </AppBottomSheet>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: "center" },
  sheet: { borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, paddingBottom: 40 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  title: { fontSize: 16, fontWeight: "700", color: Colors.onSurface },
  text: { fontSize: 14, color: Colors.onSurfaceVariant, lineHeight: 22, marginBottom: 20 },
  linkBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: Colors.primary, paddingVertical: 14, borderRadius: 30 },
  linkBtnText: { color: "#fff", fontWeight: "600" },
});