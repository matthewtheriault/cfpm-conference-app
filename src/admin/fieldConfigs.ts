export type FieldType = "text" | "textarea" | "number" | "image" | "select" | "imageList" | "reference";

export type FieldConfig = {
  key: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  options?: string[]; // for "select"
  required?: boolean;
  referenceCollection?: string; // for "reference": collection to pick a doc id from
  referenceLabelField?: string; // for "reference": field on that doc to display
};

export const scheduleFields: FieldConfig[] = [
  { key: "day", label: "Day", type: "text", placeholder: "e.g. Friday, Oct 2", required: true },
  { key: "order", label: "Sort order", type: "number", placeholder: "e.g. 10" },
  { key: "startTime", label: "Start time", type: "text", placeholder: "e.g. 9:00 AM", required: true },
  { key: "endTime", label: "End time", type: "text", placeholder: "e.g. 9:45 AM" },
  { key: "title", label: "Session title", type: "text", required: true },
  {
    key: "track",
    label: "Track",
    type: "select",
    options: ["Plenary", "Workshop", "Assistant", "Break-Out"],
  },
  { key: "speaker", label: "Speaker (display name)", type: "text" },
  {
    key: "speakerId",
    label: "Link to speaker profile (optional)",
    type: "reference",
    referenceCollection: "speakers",
    referenceLabelField: "name",
  },
  { key: "location", label: "Location", type: "text" },
  { key: "description", label: "Description", type: "textarea" },
  {
    key: "media",
    label: "Slideshow images (optional — only if the speaker supplies slides)",
    type: "imageList",
  },
];

const socialFields: FieldConfig[] = [
  { key: "instagramUrl", label: "Instagram", type: "text", placeholder: "https://instagram.com/..." },
  { key: "linkedinUrl", label: "LinkedIn", type: "text", placeholder: "https://linkedin.com/in/..." },
  { key: "facebookUrl", label: "Facebook", type: "text", placeholder: "https://facebook.com/..." },
  { key: "xUrl", label: "X (Twitter)", type: "text", placeholder: "https://x.com/..." },
  { key: "tiktokUrl", label: "TikTok", type: "text", placeholder: "https://tiktok.com/@..." },
];

const contactFields: FieldConfig[] = [
  { key: "email", label: "Email (optional)", type: "text", placeholder: "name@example.com" },
  { key: "phone", label: "Phone (optional)", type: "text", placeholder: "e.g. 555-123-4567" },
];

export const speakerFields: FieldConfig[] = [
  { key: "name", label: "Name", type: "text", required: true },
  { key: "title", label: "Title", type: "text", placeholder: "e.g. DPM, FACFAS" },
  { key: "organization", label: "Organization", type: "text" },
  { key: "bio", label: "Bio", type: "textarea", required: true },
  { key: "photoUrl", label: "Headshot", type: "image" },
  ...contactFields,
  ...socialFields,
];

export const exhibitorFields: FieldConfig[] = [
  { key: "name", label: "Name", type: "text", required: true },
  { key: "boothNumber", label: "Booth number", type: "text" },
  { key: "category", label: "Category", type: "text" },
  { key: "website", label: "Website", type: "text", placeholder: "https://" },
  { key: "bio", label: "About", type: "textarea" },
  { key: "logoUrl", label: "Logo", type: "image" },
  ...contactFields,
  ...socialFields,
];

export const sponsorFields: FieldConfig[] = [
  { key: "name", label: "Name", type: "text", required: true },
  {
    key: "tier",
    label: "Tier",
    type: "select",
    options: ["Platinum", "Gold", "Silver", "Bronze"],
  },
  { key: "website", label: "Website", type: "text", placeholder: "https://" },
  { key: "description", label: "Description", type: "textarea" },
  { key: "logoUrl", label: "Logo", type: "image" },
  { key: "order", label: "Display order (for rolling banner)", type: "number", placeholder: "e.g. 1" },
];

export const eventFields: FieldConfig[] = [
  { key: "title", label: "Title", type: "text", required: true },
  { key: "date", label: "Date", type: "text", placeholder: "e.g. Friday, Oct 2", required: true },
  { key: "time", label: "Time", type: "text" },
  { key: "location", label: "Location", type: "text" },
  { key: "description", label: "Description", type: "textarea" },
  { key: "imageUrl", label: "Image", type: "image" },
];

export const boardMemberFields: FieldConfig[] = [
  { key: "name", label: "Name", type: "text", required: true },
  { key: "role", label: "Role", type: "text", placeholder: "e.g. President, Executive Director" },
  { key: "bio", label: "Bio", type: "textarea" },
  { key: "photoUrl", label: "Photo", type: "image" },
];
