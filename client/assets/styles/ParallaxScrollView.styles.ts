import { StyleSheet } from 'react-native';
import { ColorPalette } from "../../constants/Colors";

const HEADER_HEIGHT = 250;

export const getStyles = (colors: ColorPalette) =>
  StyleSheet.create({ 


    container: {
        flex: 1,
    },
    header: {
        height: HEADER_HEIGHT,
        overflow: 'hidden',
    },
    content: {
        flex: 1,
        padding: 32,
        gap: 16,
        overflow: 'hidden',
    },
});
