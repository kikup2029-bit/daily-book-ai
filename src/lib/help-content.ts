/**
 * Every feature, written for the person using the app rather than the person
 * who built it. Kept as data so the Help page can search it and the nav can
 * deep-link into it.
 *
 * The words themselves are not here — they live in the dictionary, because this
 * page is read in six languages. What stays is the shape: which groups exist,
 * which topics sit in them, and how many steps and notes each topic has.
 *
 * Each `id` is stable and does double duty: it's the anchor in the URL, and the
 * stem of every key the topic owns.
 *
 *   help.<stem>Title      help.<stem>Where     help.<stem>Summary
 *   help.<stem>Keywords   help.<stem>Step1…N   help.<stem>Note1…N
 *
 * where <stem> is the id in camelCase ("find-entry" → "findEntry"). Group
 * labels follow the same rule under help.group<Stem>.
 */

import type { Translator } from "@/lib/i18n/translate";

export type HelpTopic = {
  /** Stable id: the deep link, and the stem of this topic's dictionary keys. */
  id: string;
  /** How many numbered steps this topic has. */
  steps?: number;
  /** How many notes it has, including anything it can't do. */
  notes?: number;
  /** Link straight to the feature. */
  to?: string;
};

export type HelpGroup = { id: string; topics: HelpTopic[] };

/** A topic with its text filled in for the current language. */
export type ResolvedTopic = {
  id: string;
  title: string;
  /** Where to find it in the app. */
  where: string;
  /** One line on what it's for. */
  summary: string;
  /** How to actually use it. */
  steps: string[];
  /** Things worth knowing, including what it can't do. */
  notes: string[];
  to?: string;
};

export type ResolvedGroup = { id: string; label: string; topics: ResolvedTopic[] };

export const HELP: HelpGroup[] = [
  {
    id: "start",
    topics: [
      { id: "first-run", to: "/dashboard", steps: 3, notes: 1 },
      { id: "palette", steps: 4 },
      { id: "theme", steps: 1, notes: 1 },
    ],
  },

  {
    id: "logging",
    topics: [
      { id: "quick-add", to: "/add", steps: 3, notes: 2 },
      { id: "voice", to: "/add", steps: 3, notes: 3 },
      { id: "full-form", to: "/add", steps: 4 },
      { id: "receipts", to: "/add", steps: 3, notes: 2 },
      { id: "editing", to: "/dashboard", steps: 4, notes: 1 },
      { id: "find-entry", to: "/entries", steps: 3, notes: 4 },
    ],
  },

  {
    id: "day",
    topics: [
      { id: "safe-to-spend", to: "/dashboard", notes: 3 },
      { id: "due-soon", to: "/dashboard", notes: 2 },
      { id: "streaks", to: "/streaks", notes: 2 },
      { id: "ask", to: "/ask", steps: 2, notes: 3 },
    ],
  },

  {
    id: "month",
    topics: [
      { id: "month-overview", to: "/monthly", steps: 1, notes: 1 },
      { id: "categories", to: "/categories" },
      { id: "daybyday", to: "/daybyday" },
      { id: "week", to: "/week", notes: 1 },
      { id: "outlook", to: "/outlook", notes: 3 },
      { id: "busydays", to: "/busydays", notes: 1 },
      { id: "budgets", to: "/budgets", steps: 2, notes: 1 },
      { id: "goals", to: "/goals", steps: 1, notes: 1 },
      { id: "bills", to: "/bills", steps: 2, notes: 2 },
    ],
  },

  {
    id: "invoices",
    topics: [
      { id: "invoice-create", to: "/invoice-new", steps: 4, notes: 3 },
      { id: "invoice-paid", to: "/invoices", steps: 2, notes: 4 },
    ],
  },

  {
    id: "tools",
    topics: [
      { id: "household", to: "/household", steps: 3, notes: 4 },
      { id: "margins", to: "/margins", notes: 2 },
      { id: "drawer", to: "/drawer", steps: 2, notes: 2 },
      { id: "tax", to: "/tax", steps: 1, notes: 2 },
      { id: "reminder", to: "/reminders", steps: 2, notes: 5 },
      { id: "lock", to: "/lock", steps: 2, notes: 3 },
    ],
  },

  {
    id: "export",
    topics: [{ id: "export", to: "/export", steps: 3, notes: 2 }],
  },

  {
    id: "offline",
    topics: [
      { id: "install", steps: 2, notes: 2 },
      { id: "offline-logging", notes: 7 },
    ],
  },

  {
    id: "privacy",
    topics: [{ id: "privacy", notes: 5 }],
  },
];

/** "find-entry" → "findEntry". */
function stem(id: string): string {
  return id.replace(/-([a-z])/g, (_, letter: string) => letter.toUpperCase());
}

/** The dictionary key holding a group's label. */
export function helpGroupKey(id: string): string {
  const name = stem(id);
  return `help.group${name[0].toUpperCase()}${name.slice(1)}`;
}

function lines(id: string, kind: "Step" | "Note", count: number | undefined, t: Translator) {
  return Array.from({ length: count ?? 0 }, (_, index) => t(`help.${stem(id)}${kind}${index + 1}`));
}

/** The extra words a topic matches on, which are translated like everything else. */
function keywords(id: string, t: Translator): string {
  return t(`help.${stem(id)}Keywords`);
}

export function resolveTopic(topic: HelpTopic, t: Translator): ResolvedTopic {
  const name = stem(topic.id);
  return {
    id: topic.id,
    to: topic.to,
    title: t(`help.${name}Title`),
    where: t(`help.${name}Where`),
    summary: t(`help.${name}Summary`),
    steps: lines(topic.id, "Step", topic.steps, t),
    notes: lines(topic.id, "Note", topic.notes, t),
  };
}

/** The whole guide in the current language. */
export function resolveHelp(t: Translator): ResolvedGroup[] {
  return HELP.map((group) => ({
    id: group.id,
    label: t(helpGroupKey(group.id)),
    topics: group.topics.map((topic) => resolveTopic(topic, t)),
  }));
}

/**
 * Nav sub-items, built from the same content so they can't drift apart.
 *
 * A function rather than a constant because the labels change with the
 * language, and a module-level constant would freeze whichever language
 * happened to load first.
 */
export function helpNav(t: Translator): { to: string; label: string }[] {
  return HELP.map((group) => ({
    to: `/help?group=${group.id}`,
    label: t(helpGroupKey(group.id)),
  }));
}

/** Loose search across titles, summaries, steps, notes and keywords. */
export function searchHelp(query: string, t: Translator): ResolvedGroup[] {
  const groups = resolveHelp(t);
  const q = query.trim().toLowerCase();
  if (!q) return groups;

  const hit = (topic: ResolvedTopic) =>
    [topic.title, topic.summary, topic.where, keywords(topic.id, t), ...topic.steps, ...topic.notes]
      .join(" ")
      .toLowerCase()
      .includes(q);

  return groups
    .map((group) => ({ ...group, topics: group.topics.filter(hit) }))
    .filter((group) => group.topics.length > 0);
}
