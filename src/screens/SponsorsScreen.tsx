import React, { useMemo } from "react";
import { View, Text, SectionList, StyleSheet, ActivityIndicator, Linking, Pressable } from "react-native";
import { Image } from "expo-image";
import { orderBy } from "firebase/firestore";
import { useFirestoreCollection } from "../hooks/useFirestoreCollection";
import { EmptyState } from "../components/EmptyState";
import { colors, spacing, radii } from "../theme";
import type { Sponsor } from "../types";

const TIER_ORDER = ["Platinum", "Gold", "Silver", "Bronze"];

export default function SponsorsScreen() {
  const { data, loading } = useFirestoreCollection<Sponsor>("sponsors", [
    orderBy("name", "asc"),
  ]);

  const sections = useMemo(() => {
    const byTier = new Map<string, Sponsor[]>();
    for (const sponsor of data) {
      const tier = sponsor.tier ?? "Sponsor";
      const list = byTier.get(tier) ?? [];
      list.push(sponsor);
      byTier.set(tier, list);
    }
    const ordered = [...byTier.entries()].sort(
      (a, b) => TIER_ORDER.indexOf(a[0]) - TIER_ORDER.indexOf(b[0])
    );
    return ordered.map(([title, entries]) => ({ title, data: entries }));
  }, [data]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (sections.length === 0) {
    return (
      <EmptyState
        icon="ribbon-outline"
        title="Sponsors coming soon"
        message="Our conference sponsors will be listed here once they're confirmed."
      />
    );
  }

  return (
    <SectionList
      sections={sections}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.list}
      renderSectionHeader={({ section }) => (
        <Text style={styles.tierHeader}>{section.title}</Text>
      )}
      renderItem={({ item }) => (
        <Pressable
          style={styles.card}
          disabled={!item.website}
          onPress={() => item.website && Linking.openURL(item.website)}
        >
          {item.logoUrl ? (
            <Image source={{ uri: item.logoUrl }} style={styles.logo} contentFit="contain" />
          ) : (
            <View style={[styles.logo, styles.logoFallback]}>
              <Text style={styles.logoFallbackText}>{item.name.charAt(0)}</Text>
            </View>
          )}
          <View style={styles.details}>
            <Text style={styles.name}>{item.name}</Text>
            {item.description ? (
              <Text style={styles.description}>{item.description}</Text>
            ) : null}
          </View>
        </Pressable>
      )}
    />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  list: { padding: spacing.md, gap: spacing.sm },
  tierHeader: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.primary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    gap: spacing.md,
  },
  logo: { width: 56, height: 56, borderRadius: radii.sm },
  logoFallback: {
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  logoFallbackText: { color: "#fff", fontSize: 22, fontWeight: "700" },
  details: { flex: 1, gap: 2 },
  name: { fontSize: 16, fontWeight: "700", color: colors.ink },
  description: { fontSize: 13, color: colors.muted },
});
