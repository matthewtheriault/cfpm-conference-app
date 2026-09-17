import "react-native-gesture-handler";
import React, { useCallback, useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import {
  useFonts,
  PlusJakartaSans_400Regular,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_800ExtraBold,
} from "@expo-google-fonts/plus-jakarta-sans";
import {
  PlayfairDisplay_400Regular,
  PlayfairDisplay_700Bold,
  PlayfairDisplay_800ExtraBold_Italic,
} from "@expo-google-fonts/playfair-display";
import { NavigationContainer } from "@react-navigation/native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AccessProvider, useAccess } from "./src/context/AccessContext";
import { AdminAuthProvider } from "./src/context/AdminAuthContext";
import { UserProfileProvider } from "./src/context/UserProfileContext";
import { BookmarksProvider } from "./src/context/BookmarksContext";
import { CheckinsProvider } from "./src/context/CheckinsContext";
import { ExhibitorPassportProvider } from "./src/context/ExhibitorPassportContext";
import RootNavigator from "./src/navigation/RootNavigator";
import { registerForPushNotificationsAsync } from "./src/notifications";
import { ErrorBoundary } from "./src/components/ErrorBoundary";
import { OfflineBanner } from "./src/components/OfflineBanner";

SplashScreen.preventAutoHideAsync().catch(() => {
  // Already hidden or unsupported - safe to ignore.
});

function PushRegistration() {
  const { isUnlocked } = useAccess();

  useEffect(() => {
    if (isUnlocked) {
      registerForPushNotificationsAsync().catch(() => {
        // Permission denied or unavailable (e.g. simulator) - safe to ignore.
      });
    }
  }, [isUnlocked]);

  return null;
}

export default function App() {
  const [fontsLoaded] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_800ExtraBold,
    PlayfairDisplay_400Regular,
    PlayfairDisplay_700Bold,
    PlayfairDisplay_800ExtraBold_Italic,
  });

  const onRootLayout = useCallback(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider onLayout={onRootLayout}>
        <ErrorBoundary>
          <AccessProvider>
            <UserProfileProvider>
              <BookmarksProvider>
                <CheckinsProvider>
                  <ExhibitorPassportProvider>
                    <AdminAuthProvider>
                      <PushRegistration />
                      <OfflineBanner />
                      <NavigationContainer>
                        <RootNavigator />
                      </NavigationContainer>
                      <StatusBar style="dark" />
                    </AdminAuthProvider>
                  </ExhibitorPassportProvider>
                </CheckinsProvider>
              </BookmarksProvider>
            </UserProfileProvider>
          </AccessProvider>
        </ErrorBoundary>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
