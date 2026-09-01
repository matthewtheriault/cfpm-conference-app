import React, { useEffect, useMemo, useState } from "react";
import { View, Text, FlatList, StyleSheet, ActivityIndicator, RefreshControl } from "react-native";
import { collection, getDocs, orderBy } from "firebase/firestore";
import { db } from "../../firebase";
import { useFirestoreCollection } from "../../hooks/useFirestoreCollection";
import { EmptyState } from "../../components/EmptyState";
import { colors, spacing, radii } from "../../theme";
import type { ScheduleItem } from "../../types";

export default function AdminCheckinsScreen() {
  const { data: schedule, loading: scheduleLoading } = useFirestoreCollection<ScheduleItem>(
    "schedule",
    [orderBy("order", "asc")]
  );
  const [counts, setCounts] = useState<Map<string, number> | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadCounts = async () => {
    const snapshot = await getDocs(collection(db, "checkins"));
    const next = new Map<string, number>();
    snapshot.forEach((doc) => {
      const scheduleItemId = doc.data().scheduleItemId as string | undefined;
      if (!scheduleItemId) return;
      next.set(scheduleItemId, (next.get(scheduleItemId) ?? 0) + 1);
    });
    setCounts(next);
  };

  useEffect(() => {
    loadCounts();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadCounts();
    setRefreshing(false);
  };

  const rows = useMemo(
    () => schedule.map((item) => ({ item, count: counts?.get(item.id) ?? 0 })),
    [schedule, counts]
  );

  if (scheduleLoading || counts === null) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (rows.length === 0) {
    return (
      <EmptyState
        icon="checkmark-done-outline"
        title="No sessions yet"
        message="Check-in counts will show up here once the schedule has sessions."
      />
    );
  }

  return (
    <FlatList
      data={rows}
      keyExtractor={({ item }) => item.id}
      contentContainerStyle={styles.list}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      renderItem={({ item: { item, count } }) => (
        <View style={styles.card}>
          <View style={styles.details}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.meta}>
              {item.day} · {item.startTime}
            </Text>
          </View>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{count}</Text>
          </View>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  list: { padding: spacing.md, gap: spacing.sm },
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
  details: { flex: 1, gap: 2 },
  title: { fontSize: 15, fontWeight: "600", color: colors.ink },
  meta: { fontSize: 12, color: colors.muted },
  countBadge: {
    minWidth: 36,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radii.pill,
    backgroundColor: colors.primary,
    alignItems: "center",
  },
  countText: { color: "#fff", fontWeight: "700", fontSize: 14 },
});
