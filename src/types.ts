export interface Registration {
  id: string;
  name: string;
  email: string;
  phone: string;
  photoUrl?: string; // base64 string for preview on card
  mustCome: boolean;
  department: string;
  college: string;
  batch: string;
  vibe: string;
  favoriteMemory: string;
  futureAspirations: string;
  messageToJuniors: string;
  farewellMessage: string;
  avatarColor: string;
  createdAt: string;
}

export interface SeniorVibe {
  id: string;
  label: string;
  emoji: string;
  description: string;
  badgeColor: string;
}

export const SENIOR_VIBES: SeniorVibe[] = [
  {
    id: "code-wizard",
    label: "The Code Wizard",
    emoji: "🧙‍♂️",
    description: "Lives in dark mode. Solved complex algorithms in sleep and held the lab records.",
    badgeColor: "bg-purple-100 text-purple-800 border-purple-200"
  },
  {
    id: "backbench-mentor",
    label: "The Backbench Mentor",
    emoji: "👑",
    description: "Sits at the back during lectures but teaches the entire batch before semester exams.",
    badgeColor: "bg-amber-100 text-amber-800 border-amber-200"
  },
  {
    id: "quiet-genius",
    label: "The Quiet Genius",
    emoji: "🧠",
    description: "Writes pristine, bug-free code without making a sound. The silent pillar of major projects.",
    badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-200"
  },
  {
    id: "bug-slayer",
    label: "The Bug Slayer",
    emoji: "⚔️",
    description: "Can find a missing semicolon in a thousand lines of code. The hero of final year presentations.",
    badgeColor: "bg-rose-100 text-rose-800 border-rose-200"
  },
  {
    id: "creative-stylist",
    label: "The Creative Stylist",
    emoji: "🎨",
    description: "Paints beautiful UI interfaces. Converted boring terminal outputs into magical experiences.",
    badgeColor: "bg-teal-100 text-teal-800 border-teal-200"
  },
  {
    id: "caffeine-machine",
    label: "The Caffeine Machine",
    emoji: "☕",
    description: "Runs on tea, coffee, and pure ambition. Pulls multi-day coding marathons with ease.",
    badgeColor: "bg-amber-100 text-amber-900 border-amber-300"
  },
  {
    id: "multitask-champion",
    label: "The Department Icon",
    emoji: "✨",
    description: "Balances sports, organizing fests, and maintaining the class code repository gracefully.",
    badgeColor: "bg-blue-100 text-blue-800 border-blue-200"
  },
  {
    id: "social-hub",
    label: "The Heart of CSE",
    emoji: "❤️",
    description: "Kept the entire batch united. Always ready for group outings and memorable bday treats.",
    badgeColor: "bg-pink-100 text-pink-800 border-pink-200"
  }
];

export const BATCH_OPTIONS = [
  "2022-2026",
  "2023-2026"
];

export const AVATAR_COLORS = [
  { id: "burgundy", name: "Classic Burgundy", bg: "bg-rose-50", border: "border-rose-200", text: "text-rose-900", accent: "rose" },
  { id: "emerald", name: "Sage Emerald", bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-900", accent: "emerald" },
  { id: "sapphire", name: "Deep Sapphire", bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-900", accent: "blue" },
  { id: "sepia", name: "Warm Sepia", bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-900", accent: "amber" },
  { id: "charcoal", name: "Midnight Onyx", bg: "bg-slate-50", border: "border-slate-300", text: "text-slate-900", accent: "slate" }
];
