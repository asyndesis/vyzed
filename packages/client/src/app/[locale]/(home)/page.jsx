import { getTranslations } from "next-intl/server";
import { Sparkles, GraduationCap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollingVerb } from "./components/scrolling-verb";
import { MailingListForm } from "./components/MailingListForm";

export const metadata = {
  title: "Vyzed",
  description:
    "Vyzed is a way for students and teachers, therapists and clients, ameteurs and experts to find eachother.",
};

export default async function LandingPage() {
  const t = await getTranslations("LandingPage");

  return (
    <>
      <main className="text-right min-h-screen bg-gradient-to-b from-background to-background/90">
        {/* Decorative elements */}
        <div
          className="absolute inset-0 -z-1"
          style={{
            backgroundImage: `
                linear-gradient(to right, rgba(128, 128, 128, 0.03) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(128, 128, 128, 0.03) 1px, transparent 1px),
                radial-gradient(rgba(128, 128, 128, 0.03) 1px, transparent 1px)
              `,
            backgroundSize: "24px 24px, 24px 24px, 20px 20px",
            backgroundPosition: "0 0, 0 0, 10px 10px",
          }}
        />
        <section className="relative py-28 md:py-36 overflow-hidden">
          <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-primary/20 opacity-20 blur-[100px]" />

          <div className="container relative max-w-6xl mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center gap-12 md:gap-16 lg:gap-24">
              <div className="flex-1 flex flex-col gap-6 md:gap-8 text-center md:text-right">
                <Badge
                  className="mx-auto md:ml-auto md:mr-0 py-1.5 px-3 text-sm font-medium bg-primary/5 hover:bg-primary/10 text-primary border-0 rounded-full w-fit"
                  variant="outline"
                >
                  <GraduationCap className="h-3.5 w-3.5 mr-1.5" />
                  <span>{t("learningTagline")}</span>
                </Badge>

                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight tracking-tight">
                  <span className="md:mr-3 z-[1] relative">
                    {t("findSomeone")}
                  </span>
                  <br />
                  <ScrollingVerb
                    verbs={[
                      t("scrollingVerb1"),
                      t("scrollingVerb2"),
                      t("scrollingVerb3"),
                      t("scrollingVerb4"),
                      t("scrollingVerb5"),
                      t("scrollingVerb6"),
                      t("scrollingVerb7"),
                    ]}
                  />
                </h1>

                <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-2xl font-light mx-auto md:ml-auto md:mr-0">
                  {t("description")}
                </p>
              </div>

              {/* Mailing List Signup Card */}
              <div className="relative overflow-hidden bg-gradient-to-tr from-card/90 to-card/40 backdrop-blur-lg border border-border/30 shadow-2xl rounded-2xl p-6 sm:p-8 w-full md:w-auto max-w-md mx-auto md:mx-0 text-center">
                <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,transparent,white)] -z-10" />
                <div className="absolute -top-16 -right-16 w-40 h-40 rounded-full bg-primary/20 blur-3xl opacity-60 -z-10" />

                <Badge
                  variant="outline"
                  className="mb-6 py-1.5 px-3 text-sm font-medium bg-background/30 text-foreground border-0 rounded-full"
                >
                  <Sparkles className="h-3.5 w-3.5 mr-1.5 text-primary" />
                  <span>{t("earlyAccess")}</span>
                </Badge>

                <h2 className="text-3xl font-bold mb-3 text-foreground">
                  {t("joinWaitingList")}
                </h2>
                <p className="text-muted-foreground mb-6">
                  {t("beFirstToKnow")}
                </p>

                <MailingListForm />
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
