import React from "react";
import { View, Text, FlatList, Pressable, StyleSheet, ActivityIndicator } from "react-native";
import { Image } from "expo-image";
import { useNavigation } from "@react-navigation/native";
import { orderBy } from "firebase/firestore";
import { useFirestoreCollection } from "../hooks/useFirestoreCollection";
import { EmptyState } from "../components/EmptyState";
import { colors, spacing, radii } from "../theme";
import type { Exhibitor } from "../types";

export default function ExhibitorsScreen() {
  const navigation = useNavigation<any>();
  const { data, loading } = useFirestoreCollection<Exhibitor>("exhibitors", [orderBy("name", "asc")]);

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
        icon="business-outline"
        title="Exhibitors coming soon"
        message="Exhibit hall booths will be listed here once they're confirmed."
      />
    );
  }

  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.list}
      renderItem={({ item }) => (
        <Pressable
          style={styles.card}
          onPress={() => navigation.navigate("ExhibitorDetail", { exhibitor: item })}
        >
          {item.logoUrl ? (
            <Image source={{ uri: item.logoUrl }} style={styles.logo} contentFit="contain" />
          ) : (
            <View style={[styles.logo, styles.logoFallback]}>
              <Text style={styles.logoFallbackText}>{item.name.charAt(0)}</Text>
            </View>
          )}
          <View style={styles.details}>
            <Text style={styles.name}>{item.name}</Text>
            {item.boothNumber ? <Text style={styles.subtitle}>Booth {item.boothNumber}</Text> : null}
            {item.category ? <Text style={styles.meta}>{item.category}</Text> : null}
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
  logo: { width: 56, height: 56, borderRadius: radii.sm },
  logoFallback: { backgroundColor: colors.primary, alignItems: "center", justifyContent: "center" },
  logoFallbackText: { color: "#fff", fontSize: 22, fontWeight: "700" },
  details: { flex: 1, gap: 2 },
  name: { fontSize: 16, fontWeight: "700", color: colors.ink },
  subtitle: { fontSize: 13, color: colors.muted },
  meta: { fontSize: 12, color: colors.muted },
});
