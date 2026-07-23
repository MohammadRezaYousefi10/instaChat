// services/otpStore.ts
// موقتی — در پروداکشن حتماً با Redis جایگزین کن (این Map با ری‌استارت سرور پاک میشه)
interface OtpEntry {
  code: string;
  expiresAt: number;
}
const store = new Map<string, OtpEntry>();

export function saveOtp(phone: string, code: string, ttlMs = 5 * 60 * 1000) {
  store.set(phone, { code, expiresAt: Date.now() + ttlMs });
}

export function verifyOtp(phone: string, code: string): boolean {
  const entry = store.get(phone);
  if (!entry) return false;
  if (entry.expiresAt < Date.now()) {
    store.delete(phone);
    return false;
  }
  const ok = entry.code === code;
  if (ok) store.delete(phone);
  return ok;
}