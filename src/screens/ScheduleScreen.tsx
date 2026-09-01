import React, { useEffect, useMemo, useState } from "react";
import { View, Text, FlatList, Pressable, StyleSheet, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { doc, getDoc, orderBy } from "firebase/firestore";
import { db, firebaseConfigured } from "../firebase";
import { useFirestoreCollection } from "../hooks/useFirestoreCollection";
import { useBookmarks } from "../context/BookmarksContext";
import { useCheckins } from "../context/CheckinsContext";
import { EmptyState } from "../components/EmptyState";
import { getTrackColor } from "../trackColors";
import { colors, spacing, radii } from "../theme";
import type { ScheduleItem, ScheduleOverview } from "../types";

export default function ScheduleScreen() {
  const navigation = useNavigation<any>();
  const { data, loading, error } = useFirestoreCollection<ScheduleItem>("schedule", [
    orderBy("order", "asc"),
  ]);
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const { isCheckedIn } = useCheckins();
  const [view, setView] = useState<"full" | "mine">("full");
  const [selectedTrack, setSelectedTrack] = useState<string | null>(null);

  const [overviewImageUrl, setOverviewImageUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!firebaseConfigured) return;
    getDoc(doc(db, "scheduleOverview", "main")).then((snap) => {
      const data = snap.data() as ScheduleOverview | undefined;
      setOverviewImageUrl(data?.imageUrl ?? null);
    });
  }, []);

  const days = useMemo(() => {
    const seen = new Set<string>();
    const ordered: string[] = [];
    for (const item of data) {
      if (!seen.has(item.day)) {
        seen.add(item.day);
        ordered.push(item.day);
      }
    }
    return ordered;
  }, [data]);

  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  useEffect(() => {
    if (days.length > 0 && (!selectedDay || !days.includes(selectedDay))) {
      setSelectedDay(days[0]);
    }
  }, [days, selectedDay]);

  const tracks = useMemo(() => {
    const seen = new Set<string>();
    for (const item of data) {
      if (item.track) seen.add(item.track);
    }
    return Array.from(seen);
  }, [data]);

  const myScheduleItems = useMemo(
    () => data.filter((item) => isBookmarked(item.id)),
    [data, isBookmarked]
  );

  const itemsForDay = useMemo(() => {
    const base = view === "mine" ? myScheduleItems : data.filter((item) => item.day === selectedDay);
    return selectedTrack ? base.filter((item) => item.track === selectedTrack) : base;
  }, [data, myScheduleItems, view, selectedDay, selectedTrack]);

  const imageBanner = overviewImageUrl ? (
    <Pressable
      style={styles.imageBanner}
      onPress={() => navigation.navigate("ScheduleImage", { imageUrl: overviewImageUrl })}
    >
      <Ionicons name="image-outline" size={18} color={colors.primary} />
      <Text style={styles.imageBannerText}>View full schedule image</Text>
      <Ionicons name="chevron-forward" size={16} color={colors.primary} />
    </Pressable>
  ) : null;

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (days.length === 0) {
    return (
      <View style={styles.container}>
        {imageBanner}
        <EmptyState
          icon={error ? "cloud-offline-outline" : "calendar-outline"}
          title={error ? "Couldn't load the schedule" : "Schedule coming soon"}
          message={
            error
              ? "Check your connection and try again."
              : "The conference schedule hasn't been published yet. Check back closer to the event."
          }
          tone={error ? "error" : "empty"}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {imageBanner}

      <View style={styles.segmentRow}>
        {(["full", "mine"] as const).map((key) => {
          const active = view === key;
          return (
            <Pressable
              key={key}
              style={[styles.segment, active && styles.segmentActive]}
              onPress={() => setView(key)}
            >
              <Text style={[styles.segmentText, active && styles.segmentTextActive]}>
                {key === "full" ? "Full Schedule" : "My Schedule"}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {view === "full" ? (
        <View style={styles.dayTabs}>
          {days.map((day) => {
            const active = day === selectedDay;
            return (
              <Pressable
                key={day}
                style={[styles.dayTab, active && styles.dayTabActive]}
                onPress={() => setSelectedDay(day)}
              >
                <Text style={[styles.dayTabText, active && styles.dayTabTextActive]}>{day}</Text>
              </Pressable>
            );
          })}
        </View>
      ) : null}

      {tracks.length > 0 ? (
        <View style={styles.trackTabs}>
          <Pressable
            style={[styles.trackChip, !selectedTrack && styles.trackChipActive]}
            onPress={() => setSelectedTrack(null)}
          >
            <Text style={[styles.trackChipText, !selectedTrack && styles.trackChipTextActive]}>All tracks</Text>
          </Pressable>
          {tracks.map((track) => {
            const active = track === selectedTrack;
            const tc = getTrackColor(track, active);
            return (
              <Pressable
                key={track}
                style={[styles.trackChip, { backgroundColor: tc.bg, borderColor: tc.border }]}
                onPress={() => setSelectedTrack(active ? null : track)}
              >
                <Text style={[styles.trackChipText, { color: tc.text }]}>{track}</Text>
              </Pressable>
            );
          })}
        </View>
      ) : null}

      {view === "mine" && itemsForDay.length === 0 ? (
        <EmptyState
          icon="star-outline"
          title="No bookmarked sessions"
          message="Tap the star on any session to add it to My Schedule."
        />
      ) : (
      <FlatList
        data={itemsForDay}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Pressable style={styles.card} onPress={() => navigation.navigate("LectureDetail", { item })}>
            <View style={styles.timeColumn}>
              <Text style={styles.time}>{item.startTime}</Text>
              {item.endTime ? <Text style={styles.timeMuted}>{item.endTime}</Text> : null}
            </View>
            <View style={styles.details}>
              <Text style={styles.title}>{item.title}</Text>
              {item.speaker ? <Text style={styles.subtitle}>{item.speaker}</Text> : null}
              {item.location ? <Text style={styles.meta}>{item.location}</Text> : null}
            </View>
            {isCheckedIn(item.id) ? (
              <Ionicons name="checkmark-circle" size={18} color={colors.primary} />
            ) : null}
            <Pressable hitSlop={12} onPress={() => toggleBookmark(item.id)}>
              <Ionicons
                name={isBookmarked(item.id) ? "star" : "star-outline"}
                size={22}
                color={isBookmarked(item.id) ? colors.warning : colors.muted}
              />
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
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  imageBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    backgroundColor: colors.card,
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    paddingVertical: 10,
    paddingHorizontal: spacing.md,
    borderRadius: radii.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  imageBannerText: { flex: 1, fontSize: 14, fontWeight: "600", color: colors.primary },
  segmentRow: {
    flexDirection: "row",
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    backgroundColor: colors.card,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 3,
  },
  segment: { flex: 1, paddingVertical: 8, borderRadius: radii.pill, alignItems: "center" },
  segmentActive: { backgroundColor: colors.primary },
  segmentText: { fontSize: 13, fontWeight: "700", color: colors.ink },
  segmentTextActive: { color: "#fff" },
  trackTabs: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.xs,
  },
  trackChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  trackChipActive: { backgroundColor: colors.ink, borderColor: colors.ink },
  trackChipText: { fontSize: 12, fontWeight: "600", color: colors.ink },
  trackChipTextActive: { color: "#fff" },
  dayTabs: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.xs,
  },
  dayTab: {
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  dayTabActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  dayTabText: { fontSize: 13, fontWeight: "700", color: colors.ink },
  dayTabTextActive: { color: "#fff" },
  list: { padding: spacing.md, paddingTop: 0, gap: spacing.sm },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  timeColumn: { width: 72 },
  time: { fontSize: 13, fontWeight: "700", color: colors.ink },
  timeMuted: { fontSize: 12, color: colors.muted },
  details: { flex: 1, gap: 2 },
  title: { fontSize: 15, fontWeight: "600", color: colors.ink },
  subtitle: { fontSize: 13, color: colors.muted },
  meta: { fontSize: 12, color: colors.muted },
});
