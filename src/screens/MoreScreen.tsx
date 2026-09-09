import React from "react";
import { View, Text, Pressable, StyleSheet, FlatList, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { colors, spacing, radii, fonts } from "../attendeeTheme";
import { useAccess } from "../context/AccessContext";
import { useUserProfile } from "../context/UserProfileContext";
import { useBookmarks } from "../context/BookmarksContext";
import { useCheckins } from "../context/CheckinsContext";

const ITEMS: { label: string; icon: keyof typeof Ionicons.glyphMap; screen: string }[] = [
  { label: "Events", icon: "megaphone-outline", screen: "Events" },
  { label: "Speakers", icon: "people-outline", screen: "Speakers" },
  { label: "Exhibitors", icon: "business-outline", screen: "Exhibitors" },
  { label: "Sponsors", icon: "ribbon-outline", screen: "Sponsors" },
  { label: "Board & Staff", icon: "people-circle-outline", screen: "Board" },
  { label: "Polls & Surveys", icon: "checkbox-outline", screen: "Polls" },
];

export default function MoreScreen() {
  const navigation = useNavigation<any>();
  const { lock } = useAccess();
  const { clearProfile } = useUserProfile();
  const { clearBookmarks } = useBookmarks();
  const { clearCheckins } = useCheckins();

  const handleSignOut = () => {
    Alert.alert(
      "Sign out?",
      "This clears your conference code, name, and bookmarked sessions from this device so it's ready for the next CFPM conference.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Sign out",
          style: "destructive",
          onPress: async () => {
            await Promise.all([clearBookmarks(), clearCheckins(), clearProfile()]);
            await lock();
          },
        },
      ]
    );
  };

  return (
    <FlatList
      data={ITEMS}
      keyExtractor={(item) => item.screen}
      contentContainerStyle={styles.list}
      renderItem={({ item }) => (
        <Pressable style={styles.row} onPress={() => navigation.navigate(item.screen)}>
          <View style={styles.rowLeft}>
            <Ionicons name={item.icon} size={22} color={colors.primary} />
            <Text style={styles.rowLabel}>{item.label}</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.muted} />
        </Pressable>
      )}
      ListFooterComponent={
        <Pressable style={[styles.row, styles.signOutRow]} onPress={handleSignOut}>
          <View style={styles.rowLeft}>
            <Ionicons name="log-out-outline" size={22} color={colors.error} />
            <Text style={styles.signOutLabel}>Sign out</Text>
          </View>
        </Pressable>
      }
    />
  );
}

const styles = StyleSheet.create({
  list: { padding: spacing.md, gap: spacing.sm },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.card,
    borderRadius: radii.md,
    padding: spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  rowLeft: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  rowLabel: { fontSize: 16, fontFamily: fonts.semibold, color: colors.ink },
  signOutRow: { marginTop: spacing.md, justifyContent: "flex-start" },
  signOutLabel: { fontSize: 16, fontFamily: fonts.semibold, color: colors.error },
});
