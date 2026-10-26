import { Link, createFileRoute, redirect } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { SignUpForm } from "@/components/auth-forms";
import { ScrollingVerb } from "@/components/scrolling-verb";
import { PitchPoints, SplitLayout } from "@/components/split-layout";
import { Button } from "@/components/ui/button";
import { m } from "@/paraglide/messages";

export const Route = createFileRoute("/_public/")({
  // The landing page is a sign-up page; signed-in users belong in the app
  beforeLoad: ({ context }) => {
    if (context.viewer) throw redirect({ to: "/dashboard" });
  },
  head: () => ({
    meta: [
      { title: "Vyzed" },
      { name: "description", content: m.landing_description() },
    ],
  }),
  component: LandingPage,
});

function LandingPage() {
  return (
    <SplitLayout
      asideOnMobile
      aside={
        <>
          <h1 className="text-4xl leading-tight font-semibold sm:text-5xl">
            {m.landing_find_someone()}
            <br />
            <ScrollingVerb verbs={m.landing_verbs().split("|")} />
          </h1>
          <p className="max-w-xl text-lg text-muted-foreground">
            {m.landing_description()}
          </p>
          <PitchPoints />
          <Button
            variant="outline"
            render={<Link to="/browse" />}
            nativeButton={false}
          >
            Browse teachers <ArrowRight />
          </Button>
        </>
      }
    >
      <SignUpForm />
    </SplitLayout>
  );
}
