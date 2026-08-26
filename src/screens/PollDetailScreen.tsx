import React, { useEffect, useState } from "react";
import { View, Text, TextInput, Pressable, ScrollView, StyleSheet, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { showAlert } from "../alert";
import { getDeviceId } from "../deviceId";
import { hasAnsweredPoll, markPollAnswered } from "../pollAnswered";
import { colors, spacing, radii } from "../theme";
import type { Poll } from "../types";

export default function PollDetailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const poll = route.params.poll as Poll;

  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [alreadyAnswered, setAlreadyAnswered] = useState<boolean | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    hasAnsweredPoll(poll.id).then(setAlreadyAnswered);
  }, [poll.id]);

  const selectSingle = (questionId: string, option: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: option }));
  };

  const toggleMultiple = (questionId: string, option: string) => {
    setAnswers((prev) => {
      const current = (prev[questionId] as string[] | undefined) ?? [];
      const next = current.includes(option)
        ? current.filter((o) => o !== option)
        : [...current, option];
      return { ...prev, [questionId]: next };
    });
  };

  const setText = (questionId: string, text: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: text }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const deviceId = await getDeviceId();
      await addDoc(collection(db, "polls", poll.id, "responses"), {
        deviceId,
        answers,
        submittedAt: serverTimestamp(),
      });
      await markPollAnswered(poll.id);
      setAlreadyAnswered(true);
    } catch {
      showAlert("Couldn't submit", "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (alreadyAnswered === null) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (alreadyAnswered) {
    return (
      <View style={styles.center}>
        <Ionicons name="checkmark-circle" size={48} color={colors.success} />
        <Text style={styles.thanksTitle}>Thanks for your response!</Text>
        <Text style={styles.thanksMessage}>You've already answered "{poll.title}".</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{poll.title}</Text>
      {poll.description ? <Text style={styles.description}>{poll.description}</Text> : null}

      {poll.questions.map((q, index) => (
        <View key={q.id} style={styles.questionCard}>
          <Text style={styles.questionText}>
            {index + 1}. {q.text}
          </Text>
          {q.type === "text" ? (
            <TextInput
              value={(answers[q.id] as string) ?? ""}
              onChangeText={(t) => setText(q.id, t)}
              placeholder="Your answer"
              placeholderTextColor={colors.muted}
              style={[styles.input, styles.textArea]}
              multiline
            />
          ) : (
            (q.options ?? []).map((option) => {
              const selected =
                q.type === "single"
                  ? answers[q.id] === option
                  : ((answers[q.id] as string[]) ?? []).includes(option);
              return (
                <Pressable
                  key={option}
                  style={styles.optionRow}
                  onPress={() =>
                    q.type === "single" ? selectSingle(q.id, option) : toggleMultiple(q.id, option)
                  }
                >
                  <Ionicons
                    name={
                      selected
                        ? q.type === "single"
                          ? "radio-button-on"
                          : "checkbox"
                        : q.type === "single"
                          ? "radio-button-off"
                          : "square-outline"
                    }
                    size={20}
                    color={selected ? colors.primary : colors.muted}
                  />
                  <Text style={styles.optionText}>{option}</Text>
                </Pressable>
              );
            })
          )}
        </View>
      ))}

      <Pressable style={[styles.submitButton, submitting && styles.buttonDisabled]} onPress={handleSubmit} disabled={submitting}>
        <Text style={styles.submitButtonText}>{submitting ? "Submitting..." : "Submit"}</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: spacing.xl, gap: spacing.sm },
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xl },
  title: { fontSize: 20, fontWeight: "800", color: colors.ink },
  description: { fontSize: 14, color: colors.muted, marginTop: -spacing.sm },
  questionCard: {
    backgroundColor: colors.card,
    borderRadius: radii.md,
    padding: spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    gap: spacing.xs,
  },
  questionText: { fontSize: 15, fontWeight: "700", color: colors.ink, marginBottom: 4 },
  optionRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm, paddingVertical: 6 },
  optionText: { fontSize: 15, color: colors.ink, flex: 1 },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.ink,
    backgroundColor: colors.background,
  },
  textArea: { minHeight: 70, textAlignVertical: "top" },
  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: radii.md,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: spacing.sm,
  },
  buttonDisabled: { opacity: 0.6 },
  submitButtonText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  thanksTitle: { fontSize: 18, fontWeight: "700", color: colors.ink },
  thanksMessage: { fontSize: 14, color: colors.muted, textAlign: "center" },
});
