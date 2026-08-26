import React from "react";
import { View, Text, Image, Pressable, StyleSheet, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { orderBy, limit } from "firebase/firestore";
import { useFirestoreCollection } from "../hooks/useFirestoreCollection";
import { useUserProfile } from "../context/UserProfileContext";
import { SponsorBanner } from "../components/SponsorBanner";
import { colors, spacing, radii } from "../theme";
import type { NotificationDoc } from "../types";

const QUICK_LINKS: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  tab?: string;
  moreScreen?: string;
}[] = [
  { label: "Schedule", icon: "calendar-outline", tab: "Schedule" },
  { label: "Map", icon: "map-outline", tab: "Map" },
  { label: "Speakers", icon: "people-outline", tab: "More", moreScreen: "Speakers" },
  { label: "Exhibitors", icon: "business-outline", tab: "More", moreScreen: "Exhibitors" },
  { label: "Sponsors", icon: "ribbon-outline", tab: "More", moreScreen: "Sponsors" },
  { label: "Polls & surveys", icon: "checkbox-outline", tab: "More", moreScreen: "Polls" },
];

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const { firstName } = useUserProfile();
  const { data: latestUpdates } = useFirestoreCollection<NotificationDoc>("notifications", [
    orderBy("sentAt", "desc"),
    limit(1),
  ]);
  const latestUpdate = latestUpdates[0];

  const goToTab = (tab: string, moreScreen?: string) => {
    const parent = navigation.getParent();
    if (moreScreen) {
      parent?.navigate(tab, { screen: moreScreen });
    } else {
      parent?.navigate(tab);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Image
        source={require("../../assets/branding/cfpm-logo.png")}
        style={styles.logo}
        resizeMode="contain"
      />
      <Text style={styles.greeting}>{firstName ? `Welcome, ${firstName}!` : "Welcome!"}</Text>
      <Text style={styles.subheading}>Glad you're here for the CFPM conference.</Text>

      <SponsorBanner />

      {latestUpdate ? (
        <Pressable style={styles.updateCard} onPress={() => goToTab("Updates")}>
          <View style={styles.updateHeader}>
            <Ionicons name="megaphone" size={16} color={colors.primary} />
            <Text style={styles.updateLabel}>Latest update</Text>
          </View>
          <Text style={styles.updateTitle}>{latestUpdate.title}</Text>
          <Text style={styles.updateBody} numberOfLines={2}>
            {latestUpdate.body}
          </Text>
        </Pressable>
      ) : null}

      <Text style={styles.sectionTitle}>Get around</Text>
      <View style={styles.grid}>
        {QUICK_LINKS.map((link) => (
          <Pressable
            key={link.label}
            style={styles.gridItem}
            onPress={() => goToTab(link.tab!, link.moreScreen)}
          >
            <Ionicons name={link.icon} size={26} color={colors.primary} />
            <Text style={styles.gridLabel}>{link.label}</Text>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, alignItems: "center", paddingBottom: spacing.xl },
  logo: { width: 140, height: 140, marginBottom: spacing.sm },
  greeting: { fontSize: 24, fontWeight: "800", color: colors.ink, textAlign: "center" },
  subheading: {
    fontSize: 14,
    color: colors.muted,
    textAlign: "center",
    marginBottom: spacing.lg,
  },
  updateCard: {
    width: "100%",
    backgroundColor: colors.card,
    borderRadius: radii.lg,
    padding: spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    gap: 4,
    marginBottom: spacing.lg,
  },
  updateHeader: { flexDirection: "row", alignItems: "center", gap: 6 },
  updateLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.primary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  updateTitle: { fontSize: 15, fontWeight: "700", color: colors.ink },
  updateBody: { fontSize: 13, color: colors.muted },
  sectionTitle: {
    alignSelf: "flex-start",
    fontSize: 13,
    fontWeight: "700",
    color: colors.primary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
  },
  grid: {
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  gridItem: {
    width: "31%",
    aspectRatio: 1,
    backgroundColor: colors.card,
    borderRadius: radii.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    padding: spacing.xs,
  },
  gridLabel: { fontSize: 12, fontWeight: "600", color: colors.ink, textAlign: "center" },
});
