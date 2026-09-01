import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing } from "../theme";

export function EmptyState({
  icon,
  title,
  message,
  tone = "empty",
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  message: string;
  tone?: "empty" | "error";
}) {
  const iconColor = tone === "error" ? colors.error : colors.border;
  return (
    <View style={styles.container}>
      <Ionicons name={icon} size={48} color={iconColor} />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
  },
  title: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.ink,
    marginTop: spacing.sm,
    textAlign: "center",
  },
  message: {
    fontSize: 14,
    color: colors.muted,
    textAlign: "center",
    lineHeight: 20,
  },
});
