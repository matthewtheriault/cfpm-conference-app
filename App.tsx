import "react-native-gesture-handler";
import React, { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AccessProvider, useAccess } from "./src/context/AccessContext";
import { AdminAuthProvider } from "./src/context/AdminAuthContext";
import { UserProfileProvider } from "./src/context/UserProfileContext";
import { BookmarksProvider } from "./src/context/BookmarksContext";
import { CheckinsProvider } from "./src/context/CheckinsContext";
import RootNavigator from "./src/navigation/RootNavigator";
import { registerForPushNotificationsAsync } from "./src/notifications";
import { ErrorBoundary } from "./src/components/ErrorBoundary";
import { OfflineBanner } from "./src/components/OfflineBanner";

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
  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <AccessProvider>
          <UserProfileProvider>
            <BookmarksProvider>
              <CheckinsProvider>
                <AdminAuthProvider>
                  <PushRegistration />
                  <OfflineBanner />
                  <NavigationContainer>
                    <RootNavigator />
                  </NavigationContainer>
                  <StatusBar style="dark" />
                </AdminAuthProvider>
              </CheckinsProvider>
            </BookmarksProvider>
          </UserProfileProvider>
        </AccessProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
