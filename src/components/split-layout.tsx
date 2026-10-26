import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeftRight, CalendarCheck, Search } from "lucide-react";

const POINTS = [
  {
    icon: Search,
    text: "Find teachers near you for languages, code, therapy and more.",
  },
  {
    icon: ArrowLeftRight,
    text: "Swap lessons skill for skill, or set your own rate.",
  },
  {
    icon: CalendarCheck,
    text: "Request, confirm and track every lesson in one place.",
  },
];

export function PitchPoints() {
  return (
    <ul className="space-y-4">
      {POINTS.map(({ icon: Icon, text }) => (
        <li key={text} className="flex items-start gap-3 text-muted-foreground">
          <Icon className="mt-0.5 size-5 shrink-0 text-foreground" />
          {text}
        </li>
      ))}
    </ul>
  );
}

// Pitch on the left, a card on the right. Home and the auth pages share it so
// they read as one flow.
export function SplitLayout({
  aside,
  asideOnMobile = false,
  children,
}: {
  aside: React.ReactNode;
  asideOnMobile?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 md:grid-cols-[1fr_400px] md:gap-16 md:px-10 md:py-24">
      <div
        className={asideOnMobile ? "space-y-6" : "hidden space-y-6 md:block"}
      >
        {aside}
      </div>
      <Card>
        <CardContent>{children}</CardContent>
      </Card>
    </section>
  );
}
