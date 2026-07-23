import { StyleSheet } from "react-native";
import { ColorPalette } from "../../constants/Colors";

export const getStyles = (colors: ColorPalette) =>
  StyleSheet.create({ 
  container: { paddingHorizontal: 20, paddingTop: 8 ,
  
    //backgroundColor: colors.surfaceLowest,
    borderTopRightRadius: 18,
    borderTopLeftRadius: 18,
    /* position: 'absolute',
    bottom: 0,
    width: '100%',
    height: "25%" ,
    maxHeight: "85%", */
  },
  forwardOverlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.5)",
      justifyContent: "flex-end",
    },
  title: { fontSize: 13, fontWeight: "600", opacity: 0.5, marginBottom: 12, textTransform: "uppercase" },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rowText: { fontSize: 16 },
});