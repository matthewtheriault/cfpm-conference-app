import React from "react";
import { Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useAdminAuth } from "../context/AdminAuthContext";
import { colors, spacing } from "../theme";

export function AdminHeaderButton() {
  const navigation = useNavigation<any>();
  const { user, isAdmin } = useAdminAuth();

  return (
    <Pressable
      onPress={() =>
        navigation.getParent()?.navigate(user && isAdmin ? "AdminDashboard" : "AdminLogin")
      }
      hitSlop={12}
      style={styles.button}
      accessibilityLabel="Conference organizer admin sign in"
    >
      <Ionicons name="shield-checkmark-outline" size={22} color={colors.muted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    marginRight: spacing.md,
  },
});
