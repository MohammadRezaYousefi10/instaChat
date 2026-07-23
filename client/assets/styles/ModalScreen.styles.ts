import { StyleSheet } from "react-native";
import { ColorPalette } from "../../constants/Colors";

export const getStyles = (colors: ColorPalette) =>
  StyleSheet.create({ 
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    link: {
        marginTop: 15,
        paddingVertical: 15,
    },
});
