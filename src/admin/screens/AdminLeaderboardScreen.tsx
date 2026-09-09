import React, { useCallback, useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, ActivityIndicator, RefreshControl, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { fetchLeaderboard, type LeaderboardEntry } from "../leaderboard";
import { EmptyState } from "../../components/EmptyState";
import { colors, spacing, radii } from "../../theme";

const MEDAL_COLORS = ["#D4AF37", "#A8A9AD", "#CD7F32"]; // gold, silver, bronze

export default function AdminLeaderboardScreen() {
  const navigation = useNavigation<any>();
  const [entries, setEntries] = useState<LeaderboardEntry[] | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const data = await fetchLeaderboard();
    setEntries(data);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  if (entries === null) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (entries.length === 0) {
    return (
      <EmptyState
        icon="trophy-outline"
        title="No points yet"
        message="Once attendees check into sessions or scan exhibitor booths, standings will show up here."
      />
    );
  }

  const topScore = entries[0].totalPoints;
  const tiedLeaders = entries.filter((e) => e.totalPoints === topScore).length;

  return (
    <FlatList
      data={entries}
      keyExtractor={(item) => item.deviceId}
      contentContainerStyle={styles.list}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      ListHeaderComponent={
        <Pressable style={styles.wheelButton} onPress={() => navigation.navigate("AdminPrizeWheel")}>
          <Ionicons name="disc-outline" size={20} color="#fff" />
          <Text style={styles.wheelButtonText}>
            Spin for the winner{tiedLeaders > 1 ? ` (${tiedLeaders} tied at ${topScore})` : ""}
          </Text>
        </Pressable>
      }
      renderItem={({ item, index }) => (
        <View style={styles.row}>
          <View style={[styles.rank, index < 3 && { backgroundColor: MEDAL_COLORS[index] }]}>
            <Text style={[styles.rankText, index < 3 && styles.rankTextMedal]}>{index + 1}</Text>
          </View>
          <View style={styles.details}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.meta}>
              {item.boothPoints} booth{item.boothPoints === 1 ? "" : "s"} · {item.sessionPoints} session
              {item.sessionPoints === 1 ? "" : "s"}
            </Text>
          </View>
          <View style={styles.pointsBadge}>
            <Text style={styles.pointsText}>{item.totalPoints}</Text>
          </View>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  list: { padding: spacing.md, gap: spacing.sm },
  wheelButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: colors.primary,
    borderRadius: radii.md,
    paddingVertical: 14,
    marginBottom: spacing.md,
  },
  wheelButtonText: { color: "#fff", fontWeight: "700", fontSize: 15 },
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
  rank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  rankText: { fontWeight: "700", color: colors.muted, fontSize: 13 },
  rankTextMedal: { color: "#fff" },
  details: { flex: 1, gap: 2 },
  name: { fontSize: 15, fontWeight: "600", color: colors.ink },
  meta: { fontSize: 12, color: colors.muted },
  pointsBadge: {
    minWidth: 40,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radii.pill,
    backgroundColor: colors.ink,
    alignItems: "center",
  },
  pointsText: { color: "#fff", fontWeight: "700", fontSize: 14 },
});
