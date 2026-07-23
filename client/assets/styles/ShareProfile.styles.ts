
import { StyleSheet } from "react-native";
import { ColorPalette } from "@/constants/Colors";

export const getStyles = (colors: ColorPalette) =>
    StyleSheet.create({ 
  btn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 10,
    alignSelf: "center",
    backgroundColor: colors.surfaceDim,
    borderRadius:14,
    paddingHorizontal:8,
  },
  text: { color: colors.primary, fontWeight: "600", fontSize: 14 },
});
