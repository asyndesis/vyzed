import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
// Helper function to render proficiency based on skill type and level
export const renderProficiency = (skillItem) => {
  const proficiencyLevel = parseInt(skillItem.proficiency);

  switch (proficiencyLevel) {
    case 0:
      return "Newbie (A0)";
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

// New function that returns badge styles with proper hover states
export const getProficiencyBadge = (level) => {
  // Base classes that will be applied to all badges
  const baseClasses = "border-transparent";

  // Level-specific classes
  switch (level) {
    case 1:
      return cn(
        baseClasses,
        "bg-blue-100 text-blue-800",
        "hover:bg-blue-200",
        "dark:bg-blue-900/30 dark:text-blue-300",
        "dark:hover:bg-blue-900/40"
      );
    case 2:
      return cn(
        baseClasses,
        "bg-green-100 text-green-800",
        "hover:bg-green-200",
        "dark:bg-green-900/30 dark:text-green-300",
        "dark:hover:bg-green-900/40"
      );
    case 3:
      return cn(
        baseClasses,
        "bg-yellow-100 text-yellow-800",
        "hover:bg-yellow-200",
        "dark:bg-yellow-900/30 dark:text-yellow-300",
        "dark:hover:bg-yellow-900/40"
      );
    case 4:
      return cn(
        baseClasses,
        "bg-orange-100 text-orange-800",
        "hover:bg-orange-200",
        "dark:bg-orange-900/30 dark:text-orange-300",
        "dark:hover:bg-orange-900/40"
      );
    case 5:
      return cn(
        baseClasses,
        "bg-red-100 text-red-800",
        "hover:bg-red-200",
        "dark:bg-red-900/30 dark:text-red-300",
        "dark:hover:bg-red-900/40"
      );
    case 6:
      return cn(
        baseClasses,
        "bg-purple-100 text-purple-800",
        "hover:bg-purple-200",
        "dark:bg-purple-900/30 dark:text-purple-300",
        "dark:hover:bg-purple-900/40"
      );
    case 7:
      return cn(
        baseClasses,
        "bg-indigo-100 text-indigo-800",
        "hover:bg-indigo-200",
        "dark:bg-indigo-900/30 dark:text-indigo-300",
        "dark:hover:bg-indigo-900/40"
      );
    default:
      return cn(
        baseClasses,
        "bg-gray-100 text-gray-800",
        "hover:bg-gray-200",
        "dark:bg-gray-800 dark:text-gray-300",
        "dark:hover:bg-gray-700"
      );
  }
};
