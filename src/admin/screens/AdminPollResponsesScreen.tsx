import React, { useMemo } from "react";
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from "react-native";
import { useRoute } from "@react-navigation/native";
import { useFirestoreCollection } from "../../hooks/useFirestoreCollection";
import { colors, spacing, radii } from "../../theme";
import type { Poll, PollResponse } from "../../types";

export default function AdminPollResponsesScreen() {
  const route = useRoute<any>();
  const poll = route.params.poll as Poll;
  const { data: responses, loading } = useFirestoreCollection<PollResponse>(
    `polls/${poll.id}/responses`
  );

  const tallies = useMemo(() => {
    return poll.questions.map((q) => {
      if (q.type === "text") {
        const answers = responses
          .map((r) => r.answers?.[q.id])
          .filter((a): a is string => typeof a === "string" && a.trim().length > 0);
        return { question: q, kind: "text" as const, answers };
      }
      const counts: Record<string, number> = {};
      for (const option of q.options ?? []) counts[option] = 0;
      for (const r of responses) {
        const answer = r.answers?.[q.id];
        const selected = Array.isArray(answer) ? answer : answer ? [answer] : [];
        for (const option of selected) {
          if (option in counts) counts[option] += 1;
        }
      }
      return { question: q, kind: "counts" as const, counts };
    });
  }, [poll, responses]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.summary}>
        {responses.length} response{responses.length === 1 ? "" : "s"}
      </Text>

      {tallies.map(({ question, kind, ...rest }) => (
        <View key={question.id} style={styles.card}>
          <Text style={styles.questionText}>{question.text}</Text>
          {kind === "counts"
            ? Object.entries((rest as { counts: Record<string, number> }).counts).map(
                ([option, count]) => (
                  <View key={option} style={styles.tallyRow}>
                    <Text style={styles.tallyOption}>{option}</Text>
                    <Text style={styles.tallyCount}>{count}</Text>
                  </View>
                )
              )
            : (rest as { answers: string[] }).answers.length === 0 ? (
                <Text style={styles.emptyText}>No responses yet.</Text>
              ) : (
                (rest as { answers: string[] }).answers.map((answer, i) => (
                  <Text key={i} style={styles.textAnswer}>
                    "{answer}"
                  </Text>
                ))
              )}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  content: { padding: spacing.lg, gap: spacing.md },
  summary: { fontSize: 14, fontWeight: "700", color: colors.muted },
  card: {
    backgroundColor: colors.card,
    borderRadius: radii.md,
    padding: spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    gap: 6,
  },
  questionText: { fontSize: 15, fontWeight: "700", color: colors.ink, marginBottom: 4 },
  tallyRow: { flexDirection: "row", justifyContent: "space-between" },
  tallyOption: { fontSize: 14, color: colors.ink },
  tallyCount: { fontSize: 14, fontWeight: "700", color: colors.primary },
  textAnswer: { fontSize: 14, color: colors.ink, fontStyle: "italic" },
  emptyText: { fontSize: 13, color: colors.muted },
});
