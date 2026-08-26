import React, { useEffect, useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { showAlert } from "../../alert";
import { uploadImageAsync } from "../../storage";
import { colors, spacing, radii } from "../../theme";
import type { VenueMap } from "../../types";

function MapCard({ docId, title }: { docId: "venue" | "exhibitHall"; title: string }) {
  const [imageUrl, setImageUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getDoc(doc(db, "map", docId)).then((snap) => {
      const data = snap.data() as VenueMap | undefined;
      setImageUrl(data?.imageUrl ?? "");
      setNotes(data?.notes ?? "");
      setAddress(data?.address ?? "");
      setLoading(false);
    });
  }, [docId]);

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
      const url = await uploadImageAsync("map", result.assets[0].uri);
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
      await setDoc(doc(db, "map", docId), {
        imageUrl: imageUrl || null,
        notes: notes || null,
        address: address || null,
      });
      showAlert("Saved", `${title} updated.`);
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
      <Text style={styles.cardTitle}>{title}</Text>
      {imageUrl ? <Image source={{ uri: imageUrl }} style={styles.preview} contentFit="contain" /> : null}
      <Pressable style={styles.uploadButton} onPress={handlePickImage} disabled={uploading}>
        {uploading ? (
          <ActivityIndicator color={colors.primary} />
        ) : (
          <Text style={styles.uploadButtonText}>{imageUrl ? "Change map image" : "Upload map image"}</Text>
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
      <TextInput
        value={notes}
        onChangeText={setNotes}
        placeholder="Notes (optional)"
        placeholderTextColor={colors.muted}
        style={[styles.input, styles.textArea]}
        multiline
      />
      <TextInput
        value={address}
        onChangeText={setAddress}
        placeholder="Street address (optional, powers 'Get Directions')"
        placeholderTextColor={colors.muted}
        style={styles.input}
      />
      <Pressable style={[styles.saveButton, saving && styles.buttonDisabled]} onPress={handleSave} disabled={saving}>
        <Text style={styles.saveButtonText}>{saving ? "Saving..." : `Save ${title}`}</Text>
      </Pressable>
    </View>
  );
}

export default function AdminMapScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <MapCard docId="venue" title="Venue Map" />
      <MapCard docId="exhibitHall" title="Exhibit Hall Map" />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.lg },
  card: {
    backgroundColor: colors.card,
    borderRadius: radii.lg,
    padding: spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  cardTitle: { fontSize: 16, fontWeight: "700", color: colors.ink },
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
  textArea: { minHeight: 70, textAlignVertical: "top" },
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: radii.md,
    paddingVertical: 12,
    alignItems: "center",
  },
  buttonDisabled: { opacity: 0.6 },
  saveButtonText: { color: "#fff", fontWeight: "700" },
});
