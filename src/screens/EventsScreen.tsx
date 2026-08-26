import React from "react";
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from "react-native";
import { orderBy } from "firebase/firestore";
import { useFirestoreCollection } from "../hooks/useFirestoreCollection";
import { EmptyState } from "../components/EmptyState";
import { colors, spacing, radii } from "../theme";
import type { EventItem } from "../types";

export default function EventsScreen() {
  const { data, loading } = useFirestoreCollection<EventItem>("events", [
    orderBy("date", "asc"),
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
        icon="megaphone-outline"
        title="No upcoming events yet"
        message="Announcements and extra conference events will show up here as they're added."
      />
    );
  }

  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.list}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.dateLine}>
            {item.date}
            {item.time ? ` · ${item.time}` : ""}
          </Text>
          {item.location ? <Text style={styles.meta}>{item.location}</Text> : null}
          {item.description ? (
            <Text style={styles.description}>{item.description}</Text>
          ) : null}
        </View>
      )}
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
  title: { fontSize: 16, fontWeight: "700", color: colors.ink },
  dateLine: { fontSize: 13, fontWeight: "600", color: colors.primary },
  meta: { fontSize: 13, color: colors.muted },
  description: { fontSize: 14, color: colors.ink, marginTop: 4, lineHeight: 20 },
});
