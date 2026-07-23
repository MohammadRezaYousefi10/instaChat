import { Dimensions, StyleSheet } from "react-native";
import { ColorPalette } from "../../constants/Colors";

const { width, height } = Dimensions.get("window");


export const getStyles = (colors: ColorPalette) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: "rgba(0,0,0,0.95)" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 50,
  },
  iconBtn: { padding: 8 },
  imageWrapper: { flex: 1, justifyContent: "center", alignItems: "center" },
  image: { width: width, height: width },
  footer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    // paddingVertical: 24,
    paddingBottom: 40,
  },
  actionBtn: { alignItems: "center", gap: 4 },
  actionText: { color: "#fff", fontSize: 12, marginTop: 4 },
});

