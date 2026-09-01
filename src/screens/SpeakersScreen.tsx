import React from "react";
import { View, Text, FlatList, Pressable, StyleSheet, ActivityIndicator } from "react-native";
import { Image } from "expo-image";
import { useNavigation } from "@react-navigation/native";
import { orderBy } from "firebase/firestore";
import { useFirestoreCollection } from "../hooks/useFirestoreCollection";
import { EmptyState } from "../components/EmptyState";
import { colors, spacing, radii } from "../theme";
import type { Speaker } from "../types";

export default function SpeakersScreen() {
  const navigation = useNavigation<any>();
  const { data, loading, error } = useFirestoreCollection<Speaker>("speakers", [orderBy("name", "asc")]);

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
        icon={error ? "cloud-offline-outline" : "people-outline"}
        title={error ? "Couldn't load speakers" : "Speakers coming soon"}
        message={
          error
            ? "Check your connection and try again."
            : "Guest speaker profiles will appear here once they're added."
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
      renderItem={({ item }) => (
        <Pressable style={styles.card} onPress={() => navigation.navigate("SpeakerDetail", { speaker: item })}>
          {item.photoUrl ? (
            <Image source={{ uri: item.photoUrl }} style={styles.photo} contentFit="cover" />
          ) : (
            <View style={[styles.photo, styles.photoFallback]}>
              <Text style={styles.photoFallbackText}>{item.name.charAt(0)}</Text>
            </View>
          )}
          <View style={styles.details}>
            <Text style={styles.name}>{item.name}</Text>
            {item.title ? <Text style={styles.subtitle}>{item.title}</Text> : null}
            {item.organization ? <Text style={styles.meta}>{item.organization}</Text> : null}
          </View>
        </Pressable>
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
  photo: { width: 56, height: 56, borderRadius: radii.pill },
  photoFallback: { backgroundColor: colors.primary, alignItems: "center", justifyContent: "center" },
  photoFallbackText: { color: "#fff", fontSize: 22, fontWeight: "700" },
  details: { flex: 1, gap: 2 },
  name: { fontSize: 16, fontWeight: "700", color: colors.ink },
  subtitle: { fontSize: 13, color: colors.muted },
  meta: { fontSize: 12, color: colors.muted },
});
