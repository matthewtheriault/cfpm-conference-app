import React from "react";
import { ScrollView, useWindowDimensions, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { useRoute } from "@react-navigation/native";
import { colors, spacing } from "../theme";

export default function ScheduleImageScreen() {
  const { width } = useWindowDimensions();
  const route = useRoute<any>();
  const imageUrl = route.params.imageUrl as string;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.zoomContent}
      minimumZoomScale={1}
      maximumZoomScale={4}
      showsHorizontalScrollIndicator={false}
      showsVerticalScrollIndicator={false}
    >
      <Image source={{ uri: imageUrl }} style={{ width, height: width * 1.4 }} contentFit="contain" />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  zoomContent: { alignItems: "center", paddingBottom: spacing.lg },
});
