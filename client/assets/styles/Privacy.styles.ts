import { StyleSheet } from "react-native";
import { ColorPalette } from "../../constants/Colors";

export const getStyles = (colors: ColorPalette) =>
  StyleSheet.create({ 
screen: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 17, fontWeight: "600" },
  content: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 40 },
  sectionLabel: { fontSize: 12, fontWeight: "600", marginBottom: 4, marginLeft: 4, textTransform: "uppercase",
    paddingTop: 12, 
   },
  card: { borderRadius: 14, overflow: "hidden" , backgroundColor:colors.surfaceLowest},
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  rowLabel: { fontSize: 16 },
  rowRight: { flexDirection: "row", alignItems: "center", gap: 4 },
  rowValue: { fontSize: 15 },
  footerNote: { fontSize: 13, marginTop: 10, marginHorizontal: 4, lineHeight: 18 },
  linkRow: { flexDirection: "row", alignItems: "center", paddingVertical: 12, gap: 12  },
  linkText: { flex: 1, fontSize: 15, color: colors.onSurface },
  badge: {
        minWidth: 26,
        height: 26,
        borderRadius: 14,
        backgroundColor: colors.primary,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 8,
    },
    badgeText: { color: colors.onPrimary, fontSize: 12, fontWeight: "600" },
});

