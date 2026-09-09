import React, { useRef, useState } from "react";
import { View, Text, Pressable, StyleSheet, Alert } from "react-native";
import { CameraView, useCameraPermissions, type BarcodeScanningResult } from "expo-camera";
import { useNavigation } from "@react-navigation/native";
import { orderBy } from "firebase/firestore";
import { useFirestoreCollection } from "../hooks/useFirestoreCollection";
import { useExhibitorPassport } from "../context/ExhibitorPassportContext";
import { colors, spacing, radii, fonts } from "../attendeeTheme";
import type { Exhibitor } from "../types";

const SCAN_PREFIX = "cfpm-exhibitor:";

export default function ScanExhibitorScreen() {
  const navigation = useNavigation<any>();
  const [permission, requestPermission] = useCameraPermissions();
  const { data: exhibitors } = useFirestoreCollection<Exhibitor>("exhibitors", [orderBy("name", "asc")]);
  const { recordVisit } = useExhibitorPassport();
  const [scanned, setScanned] = useState(false);

  const handleScan = async (result: BarcodeScanningResult) => {
    if (scanned) return;
    const value = result.data;
    if (!value.startsWith(SCAN_PREFIX)) return;

    setScanned(true);
    const exhibitorId = value.slice(SCAN_PREFIX.length);
    const exhibitor = exhibitors.find((e) => e.id === exhibitorId);

    if (!exhibitor) {
      Alert.alert("Unrecognized code", "This QR code doesn't match a known exhibitor.", [
        { text: "OK", onPress: () => setScanned(false) },
      ]);
      return;
    }

    const outcome = await recordVisit(exhibitorId);
    Alert.alert(
      outcome === "new" ? "Stamped! 🎉" : "Already stamped",
      outcome === "new"
        ? `${exhibitor.name} is now in your passport.`
        : `You've already visited ${exhibitor.name}.`,
      [
        { text: "Keep scanning", onPress: () => setScanned(false) },
        { text: "Done", onPress: () => navigation.goBack() },
      ]
    );
  };

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <View style={[styles.container, styles.center, styles.permissionContainer]}>
        <Text style={styles.permissionTitle}>Camera access needed</Text>
        <Text style={styles.permissionBody}>
          To stamp your passport, allow camera access so the app can scan exhibitor QR codes.
        </Text>
        <Pressable style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Allow Camera</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
        onBarcodeScanned={handleScan}
      />
      <View style={styles.overlay}>
        <View style={styles.frame} />
        <Text style={styles.hint}>Point your camera at an exhibitor's QR code</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  center: { alignItems: "center", justifyContent: "center", padding: spacing.xl, gap: spacing.md },
  permissionContainer: { backgroundColor: colors.background },
  permissionTitle: { fontSize: 20, fontFamily: fonts.bold, color: colors.ink, textAlign: "center" },
  permissionBody: { fontSize: 14, fontFamily: fonts.regular, color: colors.muted, textAlign: "center" },
  button: {
    backgroundColor: colors.primary,
    borderRadius: radii.md,
    paddingVertical: 14,
    paddingHorizontal: spacing.xl,
    marginTop: spacing.sm,
  },
  buttonText: { color: "#fff", fontSize: 16, fontFamily: fonts.semibold },
  overlay: {
    ...StyleSheet.absoluteFill,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.lg,
  },
  frame: {
    width: 240,
    height: 240,
    borderRadius: radii.lg,
    borderWidth: 3,
    borderColor: "#fff",
  },
  hint: {
    color: "#fff",
    fontSize: 15,
    fontFamily: fonts.semibold,
    textAlign: "center",
    paddingHorizontal: spacing.xl,
  },
});
