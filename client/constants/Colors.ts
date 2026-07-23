export interface ColorPalette {
  primary: string;
  primaryDim: string;
  primaryDeep: string;
  primaryContainer: string;
  onPrimary: string;
  onPrimaryContainer: string;

  surface: string;
  surfaceLow: string;
  surfaceHigh: string;
  surfaceHighest: string;
  surfaceLowest: string;
  surfaceDim: string;

  onSurface: string;
  onSurfaceVariant: string;
  outline: string;
  outlineVariant: string;

  tertiary: string;
  error: string;
  online: string;
}

export const lightColors: ColorPalette = {
  // Primary indigo
  primary: "#4652b0",
  primaryDim: "#3946a4",
  primaryDeep: "#283593",
  primaryContainer: "#8c99fc",
  onPrimary: "#f3f1ff",
  onPrimaryContainer: "#001075",

  // Surface
  surface: "#f5f6f7",
  surfaceLow: "#eff1f2",
  surfaceHigh: "#ebebebff",
  surfaceHighest: "#e5e5e5ff",
  surfaceLowest: "#ffffff",
  surfaceDim: "#d1d5d7",

  // Text
  onSurface: "#2c2f30",
  onSurfaceVariant: "#595c5d",
  outline: "#757778",
  outlineVariant: "#abadae",

  // Accent / Status
  tertiary: "#933880",
  error: "#b41340",
  online: "#22c55e",
};

export const darkColors: ColorPalette = {
  // Primary indigo (کمی روشن‌تر برای کنتراست بهتر روی پس‌زمینه تیره)
  primary: "#8c99fc",
  primaryDim: "#6f7ce0",
  primaryDeep: "#4652b0",
  primaryContainer: "#283593",
  onPrimary: "#001075",
  onPrimaryContainer: "#dee0ff",

  // Surface
  surface: "#121314",
  surfaceLow: "#0a0b0b",
  surfaceHigh: "#1e2021",
  surfaceHighest: "#26292a",
  surfaceLowest: "#000000",
  surfaceDim: "#303334",

  // Text
  onSurface: "#e7e9ea",
  onSurfaceVariant: "#a8acad",
  outline: "#7c8081",
  outlineVariant: "#4a4d4e",

  // Accent / Status
  tertiary: "#d68bc4",
  error: "#ff6b8f",
  online: "#22c55e",
};

// برای سازگاری با فایل‌هایی که هنوز از `import { Colors }` مستقیم استفاده می‌کنن
// (اگه فایلی رو migrate نکردی، بازم بدون خطا و با تم روشن کار می‌کنه)
export const Colors = lightColors;