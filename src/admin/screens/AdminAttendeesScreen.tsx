import React, { useMemo } from "react";
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from "react-native";
import { useFirestoreCollection } from "../../hooks/useFirestoreCollection";
import { EmptyState } from "../../components/EmptyState";
import { colors, spacing, radii } from "../../theme";
import type { Profile, PassportSubmission, Exhibitor } from "../../types";

type ExhibitorVisit = { id: string; deviceId?: string };

export default function AdminAttendeesScreen() {
  const { data: profiles, loading: profilesLoading, error } = useFirestoreCollection<Profile>("profiles");
  const { data: exhibitors, loading: exhibitorsLoading } = useFirestoreCollection<Exhibitor>("exhibitors");
  const { data: visits, loading: visitsLoading } = useFirestoreCollection<ExhibitorVisit>("exhibitorVisits");
  const { data: submissions, loading: submissionsLoading } = useFirestoreCollection<PassportSubmission>(
    "passportSubmissions"
  );

  const loading = profilesLoading || exhibitorsLoading || visitsLoading || submissionsLoading;
  const totalExhibitors = exhibitors.length;

  const rows = useMemo(() => {
    const visitedCountByDevice = new Map<string, number>();
    visits.forEach((visit) => {
      if (!visit.deviceId) return;
      visitedCountByDevice.set(visit.deviceId, (visitedCountByDevice.get(visit.deviceId) ?? 0) + 1);
    });
    const submittedDeviceIds = new Set(submissions.map((s) => s.deviceId));

    return profiles
      .map((profile) => {
        const name = [profile.firstName, profile.lastName].filter(Boolean).join(" ").trim() || "Unnamed attendee";
        const visitedCount = visitedCountByDevice.get(profile.deviceId) ?? 0;
        const percent = totalExhibitors > 0 ? Math.round((visitedCount / totalExhibitors) * 100) : 0;
        return {
          id: profile.id,
          name,
          visitedCount,
          percent,
          submitted: submittedDeviceIds.has(profile.deviceId),
        };
      })
      .sort((a, b) => b.percent - a.percent || a.name.localeCompare(b.name));
  }, [profiles, visits, submissions, totalExhibitors]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (rows.length === 0) {
    return (
      <EmptyState
        icon={error ? "cloud-offline-outline" : "people-outline"}
        title={error ? "Couldn't load attendees" : "No attendees yet"}
        message={
          error
            ? "Check your connection and try again."
            : "Once someone enters their name in the app, they'll show up here."
        }
        tone={error ? "error" : "empty"}
      />
    );
  }

  return (
    <FlatList
      data={rows}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.list}
      ListHeaderComponent={<Text style={styles.count}>{rows.length} signed in</Text>}
      renderItem={({ item }) => (
        <View style={styles.row}>
          <View style={styles.details}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.meta}>
              {item.visitedCount} of {totalExhibitors} booths
              {item.submitted ? " · Submitted" : ""}
            </Text>
          </View>
          <View style={[styles.percentBadge, item.submitted && styles.percentBadgeSubmitted]}>
            <Text style={styles.percentText}>{item.percent}%</Text>
          </View>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  list: { padding: spacing.md, gap: spacing.sm },
  count: { fontSize: 13, color: colors.muted, marginBottom: spacing.xs },
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
    backgroundColor: colors.ink,
    alignItems: "center",
  },
  percentBadgeSubmitted: { backgroundColor: colors.success },
  percentText: { color: "#fff", fontWeight: "700", fontSize: 14 },
});
