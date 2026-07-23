import { Audio } from "expo-av";
import * as Haptics from "expo-haptics";

let successSound: Audio.Sound | null = null;
let isLoading = false;

// یک‌بار در کل عمر اپ لود می‌شه و بعد فقط replay می‌شه (به‌جای ساخت مجدد هر بار)
async function getSuccessSound(): Promise<Audio.Sound | null> {
  if (successSound) return successSound;
  if (isLoading) return null;

  try {
    isLoading = true;
    const { sound } = await Audio.Sound.createAsync(
      require("@/assets/sounds/Sent.mp3")
    );
    successSound = sound;
    return sound;
  } catch (err) {
    console.error("feedback: load sound error:", err);
    return null;
  } finally {
    isLoading = false;
  }
}

export const feedback = {
  /** برای عملیات موفق: ارسال پیام، ذخیره پروفایل، لایک و... */
  async success() {
    try {
      const sound = await getSuccessSound();
      if (sound) {
        await sound.setPositionAsync(0);
        await sound.playAsync();
      }
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (err) {
      console.error("feedback.success error:", err);
    }
  },

  /** برای خطاها */
  async error() {
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } catch (err) {
      console.error("feedback.error error:", err);
    }
  },

  /** برای انتخاب/تیک زدن آیتم‌ها (فیدبک لمسی سبک) */
  async selection() {
    try {
      await Haptics.selectionAsync();
    } catch {}
  },

  /** برای لمس دکمه‌های عادی */
  async tap() {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
  },

  /** آزاد کردن حافظه صدا موقع خروج از اپ (اختیاری، معمولاً لازم نیست) */
  async unload() {
    if (successSound) {
      await successSound.unloadAsync();
      successSound = null;
    }
  },
};