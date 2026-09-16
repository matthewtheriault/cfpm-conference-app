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
  Linking,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { colors, spacing, radii, fonts } from "../attendeeTheme";
import { useAccess } from "../context/AccessContext";

const REGISTRATION_URL = "https://www.podiatryinfocanada.ca/CFPM-Annual-Conference-2026";

export default function ConferenceCodeScreen() {
  const { submitCode } = useAccess();
  const navigation = useNavigation<any>();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!code.trim()) return;
    setSubmitting(true);
    setError(null);
    const isValid = await submitCode(code);
    setSubmitting(false);
    if (!isValid) {
      setError("That code isn't right. Check your conference materials and try again.");
    }
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
        <Text style={styles.heading}>Welcome</Text>
        <Text style={styles.subheading}>
          Enter your conference code to access the CFPM Conference app.
        </Text>

        <TextInput
          value={code}
          onChangeText={(text) => {
            setCode(text);
            if (error) setError(null);
          }}
          placeholder="Conference code"
          placeholderTextColor={colors.muted}
          autoCapitalize="characters"
          autoCorrect={false}
          style={styles.input}
          onSubmitEditing={handleSubmit}
          returnKeyType="go"
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Pressable
          style={[styles.button, submitting && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          <Text style={styles.buttonText}>{submitting ? "Checking..." : "Enter"}</Text>
        </Pressable>

        <Pressable
          onPress={() => Linking.openURL(REGISTRATION_URL)}
          style={styles.registerLink}
        >
          <Text style={styles.registerLinkText}>Don't have a code? Register for the conference</Text>
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
    width: 140,
    height: 140,
    alignSelf: "center",
    marginBottom: spacing.lg,
  },
  heading: {
    fontSize: 28,
    fontFamily: fonts.bold,
    color: colors.ink,
    textAlign: "center",
  },
  subheading: {
    fontSize: 15,
    fontFamily: fonts.regular,
    color: colors.muted,
    textAlign: "center",
    marginBottom: spacing.lg,
  },
  input: {
    borderWidth: 0,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    fontSize: 16,
    fontFamily: fonts.regular,
    color: colors.ink,
    backgroundColor: colors.card,
    textAlign: "center",
    letterSpacing: 1,
  },
  error: {
    color: colors.primary,
    fontSize: 13,
    fontFamily: fonts.regular,
    textAlign: "center",
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: radii.md,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: spacing.sm,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: "#fff", fontSize: 16, fontFamily: fonts.semibold },
  registerLink: { marginTop: spacing.lg, alignItems: "center" },
  registerLinkText: {
    color: colors.primary,
    fontSize: 14,
    fontFamily: fonts.semibold,
    textDecorationLine: "underline",
  },
  adminLink: { marginTop: spacing.sm, alignItems: "center" },
  adminLinkText: {
    color: colors.muted,
    fontSize: 13,
    fontFamily: fonts.regular,
    textDecorationLine: "underline",
  },
});
