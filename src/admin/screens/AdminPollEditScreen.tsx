import React, { useEffect, useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { addDoc, collection, doc, getDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { showAlert } from "../../alert";
import { colors, spacing, radii } from "../../theme";
import type { PollQuestion, PollQuestionType } from "../../types";

function randomId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

const QUESTION_TYPES: { value: PollQuestionType; label: string }[] = [
  { value: "single", label: "Single choice" },
  { value: "multiple", label: "Multiple choice" },
  { value: "text", label: "Open text" },
];

export default function AdminPollEditScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const pollId: string | null = route.params?.pollId ?? null;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [kind, setKind] = useState<"poll" | "survey">("poll");
  const [isOpen, setIsOpen] = useState(true);
  const [questions, setQuestions] = useState<PollQuestion[]>([]);
  const [loading, setLoading] = useState(Boolean(pollId));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!pollId) return;
    getDoc(doc(db, "polls", pollId)).then((snap) => {
      const data = snap.data();
      if (data) {
        setTitle(data.title ?? "");
        setDescription(data.description ?? "");
        setKind(data.kind ?? "poll");
        setIsOpen(data.isOpen ?? true);
        setQuestions(data.questions ?? []);
      }
      setLoading(false);
    });
  }, [pollId]);

  const addQuestion = () => {
    setQuestions((prev) => [...prev, { id: randomId(), text: "", type: "single", options: [] }]);
  };

  const updateQuestion = (id: string, patch: Partial<PollQuestion>) => {
    setQuestions((prev) => prev.map((q) => (q.id === id ? { ...q, ...patch } : q)));
  };

  const removeQuestion = (id: string) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  const handleSave = async () => {
    if (!title.trim()) {
      showAlert("Missing info", "Give the poll or survey a title.");
      return;
    }
    if (questions.length === 0) {
      showAlert("Missing info", "Add at least one question.");
      return;
    }
    for (const q of questions) {
      if (!q.text.trim()) {
        showAlert("Missing info", "Every question needs text.");
        return;
      }
      if (q.type !== "text" && (!q.options || q.options.filter((o) => o.trim()).length < 2)) {
        showAlert("Missing info", `"${q.text}" needs at least two options.`);
        return;
      }
    }
    setSaving(true);
    try {
      const payload = {
        title: title.trim(),
        description: description.trim() || null,
        kind,
        isOpen,
        questions: questions.map((q) => ({
          ...q,
          options: q.type === "text" ? [] : (q.options ?? []).filter((o) => o.trim()),
        })),
      };
      if (pollId) {
        await updateDoc(doc(db, "polls", pollId), payload);
      } else {
        await addDoc(collection(db, "polls"), { ...payload, createdAt: serverTimestamp() });
      }
      navigation.goBack();
    } catch {
      showAlert("Couldn't save", "Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.label}>Title *</Text>
      <TextInput
        value={title}
        onChangeText={setTitle}
        placeholder="e.g. Keynote feedback"
        placeholderTextColor={colors.muted}
        style={styles.input}
      />

      <Text style={styles.label}>Description</Text>
      <TextInput
        value={description}
        onChangeText={setDescription}
        placeholder="Optional context shown above the questions"
        placeholderTextColor={colors.muted}
        style={[styles.input, styles.textArea]}
        multiline
      />

      <Text style={styles.label}>Type</Text>
      <View style={styles.chipRow}>
        {(["poll", "survey"] as const).map((value) => (
          <Pressable
            key={value}
            style={[styles.chip, kind === value && styles.chipActive]}
            onPress={() => setKind(value)}
          >
            <Text style={[styles.chipText, kind === value && styles.chipTextActive]}>
              {value === "poll" ? "Poll" : "Survey"}
            </Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.label}>Status</Text>
      <View style={styles.chipRow}>
        {[true, false].map((value) => (
          <Pressable
            key={String(value)}
            style={[styles.chip, isOpen === value && styles.chipActive]}
            onPress={() => setIsOpen(value)}
          >
            <Text style={[styles.chipText, isOpen === value && styles.chipTextActive]}>
              {value ? "Open" : "Closed"}
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.questionsHeader}>
        <Text style={styles.sectionTitle}>Questions</Text>
        <Pressable onPress={addQuestion} style={styles.addQuestionButton}>
          <Ionicons name="add-circle-outline" size={18} color={colors.primary} />
          <Text style={styles.addQuestionText}>Add question</Text>
        </Pressable>
      </View>

      {questions.map((q, index) => (
        <View key={q.id} style={styles.questionCard}>
          <View style={styles.questionHeader}>
            <Text style={styles.questionNumber}>Q{index + 1}</Text>
            <Pressable hitSlop={12} onPress={() => removeQuestion(q.id)}>
              <Ionicons name="close-circle-outline" size={20} color={colors.muted} />
            </Pressable>
          </View>
          <TextInput
            value={q.text}
            onChangeText={(t) => updateQuestion(q.id, { text: t })}
            placeholder="Question text"
            placeholderTextColor={colors.muted}
            style={styles.input}
          />
          <View style={styles.chipRow}>
            {QUESTION_TYPES.map((t) => (
              <Pressable
                key={t.value}
                style={[styles.chip, q.type === t.value && styles.chipActive]}
                onPress={() => updateQuestion(q.id, { type: t.value })}
              >
                <Text style={[styles.chipText, q.type === t.value && styles.chipTextActive]}>
                  {t.label}
                </Text>
              </Pressable>
            ))}
          </View>
          {q.type !== "text" ? (
            <TextInput
              value={(q.options ?? []).join(", ")}
              onChangeText={(t) => updateQuestion(q.id, { options: t.split(",").map((o) => o) })}
              placeholder="Options, separated by commas"
              placeholderTextColor={colors.muted}
              style={styles.input}
            />
          ) : null}
        </View>
      ))}

      <Pressable style={[styles.saveButton, saving && styles.buttonDisabled]} onPress={handleSave} disabled={saving}>
        <Text style={styles.saveButtonText}>{saving ? "Saving..." : "Save"}</Text>
      </Pressable>

      {pollId ? (
        <Pressable
          style={styles.resultsButton}
          onPress={() =>
            navigation.navigate("AdminPollResponses", {
              poll: { id: pollId, title, description, kind, isOpen, questions },
            })
          }
        >
          <Text style={styles.resultsButtonText}>View responses</Text>
        </Pressable>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  content: { padding: spacing.lg, gap: spacing.sm, paddingBottom: spacing.xl },
  label: { fontSize: 13, fontWeight: "600", color: colors.muted, marginTop: spacing.sm },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.ink,
    backgroundColor: colors.card,
  },
  textArea: { minHeight: 70, textAlignVertical: "top" },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.xs },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: 13, fontWeight: "600", color: colors.ink },
  chipTextActive: { color: "#fff" },
  questionsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: spacing.md,
  },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: colors.ink },
  addQuestionButton: { flexDirection: "row", alignItems: "center", gap: 4 },
  addQuestionText: { color: colors.primary, fontWeight: "600", fontSize: 13 },
  questionCard: {
    backgroundColor: colors.card,
    borderRadius: radii.md,
    padding: spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    gap: spacing.xs,
  },
  questionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  questionNumber: { fontSize: 13, fontWeight: "700", color: colors.primary },
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: radii.md,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: spacing.md,
  },
  buttonDisabled: { opacity: 0.6 },
  saveButtonText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  resultsButton: {
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: radii.md,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: spacing.sm,
  },
  resultsButtonText: { color: colors.primary, fontWeight: "700", fontSize: 16 },
});
