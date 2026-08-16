// client/components/PrivacyOptionSheet.tsx
import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Keyboard,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AppBottomSheet from "./AppBottomSheet";
import { useTheme } from "@/context/ThemeContext";
import { getStyles } from "@/assets/styles/PrivacyOptionSheet.styles";

export type PrivacyLevel = "everyone" | "contacts" | "nobody";

const OPTIONS: { value: PrivacyLevel; label: string }[] = [
  { value: "everyone", label: "Everybody" },
  { value: "contacts", label: "My Contacts" },
  { value: "nobody", label: "Nobody" },
];

interface Props {
  visible: boolean;
  title: string;
  value: PrivacyLevel;
  onClose: () => void;
  onSelect: (value: PrivacyLevel) => void;
}

export default function PrivacyOptionSheet({
  visible,
  title,
  value,
  onClose,
  onSelect,
}: Props) {
  const { colors } = useTheme();
  const styles = getStyles(colors);

  const resetAndClose = () => {
    //onSelect(value);
    onClose();
  };

  return (
    <AppBottomSheet
      visible={visible}
      onClose={resetAndClose}
      snapPoints={["35%"]}
    >
      {/* <Modal visible={visible} transparent onRequestClose={resetAndClose} > */}

      {/* <TouchableWithoutFeedback onPress={resetAndClose}>

         <KeyboardAvoidingView
                style={styles.forwardOverlay}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
              >
              <TouchableWithoutFeedback onPress={Keyboard.dismiss} >  */}

      <Pressable style={{ flex: 1 }} onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          <Text style={[styles.title, { color: colors.onSurface }]}>
            {title}
          </Text>

          {OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.value}
              style={[styles.row, { borderBottomColor: colors.outlineVariant }]}
              onPress={() => {
                onSelect(opt.value);
                onClose();
              }}
            >
              <Text style={[styles.rowText, { color: colors.onSurface }]}>
                {opt.label}
              </Text>
              {value === opt.value && (
                <Ionicons name="checkmark" size={20} color={colors.primary} />
              )}
            </TouchableOpacity>
          ))}
        </View>
        {/*  </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
      </TouchableWithoutFeedback> */}
      </Pressable>
    </AppBottomSheet>
  );
}
