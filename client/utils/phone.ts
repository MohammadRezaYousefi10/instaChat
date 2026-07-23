// client/utils/phone.ts
import { parsePhoneNumberFromString, CountryCode } from "libphonenumber-js";

/**
 * یه شماره‌ی خام (هر فرمتی) رو به E.164 استاندارد تبدیل می‌کنه.
 * @param raw شماره‌ی خام از مخاطبین گوشی
 * @param defaultCountry کشوری که اگه شماره پیش‌شماره نداشت، فرض می‌کنیم مال اونه
 */
export function normalizePhoneNumber(
  raw: string,
  defaultCountry: CountryCode
): string | null {
  const cleaned = raw.trim();
  if (!cleaned) return null;

  const parsed = parsePhoneNumberFromString(cleaned, defaultCountry);
  if (!parsed || !parsed.isValid()) return null;

  return parsed.number; // همیشه فرمت +989907080851
}

/**
 * از روی شماره‌ی E.164 خودِ کاربر (که موقع تایید ذخیره شده)، کد کشورش رو استخراج می‌کنه.
 */
export function getCountryFromE164(e164Phone: any): CountryCode | null {
  const parsed = parsePhoneNumberFromString(e164Phone);
  return parsed?.country ?? null;
}