// client/services/privacyStore.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import { PrivacyLevel } from "@/components/PrivacyOptionSheet";

const KEY = "privacy_settings";

export interface PrivacySettings {
  phoneNumber: PrivacyLevel;
  lastSeen: PrivacyLevel;
  profilePhoto: PrivacyLevel;
  bio: PrivacyLevel;
  calls: PrivacyLevel;
}

export async function getCachedPrivacy(): Promise<PrivacySettings | null> {
  const raw = await AsyncStorage.getItem(KEY);
  return raw ? JSON.parse(raw) : null;
}

export async function setCachedPrivacy(data: PrivacySettings) {
  await AsyncStorage.setItem(KEY, JSON.stringify(data));
}