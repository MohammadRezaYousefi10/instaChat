import { StyleSheet } from "react-native";
import { ColorPalette } from "../../constants/Colors";

export const getStyles = (colors: ColorPalette) =>
  StyleSheet.create({ 
    row: { flexDirection: "row", marginBottom: 2 },
    rowMe: { justifyContent: "flex-end" },
    rowThem: { justifyContent: "flex-start" },
    bubble: {
        maxWidth: "72%",
        overflow: "hidden",
        marginTop: 9,
    },
    bubbleMe: {
        borderRadius: 20,
        borderBottomRightRadius: 4,
    },
    bubbleThem: {
        borderRadius: 20,
        borderBottomLeftRadius: 4,
        backgroundColor: colors.surface
        
        // backgroundColor: "#f0f0f0",
    },
    senderName: {
        fontSize: 10,
        fontWeight: "700",
        color: colors.primary,
        paddingHorizontal: 14,
        paddingTop: 8,
    },
    mediaWrapper: { padding: 4 },
    mediaImage: { width: 220, height: 180, borderRadius: 16 },
    mediaVideo: { width: 220, height: 160, borderRadius: 16 },
    msgText: {
        fontSize: 16,
        lineHeight: 20,
        paddingHorizontal: 14,
        paddingVertical: 8,
    },
    msgTextMe: { color: colors.surface },
    msgTextThem: { color: colors.onSurface },
    footer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 3,
        paddingHorizontal: 14,
        paddingBottom: 6,
    },
    footerRight: { justifyContent: "flex-end" },
    footerLeft: { justifyContent: "flex-start" },
    timeText: { fontSize: 11 },
    timeMe: { color: `${colors.onPrimary}88` },
    timeThem: { color: colors.onSurfaceVariant },
});
