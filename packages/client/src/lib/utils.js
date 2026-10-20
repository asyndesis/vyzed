import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { SkillFramework } from "@vyzed/prisma/enums";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

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

// "Advanced", or "Advanced (C1)" for languages (CEFR). Level 7 is the top.
export const renderProficiency = ({ proficiency, framework }) => {
  const level = parseInt(proficiency);
  const cefr = framework === SkillFramework.CEFR;
  if (level === 7) return cefr ? "Native" : "Master";
  const label = LEVELS[level];
  if (!label) return "";
  return cefr && CEFR[level] ? `${label} (${CEFR[level]})` : label;
};
