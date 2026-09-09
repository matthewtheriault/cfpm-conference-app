import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useRoute } from "@react-navigation/native";
import QRCode from "react-native-qrcode-svg";
import { colors, spacing, radii } from "../../theme";

export default function AdminExhibitorQRScreen() {
  const route = useRoute<any>();
  const { exhibitorId, name, boothNumber } = route.params as {
    exhibitorId: string;
    name: string;
    boothNumber?: string;
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <QRCode value={`cfpm-exhibitor:${exhibitorId}`} size={240} />
      </View>
      <Text style={styles.name}>{name}</Text>
      {boothNumber ? <Text style={styles.booth}>Booth {boothNumber}</Text> : null}
      <Text style={styles.hint}>
        Screenshot or print this code and display it at the booth. Attendees scan it from the app's
        Exhibitor Passport screen.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
    gap: spacing.md,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: radii.lg,
    padding: spacing.xl,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  name: { fontSize: 20, fontWeight: "800", color: colors.ink, textAlign: "center" },
  booth: { fontSize: 15, color: colors.muted },
  hint: { fontSize: 13, color: colors.muted, textAlign: "center", maxWidth: 280, marginTop: spacing.md },
});
