import type { Timestamp } from "firebase/firestore";

export type ScheduleItem = {
  id: string;
  day: string; // e.g. "Friday, Oct 2"
  startTime: string; // e.g. "9:00 AM"
  endTime?: string;
  title: string;
  speaker?: string;
  speakerId?: string; // optional link to a speakers/{id} doc, for photo + bio link
  location?: string;
  description?: string;
  order?: number;
  track?: string; // e.g. "Plenary" | "Workshop" | "Assistant" | "Break-Out"
  media?: string[]; // optional slideshow image URLs
};

export type EventItem = {
  id: string;
  title: string;
  date: string;
  time?: string;
  location?: string;
  description?: string;
  imageUrl?: string;
};

export type Sponsor = {
  id: string;
  name: string;
  tier?: "Platinum" | "Gold" | "Silver" | "Bronze" | string;
  logoUrl?: string;
  website?: string;
  description?: string;
  order?: number; // controls rolling banner sequence; falls back to name order
};

export type Speaker = {
  id: string;
  name: string;
  title?: string;
  organization?: string;
  bio?: string;
  photoUrl?: string;
  instagramUrl?: string;
  linkedinUrl?: string;
  facebookUrl?: string;
  xUrl?: string;
  tiktokUrl?: string;
  email?: string;
  phone?: string;
};

export type Exhibitor = {
  id: string;
  name: string;
  boothNumber?: string;
  category?: string;
  bio?: string;
  website?: string;
  logoUrl?: string;
  instagramUrl?: string;
  linkedinUrl?: string;
  facebookUrl?: string;
  xUrl?: string;
  tiktokUrl?: string;
  email?: string;
  phone?: string;
};

export type VenueMap = {
  imageUrl?: string;
  notes?: string;
  address?: string; // source for the "Get Directions" link
};

export type BoardMember = {
  id: string;
  name: string;
  role?: string;
  photoUrl?: string;
  bio?: string;
};

export type SessionCheckin = {
  id: string;
  scheduleItemId: string;
  deviceId: string;
  checkedInAt: Timestamp | null;
  method: "self" | "qr";
};

export type ScheduleOverview = {
  imageUrl?: string;
};

export type NotificationDoc = {
  id: string;
  title: string;
  body: string;
  recipientCount: number;
  sentBy: string;
  sentAt: Timestamp | null;
};

export type PollQuestionType = "single" | "multiple" | "text";

export type PollQuestion = {
  id: string;
  text: string;
  type: PollQuestionType;
  options?: string[]; // used by "single" and "multiple"
};

export type Poll = {
  id: string;
  title: string;
  description?: string;
  kind: "poll" | "survey";
  isOpen: boolean;
  questions: PollQuestion[];
  createdAt?: Timestamp | null;
};

export type PollResponse = {
  id: string;
  deviceId: string;
  answers: Record<string, string | string[]>;
  submittedAt: Timestamp | null;
};
