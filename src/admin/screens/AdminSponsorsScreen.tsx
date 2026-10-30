import React, { useEffect, useMemo, useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet } from "react-native";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { showAlert } from "../../alert";
import { useSponsorTiers } from "../../hooks/useSponsorTiers";
import { CollectionEditorScreen } from "../CollectionEditorScreen";
import { sponsorFields } from "../fieldConfigs";
import { colors, spacing, radii } from "../../theme";

// Edits config/sponsorTiers — the tier choices below and the section order
// attendees see on the Sponsors screen. Renaming a tier here doesn't rename
// it on sponsors already saved with the old name.
function TierListCard({ tiers }: { tiers: string[] }) {
  const [text, setText] = useState(tiers.join("\n"));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setText(tiers.join("\n"));
  }, [tiers]);

  const handleSave = async () => {
    const list = [...new Set(text.split("\n").map((line) => line.trim()).filter(Boolean))];
    if (list.length === 0) {
      showAlert("Missing info", "Add at least one tier.");
      return;
    }
    setSaving(true);
    try {
      await setDoc(doc(db, "config", "sponsorTiers"), { tiers: list });
      showAlert("Saved", "Sponsor tiers updated.");
    } catch {
      showAlert("Couldn't save", "Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Sponsor tiers</Text>
      <Text style={styles.hint}>One per line, in the order attendees should see them (top tier first).</Text>
      <TextInput
        value={text}
        onChangeText={setText}
        style={[styles.input, styles.textArea]}
        multiline
        autoCorrect={false}
      />
      <Pressable style={[styles.saveButton, saving && styles.buttonDisabled]} onPress={handleSave} disabled={saving}>
        <Text style={styles.saveButtonText}>{saving ? "Saving..." : "Save tiers"}</Text>
      </Pressable>
    </View>
  );
}

export default function AdminSponsorsScreen() {
  const tiers = useSponsorTiers();
  const fields = useMemo(() => sponsorFields(tiers), [tiers]);

  return (
    <CollectionEditorScreen
      collectionPath="sponsors"
      fields={fields}
      titleField="name"
      subtitleField="tier"
      storageFolder="sponsors"
      emptyLabel="No sponsors yet. Tap Add new to create the first one."
      listHeader={<TierListCard tiers={tiers} />}
    />
  );
}

const styles = StyleSheet.create({
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
  hint: { fontSize: 13, color: colors.muted },
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
  textArea: { minHeight: 130, textAlignVertical: "top" },
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: radii.md,
    paddingVertical: 12,
    alignItems: "center",
  },
  buttonDisabled: { opacity: 0.6 },
  saveButtonText: { color: "#fff", fontWeight: "700" },
});
