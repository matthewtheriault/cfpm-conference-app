import React, { useCallback, useMemo, useRef, useState } from "react";
import { View, Text, Image, Pressable, StyleSheet, ActivityIndicator, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { orderBy } from "firebase/firestore";
import ViewShot from "react-native-view-shot";
import * as Sharing from "expo-sharing";
import { useFirestoreCollection } from "../hooks/useFirestoreCollection";
import { useUserProfile } from "../context/UserProfileContext";
import { hasAnsweredPoll } from "../pollAnswered";
import { EmptyState } from "../components/EmptyState";
import { colors, spacing, radii, fonts, certificateFonts, shadow } from "../attendeeTheme";
import type { Poll } from "../types";

// This conference's fixed details - update these each year rather than
// building a settings UI for something edited once annually.
const CONFERENCE_LINE_1 = "The Canadian Federation of Podiatric Medicine";
const CONFERENCE_LINE_2 = "Annual Conference, November 6th–7th, 2026";
const CREDITS_LINE = "18.0 continuing education credits";
const SIGNATURE_NAME = "Stephanie Playford";
const SIGNATURE_TITLE = "President";
const SIGNATURE_SUBTITLE = "Stephanie Playford D.Ch.";

export default function CertificateScreen() {
  const navigation = useNavigation<any>();
  const { firstName, lastName } = useUserProfile();
  const { data: polls, loading } = useFirestoreCollection<Poll>("polls", [orderBy("createdAt", "desc")]);
  const surveys = useMemo(() => polls.filter((p) => p.kind === "postConferenceSurvey"), [polls]);

  const [checkingAnswers, setCheckingAnswers] = useState(true);
  const [eligible, setEligible] = useState(false);
  const shotRef = useRef<React.ElementRef<typeof ViewShot>>(null);

  useFocusEffect(
    useCallback(() => {
      if (loading) return;
      if (surveys.length === 0) {
        setCheckingAnswers(false);
        setEligible(false);
        return;
      }
      let cancelled = false;
      setCheckingAnswers(true);
      Promise.all(surveys.map((s) => hasAnsweredPoll(s.id))).then((results) => {
        if (!cancelled) {
          setEligible(results.every(Boolean));
          setCheckingAnswers(false);
        }
      });
      return () => {
        cancelled = true;
      };
    }, [loading, surveys])
  );

  const handleShare = async () => {
    const uri = await shotRef.current?.capture?.();
    if (!uri) return;
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri, { mimeType: "image/png", dialogTitle: "Save your certificate" });
    }
  };

  if (loading || checkingAnswers) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (surveys.length === 0) {
    return (
      <EmptyState
        icon="ribbon-outline"
        title="Certificate not available yet"
        message="Your continuing education certificate will unlock here once the conference survey opens."
        tone="empty"
      />
    );
  }

  if (!eligible) {
    return (
      <View style={styles.lockedContainer}>
        <Ionicons name="lock-closed-outline" size={48} color={colors.muted} />
        <Text style={styles.lockedTitle}>Complete the survey to unlock your certificate</Text>
        <Text style={styles.lockedBody}>
          Your continuing education credits are issued after you complete the conference survey.
        </Text>
        <Pressable
          style={styles.surveyButton}
          onPress={() => navigation.navigate("PollDetail", { poll: surveys[0] })}
        >
          <Text style={styles.surveyButtonText}>Go to Survey</Text>
        </Pressable>
      </View>
    );
  }

  const fullName = `${firstName} ${lastName}`.trim();

  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <ViewShot ref={shotRef} options={{ format: "png", quality: 1 }}>
        <View style={styles.certificate}>
          <View style={styles.watermarkBlobA} />
          <View style={styles.watermarkBlobB} />

          <Text style={styles.name}>{fullName || "Attendee"}</Text>
          <Text style={styles.certTitle}>CERTIFICATE</Text>
          <Text style={styles.certSubtitle}>OF COMPLETION</Text>

          <View style={styles.body}>
            <Text style={styles.conferenceLine}>{CONFERENCE_LINE_1}</Text>
            <Text style={styles.conferenceLine}>{CONFERENCE_LINE_2}</Text>
          </View>

          <Text style={styles.credits}>{CREDITS_LINE}</Text>

          <View style={styles.footer}>
            <View>
              <Text style={styles.signatureName}>{SIGNATURE_NAME}</Text>
              <View style={styles.signatureLine} />
              <Text style={styles.signatureTitle}>{SIGNATURE_TITLE}</Text>
              <Text style={styles.signatureSubtitle}>{SIGNATURE_SUBTITLE}</Text>
            </View>
            <Image
              source={require("../../assets/branding/cfpm-logo.png")}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
        </View>
      </ViewShot>

      <Pressable style={styles.shareButton} onPress={handleShare}>
        <Ionicons name="share-outline" size={20} color="#fff" />
        <Text style={styles.shareButtonText}>Save or Share</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  lockedContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
    gap: spacing.sm,
  },
  lockedTitle: {
    fontSize: 18,
    fontFamily: fonts.bold,
    color: colors.ink,
    textAlign: "center",
    marginTop: spacing.sm,
  },
  lockedBody: { fontSize: 14, fontFamily: fonts.regular, color: colors.muted, textAlign: "center" },
  surveyButton: {
    backgroundColor: colors.primary,
    borderRadius: radii.pill,
    paddingVertical: 14,
    paddingHorizontal: spacing.xl,
    marginTop: spacing.md,
  },
  surveyButtonText: { color: "#fff", fontSize: 16, fontFamily: fonts.semibold },
  scrollContent: { padding: spacing.md, gap: spacing.md },
  certificate: {
    backgroundColor: "#fff",
    borderRadius: radii.lg,
    padding: spacing.xl,
    alignItems: "center",
    overflow: "hidden",
    ...shadow,
  },
  watermarkBlobA: {
    position: "absolute",
    width: 220,
    height: 160,
    borderRadius: 100,
    backgroundColor: "#EE3A43",
    opacity: 0.06,
    left: -60,
    bottom: 60,
    transform: [{ rotate: "-12deg" }],
  },
  watermarkBlobB: {
    position: "absolute",
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "#EE3A43",
    opacity: 0.05,
    right: -50,
    bottom: -20,
  },
  name: {
    fontSize: 26,
    fontFamily: certificateFonts.nameScript,
    color: colors.primary,
    textAlign: "center",
  },
  certTitle: {
    fontSize: 32,
    fontFamily: certificateFonts.bold,
    color: "#1A1712",
    marginTop: spacing.sm,
    letterSpacing: 1,
  },
  certSubtitle: {
    fontSize: 14,
    fontFamily: certificateFonts.regular,
    color: colors.primary,
    letterSpacing: 3,
    marginTop: 2,
  },
  body: { marginTop: spacing.lg, alignItems: "center", gap: 4 },
  conferenceLine: {
    fontSize: 16,
    fontFamily: certificateFonts.regular,
    color: "#1A1712",
    textAlign: "center",
  },
  credits: {
    fontSize: 15,
    fontFamily: certificateFonts.regular,
    color: "#1A1712",
    marginTop: spacing.xl,
  },
  footer: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    width: "100%",
    marginTop: spacing.xl,
  },
  signatureName: { fontSize: 16, fontFamily: certificateFonts.nameScript, color: "#1A1712" },
  signatureLine: { width: 120, height: 1, backgroundColor: colors.muted, marginTop: 2, marginBottom: 4 },
  signatureTitle: { fontSize: 12, fontFamily: certificateFonts.regular, color: "#1A1712" },
  signatureSubtitle: { fontSize: 11, fontFamily: certificateFonts.regular, color: colors.muted },
  logo: { width: 64, height: 64 },
  shareButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: colors.primary,
    borderRadius: radii.pill,
    paddingVertical: 14,
  },
  shareButtonText: { color: "#fff", fontSize: 16, fontFamily: fonts.semibold },
});
