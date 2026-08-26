import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { colors, spacing, radii } from "../theme";
import { useAdminAuth } from "../context/AdminAuthContext";
import { firebaseConfigured } from "../firebase";

export default function AdminLoginScreen() {
  const { signIn } = useAdminAuth();
  const navigation = useNavigation<any>();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSignIn = async () => {
    if (!email || !password) return;
    setSubmitting(true);
    setError(null);
    try {
      await signIn(email.trim(), password);
      navigation.replace("AdminDashboard");
    } catch (err: any) {
      setError("Sign in failed. Check your email and password and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.content}>
        <Text style={styles.heading}>Admin Sign In</Text>
        <Text style={styles.subheading}>
          Sign in with your organizer account to manage push notifications.
        </Text>

        {!firebaseConfigured ? (
          <Text style={styles.warning}>
            Firebase isn't configured yet. Add your Firebase project keys to a .env file
            (see .env.example) before admin sign-in will work.
          </Text>
        ) : null}

        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="Email"
          placeholderTextColor={colors.muted}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          style={styles.input}
        />
        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="Password"
          placeholderTextColor={colors.muted}
          secureTextEntry
          style={styles.input}
          onSubmitEditing={handleSignIn}
          returnKeyType="go"
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Pressable
          style={[styles.button, submitting && styles.buttonDisabled]}
          onPress={handleSignIn}
          disabled={submitting || !firebaseConfigured}
        >
          <Text style={styles.buttonText}>{submitting ? "Signing in..." : "Sign In"}</Text>
        </Pressable>

        <Pressable onPress={() => navigation.goBack()} style={styles.backLink}>
          <Text style={styles.backLinkText}>Back</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { flex: 1, justifyContent: "center", paddingHorizontal: spacing.xl, gap: spacing.sm },
  heading: { fontSize: 24, fontWeight: "800", color: colors.ink, textAlign: "center" },
  subheading: { fontSize: 14, color: colors.muted, textAlign: "center", marginBottom: spacing.lg },
  warning: {
    fontSize: 12,
    color: colors.warning,
    textAlign: "center",
    marginBottom: spacing.md,
    lineHeight: 18,
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
  error: { color: colors.primary, fontSize: 13, textAlign: "center" },
  button: {
    backgroundColor: colors.ink,
    borderRadius: radii.md,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: spacing.sm,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  backLink: { marginTop: spacing.lg, alignItems: "center" },
  backLinkText: { color: colors.muted, fontSize: 13 },
});
