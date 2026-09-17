import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useNetworkState } from "expo-network";
import { colors, spacing, fonts } from "../attendeeTheme";

// How long a disconnect has to persist before we show the banner. On
// Android, isInternetReachable briefly reports false right as the app
// resumes from the background while the OS re-validates the connection,
// even though the device is actually online - without this debounce the
// banner flashed on nearly every app open.
const OFFLINE_DEBOUNCE_MS = 1500;

export function OfflineBanner() {
  const { isConnected, isInternetReachable } = useNetworkState();

  // Only warn on a confirmed disconnect - undefined/null just means the
  // native module hasn't reported a state yet (e.g. right at startup).
  const isOffline = isConnected === false || isInternetReachable === false;

  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    if (!isOffline) {
      setShowBanner(false);
      return;
    }
    const timer = setTimeout(() => setShowBanner(true), OFFLINE_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [isOffline]);

  if (!showBanner) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.text}>You're offline — showing saved info</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.warning,
    paddingVertical: spacing.xs,
    alignItems: "center",
  },
  text: {
    color: "#FFFFFF",
    fontSize: 13,
    fontFamily: fonts.semibold,
  },
});
