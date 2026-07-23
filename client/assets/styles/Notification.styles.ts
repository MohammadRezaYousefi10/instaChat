import { StyleSheet } from "react-native";
import { ColorPalette } from "../../constants/Colors";

export const getStyles = (colors: ColorPalette) =>
  StyleSheet.create({ 
  container: { flex: 1, backgroundColor: colors.surface },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingBottom: 16 },
  title: { fontSize: 16, fontWeight: "700", color: colors.onSurface },
  row: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 14, gap: 12 },
  rowLabel: { fontSize: 15, fontWeight: "600", color: colors.onSurface },
  rowDesc: { fontSize: 12, color: colors.onSurfaceVariant, marginTop: 2 },
});