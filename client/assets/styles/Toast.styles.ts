import { StyleSheet } from "react-native";
import { ColorPalette } from "@/constants/Colors";

export const getStyles = (colors: ColorPalette) =>
  StyleSheet.create({
    overlay: {
      ...StyleSheet.absoluteFillObject,
      justifyContent: "center",
      alignItems: "center",
      zIndex: 999,
      elevation: 999, // برای اندروید
    },
    bubble: {
      backgroundColor: "rgba(28,28,30,0.92)",
      paddingVertical: 16,
      paddingHorizontal: 24,
      borderRadius: 14,
      flexDirection: "row",
      alignItems: "center",
      maxWidth: "80%",
    },
    icon: { marginRight: 8 },
    text: {
      color: "#fff",
      fontSize: 15,
      fontWeight: "600",
      textAlign: "center",
    },
  });
