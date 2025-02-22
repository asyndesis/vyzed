import { cn } from "@/lib/utils";
import {
  Frame,
  XCircle,
  PieChart,
  Map,
  GalleryVerticalEnd,
  SquareTerminal,
  CircleAlert,
  Pencil,
} from "lucide-react";

// Add new icons here as we need them
const iconMap = {
  Frame,
  PieChart,
  Map,
  GalleryVerticalEnd,
  SquareTerminal,
  CircleAlert,
  Pencil,
};

export const Icon = ({ iconName, className }) => {
  const IconComponent = iconMap[iconName] || XCircle;

  return <IconComponent className={cn("h-4 w-4", className)} />;
};
