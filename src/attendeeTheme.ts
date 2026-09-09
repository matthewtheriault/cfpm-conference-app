// Attendee-facing theme - the visual identity for the screens attendees see
// (Home, Schedule, Map, Speakers, Exhibitors, Sponsors, Polls, Board,
// Updates, More, and the conference-code/name-entry gate). Softer-edged and
// more considered than the admin dashboard's theme (see ./theme), which
// stays on the original plain look deliberately - this redesign is scoped
// to the attendee app only.
export const colors = {
  primary: "#EE3A43",
  primaryDark: "#C92832",
  ink: "#242320",
  background: "#FAF8F3",
  card: "#FFFFFF",
  border: "transparent",
  muted: "#7A7568",
  success: "#1E9E5A",
  warning: "#C9820A",
  error: "#B3261E",
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const radii = {
  sm: 10,
  md: 16,
  lg: 22,
  pill: 999,
};

// Plus Jakarta Sans, loaded in App.tsx via @expo-google-fonts. Regular for
// body copy, semibold for labels/emphasis, extrabold for display/headings.
export const fonts = {
  regular: "PlusJakartaSans_400Regular",
  semibold: "PlusJakartaSans_600SemiBold",
  bold: "PlusJakartaSans_800ExtraBold",
};

// Playfair Display, loaded in App.tsx via @expo-google-fonts - used only on
// the CME certificate, to match the organizer's certificate template rather
// than the app's everyday Plus Jakarta Sans.
export const certificateFonts = {
  regular: "PlayfairDisplay_400Regular",
  bold: "PlayfairDisplay_700Bold",
  nameScript: "PlayfairDisplay_800ExtraBold_Italic",
};

// A single, restrained elevation for the few surfaces that should lift off
// the page (see "not everything is a card") - not applied blanket-style to
// every card.
export const shadow = {
  shadowColor: "#1A1712",
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.06,
  shadowRadius: 12,
  elevation: 2,
};
