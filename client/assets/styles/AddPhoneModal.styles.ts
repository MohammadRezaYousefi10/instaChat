import { StyleSheet } from "react-native";
import { ColorPalette } from "../../constants/Colors";

export const getStyles = (colors: ColorPalette) =>
  StyleSheet.create({ 
     container: { paddingHorizontal: 20, paddingTop: 12 },
  title: { fontSize: 18, fontWeight: "700", marginBottom: 6 },
  subtitle: { fontSize: 14, marginBottom: 20 },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  forwardOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
 /*  saveBtn: { paddingVertical: 15, alignItems: "center" },
  button: { borderRadius: 10, paddingVertical: 14, alignItems: "center" , overflow: "hidden" }, */
  buttonDisabled: { opacity: 0.5 },
 /*  buttonText: { color: "#fff", fontWeight: "700", fontSize: 15 }, */
  saveWrapper: { borderRadius: 16, overflow: "hidden", marginTop: 4  },
  saveBtn: { paddingVertical: 15, alignItems: "center" },
  saveBtnText: { fontSize: 15, fontWeight: "700", color: colors.onPrimary },
});