import React from "react";
import { View, Text, FlatList, Pressable, StyleSheet, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { orderBy } from "firebase/firestore";
import { useFirestoreCollection } from "../hooks/useFirestoreCollection";
import { useExhibitorPassport } from "../context/ExhibitorPassportContext";
import { EmptyState } from "../components/EmptyState";
import { colors, spacing, radii, fonts, shadow } from "../attendeeTheme";
import type { Exhibitor } from "../types";

export default function PassportScreen() {
  const navigation = useNavigation<any>();
  const { data: exhibitors, loading, error } = useFirestoreCollection<Exhibitor>("exhibitors", [
    orderBy("name", "asc"),
  ]);
  const { isVisited, visitedCount, isLoading: passportLoading } = useExhibitorPassport();

  if (loading || passportLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (exhibitors.length === 0) {
    return (
      <EmptyState
        icon={error ? "cloud-offline-outline" : "qr-code-outline"}
        title={error ? "Couldn't load exhibitors" : "Passport coming soon"}
        message={
          error
            ? "Check your connection and try again."
            : "Once exhibitors are confirmed, visit their booths to fill your passport."
        }
        tone={error ? "error" : "empty"}
      />
    );
  }

  const total = exhibitors.length;
  const complete = visitedCount >= total;

  return (
    <FlatList
      data={exhibitors}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.list}
      ListHeaderComponent={
        <View style={styles.header}>
          <Text style={styles.progressText}>
            {visitedCount} of {total} booths visited
          </Text>
          <View style={styles.progressTrack}>
            <View
              style={[styles.progressFill, { width: `${Math.min(100, (visitedCount / total) * 100)}%` }]}
            />
          </View>
          {complete ? (
            <Text style={styles.completeText}>
              Passport complete! Show this screen at the registration desk.
            </Text>
          ) : null}
          <Pressable style={styles.scanButton} onPress={() => navigation.navigate("ScanExhibitor")}>
            <Ionicons name="qr-code-outline" size={20} color="#fff" />
            <Text style={styles.scanButtonText}>Scan QR Code</Text>
          </Pressable>
        </View>
      }
      renderItem={({ item }) => {
        const visited = isVisited(item.id);
        return (
          <View style={styles.row}>
            <View style={[styles.checkCircle, visited && styles.checkCircleDone]}>
              {visited ? <Ionicons name="checkmark" size={16} color="#fff" /> : null}
            </View>
            <View style={styles.rowDetails}>
              <Text style={[styles.rowName, visited && styles.rowNameDone]}>{item.name}</Text>
              {item.boothNumber ? <Text style={styles.rowMeta}>Booth {item.boothNumber}</Text> : null}
            </View>
          </View>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  list: { padding: spacing.md, paddingBottom: spacing.xl },
  header: {
    backgroundColor: colors.card,
    borderRadius: radii.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    gap: spacing.sm,
    ...shadow,
  },
  progressText: { fontSize: 16, fontFamily: fonts.bold, color: colors.ink },
  progressTrack: {
    height: 10,
    borderRadius: radii.pill,
    backgroundColor: colors.background,
    overflow: "hidden",
  },
  progressFill: { height: "100%", backgroundColor: colors.primary, borderRadius: radii.pill },
  completeText: { fontSize: 13, fontFamily: fonts.semibold, color: colors.primary },
  scanButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: colors.primary,
    borderRadius: radii.pill,
    paddingVertical: 12,
    marginTop: spacing.xs,
  },
  scanButtonText: { color: "#fff", fontSize: 15, fontFamily: fonts.semibold },
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    gap: spacing.md,
  },
  checkCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: colors.muted,
    alignItems: "center",
    justifyContent: "center",
  },
  checkCircleDone: { backgroundColor: colors.primary, borderColor: colors.primary },
  rowDetails: { flex: 1, gap: 2 },
  rowName: { fontSize: 15, fontFamily: fonts.semibold, color: colors.ink },
  rowNameDone: { color: colors.muted, textDecorationLine: "line-through" },
  rowMeta: { fontSize: 12, fontFamily: fonts.regular, color: colors.muted },
});
