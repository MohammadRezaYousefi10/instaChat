// client/constants/countries.ts

export interface Country {
  code: string;
  name: string;
  dialCode: string;
  placeholder: string;
  maxLength: number; // حداکثر تعداد رقم (بدون فاصله/صفر ابتدایی که کاربر واردش می‌کنه)
}

export function isoToFlagEmoji(iso2: string): string {
  return iso2
    .toUpperCase()
    .replace(/./g, (char) => String.fromCodePoint(127397 + char.charCodeAt(0)));
}

export const COUNTRIES: Country[] = [
  { code: "IR", name: "Iran", dialCode: "+98", placeholder: "912 345 6789", maxLength: 10 },
  { code: "US", name: "United States", dialCode: "+1", placeholder: "201 555 0123", maxLength: 10 },
  { code: "GB", name: "United Kingdom", dialCode: "+44", placeholder: "7400 123456", maxLength: 10 },
  { code: "DE", name: "Germany", dialCode: "+49", placeholder: "151 2345 6789", maxLength: 11 },
  { code: "FR", name: "France", dialCode: "+33", placeholder: "6 12 34 56 78", maxLength: 9 },
  { code: "TR", name: "Turkey", dialCode: "+90", placeholder: "532 123 45 67", maxLength: 10 },
  { code: "AE", name: "United Arab Emirates", dialCode: "+971", placeholder: "50 123 4567", maxLength: 9 },
  { code: "SA", name: "Saudi Arabia", dialCode: "+966", placeholder: "50 123 4567", maxLength: 9 },
  { code: "IQ", name: "Iraq", dialCode: "+964", placeholder: "790 123 4567", maxLength: 10 },
  { code: "AF", name: "Afghanistan", dialCode: "+93", placeholder: "70 123 4567", maxLength: 9 },
  { code: "PK", name: "Pakistan", dialCode: "+92", placeholder: "301 234 5678", maxLength: 10 },
  { code: "IN", name: "India", dialCode: "+91", placeholder: "81234 56789", maxLength: 10 },
  { code: "CN", name: "China", dialCode: "+86", placeholder: "131 2345 6789", maxLength: 11 },
  { code: "RU", name: "Russia", dialCode: "+7", placeholder: "912 345 6789", maxLength: 10 },
  { code: "CA", name: "Canada", dialCode: "+1", placeholder: "204 555 0123", maxLength: 10 },
  { code: "AU", name: "Australia", dialCode: "+61", placeholder: "412 345 678", maxLength: 9 },
  { code: "IT", name: "Italy", dialCode: "+39", placeholder: "312 345 6789", maxLength: 10 },
  { code: "ES", name: "Spain", dialCode: "+34", placeholder: "612 34 56 78", maxLength: 9 },
  { code: "NL", name: "Netherlands", dialCode: "+31", placeholder: "6 12345678", maxLength: 9 },
  { code: "SE", name: "Sweden", dialCode: "+46", placeholder: "70 123 45 67", maxLength: 9 },
  { code: "QA", name: "Qatar", dialCode: "+974", placeholder: "3312 3456", maxLength: 8 },
  { code: "KW", name: "Kuwait", dialCode: "+965", placeholder: "500 12345", maxLength: 8 },
  { code: "OM", name: "Oman", dialCode: "+968", placeholder: "9212 3456", maxLength: 8 },
  { code: "AZ", name: "Azerbaijan", dialCode: "+994", placeholder: "40 123 45 67", maxLength: 9 },
  { code: "AM", name: "Armenia", dialCode: "+374", placeholder: "77 123456", maxLength: 8 },
];  

export function findCountryByCode(iso2: string): Country {
  return COUNTRIES.find((c) => c.code === iso2) ?? COUNTRIES[1];
}