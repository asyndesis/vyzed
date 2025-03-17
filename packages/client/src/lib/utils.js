import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
// Helper function to render proficiency based on skill type and level
export const renderProficiency = (proficiency) => {
  const proficiencyLevel = parseInt(proficiency);

  switch (proficiencyLevel) {
    case 0:
      return "Newbie";
    case 1:
      return "Beginner (A1)";
    case 2:
      return "Elementary (A2)";
    case 3:
      return "Intermediate (B1)";
    case 4:
      return "Upper Intermediate (B2)";
    case 5:
      return "Advanced (C1)";
    case 6:
      return "Proficient (C2)";
    case 7:
      return "Native";
    default:
      return "";
  }
};
