import React, { useEffect, useRef } from "react";
import { View, ScrollView, Pressable, Linking, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { orderBy } from "firebase/firestore";
import { useFirestoreCollection } from "../hooks/useFirestoreCollection";
import { colors, spacing, radii } from "../theme";
import type { Sponsor } from "../types";

const LOGO_WIDTH = 120;
const SCROLL_INTERVAL_MS = 2500;

export function SponsorBanner() {
  const { data } = useFirestoreCollection<Sponsor>("sponsors", [orderBy("order", "asc")]);
  const withLogos = data.filter((s) => s.logoUrl);
  const scrollRef = useRef<ScrollView>(null);
  const offsetRef = useRef(0);

  useEffect(() => {
    if (withLogos.length < 2) return;
    const contentWidth = withLogos.length * LOGO_WIDTH;
    const interval = setInterval(() => {
      offsetRef.current += LOGO_WIDTH;
      if (offsetRef.current >= contentWidth) {
        offsetRef.current = 0;
      }
      scrollRef.current?.scrollTo({ x: offsetRef.current, animated: true });
    }, SCROLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [withLogos.length]);

  if (withLogos.length === 0) return null;

  return (
    <ScrollView
      ref={scrollRef}
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.container}
      contentContainerStyle={styles.content}
      scrollEnabled={false}
    >
      {withLogos.map((sponsor) => (
        <Pressable
          key={sponsor.id}
          disabled={!sponsor.website}
          onPress={() => sponsor.website && Linking.openURL(sponsor.website)}
          style={styles.logoWrap}
        >
          <Image source={{ uri: sponsor.logoUrl }} style={styles.logo} contentFit="contain" />
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { width: "100%", marginBottom: spacing.md },
  content: { alignItems: "center", paddingHorizontal: spacing.xs },
  logoWrap: {
    width: LOGO_WIDTH,
    height: 60,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.card,
    borderRadius: radii.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    marginHorizontal: spacing.xs / 2,
  },
  logo: { width: "80%", height: "70%" },
});
