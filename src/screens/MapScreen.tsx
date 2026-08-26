import React, { useEffect, useState } from "react";
import { View, ScrollView, Pressable, Linking, useWindowDimensions, ActivityIndicator, StyleSheet, Text } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { doc, getDoc } from "firebase/firestore";
import { db, firebaseConfigured } from "../firebase";
import { EmptyState } from "../components/EmptyState";
import { colors, spacing, radii } from "../theme";
import type { VenueMap } from "../types";

const MAP_TABS: { key: "venue" | "exhibitHall"; label: string }[] = [
  { key: "venue", label: "Venue" },
  { key: "exhibitHall", label: "Exhibit Hall" },
];

export default function MapScreen() {
  const { width } = useWindowDimensions();
  const [selected, setSelected] = useState<"venue" | "exhibitHall">("venue");
  const [maps, setMaps] = useState<Record<string, VenueMap | null>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!firebaseConfigured) {
      setLoading(false);
      return;
    }
    Promise.all([
      getDoc(doc(db, "map", "venue")),
      getDoc(doc(db, "map", "exhibitHall")),
    ]).then(([venueSnap, hallSnap]) => {
      setMaps({
        venue: venueSnap.exists() ? (venueSnap.data() as VenueMap) : null,
        exhibitHall: hallSnap.exists() ? (hallSnap.data() as VenueMap) : null,
      });
      setLoading(false);
    });
  }, []);

  const map = maps[selected];

  return (
    <View style={styles.container}>
      <View style={styles.tabRow}>
        {MAP_TABS.map((tab) => {
          const active = tab.key === selected;
          return (
            <Pressable
              key={tab.key}
              style={[styles.tab, active && styles.tabActive]}
              onPress={() => setSelected(tab.key)}
            >
              <Text style={[styles.tabText, active && styles.tabTextActive]}>{tab.label}</Text>
            </Pressable>
          );
        })}
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : !map?.imageUrl ? (
        <EmptyState
          icon="map-outline"
          title={`${selected === "venue" ? "Venue" : "Exhibit hall"} map coming soon`}
          message="This floor plan will appear here once it's uploaded."
        />
      ) : (
        <ScrollView
          contentContainerStyle={styles.zoomContent}
          minimumZoomScale={1}
          maximumZoomScale={4}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
        >
          <Image
            source={{ uri: map.imageUrl }}
            style={{ width, height: width }}
            contentFit="contain"
          />
          {map.notes ? <Text style={styles.notes}>{map.notes}</Text> : null}
          {map.address ? (
            <Pressable
              style={styles.directionsButton}
              onPress={() =>
                Linking.openURL(
                  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(map.address!)}`
                )
              }
            >
              <Ionicons name="navigate-outline" size={18} color="#fff" />
              <Text style={styles.directionsButtonText}>Get Directions</Text>
            </Pressable>
          ) : null}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  tabRow: {
    flexDirection: "row",
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    alignItems: "center",
  },
  tabActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  tabText: { fontSize: 13, fontWeight: "700", color: colors.ink },
  tabTextActive: { color: "#fff" },
  zoomContent: { alignItems: "center", paddingBottom: spacing.lg },
  notes: {
    fontSize: 13,
    color: colors.muted,
    textAlign: "center",
    paddingHorizontal: spacing.lg,
    marginTop: spacing.sm,
  },
  directionsButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    backgroundColor: colors.primary,
    borderRadius: radii.pill,
    paddingVertical: 12,
    paddingHorizontal: spacing.xl,
    marginTop: spacing.md,
  },
  directionsButtonText: { color: "#fff", fontWeight: "700", fontSize: 14 },
});
