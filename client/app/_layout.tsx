import { router, SplashScreen, Stack, useRouter, useSegments } from "expo-router";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { ClerkLoaded, ClerkProvider, useAuth } from "@clerk/expo";
import { tokenCache } from "@clerk/expo/token-cache";
import { ActivityIndicator, View } from "react-native";
import { AppProvider } from "@/context/AppContext";
import * as Notifications from "expo-notifications";
import { ThemeProvider, useTheme } from "@/context/ThemeContext";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import ToastHost from "@/components/Toast";

SplashScreen.preventAutoHideAsync();

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

if (!publishableKey) {
  throw new Error("Add your Clerk publishable key to the .env file");
}

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});



function AuthGuard() {
  const { colors } = useTheme();

  /* const {isLoaded , isSignedIn } = useAuth(); */
  const { isLoaded, isSignedIn } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded) return;
    SplashScreen.hideAsync();
    const inAuth = segments[0] === "(auth)";

    if (!isSignedIn && !inAuth) {
      router.replace("/(auth)");
    } else if (isSignedIn && inAuth) {
      router.replace("/(tabs)");

      (async () => {
        const { status: existing } = await Notifications.getPermissionsAsync();
        if (existing !== "granted") {
          await Notifications.requestPermissionsAsync();
        }
      })();
    }
  }, [isSignedIn, isLoaded, segments]);

  if (!isLoaded) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: colors.surface,
        }}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }
  return null;
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
        <ClerkLoaded>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <BottomSheetModalProvider>
              <AppProvider>
                <AuthGuard />
                <Stack screenOptions={{ headerShown: false }}>
                  <Stack.Screen name="(auth)" />
                  <Stack.Screen name="(tabs)" />
                  <Stack.Screen
                    name="chat/[id]"
                    options={{ animation: "slide_from_right" }}
                  />
                  <Stack.Screen
                    name="settings"
                    options={{ animation: "slide_from_right" }}
                  />
                  <Stack.Screen
                    name="notification"
                    options={{ animation: "slide_from_right" }}
                  />
                  <Stack.Screen
                    name="privacy"
                    options={{ animation: "slide_from_right" }}
                  />
                </Stack>
              </AppProvider>
              <ToastHost />
            </BottomSheetModalProvider>
          </GestureHandlerRootView>
        </ClerkLoaded>
      </ClerkProvider>
    </ThemeProvider>
  );
}
