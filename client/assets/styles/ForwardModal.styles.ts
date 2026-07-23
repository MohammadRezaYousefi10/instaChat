import { StyleSheet, Dimensions } from "react-native";
import { ColorPalette } from "@/constants/Colors";

const { width } = Dimensions.get("window");
const NUM_COLUMNS = 4;

export const ITEM_SIZE = width / NUM_COLUMNS;
export const AVATAR_SIZE = 62;

export const getForwardStyles = (colors: ColorPalette) =>
  StyleSheet.create({
    // ---- overlay + sheet ----
    forwardOverlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.5)",
      justifyContent: "flex-end",
    },
    forwardKav: {
      justifyContent: "flex-end",
    },
    /* sheet: {
      backgroundColor: colors.surfaceLowest,
      borderTopLeftRadius: 14,
      borderTopRightRadius: 14,
      paddingTop: 14,
      paddingBottom: 24,
      maxHeight: "85%",
    }, */

    // ---- header ----
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center" ,
      paddingHorizontal: 16,
      paddingBottom: 10,
    },
    headerIconBtn: {
      width: 32,
      alignItems: "flex-start",
    },
    headerCenter: {
      flex: 1,
      alignItems: "center",
      margin:"auto"
    },
    headerTitle: {
      color: colors.onSurface,
      fontSize: 17,
      fontWeight: "600",
    },
    headerSubtitle: {
      color: colors.onSurfaceVariant,
      fontSize: 12,
      marginTop: 2,
    },

    // ---- search ----
    searchBox: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.surfaceHigh,
      marginHorizontal: 16,
      borderRadius: 10,
      paddingHorizontal: 10,
      height: 36,
      gap: 6,
      marginBottom: 8,
    },
    searchInput: {
      flex: 1,
      color: colors.onSurface,
      fontSize: 14,
    },

    // ---- grid ----
    gridContent: {
      paddingHorizontal: 8,
      paddingTop: 8,
      paddingBottom: 8,
      
    },
    gridItem: {
      width: ITEM_SIZE,
      alignItems: "center",
      paddingVertical: 10,
    },
    avatarWrapper: {
      width: AVATAR_SIZE,
      height: AVATAR_SIZE,
    },
    avatarRing: {
      width: AVATAR_SIZE,
      height: AVATAR_SIZE,
      borderRadius: AVATAR_SIZE / 2,
      borderWidth: 2,
      borderColor: "transparent",
      overflow: "hidden",
    },
    avatarRingSelected: {
      borderColor: colors.primary,
    },
    avatarImage: {
      width: "100%",
      height: "100%",
      borderRadius: AVATAR_SIZE / 2,
    },
    avatarFallback: {
      backgroundColor: colors.surfaceHighest,
      justifyContent: "center",
      alignItems: "center",
    },
    avatarFallbackText: {
      color: colors.onSurface,
      fontSize: 22,
      fontWeight: "600",
    },
    checkBadge: {
      position: "absolute",
      bottom: 0,
      right: 0,
      width: 20,
      height: 20,
      borderRadius: 10,
      backgroundColor: colors.primary,
      borderWidth: 2,
      borderColor: colors.surfaceLowest,
      justifyContent: "center",
      alignItems: "center",
    },
    gridItemName: {
      color: colors.onSurface,
      fontSize: 12,
      textAlign: "center",
      marginTop: 6,
      maxWidth: ITEM_SIZE - 8,
    },
    empty: {
      color: colors.onSurfaceVariant,
      textAlign: "center",
      marginTop: 40,
      width: width - 16,
    },

    // ---- comment input ----
    commentBox: {
      marginHorizontal: 16,
      marginTop: 8,
      backgroundColor: colors.surfaceHigh,
      borderRadius: 10,
      paddingHorizontal: 12,
      height: 40,
      justifyContent: "center",
    },
    commentInput: {
      color: colors.onSurface,
      fontSize: 14,
    },

    // ---- send / cancel ----
    sendBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      marginHorizontal: 16,
      marginTop: 14,
      backgroundColor: colors.surfaceHigh,
      borderRadius: 10,
      height: 46,
    },
    sendBtnDisabled: {
      opacity: 0.5,
    },
    sendBtnText: {
      color: colors.primary,
      fontSize: 16,
      fontWeight: "600",
    },
    sendBadge: {
      minWidth: 22,
      height: 22,
      borderRadius: 11,
      backgroundColor: colors.primary,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 6,
    },
    sendBadgeText: {
      color: colors.onPrimary,
      fontSize: 12,
      fontWeight: "700",
    },
    cancelBtn: {
      marginHorizontal: 16,
      marginTop: 8,
      height: 46,
      borderRadius: 10,
      backgroundColor: colors.surfaceHigh,
      justifyContent: "center",
      alignItems: "center",
      
    },
    cancelBtnText: {
      color: colors.primary,
      fontSize: 16,
      fontWeight: "600",
    },
    saveBtn: { paddingVertical: 15, alignItems: "center" },

  });