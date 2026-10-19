import { Suspense } from "react";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuthForm } from "@/components/auth-form";
import { PitchPoints, SplitLayout } from "@/components/split-layout";
import { ScrollingVerb } from "./components/scrolling-verb";

export const metadata = {
  title: "Vyzed",
  description:
    "Vyzed is a way for students and teachers, therapists and clients, amateurs and experts to find each other.",
};

// Signed-in visitors are sent to /dashboard by the middleware
export default async function LandingPage() {
  const t = await getTranslations("LandingPage");

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
            <Link href="/browse">
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
