// client/components/AppBottomSheet.tsx
import React, { useCallback, useEffect, useMemo, useRef } from "react";
import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  TouchableWithoutFeedback,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { useTheme } from "@/context/ThemeContext";
import { Keyboard, KeyboardAvoidingView, Platform } from "react-native";
import { getStyles } from "@/assets/styles/Contacts.styles";

interface Props {
  visible: boolean;
  onClose: () => void;
  snapPoints?: (string | number)[];
  enablePanDownToClose?: boolean;
  enableDynamicSizing?: boolean;
  stackBehavior?: "push" | "replace" | "switch";
  children: React.ReactNode;
}

export default function AppBottomSheet({
  visible,
  onClose,
  snapPoints: snapPointsProp,
  enablePanDownToClose = true,
  enableDynamicSizing = false,
  stackBehavior = "push",
  children,
}: Props) {
  const sheetRef = useRef<BottomSheetModal>(null);
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const snapPoints = useMemo(() => snapPointsProp ?? ["70%"], [snapPointsProp]);
  const isPresented = useRef(false); //


   useEffect(() => {
    if (visible && !isPresented.current) {
      isPresented.current = true;
      sheetRef.current?.present();
    } else if (!visible && isPresented.current) {
      isPresented.current = false;
      sheetRef.current?.dismiss();
    }
  }, [visible]);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
        pressBehavior="close"
        
      />
    ),
    []
  );

  // وقتی شیت با گستچر/بک‌دراپ خودش بسته شد
  const handleDismiss = useCallback(() => {
    isPresented.current = false; // 👈 مهم: قبل از onClose ست کن
    onClose();
  }, [onClose]);

  return (
    <BottomSheetModal
  ref={sheetRef}
  snapPoints={enableDynamicSizing ? undefined : snapPoints}
  enableDynamicSizing={enableDynamicSizing}
  enablePanDownToClose={enablePanDownToClose}
  stackBehavior={stackBehavior}
  backdropComponent={renderBackdrop}
  onDismiss={handleDismiss}
  
  keyboardBehavior="interactive"
  keyboardBlurBehavior="restore"
  android_keyboardInputMode="adjustResize"
  backgroundStyle={{ backgroundColor: colors.surface   , borderRadius:40}}
  handleIndicatorStyle={{ backgroundColor: colors.outlineVariant}}
>
  {children}
</BottomSheetModal>
    /* <BottomSheetModal
      ref={sheetRef}
      snapPoints={enableDynamicSizing ? undefined : snapPoints}
      enableDynamicSizing={enableDynamicSizing}
      enablePanDownToClose={enablePanDownToClose}
      stackBehavior={stackBehavior}
      backdropComponent={renderBackdrop}
      onDismiss={handleDismiss}
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      android_keyboardInputMode="adjustResize"
      backgroundStyle={{ backgroundColor: colors.surface }}
      handleIndicatorStyle={{ backgroundColor: colors.outlineVariant }}>
      <BottomSheetScrollView style={{ flex: 1 }}>{children}</BottomSheetScrollView>
    </BottomSheetModal> */
  );
}