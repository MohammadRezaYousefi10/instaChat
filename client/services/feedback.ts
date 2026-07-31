import { preload, createAudioPlayer, AudioPlayer } from "expo-audio";
import * as Haptics from "expo-haptics";

// Preload at module scope — starts buffering immediately
preload(require("@/assets/sounds/Sent.mp3"));

let successPlayer: AudioPlayer | null = null;

function getSuccessPlayer(): AudioPlayer {
  if (!successPlayer) {
    successPlayer = createAudioPlayer(require("@/assets/sounds/Sent.mp3"));
  }
  return successPlayer;
}

export const feedback = {
  /** برای عملیات موفق: ارسال پیام، ذخیره پروفایل، لایک و... */
  async success() {
    try {
      const player = getSuccessPlayer();
      player.seekTo(0);
      player.play();
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

  /** آزاد کردن حافظه صدا موقع خروج از اپ */
  async unload() {
    if (successPlayer) {
      successPlayer.remove();
      successPlayer = null;
    }
  },
};