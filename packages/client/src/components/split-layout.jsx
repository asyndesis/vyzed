import { ArrowLeftRight, CalendarCheck, Search } from "lucide-react";

const POINTS = [
  { icon: Search, text: "Find teachers near you for languages, code, therapy and more." },
  { icon: ArrowLeftRight, text: "Swap lessons skill for skill, or set your own rate." },
  { icon: CalendarCheck, text: "Request, confirm and track every lesson in one place." },
];

export function PitchPoints() {
  return (
    <ul className="space-y-4">
      {POINTS.map(({ icon: Icon, text }) => (
        <li key={text} className="flex items-start gap-3 text-muted-foreground">
          <Icon className="mt-0.5 h-5 w-5 shrink-0 text-foreground" />
          {text}
        </li>
      ))}
    </ul>
  );
}

// Public split: pitch on the left, a card (auth form) on the right.
// Home and every auth page use this so they read as one flow.
export function SplitLayout({ aside, asideOnMobile = false, children }) {
  return (
    <section className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 md:grid-cols-[1fr_400px] md:gap-16 md:px-10 md:py-24">
      <div className={asideOnMobile ? "space-y-6" : "hidden space-y-6 md:block"}>{aside}</div>
      <div className="rounded-xl border bg-card p-6 sm:p-8">{children}</div>
    </section>
  );
}
