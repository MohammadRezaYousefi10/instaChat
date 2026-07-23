// client/components/AddPhoneModal.tsx
import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Pressable, Keyboard } from "react-native";
import AppBottomSheet from "./AppBottomSheet";
import PhoneInput from "./PhoneInput";
import { useTheme } from "@/context/ThemeContext";
import { usePhoneAuth } from "@/services/phoneAuth";
import { toast } from "./Toast";

interface Props {
  visible: boolean;
  onClose: () => void;
  onVerified: () => void;
}

type Step = "phone" | "code";

export default function AddPhoneModal({ visible, onClose, onVerified }: Props) {
  const { colors } = useTheme();
  const { sendCode, verifyCode } = usePhoneAuth();

  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState<string | null>(null);
  const [phoneValid, setPhoneValid] = useState(false);
  const [provider, setProvider] = useState<"melipayamak" | "clerk">("melipayamak");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const reset = () => {
    setStep("phone");
    setPhone(null);
    setCode("");
  };

  const handleSendCode = async () => {
    if (!phone || !phoneValid) return;
    setLoading(true);
    try {
      const p = await sendCode(phone);
      setProvider(p);
      setStep("code");
    } catch {
      toast.show("Failed to send code");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!phone || !code.trim()) return;
    setLoading(true);
    try {
      await verifyCode(phone, code.trim(), provider);
      toast.show("Phone verified", { icon: "checkmark-circle" });
      reset();
      onVerified();
    } catch {
      toast.show("Invalid code");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppBottomSheet
      visible={visible}
      onClose={() => {
        reset();
        onClose();
      }}
      snapPoints={["70%"]}
    >
        
         <Pressable
          style={{ flex: 1 }}
          onPress={Keyboard.dismiss}
        >
      <View style={styles.container}>
        {step === "phone" ? (
          <>
            
            <Text style={[styles.title, { color: colors.onSurface }]}>Enter your phone number</Text>
            <Text style={[styles.subtitle, { color: colors.outlineVariant }]}>
              To see your contacts, verify your phone number first.
            </Text>

            <PhoneInput onChange={(e164, valid ) => { setPhone(e164); setPhoneValid(valid); }} />
            <TouchableOpacity
              style={[styles.button, { backgroundColor: colors.primary }, !phoneValid && styles.buttonDisabled]}
              disabled={!phoneValid || loading}
              onPress={handleSendCode}
            >
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Send Code</Text>}
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={[styles.title, { color: colors.onSurface }]}>Enter verification code</Text>
            <Text style={[styles.subtitle, { color: colors.outlineVariant }]}>We sent a code to {phone}</Text>

            {/* یه TextInput ساده برای کد، مثل قبل */}

            <TouchableOpacity
              style={[styles.button, { backgroundColor: colors.primary }, !code.trim() && styles.buttonDisabled]}
              disabled={!code.trim() || loading}
              onPress={handleVerify}
            >
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Verify</Text>}
            </TouchableOpacity>
          </>
        )}
      </View>
      </Pressable>
    </AppBottomSheet>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 20, paddingTop: 12 },
  title: { fontSize: 18, fontWeight: "700", marginBottom: 6 },
  subtitle: { fontSize: 14, marginBottom: 20 },
  button: { borderRadius: 10, paddingVertical: 14, alignItems: "center", marginTop: 20 },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: "#fff", fontWeight: "700", fontSize: 15 },
});