import React from "react";
import { View, Text, Pressable, StyleSheet, FlatList, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { deleteDoc, doc, orderBy } from "firebase/firestore";
import { db } from "../../firebase";
import { showAlert } from "../../alert";
import { useFirestoreCollection } from "../../hooks/useFirestoreCollection";
import { colors, spacing, radii } from "../../theme";
import type { Poll } from "../../types";

export default function AdminPollsScreen() {
  const navigation = useNavigation<any>();
  const { data, loading } = useFirestoreCollection<Poll>("polls", [orderBy("createdAt", "desc")]);

  const handleDelete = (id: string, title: string) => {
    showAlert("Delete", `Remove "${title}"? This can't be undone.`, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => deleteDoc(doc(db, "polls", id)) },
    ]);
  };

  return (
    <View style={styles.container}>
      <Pressable
        style={styles.addButton}
        onPress={() => navigation.navigate("AdminPollEdit", { pollId: null })}
      >
        <Ionicons name="add-circle" size={20} color="#fff" />
        <Text style={styles.addButtonText}>New poll or survey</Text>
      </Pressable>

      {loading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.lg }} />
      ) : data.length === 0 ? (
        <Text style={styles.emptyText}>No polls or surveys yet.</Text>
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <Pressable
              style={styles.row}
              onPress={() => navigation.navigate("AdminPollEdit", { pollId: item.id })}
            >
              <View style={styles.rowText}>
                <Text style={styles.rowTitle}>{item.title}</Text>
                <Text style={styles.rowSubtitle}>
                  {item.kind === "survey" ? "Survey" : "Poll"} · {item.questions?.length ?? 0}{" "}
                  question{(item.questions?.length ?? 0) === 1 ? "" : "s"} ·{" "}
                  {item.isOpen ? "Open" : "Closed"}
                </Text>
              </View>
              <Pressable hitSlop={12} onPress={() => handleDelete(item.id, item.title)}>
                <Ionicons name="trash-outline" size={20} color={colors.muted} />
              </Pressable>
            </Pressable>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    backgroundColor: colors.primary,
    margin: spacing.md,
    borderRadius: radii.md,
    paddingVertical: 12,
  },
  addButtonText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  emptyText: { color: colors.muted, fontSize: 14, textAlign: "center", marginTop: spacing.xl },
  list: { paddingHorizontal: spacing.md, paddingBottom: spacing.lg, gap: spacing.xs },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.card,
    borderRadius: radii.md,
    padding: spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  rowText: { flex: 1, gap: 2, paddingRight: spacing.sm },
  rowTitle: { fontSize: 15, fontWeight: "700", color: colors.ink },
  rowSubtitle: { fontSize: 13, color: colors.muted },
});
