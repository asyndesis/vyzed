import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@vyzed/ui/components/button";
import { CalendarCheck, Search, Video } from "lucide-react";

export const Route = createFileRoute("/")({ component: Home });

const features = [
  { icon: Search, title: "Find your teacher", body: "Search by subject, language and price." },
  {
    icon: CalendarCheck,
    title: "Book in your time zone",
    body: "See open slots in your local time.",
  },
  { icon: Video, title: "Learn one-on-one", body: "Lessons tailored to your goals." },
];

function Home() {
  return (
    <div className="mx-auto max-w-6xl px-4">
      <section className="flex flex-col items-center gap-6 py-24 text-center">
        <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-6xl">
          Learn anything with a teacher who fits your schedule
        </h1>
        <p className="max-w-xl text-lg text-muted-foreground">
          Vyzed connects learners with independent teachers. Find someone great, pick a time, and
          start learning.
        </p>
        <div className="flex gap-3">
          <Button asChild size="lg">
            <Link to="/teachers">Find a teacher</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link to="/sign-in">Become a teacher</Link>
          </Button>
        </div>
      </section>
      <section className="grid gap-6 pb-24 sm:grid-cols-3">
        {features.map(({ icon: Icon, title, body }) => (
          <div key={title} className="rounded-xl border p-6">
            <Icon className="mb-3 size-6" />
            <h3 className="font-semibold">{title}</h3>
            <p className="text-sm text-muted-foreground">{body}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
