import React, { Fragment, useEffect, useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet, ActivityIndicator } from "react-native";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { showAlert } from "../../alert";
import { uploadImageAsync } from "../../storage";
import { colors, spacing, radii } from "../../theme";
import type { ScheduleOverview } from "../../types";
import { CollectionEditorScreen } from "../CollectionEditorScreen";
import { scheduleFields } from "../fieldConfigs";

function ScheduleOverviewCard() {
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getDoc(doc(db, "scheduleOverview", "main")).then((snap) => {
      const data = snap.data() as ScheduleOverview | undefined;
      setImageUrl(data?.imageUrl ?? "");
      setLoading(false);
    });
  }, []);

  const handlePickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      showAlert("Permission needed", "Allow photo library access to pick an image.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: "images", quality: 0.8 });
    if (result.canceled || !result.assets[0]) return;
    setUploading(true);
    try {
      const url = await uploadImageAsync("schedule-overview", result.assets[0].uri);
      setImageUrl(url);
    } catch {
      showAlert("Upload failed", "Couldn't upload that image. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, "scheduleOverview", "main"), { imageUrl: imageUrl || null });
      showAlert("Saved", "Schedule image updated.");
    } catch {
      showAlert("Couldn't save", "Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.card}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Schedule image (optional)</Text>
      <Text style={styles.cardHint}>
        Upload a screenshot/photo of your full schedule for a quick at-a-glance view.
        Attendees still see the session list below for bookmarking individual lectures.
      </Text>
      {imageUrl ? <Image source={{ uri: imageUrl }} style={styles.preview} contentFit="contain" /> : null}
      <Pressable style={styles.uploadButton} onPress={handlePickImage} disabled={uploading}>
        {uploading ? (
          <ActivityIndicator color={colors.primary} />
        ) : (
          <Text style={styles.uploadButtonText}>{imageUrl ? "Change image" : "Upload image"}</Text>
        )}
      </Pressable>
      <TextInput
        value={imageUrl}
        onChangeText={setImageUrl}
        placeholder="Or paste an image URL"
        placeholderTextColor={colors.muted}
        style={styles.input}
        autoCapitalize="none"
        autoCorrect={false}
      />
      <Pressable style={[styles.saveButton, saving && styles.buttonDisabled]} onPress={handleSave} disabled={saving}>
        <Text style={styles.saveButtonText}>{saving ? "Saving..." : "Save schedule image"}</Text>
      </Pressable>
    </View>
  );
}

export default function AdminScheduleScreen() {
  return (
    <View style={styles.container}>
      <CollectionEditorScreen
        collectionPath="schedule"
        fields={scheduleFields}
        titleField="title"
        subtitleField="day"
        orderByField="order"
        storageFolder="schedule"
        emptyLabel="No sessions yet. Tap Add new to create the first one."
        listHeader={
          <Fragment>
            <ScheduleOverviewCard />
            <Text style={styles.listTitle}>Individual sessions</Text>
          </Fragment>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  card: {
    backgroundColor: colors.card,
    borderRadius: radii.lg,
    padding: spacing.md,
    margin: spacing.md,
    marginBottom: 0,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  cardTitle: { fontSize: 16, fontWeight: "700", color: colors.ink },
  cardHint: { fontSize: 12, color: colors.muted, marginTop: -4, lineHeight: 16 },
  preview: { width: "100%", height: 320, borderRadius: radii.md, backgroundColor: colors.background },
  uploadButton: {
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: radii.sm,
    paddingVertical: 12,
    alignItems: "center",
  },
  uploadButtonText: { color: colors.primary, fontWeight: "700", fontSize: 14 },
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
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: radii.md,
    paddingVertical: 12,
    alignItems: "center",
  },
  buttonDisabled: { opacity: 0.6 },
  saveButtonText: { color: "#fff", fontWeight: "700" },
  listTitle: { fontSize: 13, fontWeight: "700", color: colors.muted, marginLeft: spacing.md },
});
