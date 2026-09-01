import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useNetworkState } from "expo-network";
import { colors, spacing } from "../theme";

export function OfflineBanner() {
  const { isConnected, isInternetReachable } = useNetworkState();

  // Only warn on a confirmed disconnect - undefined/null just means the
  // native module hasn't reported a state yet (e.g. right at startup).
  const isOffline = isConnected === false || isInternetReachable === false;

  if (!isOffline) {
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
    fontWeight: "600",
  },
});
