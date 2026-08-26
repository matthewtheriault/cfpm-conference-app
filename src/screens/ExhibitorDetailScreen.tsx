import React from "react";
import { View, Text, ScrollView, Pressable, Linking, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { useRoute } from "@react-navigation/native";
import { SocialLinks } from "../components/SocialLinks";
import { colors, spacing, radii } from "../theme";
import type { Exhibitor } from "../types";

export default function ExhibitorDetailScreen() {
  const route = useRoute<any>();
  const exhibitor = route.params.exhibitor as Exhibitor;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {exhibitor.logoUrl ? (
        <Image source={{ uri: exhibitor.logoUrl }} style={styles.logo} contentFit="contain" />
      ) : (
        <View style={[styles.logo, styles.logoFallback]}>
          <Text style={styles.logoFallbackText}>{exhibitor.name.charAt(0)}</Text>
        </View>
      )}
      <Text style={styles.name}>{exhibitor.name}</Text>
      {exhibitor.boothNumber ? <Text style={styles.subtitle}>Booth {exhibitor.boothNumber}</Text> : null}
      {exhibitor.category ? <Text style={styles.meta}>{exhibitor.category}</Text> : null}
      <SocialLinks
        instagramUrl={exhibitor.instagramUrl}
        linkedinUrl={exhibitor.linkedinUrl}
        facebookUrl={exhibitor.facebookUrl}
        xUrl={exhibitor.xUrl}
        tiktokUrl={exhibitor.tiktokUrl}
        email={exhibitor.email}
        phone={exhibitor.phone}
      />
      {exhibitor.bio ? <Text style={styles.bio}>{exhibitor.bio}</Text> : null}
      {exhibitor.website ? (
        <Pressable style={styles.linkButton} onPress={() => Linking.openURL(exhibitor.website!)}>
          <Text style={styles.linkButtonText}>Visit website</Text>
        </Pressable>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, alignItems: "center" },
  logo: { width: 120, height: 120, borderRadius: radii.md, marginBottom: spacing.md },
  logoFallback: { backgroundColor: colors.primary, alignItems: "center", justifyContent: "center" },
  logoFallbackText: { color: "#fff", fontSize: 40, fontWeight: "700" },
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
  linkButton: {
    backgroundColor: colors.primary,
    borderRadius: radii.md,
    paddingVertical: 12,
    paddingHorizontal: spacing.xl,
    marginTop: spacing.lg,
  },
  linkButtonText: { color: "#fff", fontWeight: "700" },
});
