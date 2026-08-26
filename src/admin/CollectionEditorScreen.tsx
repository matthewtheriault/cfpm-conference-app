import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  orderBy as fbOrderBy,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import { showAlert } from "../alert";
import { useFirestoreCollection } from "../hooks/useFirestoreCollection";
import { uploadImageAsync } from "../storage";
import { colors, spacing, radii } from "../theme";
import type { FieldConfig } from "./fieldConfigs";

type Props = {
  collectionPath: string;
  fields: FieldConfig[];
  titleField: string;
  subtitleField?: string;
  orderByField?: string;
  storageFolder: string;
  emptyLabel: string;
  // Extra content (e.g. AdminScheduleScreen's schedule-image card) rendered
  // above the "Add new" button, scrolling together with the list itself
  // rather than competing with it for space in a separate flex region.
  // Only shown in list mode — hidden automatically while a form is open.
  listHeader?: React.ReactNode;
};

type FormValues = Record<string, string>;

export function CollectionEditorScreen({
  collectionPath,
  fields,
  titleField,
  subtitleField,
  orderByField,
  storageFolder,
  emptyLabel,
  listHeader,
}: Props) {
  const { data, loading } = useFirestoreCollection<any>(
    collectionPath,
    orderByField ? [fbOrderBy(orderByField, "asc")] : []
  );
  const referenceField = fields.find((f) => f.type === "reference" && f.referenceCollection);
  const { data: referenceOptions } = useFirestoreCollection<any>(
    referenceField?.referenceCollection ?? collectionPath
  );
  const [editingId, setEditingId] = useState<string | null | "new">(null);
  const [values, setValues] = useState<FormValues>({});
  const [saving, setSaving] = useState(false);
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);

  const editing = editingId !== null;

  const startNew = () => {
    setValues({});
    setEditingId("new");
  };

  const startEdit = (item: any) => {
    const initial: FormValues = {};
    for (const field of fields) {
      const raw = item[field.key];
      if (raw == null) {
        initial[field.key] = "";
      } else if (Array.isArray(raw)) {
        initial[field.key] = raw.join("\n");
      } else {
        initial[field.key] = String(raw);
      }
    }
    setValues(initial);
    setEditingId(item.id);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setValues({});
  };

  const handleDelete = (id: string, label: string) => {
    showAlert("Delete", `Remove "${label}"? This can't be undone.`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deleteDoc(doc(db, collectionPath, id));
        },
      },
    ]);
  };

  const handlePickImage = async (key: string) => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      showAlert("Permission needed", "Allow photo library access to pick an image.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      quality: 0.8,
    });
    if (result.canceled || !result.assets[0]) return;
    setUploadingKey(key);
    try {
      const url = await uploadImageAsync(storageFolder, result.assets[0].uri);
      setValues((prev) => ({ ...prev, [key]: url }));
    } catch {
      showAlert("Upload failed", "Couldn't upload that image. Please try again.");
    } finally {
      setUploadingKey(null);
    }
  };

  const handlePickImageAppend = async (key: string) => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      showAlert("Permission needed", "Allow photo library access to pick an image.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      quality: 0.8,
    });
    if (result.canceled || !result.assets[0]) return;
    setUploadingKey(key);
    try {
      const url = await uploadImageAsync(storageFolder, result.assets[0].uri);
      setValues((prev) => {
        const existing = prev[key]?.trim();
        return { ...prev, [key]: existing ? `${existing}\n${url}` : url };
      });
    } catch {
      showAlert("Upload failed", "Couldn't upload that image. Please try again.");
    } finally {
      setUploadingKey(null);
    }
  };

  const handleSave = async () => {
    for (const field of fields) {
      if (field.required && !values[field.key]?.trim()) {
        showAlert("Missing info", `${field.label} is required.`);
        return;
      }
    }
    setSaving(true);
    try {
      const payload: Record<string, any> = {};
      for (const field of fields) {
        const raw = values[field.key]?.trim() ?? "";
        if (field.type === "number") {
          payload[field.key] = raw ? Number(raw) : null;
        } else if (field.type === "imageList") {
          const urls = raw
            .split("\n")
            .map((line) => line.trim())
            .filter(Boolean);
          payload[field.key] = urls.length > 0 ? urls : null;
        } else {
          payload[field.key] = raw || null;
        }
      }
      if (editingId === "new") {
        await addDoc(collection(db, collectionPath), payload);
      } else if (editingId) {
        await updateDoc(doc(db, collectionPath, editingId), payload);
      }
      cancelEdit();
    } catch {
      showAlert("Couldn't save", "Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const sortedData = useMemo(() => data, [data]);

  if (editing) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.formContent}>
        {fields.map((field) => (
          <View key={field.key} style={styles.fieldGroup}>
            <Text style={styles.label}>
              {field.label}
              {field.required ? " *" : ""}
            </Text>
            {field.type === "textarea" ? (
              <TextInput
                value={values[field.key] ?? ""}
                onChangeText={(t) => setValues((prev) => ({ ...prev, [field.key]: t }))}
                placeholder={field.placeholder}
                placeholderTextColor={colors.muted}
                style={[styles.input, styles.textArea]}
                multiline
              />
            ) : field.type === "number" ? (
              <TextInput
                value={values[field.key] ?? ""}
                onChangeText={(t) => setValues((prev) => ({ ...prev, [field.key]: t }))}
                placeholder={field.placeholder}
                placeholderTextColor={colors.muted}
                style={styles.input}
                keyboardType="number-pad"
              />
            ) : field.type === "select" ? (
              <View style={styles.selectRow}>
                {field.options?.map((option) => {
                  const active = values[field.key] === option;
                  return (
                    <Pressable
                      key={option}
                      style={[styles.selectChip, active && styles.selectChipActive]}
                      onPress={() => setValues((prev) => ({ ...prev, [field.key]: option }))}
                    >
                      <Text style={[styles.selectChipText, active && styles.selectChipTextActive]}>
                        {option}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            ) : field.type === "image" ? (
              <View>
                {values[field.key] ? (
                  <Image source={{ uri: values[field.key] }} style={styles.imagePreview} contentFit="contain" />
                ) : null}
                <Pressable
                  style={styles.uploadButton}
                  onPress={() => handlePickImage(field.key)}
                  disabled={uploadingKey === field.key}
                >
                  {uploadingKey === field.key ? (
                    <ActivityIndicator color={colors.primary} />
                  ) : (
                    <Text style={styles.uploadButtonText}>
                      {values[field.key] ? "Change photo" : "Upload photo"}
                    </Text>
                  )}
                </Pressable>
                <TextInput
                  value={values[field.key] ?? ""}
                  onChangeText={(t) => setValues((prev) => ({ ...prev, [field.key]: t }))}
                  placeholder="Or paste an image URL"
                  placeholderTextColor={colors.muted}
                  style={[styles.input, styles.urlInput]}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            ) : field.type === "imageList" ? (
              <View>
                {(values[field.key] ?? "")
                  .split("\n")
                  .map((url) => url.trim())
                  .filter(Boolean)
                  .map((url) => (
                    <Image key={url} source={{ uri: url }} style={styles.imagePreview} contentFit="contain" />
                  ))}
                <Pressable
                  style={styles.uploadButton}
                  onPress={() => handlePickImageAppend(field.key)}
                  disabled={uploadingKey === field.key}
                >
                  {uploadingKey === field.key ? (
                    <ActivityIndicator color={colors.primary} />
                  ) : (
                    <Text style={styles.uploadButtonText}>Add image</Text>
                  )}
                </Pressable>
                <TextInput
                  value={values[field.key] ?? ""}
                  onChangeText={(t) => setValues((prev) => ({ ...prev, [field.key]: t }))}
                  placeholder="Or paste image URLs, one per line"
                  placeholderTextColor={colors.muted}
                  style={[styles.input, styles.textArea, styles.urlInput]}
                  autoCapitalize="none"
                  autoCorrect={false}
                  multiline
                />
              </View>
            ) : field.type === "reference" ? (
              <View style={styles.selectRow}>
                <Pressable
                  style={[styles.selectChip, !values[field.key] && styles.selectChipActive]}
                  onPress={() => setValues((prev) => ({ ...prev, [field.key]: "" }))}
                >
                  <Text style={[styles.selectChipText, !values[field.key] && styles.selectChipTextActive]}>
                    None
                  </Text>
                </Pressable>
                {referenceOptions.map((option) => {
                  const active = values[field.key] === option.id;
                  const label = field.referenceLabelField ? option[field.referenceLabelField] : option.id;
                  return (
                    <Pressable
                      key={option.id}
                      style={[styles.selectChip, active && styles.selectChipActive]}
                      onPress={() => setValues((prev) => ({ ...prev, [field.key]: option.id }))}
                    >
                      <Text style={[styles.selectChipText, active && styles.selectChipTextActive]}>
                        {label || "Untitled"}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            ) : (
              <TextInput
                value={values[field.key] ?? ""}
                onChangeText={(t) => setValues((prev) => ({ ...prev, [field.key]: t }))}
                placeholder={field.placeholder}
                placeholderTextColor={colors.muted}
                style={styles.input}
              />
            )}
          </View>
        ))}

        <View style={styles.formActions}>
          <Pressable style={styles.cancelButton} onPress={cancelEdit} disabled={saving}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </Pressable>
          <Pressable style={[styles.saveButton, saving && styles.buttonDisabled]} onPress={handleSave} disabled={saving}>
            <Text style={styles.saveButtonText}>{saving ? "Saving..." : "Save"}</Text>
          </Pressable>
        </View>
      </ScrollView>
    );
  }

  return (
    <FlatList
      style={styles.container}
      data={sortedData}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.list}
      ListHeaderComponent={
        <>
          {listHeader}
          <Pressable style={styles.addButton} onPress={startNew}>
            <Ionicons name="add-circle" size={20} color="#fff" />
            <Text style={styles.addButtonText}>Add new</Text>
          </Pressable>
          {loading ? <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.lg }} /> : null}
        </>
      }
      ListEmptyComponent={!loading ? <Text style={styles.emptyText}>{emptyLabel}</Text> : null}
      renderItem={({ item }) => (
        <Pressable style={styles.row} onPress={() => startEdit(item)}>
          <View style={styles.rowText}>
            <Text style={styles.rowTitle}>{item[titleField] || "Untitled"}</Text>
            {subtitleField && item[subtitleField] ? (
              <Text style={styles.rowSubtitle}>{item[subtitleField]}</Text>
            ) : null}
          </View>
          <Pressable
            hitSlop={12}
            onPress={() => handleDelete(item.id, item[titleField] || "this item")}
          >
            <Ionicons name="trash-outline" size={20} color={colors.muted} />
          </Pressable>
        </Pressable>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  formContent: { padding: spacing.lg, gap: spacing.md },
  fieldGroup: { gap: spacing.xs },
  label: { fontSize: 13, fontWeight: "600", color: colors.muted },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.ink,
    backgroundColor: colors.card,
  },
  textArea: { minHeight: 90, textAlignVertical: "top" },
  urlInput: { marginTop: spacing.xs },
  selectRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.xs },
  selectChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  selectChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  selectChipText: { fontSize: 13, fontWeight: "600", color: colors.ink },
  selectChipTextActive: { color: "#fff" },
  imagePreview: {
    width: "100%",
    height: 200,
    borderRadius: radii.md,
    marginBottom: spacing.xs,
    backgroundColor: colors.card,
  },
  uploadButton: {
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: radii.sm,
    paddingVertical: 12,
    alignItems: "center",
  },
  uploadButtonText: { color: colors.primary, fontWeight: "700", fontSize: 14 },
  formActions: { flexDirection: "row", gap: spacing.sm, marginTop: spacing.md },
  cancelButton: {
    flex: 1,
    borderRadius: radii.md,
    paddingVertical: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  cancelButtonText: { color: colors.muted, fontWeight: "700" },
  saveButton: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: radii.md,
    paddingVertical: 14,
    alignItems: "center",
  },
  buttonDisabled: { opacity: 0.6 },
  saveButtonText: { color: "#fff", fontWeight: "700" },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    backgroundColor: colors.primary,
    margin: spacing.md,
    borderRadius: radii.md,
    paddingVertical: 12,
  },
  addButtonText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  emptyText: { color: colors.muted, fontSize: 14, textAlign: "center", marginTop: spacing.xl },
  // No horizontal padding here (unlike a plain list) — the "Add new" button,
  // an optional listHeader, and each row all carry their own horizontal
  // margin instead, so a listHeader's content doesn't get double-inset.
  list: { paddingBottom: spacing.lg, gap: spacing.xs },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.card,
    borderRadius: radii.md,
    padding: spacing.md,
    marginHorizontal: spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  rowText: { flex: 1, gap: 2, paddingRight: spacing.sm },
  rowTitle: { fontSize: 15, fontWeight: "700", color: colors.ink },
  rowSubtitle: { fontSize: 13, color: colors.muted },
});
