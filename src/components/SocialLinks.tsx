import React from "react";
import { View, Text, Pressable, Linking, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, radii } from "../theme";

type Props = {
  instagramUrl?: string;
  linkedinUrl?: string;
  facebookUrl?: string;
  xUrl?: string;
  tiktokUrl?: string;
  email?: string;
  phone?: string;
};

type SocialKey = "instagramUrl" | "linkedinUrl" | "facebookUrl" | "xUrl" | "tiktokUrl";

const ICONS: { key: SocialKey; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: "instagramUrl", icon: "logo-instagram" },
  { key: "linkedinUrl", icon: "logo-linkedin" },
  { key: "facebookUrl", icon: "logo-facebook" },
  { key: "xUrl", icon: "logo-twitter" },
  { key: "tiktokUrl", icon: "logo-tiktok" },
];

export function SocialLinks({ email, phone, ...socials }: Props) {
  const activeSocials = ICONS.filter(({ key }) => socials[key]);

  if (activeSocials.length === 0 && !email && !phone) return null;

  return (
    <View style={styles.container}>
      {activeSocials.length > 0 ? (
        <View style={styles.iconRow}>
          {activeSocials.map(({ key, icon }) => (
            <Pressable
              key={key}
              style={styles.iconButton}
              hitSlop={8}
              onPress={() => Linking.openURL(socials[key]!)}
            >
              <Ionicons name={icon} size={22} color={colors.primary} />
            </Pressable>
          ))}
        </View>
      ) : null}
      {email ? (
        <Pressable style={styles.contactRow} onPress={() => Linking.openURL(`mailto:${email}`)}>
          <Ionicons name="mail-outline" size={16} color={colors.muted} />
          <Text style={styles.contactText}>{email}</Text>
        </Pressable>
      ) : null}
      {phone ? (
        <Pressable style={styles.contactRow} onPress={() => Linking.openURL(`tel:${phone}`)}>
          <Ionicons name="call-outline" size={16} color={colors.muted} />
          <Text style={styles.contactText}>{phone}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: "center", gap: spacing.xs, marginTop: spacing.sm },
  iconRow: { flexDirection: "row", gap: spacing.sm },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  contactRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  contactText: { fontSize: 13, color: colors.primary, fontWeight: "600" },
});
