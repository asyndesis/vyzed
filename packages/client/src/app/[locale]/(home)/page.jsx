import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  HeartHandshake,
  Users,
  Sparkles,
  GraduationCap,
  Clock,
  DollarSign,
  Search,
  Handshake,
  ArrowRight,
  CheckCircle2,
  ArrowUpRight,
  Globe,
  Shield,
  Star,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function LandingPage() {
  const t = await getTranslations("HomePage");

  return (
    <>
      <main className="min-h-screen bg-gradient-to-b from-background to-background/90">
        {/* Hero section with dynamic background */}
        <section className="relative py-28 md:py-36 overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] -z-10" />
          <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-primary/20 opacity-20 blur-[100px]" />

          <div className="container relative max-w-6xl mx-auto px-4">
            <div className="flex flex-col items-center text-center">
              <Badge
                className="mb-8 py-1.5 px-3 text-sm font-medium bg-primary/5 hover:bg-primary/10 text-primary border-0 rounded-full"
                variant="outline"
              >
                <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                <span>Reimagining human connection through learning</span>
              </Badge>

              <h1 className="text-5xl md:text-7xl font-bold leading-tight tracking-tight mb-6 md:mb-8 max-w-4xl mx-auto">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-blue-500 to-indigo-500">
                  Connect
                </span>{" "}
                for Learning & Support
              </h1>

              <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-2xl font-light">
                A platform designed for meaningful connections between teachers
                and learners— without unnecessary complexity or costs.
              </p>

              <div className="flex flex-col sm:flex-row gap-5 mb-20">
                <Button
                  size="lg"
                  className="h-14 px-8 rounded-full text-base font-medium shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
                >
                  Start Learning
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button
                  variant="secondary"
                  size="lg"
                  className="h-14 px-8 rounded-full text-base font-medium border-none bg-muted/80 hover:bg-muted"
                >
                  Become a Teacher
                  <ArrowUpRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Feature cards with hover effects */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
              {[
                {
                  icon: <HeartHandshake className="h-10 w-10" />,
                  title: "1-on-1 Connection",
                  desc: "Direct learning, therapy, and mentoring experiences",
                },
                {
                  icon: <Users className="h-10 w-10" />,
                  title: "Human-Centered",
                  desc: "Platform focused on real human connection",
                },
                {
                  icon: <DollarSign className="h-10 w-10" />,
                  title: "Full Earnings",
                  desc: "We don't take a cut of educators' earnings",
                },
              ].map((item, i) => (
                <Card
                  key={i}
                  className="group backdrop-blur-sm border border-muted h-full overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-primary/20 hover:-translate-y-1"
                >
                  <CardContent className="p-8 flex flex-col items-center text-center">
                    <div className="rounded-full bg-gradient-to-br from-primary/10 to-primary/5 p-4 mb-6 group-hover:bg-primary/20 transition-colors duration-300">
                      <div className="text-primary group-hover:text-primary/90 transition-colors duration-300">
                        {item.icon}
                      </div>
                    </div>
                    <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                    <p className="text-muted-foreground">{item.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Stats section */}
        <section className="py-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-muted/30 to-transparent -z-10" />
          <div className="container mx-auto max-w-5xl px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-16">
              {[
                { number: "0%", label: "Platform Fee for Teachers" },
                { number: "$3", label: "Monthly Fee for Learners" },
                { number: "100%", label: "Earnings to Teachers" },
                { number: "24/7", label: "Connection Opportunities" },
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <p className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-indigo-500 mb-2">
                    {stat.number}
                  </p>
                  <p className="text-muted-foreground font-medium">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Educators section */}
        <section className="py-28 relative overflow-hidden">
          <div className="absolute right-0 -top-40 -z-10 h-[500px] w-[500px] rounded-full bg-primary/10 opacity-20 blur-[100px]" />

          <div className="container mx-auto max-w-6xl px-4">
            <div className="flex flex-col md:flex-row gap-16 items-center">
              <div className="md:w-1/2 space-y-6">
                <Badge
                  className="px-3 py-1 bg-primary/5 hover:bg-primary/10 text-primary border-0 rounded-full"
                  variant="outline"
                >
                  For Educators
                </Badge>

                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight tracking-tight mb-6">
                  Teachers, providers,
                  <br className="hidden md:block" /> and mentors
                </h2>

                <p className="text-lg md:text-xl text-muted-foreground font-light">
                  Share your expertise without the hassle of middlemen. Create
                  your own schedule, set your own rates, and build direct
                  relationships with your students.
                </p>

                <ul className="space-y-5 pt-4">
                  {[
                    "No cost to join or use the platform",
                    "Direct arrangements with your students/clients",
                    "Full control over your services and rates",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start">
                      <div className="rounded-full bg-primary/10 p-1 mr-4 mt-0.5">
                        <CheckCircle2 className="h-5 w-5 text-primary" />
                      </div>
                      <span className="text-lg">{item}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className="mt-8 rounded-full px-8 shadow-lg shadow-primary/20"
                  size="lg"
                >
                  <GraduationCap className="mr-2 h-5 w-5" />
                  Start Teaching
                </Button>
              </div>

              <div className="md:w-1/2">
                <div className="relative">
                  <div className="absolute -inset-2 rounded-3xl bg-gradient-to-r from-blue-600/20 via-primary/20 to-indigo-600/20 opacity-60 blur-xl transform rotate-3"></div>
                  <Card className="relative overflow-hidden rounded-2xl border-none shadow-2xl bg-background/95 backdrop-blur">
                    <CardHeader className="pb-4 border-b border-muted">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="rounded-full p-2 bg-primary/10">
                          <GraduationCap className="h-5 w-5 text-primary" />
                        </div>
                        <Badge
                          variant="secondary"
                          className="font-medium rounded-md px-3 py-1"
                        >
                          Educator Plan
                        </Badge>
                      </div>
                      <CardTitle className="text-2xl md:text-3xl font-bold">
                        Free Forever
                      </CardTitle>
                    </CardHeader>

                    <CardContent className="p-6">
                      <div className="space-y-4 mb-8">
                        {[
                          {
                            icon: <DollarSign className="h-4 w-4" />,
                            label: "Platform Fee",
                            value: "None",
                          },
                          {
                            icon: <Globe className="h-4 w-4" />,
                            label: "Commission",
                            value: "0%",
                          },
                          {
                            icon: <Clock className="h-4 w-4" />,
                            label: "Scheduling",
                            value: "Full control",
                          },
                          {
                            icon: <Shield className="h-4 w-4" />,
                            label: "Payment",
                            value: "Direct from students",
                          },
                        ].map((item, i) => (
                          <div
                            key={i}
                            className="flex justify-between items-center border-b border-border/40 pb-3"
                          >
                            <span className="flex items-center text-muted-foreground">
                              <span className="bg-muted rounded-full p-1 mr-2">
                                {item.icon}
                              </span>
                              {item.label}
                            </span>
                            <span className="font-medium">{item.value}</span>
                          </div>
                        ))}
                      </div>

                      <Button className="w-full rounded-xl" size="lg">
                        Create Educator Profile
                      </Button>
                    </CardContent>

                    <CardFooter className="bg-muted/40 py-4 px-6 text-center">
                      <p className="text-sm text-muted-foreground">
                        *All payments processed through secure third-party
                        providers
                      </p>
                    </CardFooter>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Learners section */}
        <section className="py-28 relative overflow-hidden bg-muted/10">
          <div className="absolute left-0 -bottom-40 -z-10 h-[500px] w-[500px] rounded-full bg-indigo-500/10 opacity-20 blur-[100px]" />

          <div className="container mx-auto max-w-6xl px-4">
            <div className="flex flex-col md:flex-row-reverse gap-16 items-center">
              <div className="md:w-1/2 space-y-6">
                <Badge
                  className="px-3 py-1 bg-indigo-500/5 hover:bg-indigo-500/10 text-indigo-500 border-0 rounded-full"
                  variant="outline"
                >
                  For Learners
                </Badge>

                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight tracking-tight mb-6">
                  Students and
                  <br className="hidden md:block" /> support seekers
                </h2>

                <p className="text-lg md:text-xl text-muted-foreground font-light">
                  Find the perfect mentor or teacher for your unique learning
                  journey. Connect with qualified professionals who can help you
                  achieve your goals.
                </p>

                <ul className="space-y-5 pt-4">
                  {[
                    "$3 monthly platform access (keeps our servers running)",
                    "Find qualified teachers, therapists, and mentors",
                    "Option to barter your classes for classes from others",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start">
                      <div className="rounded-full bg-indigo-500/10 p-1 mr-4 mt-0.5">
                        <CheckCircle2 className="h-5 w-5 text-indigo-500" />
                      </div>
                      <span className="text-lg">{item}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className="mt-8 rounded-full px-8 shadow-lg shadow-indigo-500/20 bg-indigo-500 hover:bg-indigo-600"
                  size="lg"
                >
                  <BookOpen className="mr-2 h-5 w-5" />
                  Find Teachers
                </Button>
              </div>

              <div className="md:w-1/2">
                <div className="relative">
                  <div className="absolute -inset-2 rounded-3xl bg-gradient-to-r from-indigo-600/20 via-blue-600/20 to-indigo-400/20 opacity-60 blur-xl transform -rotate-3"></div>
                  <Card className="relative overflow-hidden rounded-2xl border-none shadow-2xl bg-background/95 backdrop-blur">
                    <CardHeader className="pb-4 border-b border-muted">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="rounded-full p-2 bg-indigo-500/10">
                          <BookOpen className="h-5 w-5 text-indigo-500" />
                        </div>
                        <Badge
                          variant="secondary"
                          className="font-medium rounded-md px-3 py-1"
                        >
                          Learner Plan
                        </Badge>
                      </div>
                      <CardTitle className="text-2xl md:text-3xl font-bold">
                        $3
                        <span className="text-base font-normal text-muted-foreground">
                          /month
                        </span>
                      </CardTitle>
                    </CardHeader>

                    <CardContent className="p-6">
                      <div className="space-y-4 mb-8">
                        <div className="flex justify-between items-center border-b border-border/40 pb-3">
                          <span className="flex items-center text-muted-foreground">
                            <span className="bg-muted rounded-full p-1 mr-2">
                              <DollarSign className="h-4 w-4" />
                            </span>
                            Platform Fee
                          </span>
                          <Badge
                            variant="outline"
                            className="font-semibold text-indigo-500 border-indigo-500/20"
                          >
                            $3/month
                          </Badge>
                        </div>

                        {[
                          {
                            icon: <Search className="h-4 w-4" />,
                            label: "Teacher Selection",
                            value: "Unlimited",
                          },
                          {
                            icon: <Star className="h-4 w-4" />,
                            label: "Learning Formats",
                            value: "Flexible",
                          },
                          {
                            icon: <Handshake className="h-4 w-4" />,
                            label: "Support Options",
                            value: "Diverse",
                          },
                        ].map((item, i) => (
                          <div
                            key={i}
                            className="flex justify-between items-center border-b border-border/40 pb-3"
                          >
                            <span className="flex items-center text-muted-foreground">
                              <span className="bg-muted rounded-full p-1 mr-2">
                                {item.icon}
                              </span>
                              {item.label}
                            </span>
                            <span className="font-medium">{item.value}</span>
                          </div>
                        ))}
                      </div>

                      <Button
                        className="w-full rounded-xl bg-indigo-500 hover:bg-indigo-600"
                        size="lg"
                      >
                        Start Learning Today
                      </Button>
                    </CardContent>

                    <CardFooter className="bg-muted/40 py-4 px-6 text-center">
                      <p className="text-sm text-muted-foreground">
                        *Teacher rates vary and are set individually by
                        educators
                      </p>
                    </CardFooter>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA section */}
        <section className="py-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-background to-background/50 -z-10" />
          <div className="absolute opacity-5 inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px] -z-10" />

          <div className="container mx-auto max-w-4xl px-4 text-center">
            <Badge
              className="mb-6 py-1.5 px-3 text-sm font-medium bg-primary/5 hover:bg-primary/10 text-primary border-0 rounded-full"
              variant="outline"
            >
              <Sparkles className="h-3.5 w-3.5 mr-1.5" />
              <span>Get Started Today</span>
            </Badge>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">
              Ready to transform how you learn or teach?
            </h2>

            <p className="text-lg md:text-xl text-muted-foreground font-light max-w-2xl mx-auto mb-10">
              Join our community of learners and educators. Create meaningful
              connections that foster growth and development.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="h-14 px-8 rounded-full text-base font-medium shadow-lg shadow-primary/20"
              >
                Start Learning
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="h-14 px-8 rounded-full text-base font-medium"
              >
                Become a Teacher
                <ArrowUpRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
