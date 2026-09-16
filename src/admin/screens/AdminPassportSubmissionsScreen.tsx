import React from "react";
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from "react-native";
import { orderBy } from "firebase/firestore";
import { useFirestoreCollection } from "../../hooks/useFirestoreCollection";
import { EmptyState } from "../../components/EmptyState";
import { colors, spacing, radii } from "../../theme";
import type { PassportSubmission } from "../../types";

export default function AdminPassportSubmissionsScreen() {
  const { data, loading, error } = useFirestoreCollection<PassportSubmission>("passportSubmissions", [
    orderBy("submittedAt", "desc"),
  ]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (data.length === 0) {
    return (
      <EmptyState
        icon={error ? "cloud-offline-outline" : "trophy-outline"}
        title={error ? "Couldn't load submissions" : "No submissions yet"}
        message={
          error
            ? "Check your connection and try again."
            : "Once an attendee submits their completed passport, it'll show up here."
        }
        tone={error ? "error" : "empty"}
      />
    );
  }

  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.list}
      renderItem={({ item }) => {
        const name = [item.firstName, item.lastName].filter(Boolean).join(" ").trim() || "Unnamed attendee";
        return (
          <View style={styles.row}>
            <View style={styles.details}>
              <Text style={styles.name}>{name}</Text>
              <Text style={styles.meta}>
                {item.visitedCount} of {item.totalExhibitors} booths ·{" "}
                {item.submittedAt ? item.submittedAt.toDate().toLocaleString() : "Just now"}
              </Text>
            </View>
            <View style={styles.percentBadge}>
              <Text style={styles.percentText}>{item.percentComplete}%</Text>
            </View>
          </View>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  list: { padding: spacing.md, gap: spacing.sm },
  row: {
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
  details: { flex: 1, gap: 2 },
  name: { fontSize: 15, fontWeight: "600", color: colors.ink },
  meta: { fontSize: 12, color: colors.muted },
  percentBadge: {
    minWidth: 48,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radii.pill,
    backgroundColor: colors.success,
    alignItems: "center",
  },
  percentText: { color: "#fff", fontWeight: "700", fontSize: 14 },
});
