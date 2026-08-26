import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { useRoute } from "@react-navigation/native";
import { SocialLinks } from "../components/SocialLinks";
import { colors, spacing, radii } from "../theme";
import type { Speaker } from "../types";

export default function SpeakerDetailScreen() {
  const route = useRoute<any>();
  const speaker = route.params.speaker as Speaker;

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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, alignItems: "center" },
  photo: { width: 120, height: 120, borderRadius: radii.pill, marginBottom: spacing.md },
  photoFallback: { backgroundColor: colors.primary, alignItems: "center", justifyContent: "center" },
  photoFallbackText: { color: "#fff", fontSize: 40, fontWeight: "700" },
  name: { fontSize: 22, fontWeight: "800", color: colors.ink, textAlign: "center" },
  subtitle: { fontSize: 15, color: colors.muted, textAlign: "center", marginTop: 2 },
  meta: { fontSize: 13, color: colors.muted, textAlign: "center" },
  bio: {
    fontSize: 15,
    color: colors.ink,
    lineHeight: 22,
    marginTop: spacing.lg,
    alignSelf: "stretch",
  },
});
