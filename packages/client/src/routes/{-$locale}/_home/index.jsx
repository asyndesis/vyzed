import { Suspense } from "react";
import { Link, createFileRoute, redirect } from "@tanstack/react-router";
import { useTranslations } from "use-intl";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuthForm } from "@/components/auth-form";
import { PitchPoints, SplitLayout } from "@/components/split-layout";
import { ScrollingVerb } from "@/components/scrolling-verb";

import { hasSession } from "@/lib/session";

export const Route = createFileRoute("/{-$locale}/_home/")({
  // The landing page is a sign-up page; signed-in users belong in the app
  beforeLoad: async () => {
    if (await hasSession()) throw redirect({ to: "/{-$locale}/dashboard" });
  },
  head: () => ({
    meta: [
      { title: "Vyzed" },
      {
        name: "description",
        content:
          "Vyzed is a way for students and teachers, therapists and clients, amateurs and experts to find each other.",
      },
    ],
  }),
  component: LandingPage,
});

function LandingPage() {
  const t = useTranslations("LandingPage");

  return (
    <SplitLayout
      asideOnMobile
      aside={
        <>
          <h1 className="text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
            {t("findSomeone")}
            <br />
            <ScrollingVerb
              verbs={[1, 2, 3, 4, 5, 6, 7].map((n) => t(`scrollingVerb${n}`))}
            />
          </h1>
          <p className="max-w-xl text-lg text-muted-foreground">{t("description")}</p>
          <PitchPoints />
          <Button asChild variant="outline">
            <Link to="/{-$locale}/browse">
              Browse teachers <ArrowRight />
            </Link>
          </Button>
        </>
      }
    >
      <Suspense>
        <AuthForm mode="sign-up" />
      </Suspense>
    </SplitLayout>
  );
}
