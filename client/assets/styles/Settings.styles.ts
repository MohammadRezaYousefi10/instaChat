
import { StyleSheet } from "react-native";
import { ColorPalette } from "@/constants/Colors";

export const getStyles = (colors: ColorPalette) =>
    StyleSheet.create({ 
  container: { flex: 1, backgroundColor: colors.surface },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingBottom: 16 },
  title: { fontSize: 16, fontWeight: "700", color: colors.onSurface },
  content: { paddingHorizontal: 16 },
  row: { flexDirection: "row", alignItems: "center", paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.surfaceHigh ?? "#eee", gap: 12 },
  rowIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.surfaceHigh ?? "#f2f2f2", justifyContent: "center", alignItems: "center" },
  rowLabel: { fontSize: 15, fontWeight: "600", color: colors.onSurface },
  rowDesc: { fontSize: 12, color: colors.onSurfaceVariant, marginTop: 2 },
});