import React, { useMemo, useState } from "react";
import { View, Text, SectionList, StyleSheet, ActivityIndicator, Linking, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFirestoreCollection } from "../hooks/useFirestoreCollection";
import { EmptyState } from "../components/EmptyState";
import { colors, spacing, radii, fonts } from "../attendeeTheme";
import type { Listing } from "../types";

const SECTIONS: { kind: Listing["kind"]; title: string }[] = [
  { kind: "Practice for Sale", title: "Practices for Sale" },
  { kind: "Job Posting", title: "Job Postings" },
];

// Newsletter posts can run long, so details are clamped until expanded.
// "Long" is judged from the text itself rather than onTextLayout, which
// isn't consistent across iOS, Android, and web.
const COLLAPSED_LINES = 6;
const isLong = (text: string) => text.length > 280 || text.split("\n").length > COLLAPSED_LINES;

function ListingCard({ item }: { item: Listing }) {
  const [expanded, setExpanded] = useState(false);
  const collapsible = isLong(item.details ?? "");

  const meta = [item.location, item.postedDate ? `Posted ${item.postedDate}` : null]
    .filter(Boolean)
    .join(" · ");

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{item.title}</Text>
      {meta ? <Text style={styles.meta}>{meta}</Text> : null}
      <Text
        style={styles.details}
        numberOfLines={collapsible && !expanded ? COLLAPSED_LINES : undefined}
        selectable
      >
        {item.details}
      </Text>
      {collapsible ? (
        <Pressable hitSlop={8} onPress={() => setExpanded((v) => !v)}>
          <Text style={styles.readMore}>{expanded ? "Show less" : "Read more"}</Text>
        </Pressable>
      ) : null}
      {item.contactName ? <Text style={styles.contactName}>Contact: {item.contactName}</Text> : null}
      {item.email || item.phone ? (
        <View style={styles.actions}>
          {item.email ? (
            <Pressable
              style={styles.actionButton}
              onPress={() =>
                Linking.openURL(`mailto:${item.email}?subject=${encodeURIComponent(item.title)}`)
              }
            >
              <Ionicons name="mail-outline" size={16} color={colors.primary} />
              <Text style={styles.actionText} numberOfLines={1}>
                {item.email}
              </Text>
            </Pressable>
          ) : null}
          {item.phone ? (
            <Pressable style={styles.actionButton} onPress={() => Linking.openURL(`tel:${item.phone}`)}>
              <Ionicons name="call-outline" size={16} color={colors.primary} />
              <Text style={styles.actionText}>{item.phone}</Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

export default function ListingsScreen() {
  const { data, loading, error } = useFirestoreCollection<Listing>("listings");

  const sections = useMemo(() => {
    // Newest first. createdAt is a server timestamp, briefly null on a doc
    // that was just written, so treat that as "now".
    const sorted = [...data].sort(
      (a, b) => (b.createdAt?.toMillis() ?? Date.now()) - (a.createdAt?.toMillis() ?? Date.now())
    );
    return SECTIONS.map(({ kind, title }) => ({
      title,
      data: sorted.filter((item) => item.kind === kind),
    })).filter((section) => section.data.length > 0);
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
        icon={error ? "cloud-offline-outline" : "briefcase-outline"}
        title={error ? "Couldn't load listings" : "No listings right now"}
        message={
          error
            ? "Check your connection and try again."
            : "Practices for sale and job postings from the CFPM newsletter will show up here."
        }
        tone={error ? "error" : "empty"}
      />
    );
  }

  return (
    <SectionList
      sections={sections}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.list}
      stickySectionHeadersEnabled={false}
      renderSectionHeader={({ section }) => <Text style={styles.sectionHeader}>{section.title}</Text>}
      renderItem={({ item }) => <ListingCard item={item} />}
    />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  list: { padding: spacing.md, gap: spacing.sm },
  sectionHeader: {
    fontSize: 13,
    fontFamily: fonts.semibold,
    color: colors.primary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    gap: 4,
  },
  title: { fontSize: 16, fontFamily: fonts.semibold, color: colors.ink },
  meta: { fontSize: 13, fontFamily: fonts.semibold, color: colors.primary },
  details: { fontSize: 14, color: colors.ink, marginTop: 4, lineHeight: 20 },
  readMore: { fontSize: 14, fontFamily: fonts.semibold, color: colors.primary, marginTop: 2 },
  contactName: { fontSize: 14, color: colors.muted, marginTop: spacing.xs },
  actions: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, marginTop: spacing.sm },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.primary,
    maxWidth: "100%",
  },
  actionText: { fontSize: 13, fontFamily: fonts.semibold, color: colors.primary, flexShrink: 1 },
});
