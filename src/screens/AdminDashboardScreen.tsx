import React, { useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet, ScrollView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { deleteDoc, doc, orderBy, limit } from "firebase/firestore";
import { db } from "../firebase";
import { showAlert } from "../alert";
import { useFirestoreCollection } from "../hooks/useFirestoreCollection";
import { useAdminAuth } from "../context/AdminAuthContext";
import { sendPushToAllDevices } from "../pushSend";
import { colors, spacing, radii } from "../theme";
import type { NotificationDoc } from "../types";

export default function AdminDashboardScreen() {
  const { user, isAdmin, isLoading, signOutAdmin } = useAdminAuth();
  const navigation = useNavigation<any>();

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { data: recent } = useFirestoreCollection<NotificationDoc>("notifications", [
    orderBy("sentAt", "desc"),
    limit(20),
  ]);

  if (!isLoading && (!user || !isAdmin)) {
    return (
      <View style={styles.center}>
        <Text style={styles.deniedTitle}>Admin access required</Text>
        <Text style={styles.deniedMessage}>
          This account doesn't have organizer permissions yet. See README.md for how to
          grant the admin custom claim to a Firebase user. If the claim was just granted,
          try signing out and back in.
        </Text>
        <Pressable style={styles.linkButton} onPress={() => navigation.goBack()}>
          <Text style={styles.linkButtonText}>Back</Text>
        </Pressable>
        {user ? (
          <Pressable
            style={styles.linkButton}
            onPress={async () => {
              await signOutAdmin();
              navigation.popToTop();
            }}
          >
            <Text style={styles.linkButtonText}>Sign out</Text>
          </Pressable>
        ) : null}
      </View>
    );
  }

  const handleDeleteNotification = (id: string, title: string) => {
    showAlert("Delete update", `Remove "${title}"? This also removes it from attendees' Updates tab.`, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => deleteDoc(doc(db, "notifications", id)) },
    ]);
  };

  const handleSend = async () => {
    if (!title.trim() || !body.trim()) {
      showAlert("Missing info", "Add a title and message before sending.");
      return;
    }
    setSubmitting(true);
    try {
      const recipientCount = await sendPushToAllDevices(
        title.trim(),
        body.trim(),
        user?.email ?? "admin"
      );
      setTitle("");
      setBody("");
      showAlert(
        "Notification sent",
        recipientCount > 0
          ? `Delivered to ${recipientCount} device${recipientCount === 1 ? "" : "s"}.`
          : "Sent, but no devices are registered yet — nothing was delivered."
      );
    } catch (err) {
      showAlert("Couldn't send", "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerRow}>
        <Text style={styles.heading}>Admin Dashboard</Text>
        <Pressable
          onPress={async () => {
            await signOutAdmin();
            navigation.popToTop();
          }}
        >
          <Text style={styles.signOut}>Sign out</Text>
        </Pressable>
      </View>
      <Text style={styles.subheading}>Signed in as {user?.email}</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Manage content</Text>
        <Text style={styles.sectionHint}>
          Add, edit, or remove what attendees see — changes show up in the app immediately.
        </Text>
        <View style={styles.manageGrid}>
          {[
            { label: "Schedule", screen: "AdminSchedule" },
            { label: "Speakers", screen: "AdminSpeakers" },
            { label: "Exhibitors", screen: "AdminExhibitors" },
            { label: "Sponsors", screen: "AdminSponsors" },
            { label: "Events", screen: "AdminEvents" },
            { label: "Maps", screen: "AdminMap" },
            { label: "Board & staff", screen: "AdminBoard" },
            { label: "Polls & surveys", screen: "AdminPolls" },
          ].map((item) => (
            <Pressable
              key={item.screen}
              style={styles.manageButton}
              onPress={() => navigation.navigate(item.screen)}
            >
              <Text style={styles.manageButtonText}>{item.label}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Send a push notification</Text>
        <Text style={styles.sectionHint}>
          Delivered immediately to every device that has the app installed with
          notifications enabled.
        </Text>

        <Text style={styles.label}>Title</Text>
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="e.g. Keynote starting soon"
          placeholderTextColor={colors.muted}
          style={styles.input}
        />

        <Text style={styles.label}>Message</Text>
        <TextInput
          value={body}
          onChangeText={setBody}
          placeholder="e.g. Head to the Main Hall — we start in 10 minutes."
          placeholderTextColor={colors.muted}
          style={[styles.input, styles.textArea]}
          multiline
        />

        <Pressable
          style={[styles.button, submitting && styles.buttonDisabled]}
          onPress={handleSend}
          disabled={submitting}
        >
          <Text style={styles.buttonText}>{submitting ? "Sending..." : "Send Now"}</Text>
        </Pressable>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recently sent</Text>
        {recent.length === 0 ? (
          <Text style={styles.emptyText}>Nothing sent yet.</Text>
        ) : (
          recent.map((n) => (
            <View key={n.id} style={styles.historyCard}>
              <View style={styles.historyRow}>
                <View style={styles.historyText}>
                  <Text style={styles.historyTitle}>{n.title}</Text>
                  <Text style={styles.historyBody}>{n.body}</Text>
                  <Text style={styles.historyMeta}>
                    {n.sentAt ? n.sentAt.toDate().toLocaleString() : "Just now"} · {n.recipientCount}{" "}
                    recipient{n.recipientCount === 1 ? "" : "s"}
                  </Text>
                </View>
                <Pressable hitSlop={12} onPress={() => handleDeleteNotification(n.id, n.title)}>
                  <Ionicons name="trash-outline" size={20} color={colors.muted} />
                </Pressable>
              </View>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.lg },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: spacing.xl, gap: spacing.sm },
  deniedTitle: { fontSize: 18, fontWeight: "700", color: colors.ink },
  deniedMessage: { fontSize: 14, color: colors.muted, textAlign: "center", lineHeight: 20 },
  linkButton: { marginTop: spacing.md },
  linkButtonText: { color: colors.primary, fontWeight: "600" },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  heading: { fontSize: 24, fontWeight: "800", color: colors.ink },
  signOut: { color: colors.primary, fontWeight: "600" },
  subheading: { fontSize: 13, color: colors.muted, marginTop: -spacing.sm },
  section: {
    backgroundColor: colors.card,
    borderRadius: radii.lg,
    padding: spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: colors.ink },
  sectionHint: { fontSize: 12, color: colors.muted, marginTop: -4, marginBottom: 4 },
  manageGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  manageButton: {
    backgroundColor: colors.background,
    borderRadius: radii.md,
    paddingVertical: 10,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  manageButtonText: { color: colors.ink, fontWeight: "600", fontSize: 14 },
  label: { fontSize: 13, fontWeight: "600", color: colors.muted },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.ink,
    backgroundColor: colors.background,
  },
  textArea: { minHeight: 80, textAlignVertical: "top" },
  button: {
    backgroundColor: colors.primary,
    borderRadius: radii.md,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: spacing.sm,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  emptyText: { color: colors.muted, fontSize: 13 },
  historyCard: {
    paddingVertical: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  historyRow: { flexDirection: "row", alignItems: "flex-start", gap: spacing.sm },
  historyText: { flex: 1, gap: 2 },
  historyTitle: { fontSize: 14, fontWeight: "700", color: colors.ink },
  historyBody: { fontSize: 13, color: colors.muted },
  historyMeta: { fontSize: 12, color: colors.muted, marginTop: 2 },
});
