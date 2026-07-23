// client/components/PhoneInput.tsx
import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { AsYouType, parsePhoneNumberFromString } from "libphonenumber-js";
import CountryPickerSheet from "./CountryPickerSheet";
import {
  COUNTRIES,
  Country,
  findCountryByCode,
  isoToFlagEmoji,
} from "@/constants/countries";
import { useTheme } from "@/context/ThemeContext";
import { api } from "@/context/AppContext";

interface Props {
  onChange: (e164: string | null, isValid: boolean) => void;
}

export default function PhoneInput({ onChange }: Props) {
  const { colors } = useTheme();
  const [country, setCountry] = useState<Country>(COUNTRIES[1]);
  const [displayValue, setDisplayValue] = useState("");
  const [showPicker, setShowPicker] = useState(false);
  const [detecting, setDetecting] = useState(true);

  useEffect(() => {
    api
      .get<{ success: boolean; country: string }>("/api/geo/detect-country")
      .then(({ data }) => {
        if (data.success) setCountry(findCountryByCode(data.country));
      })
      .catch(() => {})
      .finally(() => setDetecting(false));
  }, []);

  useEffect(() => {
    setDisplayValue(""); // با تغییر کشور، ورودی قبلی پاک بشه
  }, [country.code]);

  const handleChangeText = (text: string) => {
    const digitsOnly = text.replace(/\D/g, "").slice(0, country.maxLength); // 👈 قفل تعداد رقم
    const formatter = new AsYouType(country.code as any);
    setDisplayValue(formatter.input(digitsOnly));
  };

  const parsed = useMemo(() => {
    if (!displayValue.trim()) return null;

    return parsePhoneNumberFromString(displayValue, country.code as any);
  }, [displayValue, country]);

  const isValid = useMemo(() => {
    if (!parsed) return false;

    if (parsed.country === "IR") {
      return /^9\d{9}$/.test(parsed.nationalNumber) && parsed.isValid();
    }

    return parsed.isValid();
  }, [parsed]);

  const e164 = isValid ? parsed!.number : null;

  useEffect(() => {
    //console.log(e164);

    onChange(e164, isValid);
  }, [e164, isValid]);

  return (
    <View>
      <View style={[styles.row, { borderColor: colors.outlineVariant }]}>
        <TouchableOpacity
          style={styles.countryBtn}
          onPress={() => setShowPicker(true)}
          disabled={detecting}
        >
          <Text style={styles.flag}>{isoToFlagEmoji(country.code)}</Text>
          <Text style={[styles.dialCode, { color: colors.onSurface }]}>
            {country.dialCode}
          </Text>
        </TouchableOpacity>

        <View
          style={[styles.divider, { backgroundColor: colors.outlineVariant }]}
        />

        <TextInput
          style={[styles.input, { color: colors.onSurface }]}
          placeholder={country.placeholder}
          placeholderTextColor={colors.outlineVariant}
          keyboardType="phone-pad"
          value={displayValue}
          onChangeText={handleChangeText}
          autoFocus
          keyboardAppearance={colors.surface === "#121314" ? "dark" : "light"}
        />
      </View>

      {displayValue.length > 0 && !isValid && (
        <Text style={styles.errorText}>
          Invalid phone number for {country.name}
        </Text>
      )}

      <CountryPickerSheet
        visible={showPicker}
        onClose={() => setShowPicker(false)}
        onSelect={setCountry}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 52,
  },
  countryBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingRight: 10,
  },
  flag: { fontSize: 20 },
  dialCode: { fontSize: 16, fontWeight: "600" },
  divider: { width: 1, height: "60%", marginHorizontal: 8 },
  input: { flex: 1, fontSize: 16, height: "100%" },
  errorText: { color: "#EF4444", fontSize: 12, marginTop: 6, marginLeft: 4 },
});
