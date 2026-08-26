import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Image,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { colors, spacing, radii } from "../theme";
import { useUserProfile } from "../context/UserProfileContext";

export default function NameEntryScreen() {
  const { saveProfile } = useUserProfile();
  const navigation = useNavigation<any>();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = firstName.trim().length > 0 && lastName.trim().length > 0;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    await saveProfile(firstName, lastName);
    setSubmitting(false);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.content}>
        <Image
          source={require("../../assets/branding/cfpm-logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.heading}>Welcome!</Text>
        <Text style={styles.subheading}>
          Let us know who's joining us — this personalizes your app, it's not an account or
          password.
        </Text>

        <TextInput
          value={firstName}
          onChangeText={setFirstName}
          placeholder="First name"
          placeholderTextColor={colors.muted}
          autoCapitalize="words"
          autoCorrect={false}
          style={styles.input}
          returnKeyType="next"
        />
        <TextInput
          value={lastName}
          onChangeText={setLastName}
          placeholder="Last name"
          placeholderTextColor={colors.muted}
          autoCapitalize="words"
          autoCorrect={false}
          style={styles.input}
          onSubmitEditing={handleSubmit}
          returnKeyType="go"
        />

        <Pressable
          style={[styles.button, (!canSubmit || submitting) && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={!canSubmit || submitting}
        >
          <Text style={styles.buttonText}>{submitting ? "Saving..." : "Continue"}</Text>
        </Pressable>

        <Pressable onPress={() => navigation.navigate("AdminLogin")} style={styles.adminLink}>
          <Text style={styles.adminLinkText}>Conference organizer? Admin sign in</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
  },
  logo: {
    width: 120,
    height: 120,
    alignSelf: "center",
    marginBottom: spacing.lg,
  },
  heading: {
    fontSize: 26,
    fontWeight: "800",
    color: colors.ink,
    textAlign: "center",
  },
  subheading: {
    fontSize: 15,
    color: colors.muted,
    textAlign: "center",
    marginBottom: spacing.lg,
    lineHeight: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    fontSize: 16,
    color: colors.ink,
    backgroundColor: colors.card,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: radii.md,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: spacing.md,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  adminLink: { marginTop: spacing.lg, alignItems: "center" },
  adminLinkText: { color: colors.muted, fontSize: 13, textDecorationLine: "underline" },
});
