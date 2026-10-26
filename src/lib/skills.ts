export const SKILL_KINDS = ["speaks", "learns", "teaches"] as const;
export type SkillKind = (typeof SKILL_KINDS)[number];

export const SKILL_FRAMEWORKS = ["CEFR", "DEFAULT"] as const;
export type SkillFramework = (typeof SKILL_FRAMEWORKS)[number];

export const LANGUAGE_SLUG = "language";

// Proficiency runs 0-7; 7 is the top (Native for languages)
export const MIN_LEVEL = 0;
export const MAX_LEVEL = 7;

const LEVELS = [
  "Newbie",
  "Beginner",
  "Elementary",
  "Intermediate",
  "Upper Intermediate",
  "Advanced",
  "Proficient",
];
const CEFR = [null, "A1", "A2", "B1", "B2", "C1", "C2"];

// "Advanced", or "Advanced (C1)" for languages
export function levelLabel(
  level: number,
  framework: SkillFramework = "DEFAULT",
) {
  const cefr = framework === "CEFR";
  if (level >= MAX_LEVEL) return cefr ? "Native" : "Master";
  const label = LEVELS[level] ?? "";
  return cefr && CEFR[level] ? `${label} (${CEFR[level]})` : label;
}
