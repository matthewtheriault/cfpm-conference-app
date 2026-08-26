import React, { useEffect, useMemo, useState } from "react";
import { View, Text, FlatList, Pressable, StyleSheet, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { orderBy } from "firebase/firestore";
import { useFirestoreCollection } from "../hooks/useFirestoreCollection";
import { EmptyState } from "../components/EmptyState";
import { hasAnsweredPoll } from "../pollAnswered";
import { colors, spacing, radii } from "../theme";
import type { Poll } from "../types";

export default function PollsScreen() {
  const navigation = useNavigation<any>();
  const { data, loading } = useFirestoreCollection<Poll>("polls", [orderBy("createdAt", "desc")]);
  const openPolls = useMemo(() => data.filter((p) => p.isOpen), [data]);
  const [answeredIds, setAnsweredIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    let cancelled = false;
    Promise.all(openPolls.map((p) => hasAnsweredPoll(p.id).then((a) => (a ? p.id : null)))).then(
      (results) => {
        if (!cancelled) setAnsweredIds(new Set(results.filter(Boolean) as string[]));
      }
    );
    return () => {
      cancelled = true;
    };
  }, [openPolls]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (openPolls.length === 0) {
    return (
      <EmptyState
        icon="checkbox-outline"
        title="No polls right now"
        message="Post-lecture polls and the conference survey will show up here when they're open."
      />
    );
  }

  return (
    <FlatList
      data={openPolls}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.list}
      renderItem={({ item }) => {
        const answered = answeredIds.has(item.id);
        return (
          <Pressable style={styles.card} onPress={() => navigation.navigate("PollDetail", { poll: item })}>
            <View style={styles.cardHeader}>
              <Text style={styles.kind}>{item.kind === "survey" ? "Survey" : "Poll"}</Text>
              {answered ? (
                <View style={styles.answeredBadge}>
                  <Ionicons name="checkmark-circle" size={14} color={colors.success} />
                  <Text style={styles.answeredText}>Answered</Text>
                </View>
              ) : null}
            </View>
            <Text style={styles.title}>{item.title}</Text>
            {item.description ? <Text style={styles.description}>{item.description}</Text> : null}
          </Pressable>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  list: { padding: spacing.md, gap: spacing.sm },
  card: {
    backgroundColor: colors.card,
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    gap: 4,
  },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  kind: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.primary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  answeredBadge: { flexDirection: "row", alignItems: "center", gap: 4 },
  answeredText: { fontSize: 12, color: colors.success, fontWeight: "600" },
  title: { fontSize: 16, fontWeight: "700", color: colors.ink },
  description: { fontSize: 13, color: colors.muted },
});
