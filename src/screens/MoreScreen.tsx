import React from "react";
import { View, Text, Pressable, StyleSheet, FlatList } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { colors, spacing, radii } from "../theme";

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
  rowLabel: { fontSize: 16, fontWeight: "600", color: colors.ink },
});
