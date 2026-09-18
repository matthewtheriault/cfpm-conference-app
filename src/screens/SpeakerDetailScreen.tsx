import React, { useMemo } from "react";
import { View, Text, ScrollView, Pressable, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { orderBy } from "firebase/firestore";
import { useFirestoreCollection } from "../hooks/useFirestoreCollection";
import { SocialLinks } from "../components/SocialLinks";
import { colors, spacing, radii, fonts } from "../attendeeTheme";
import type { ScheduleItem, Speaker } from "../types";

export default function SpeakerDetailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const speaker = route.params.speaker as Speaker;

  const { data: schedule } = useFirestoreCollection<ScheduleItem>("schedule", [
    orderBy("order", "asc"),
  ]);
  const sessions = useMemo(() => {
    const nameLower = speaker.name.trim().toLowerCase();
    return schedule.filter(
      (item) =>
        item.speakerIds?.includes(speaker.id) ||
        (nameLower && item.speaker?.toLowerCase().includes(nameLower))
    );
  }, [schedule, speaker.id, speaker.name]);

  const goToSession = (item: ScheduleItem) => {
    navigation.getParent()?.navigate("Schedule", {
      screen: "LectureDetail",
      params: { item },
      initial: false,
    });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {speaker.photoUrl ? (
        <Image source={{ uri: speaker.photoUrl }} style={styles.photo} contentFit="cover" />
      ) : (
        <View style={[styles.photo, styles.photoFallback]}>
          <Text style={styles.photoFallbackText}>{speaker.name.charAt(0)}</Text>
        </View>
      )}
      <Text style={styles.name}>{speaker.name}</Text>
      {speaker.title ? <Text style={styles.subtitle}>{speaker.title}</Text> : null}
      {speaker.organization ? <Text style={styles.meta}>{speaker.organization}</Text> : null}
      <SocialLinks
        instagramUrl={speaker.instagramUrl}
        linkedinUrl={speaker.linkedinUrl}
        facebookUrl={speaker.facebookUrl}
        xUrl={speaker.xUrl}
        tiktokUrl={speaker.tiktokUrl}
        email={speaker.email}
        phone={speaker.phone}
      />
      {speaker.bio ? <Text style={styles.bio}>{speaker.bio}</Text> : null}

      {sessions.length > 0 ? (
        <View style={styles.sessionsSection}>
          <Text style={styles.sessionsTitle}>Sessions</Text>
          {sessions.map((item) => (
            <Pressable key={item.id} style={styles.sessionCard} onPress={() => goToSession(item)}>
              <View style={styles.sessionTimeColumn}>
                <Text style={styles.sessionTime}>{item.startTime}</Text>
                {item.endTime ? <Text style={styles.sessionTimeMuted}>{item.endTime}</Text> : null}
              </View>
              <View style={styles.sessionInfo}>
                <Text style={styles.sessionTitle}>{item.title}</Text>
                <Text style={styles.sessionMeta}>
                  {item.day}
                  {item.location ? ` · ${item.location}` : ""}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.muted} />
            </Pressable>
          ))}
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, alignItems: "center" },
  photo: { width: 120, height: 120, borderRadius: radii.pill, marginBottom: spacing.md },
  photoFallback: { backgroundColor: colors.primary, alignItems: "center", justifyContent: "center" },
  photoFallbackText: { color: "#fff", fontSize: 40, fontFamily: fonts.semibold },
  name: { fontSize: 22, fontFamily: fonts.bold, color: colors.ink, textAlign: "center" },
  subtitle: { fontSize: 15, color: colors.muted, textAlign: "center", marginTop: 2 },
  meta: { fontSize: 13, color: colors.muted, textAlign: "center" },
  bio: {
    fontSize: 15,
    color: colors.ink,
    lineHeight: 22,
    marginTop: spacing.lg,
    alignSelf: "stretch",
  },
  sessionsSection: { alignSelf: "stretch", marginTop: spacing.lg, gap: spacing.sm },
  sessionsTitle: {
    fontSize: 13,
    fontFamily: fonts.semibold,
    color: colors.primary,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  sessionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: radii.md,
    padding: spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  sessionTimeColumn: { width: 72 },
  sessionTime: { fontSize: 13, fontFamily: fonts.semibold, color: colors.ink },
  sessionTimeMuted: { fontSize: 12, color: colors.muted },
  sessionInfo: { flex: 1, gap: 2 },
  sessionTitle: { fontSize: 15, fontFamily: fonts.semibold, color: colors.ink },
  sessionMeta: { fontSize: 13, color: colors.muted },
});
