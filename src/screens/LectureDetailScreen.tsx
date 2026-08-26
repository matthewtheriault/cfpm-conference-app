import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, Pressable, StyleSheet, useWindowDimensions } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { doc, getDoc } from "firebase/firestore";
import { db, firebaseConfigured } from "../firebase";
import { useBookmarks } from "../context/BookmarksContext";
import { useCheckins } from "../context/CheckinsContext";
import { colors, spacing, radii } from "../theme";
import type { ScheduleItem, Speaker } from "../types";

export default function LectureDetailScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { width } = useWindowDimensions();
  const item = route.params.item as ScheduleItem;
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const { isCheckedIn, toggleCheckin } = useCheckins();
  const bookmarked = isBookmarked(item.id);
  const checkedIn = isCheckedIn(item.id);

  const [speakerProfile, setSpeakerProfile] = useState<Speaker | null>(null);

  useEffect(() => {
    if (!item.speakerId || !firebaseConfigured) return;
    getDoc(doc(db, "speakers", item.speakerId)).then((snap) => {
      if (snap.exists()) {
        setSpeakerProfile({ id: snap.id, ...snap.data() } as Speaker);
      }
    });
  }, [item.speakerId]);

  const goToSpeaker = () => {
    if (!speakerProfile) return;
    navigation.getParent()?.navigate("More", {
      screen: "SpeakerDetail",
      params: { speaker: speakerProfile },
    });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.badgeRow}>
        <Text style={styles.day}>{item.day}</Text>
        {item.track ? (
          <View style={styles.trackBadge}>
            <Text style={styles.trackBadgeText}>{item.track}</Text>
          </View>
        ) : null}
      </View>
      <View style={styles.titleRow}>
        <Text style={styles.title}>{item.title}</Text>
        <Pressable hitSlop={12} onPress={() => toggleBookmark(item.id)}>
          <Ionicons
            name={bookmarked ? "star" : "star-outline"}
            size={26}
            color={bookmarked ? colors.warning : colors.muted}
          />
        </Pressable>
      </View>
      <Text style={styles.time}>
        {item.startTime}
        {item.endTime ? ` – ${item.endTime}` : ""}
      </Text>

      {speakerProfile ? (
        <Pressable style={styles.speakerCard} onPress={goToSpeaker}>
          {speakerProfile.photoUrl ? (
            <Image source={{ uri: speakerProfile.photoUrl }} style={styles.speakerPhoto} contentFit="cover" />
          ) : (
            <View style={[styles.speakerPhoto, styles.speakerPhotoFallback]}>
              <Text style={styles.speakerPhotoFallbackText}>{speakerProfile.name.charAt(0)}</Text>
            </View>
          )}
          <View style={styles.speakerInfo}>
            <Text style={styles.speakerName}>{speakerProfile.name}</Text>
            {speakerProfile.title ? <Text style={styles.speakerTitle}>{speakerProfile.title}</Text> : null}
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.muted} />
        </Pressable>
      ) : item.speaker ? (
        <Text style={styles.speaker}>{item.speaker}</Text>
      ) : null}

      {item.location ? (
        <View style={styles.locationRow}>
          <Ionicons name="location-outline" size={16} color={colors.muted} />
          <Text style={styles.location}>{item.location}</Text>
        </View>
      ) : null}
      {item.description ? <Text style={styles.description}>{item.description}</Text> : null}

      <Pressable
        style={[styles.checkinButton, checkedIn && styles.checkinButtonActive]}
        onPress={() => toggleCheckin(item.id)}
      >
        <Ionicons
          name={checkedIn ? "checkmark-circle" : "checkmark-circle-outline"}
          size={20}
          color={checkedIn ? "#fff" : colors.primary}
        />
        <Text style={[styles.checkinButtonText, checkedIn && styles.checkinButtonTextActive]}>
          {checkedIn ? "Checked in" : "Check in"}
        </Text>
      </Pressable>

      {item.media && item.media.length > 0 ? <MediaGallery media={item.media} width={width} /> : null}
    </ScrollView>
  );
}

function MediaGallery({ media, width }: { media: string[]; width: number }) {
  const [index, setIndex] = useState(0);

  return (
    <View style={styles.mediaSection}>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => {
          setIndex(Math.round(e.nativeEvent.contentOffset.x / width));
        }}
      >
        {media.map((url) => (
          <Image key={url} source={{ uri: url }} style={[styles.mediaImage, { width }]} contentFit="contain" />
        ))}
      </ScrollView>
      {media.length > 1 ? (
        <Text style={styles.mediaCounter}>
          {index + 1} / {media.length}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.xs },
  badgeRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  day: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.primary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  trackBadge: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  trackBadgeText: { fontSize: 11, fontWeight: "700", color: colors.ink },
  titleRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: spacing.sm },
  title: { flex: 1, fontSize: 22, fontWeight: "800", color: colors.ink },
  time: { fontSize: 15, fontWeight: "600", color: colors.ink, marginTop: spacing.xs },
  speaker: { fontSize: 15, color: colors.muted },
  speakerCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.card,
    borderRadius: radii.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    padding: spacing.sm,
    marginTop: spacing.xs,
  },
  speakerPhoto: { width: 44, height: 44, borderRadius: radii.pill },
  speakerPhotoFallback: { backgroundColor: colors.primary, alignItems: "center", justifyContent: "center" },
  speakerPhotoFallbackText: { color: "#fff", fontSize: 18, fontWeight: "700" },
  speakerInfo: { flex: 1, gap: 1 },
  speakerName: { fontSize: 15, fontWeight: "700", color: colors.ink },
  speakerTitle: { fontSize: 12, color: colors.muted },
  locationRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  location: { fontSize: 14, color: colors.muted },
  description: { fontSize: 15, color: colors.ink, lineHeight: 22, marginTop: spacing.md },
  checkinButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: radii.pill,
    paddingVertical: 10,
    marginTop: spacing.md,
  },
  checkinButtonActive: { backgroundColor: colors.primary },
  checkinButtonText: { color: colors.primary, fontWeight: "700", fontSize: 14 },
  checkinButtonTextActive: { color: "#fff" },
  mediaSection: { marginTop: spacing.lg, marginHorizontal: -spacing.lg },
  mediaImage: { height: 220, backgroundColor: colors.card },
  mediaCounter: { textAlign: "center", fontSize: 12, color: colors.muted, marginTop: spacing.xs },
});
