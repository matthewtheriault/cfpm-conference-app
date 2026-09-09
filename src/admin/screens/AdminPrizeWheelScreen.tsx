import React, { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, Pressable, Animated, Easing, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Svg, { G, Path, Text as SvgText } from "react-native-svg";
import { fetchLeaderboard, type LeaderboardEntry } from "../leaderboard";
import { EmptyState } from "../../components/EmptyState";
import { colors, spacing, radii } from "../../theme";

const WHEEL_SIZE = 300;
const RADIUS = WHEEL_SIZE / 2;
const SLICE_COLORS = ["#EE3A43", "#1A1A1A", "#C92832", "#6B7280", "#8A1B21", "#3B3B3B", "#D4736A"];

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const angleRad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(angleRad), y: cy + r * Math.sin(angleRad) };
}

function describeSlice(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
  return `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y} Z`;
}

export default function AdminPrizeWheelScreen() {
  const [entries, setEntries] = useState<LeaderboardEntry[] | null>(null);
  const [spinning, setSpinning] = useState(false);
  const [winner, setWinner] = useState<LeaderboardEntry | null>(null);
  const rotation = useRef(new Animated.Value(0)).current;
  const rotationValueRef = useRef(0);

  useEffect(() => {
    fetchLeaderboard().then(setEntries);
  }, []);

  if (entries === null) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  const topScore = entries[0]?.totalPoints ?? 0;
  const tied = entries.filter((e) => e.totalPoints === topScore);

  if (tied.length === 0) {
    return (
      <EmptyState
        icon="disc-outline"
        title="No points yet"
        message="Once attendees earn points, the top scorer(s) will show up here to spin for."
      />
    );
  }

  if (tied.length === 1) {
    return (
      <View style={styles.center}>
        <Ionicons name="trophy" size={64} color="#D4AF37" />
        <Text style={styles.singleWinnerTitle}>{tied[0].name}</Text>
        <Text style={styles.singleWinnerBody}>Clear leader with {topScore} points - no tie to break.</Text>
      </View>
    );
  }

  const segmentAngle = 360 / tied.length;

  const handleSpin = () => {
    if (spinning) return;
    setSpinning(true);
    setWinner(null);
    const winnerIndex = Math.floor(Math.random() * tied.length);
    const targetAngle = winnerIndex * segmentAngle + segmentAngle / 2;
    const spins = 6;
    const finalRotation = rotationValueRef.current + spins * 360 + (360 - (targetAngle % 360));

    Animated.timing(rotation, {
      toValue: finalRotation,
      duration: 4200,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(() => {
      rotationValueRef.current = finalRotation;
      setWinner(tied[winnerIndex]);
      setSpinning(false);
    });
  };

  const spin = rotation.interpolate({
    inputRange: [0, 360],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tied at {topScore} points</Text>
      <Text style={styles.subtitle}>{tied.length} attendees to choose from</Text>

      <View style={styles.wheelWrap}>
        <View style={styles.pointer} />
        <Animated.View style={{ transform: [{ rotate: spin }] }}>
          <Svg width={WHEEL_SIZE} height={WHEEL_SIZE}>
            <G>
              {tied.map((entry, i) => {
                const start = i * segmentAngle;
                const end = start + segmentAngle;
                const mid = start + segmentAngle / 2;
                const labelPos = polarToCartesian(RADIUS, RADIUS, RADIUS * 0.62, mid);
                return (
                  <G key={entry.deviceId}>
                    <Path
                      d={describeSlice(RADIUS, RADIUS, RADIUS - 4, start, end)}
                      fill={SLICE_COLORS[i % SLICE_COLORS.length]}
                      stroke="#fff"
                      strokeWidth={2}
                    />
                    <SvgText
                      x={labelPos.x}
                      y={labelPos.y}
                      fill="#fff"
                      fontSize={13}
                      fontWeight="700"
                      textAnchor="middle"
                      rotation={mid}
                      origin={`${labelPos.x}, ${labelPos.y}`}
                    >
                      {entry.name.split(" ")[0]}
                    </SvgText>
                  </G>
                );
              })}
            </G>
          </Svg>
        </Animated.View>
      </View>

      {winner ? (
        <View style={styles.winnerCard}>
          <Ionicons name="trophy" size={28} color="#D4AF37" />
          <Text style={styles.winnerText}>{winner.name} wins!</Text>
        </View>
      ) : null}

      <Pressable
        style={[styles.spinButton, spinning && styles.spinButtonDisabled]}
        onPress={handleSpin}
        disabled={spinning}
      >
        <Text style={styles.spinButtonText}>
          {spinning ? "Spinning..." : winner ? "Spin Again" : "Spin the Wheel"}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
    gap: spacing.sm,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: "center",
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  title: { fontSize: 20, fontWeight: "800", color: colors.ink },
  subtitle: { fontSize: 13, color: colors.muted, marginTop: -spacing.sm },
  singleWinnerTitle: { fontSize: 24, fontWeight: "800", color: colors.ink, textAlign: "center" },
  singleWinnerBody: { fontSize: 14, color: colors.muted, textAlign: "center" },
  wheelWrap: { alignItems: "center", justifyContent: "center", marginTop: spacing.md },
  pointer: {
    position: "absolute",
    top: -6,
    zIndex: 2,
    width: 0,
    height: 0,
    borderLeftWidth: 12,
    borderRightWidth: 12,
    borderTopWidth: 20,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: colors.ink,
  },
  winnerCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.card,
    borderRadius: radii.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  winnerText: { fontSize: 17, fontWeight: "800", color: colors.ink },
  spinButton: {
    backgroundColor: colors.primary,
    borderRadius: radii.pill,
    paddingVertical: 14,
    paddingHorizontal: spacing.xl,
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
  },
  spinButtonDisabled: { opacity: 0.6 },
  spinButtonText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
