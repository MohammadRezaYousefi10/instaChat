import {
  Redirect,
  SplashScreen,
  Stack,
  useRouter,
  useSegments,
} from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { ClerkLoaded, ClerkProvider, useAuth, useSignIn } from "@clerk/expo";
import { tokenCache } from "@clerk/expo/token-cache";
import { Colors } from "@/constants/Colors";
import { ActivityIndicator, View } from "react-native";
import { AppProvider, useApp } from "@/context/AppContext";

SplashScreen.preventAutoHideAsync();

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

if (!publishableKey) {
  throw new Error("Add your Clerk publishable key to the .env file");
}

function AuthGuard() {
  /* const {isLoaded , isSignedIn } = useAuth(); */
  const {isLoaded , isSignedIn } = useAuth();
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
    }
  }, [isSignedIn, isLoaded, segments]);

  if (!isLoaded) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: Colors.surface,
        }}
      >
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }
  return null;
}

export default function RootLayout() {


  return <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <ClerkLoaded>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <AppProvider>
            <AuthGuard />

            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(auth)" />
              <Stack.Screen name="(tabs)" />
              <Stack.Screen
                name="chat/[id]"
                options={{ animation: "slide_from_right" }}
              />
            </Stack>
            <StatusBar style="dark" />
          </AppProvider>
        </GestureHandlerRootView>
      </ClerkLoaded>
    </ClerkProvider>
  
}
