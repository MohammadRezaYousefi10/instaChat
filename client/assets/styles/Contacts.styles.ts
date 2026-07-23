 
 import { StyleSheet } from "react-native";
 import { ColorPalette } from "../../constants/Colors";
 
 export const getStyles = (colors: ColorPalette) =>
   StyleSheet.create({ 
    
 container: { flex: 1, paddingHorizontal: 16, paddingTop: 8 ,
    width: '100%',
    backgroundColor: colors.surfaceLowest,
    borderTopRightRadius: 18,
    borderTopLeftRadius: 18,
    bottom: 0,
    maxHeight: "95%",

  },
   forwardOverlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.5)",
      justifyContent: "flex-end",
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: 12,
        paddingBottom: 16,
        flexDirection:"row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    headerRight: { flexDirection: "row", alignItems: "center", gap: 8 },
  title: { fontSize: 18, fontWeight: "700", marginBottom: 12 },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8, 
    gap: 6,
    marginBottom: 12,
  },
  searchInput: { flex: 1, fontSize: 15 },
  row: { flexDirection: "row", alignItems: "center", paddingVertical: 10, gap: 12 },
  avatar: { width: 46, height: 46, borderRadius: 23 },
  avatarFallback: { justifyContent: "center", alignItems: "center" },
  avatarFallbackText: { color: "#fff", fontWeight: "700" },
  name: { fontSize: 16, fontWeight: "600" },
  sub: { fontSize: 13, marginTop: 2 },
  inviteText: { fontSize: 14, fontWeight: "600" },
  centerMessage: { alignItems: "center", marginTop: 60 },
  messageText: { fontSize: 14, textAlign: "center" },
  fieldLabel: { fontSize: 10, fontWeight: "800", letterSpacing: 1, color: colors.onSurfaceVariant, opacity: 0.6 },

});