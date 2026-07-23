

import { StyleSheet } from "react-native";
import { ColorPalette } from "../../constants/Colors";

export const getStyles = (colors: ColorPalette) =>
  StyleSheet.create({ 
  safe: { flex: 1, backgroundColor: colors.surface },
  container: { flex: 1 },
  map: { flex: 1 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  permissionText: { textAlign: "center", marginVertical: 12, fontSize: 15 },
  permissionButton: { backgroundColor: colors.primary, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  permissionButtonText: { color: "#fff", fontWeight: "600" },
  toggleContainer: {
    position: "absolute", top: 16, right: 16, backgroundColor: colors.surface,
    flexDirection: "row", alignItems: "center", paddingHorizontal: 12, paddingVertical: 8,
    borderRadius: 24, elevation: 4,
  },
  toggleLabel: { marginLeft: 8, fontSize: 13, fontWeight: "600"  , color : colors.onSurface},
  myMarkerWrapper: { alignItems: "center", maxWidth: 70 },
  markerWrapper: { alignItems: "center", maxWidth: 64 },
  markerLabel: {
    marginTop: 2,
    fontSize: 11,
    fontWeight: "600",
    color: colors.onSurface,
    backgroundColor: colors.surface,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
    overflow: "hidden",
  },
  badge: { position: "absolute", bottom: 24, left: 16, backgroundColor: "rgba(0,0,0,0.7)", paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  badgeText: { color: "#fff", fontSize: 13 },
});