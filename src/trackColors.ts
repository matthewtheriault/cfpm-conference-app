import { colors } from "./theme";

type TrackColor = { bg: string; border: string; text: string };

// Matches the fixed track options in src/admin/fieldConfigs.ts (scheduleFields).
const TINT: Record<string, TrackColor> = {
  Plenary: { bg: "#dcfce7", border: "#86efac", text: "#166534" },
  Workshop: { bg: "#fef3c7", border: "#fcd34d", text: "#92400e" },
  Assistant: { bg: "#dbeafe", border: "#93c5fd", text: "#1e40af" },
  "Break-Out": { bg: "#fee2e2", border: "#fca5a5", text: "#991b1b" },
};

const SOLID: Record<string, TrackColor> = {
  Plenary: { bg: "#16a34a", border: "#16a34a", text: "#ffffff" },
  Workshop: { bg: "#d97706", border: "#d97706", text: "#ffffff" },
  Assistant: { bg: "#2563eb", border: "#2563eb", text: "#ffffff" },
  "Break-Out": { bg: "#dc2626", border: "#dc2626", text: "#ffffff" },
};

const DEFAULT_TINT: TrackColor = { bg: colors.card, border: colors.border, text: colors.ink };
const DEFAULT_SOLID: TrackColor = { bg: colors.ink, border: colors.ink, text: "#ffffff" };

/**
 * Color for a session track (Plenary/Workshop/Assistant/Break-Out), used to
 * color-code the track filter chips and the track badge on session detail.
 * `solid` picks the bold/selected variant; otherwise a soft tint. Falls back
 * to a neutral color for an unrecognized or missing track.
 */
export function getTrackColor(track: string | undefined, solid: boolean): TrackColor {
  if (!track) return solid ? DEFAULT_SOLID : DEFAULT_TINT;
  const map = solid ? SOLID : TINT;
  return map[track] ?? (solid ? DEFAULT_SOLID : DEFAULT_TINT);
}
