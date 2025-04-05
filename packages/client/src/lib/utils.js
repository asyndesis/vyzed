import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { SkillFramework } from "@vyzed/prisma/enums";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const renderProficiency = ({ proficiency, framework }) => {
  if (proficiency === null || proficiency === undefined) {
    return "";
  }

  const proficiencyLevel = parseInt(proficiency);

  // Base labels without CEFR annotations
  const baseLabels = {
    0: "Newbie",
    1: "Beginner",
    2: "Elementary",
    3: "Intermediate",
    4: "Upper Intermediate",
    5: "Advanced",
    6: "Proficient",
    7: framework === SkillFramework.CEFR ? "Native" : "Master",
  };

  // CEFR annotations
  const cefrAnnotations = {
    1: "A1",
    2: "A2",
    3: "B1",
    4: "B2",
    5: "C1",
    6: "C2",
  };

  // Get the base label
  const baseLabel = baseLabels[proficiencyLevel] || "";

  // If no base label or not a valid level, return empty string
  if (!baseLabel) return "";

  // If framework is CEFR and we have a corresponding annotation, add it
  if (framework === SkillFramework.CEFR && cefrAnnotations[proficiencyLevel]) {
    return `${baseLabel} (${cefrAnnotations[proficiencyLevel]})`;
  }

  // Otherwise just return the base label
  return baseLabel;
};
