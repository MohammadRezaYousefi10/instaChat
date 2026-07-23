// client/services/invite.ts
import { Linking, Platform } from "react-native";

const STORE_LINKS = {
  ios: "https://apps.apple.com/app/id0000000000", // لینک واقعی اپ‌ت رو بذار
  android: "https://play.google.com/store/apps/details?id=com.yourapp", // پکیج واقعی
};

export function sendInvite(phone: string) {
  const storeLink = Platform.OS === "ios" ? STORE_LINKS.ios : STORE_LINKS.android;
  const body = encodeURIComponent(`Let's chat on InstaChat! ${storeLink}`);
  Linking.openURL(`sms:${phone}?body=${body}`);
}