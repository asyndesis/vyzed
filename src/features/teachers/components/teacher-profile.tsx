import { useSuspenseQuery } from "@tanstack/react-query";
import { Link, notFound, useRouteContext } from "@tanstack/react-router";
import { format } from "date-fns";
import {
  ArrowLeft,
  ArrowLeftRight,
  BookOpen,
  GraduationCap,
  Languages,
  type LucideIcon,
} from "lucide-react";
import {
  BookableTeacherFields,
  RequestLessonDialog,
} from "@/features/teachers/components/request-lesson-dialog";
import { SkillBadges } from "@/components/skill-badges";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Item, ItemContent, ItemMedia, ItemTitle } from "@/components/ui/item";
import { UserAvatar } from "@/components/user-avatar";
import { formatPrice, fullName } from "@/lib/format";
import { gqlQuery, graphql } from "@/lib/gql";

const TeacherProfileQuery = graphql(
  `
    query TeacherProfile($id: ID!) {
      user(id: $id) {
        id
        firstName
        lastInitial
        image
        bio
        createdAt
        priceAmount
        priceCurrency
        allowBarter
        skills {
          kind
          proficiency
          skill {
            id
            name
            framework
          }
        }
        ...BookableTeacherFields
      }
    }
  `,
  [BookableTeacherFields],
);

export const teacherProfileQuery = (id: string) =>
  gqlQuery(TeacherProfileQuery, { id });

// For route loaders: 404 when there's no such user
export async function loadTeacherProfile(
  queryClient: import("@tanstack/react-query").QueryClient,
  id: string,
) {
  const data = await queryClient.ensureQueryData(teacherProfileQuery(id));
  if (!data.user) throw notFound();
  return data;
}

function Block({
  icon: Icon,
  title,
  children,
}: {
  icon: LucideIcon;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-2">
      <h2 className="flex items-center gap-2 font-sans text-sm font-semibold text-muted-foreground">
        <Icon className="size-4" /> {title}
      </h2>
      {children}
    </section>
  );
}

// Shared by the public /browse/$id and the signed-in /dashboard/teachers/$id pages
export function TeacherProfile({
  id,
  backTo,
}: {
  id: string;
  backTo: "/browse" | "/dashboard/teachers";
}) {
  const { viewer } = useRouteContext({ from: "__root__" });
  const { data } = useSuspenseQuery(teacherProfileQuery(id));
  const user = data.user!;

  const of = (kind: "teaches" | "speaks" | "learns") =>
    user.skills.filter((s) => s.kind === kind);
  const teaches = of("teaches");
  const price = formatPrice(user.priceAmount, user.priceCurrency);
  const isMe = viewer?.id === user.id;

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className="-ml-2"
        render={<Link to={backTo} />}
        nativeButton={false}
      >
        <ArrowLeft /> All teachers
      </Button>

      <div className="grid gap-8 md:grid-cols-[1fr_280px]">
        <div className="space-y-8">
          <div className="flex items-center gap-4">
            <UserAvatar user={user} className="size-20 text-2xl" />
            <div>
              <h1 className="text-2xl font-semibold">{fullName(user)}</h1>
              <p className="text-sm text-muted-foreground">
                Member since {format(new Date(user.createdAt), "MMMM yyyy")}
              </p>
            </div>
          </div>

          {user.bio && (
            <p className="leading-relaxed whitespace-pre-line">{user.bio}</p>
          )}

          {teaches.length > 0 && (
            <Block icon={BookOpen} title="Teaches">
              <SkillBadges items={teaches} />
            </Block>
          )}
          {of("speaks").length > 0 && (
            <Block icon={Languages} title="Speaks">
              <SkillBadges items={of("speaks")} />
            </Block>
          )}
          {of("learns").length > 0 && (
            <Block
              icon={GraduationCap}
              title={
                user.allowBarter
                  ? "Wants to learn (swap for these)"
                  : "Wants to learn"
              }
            >
              <SkillBadges items={of("learns")} />
            </Block>
          )}
        </div>

        <Card className="h-fit md:sticky md:top-20">
          <CardHeader>
            <CardTitle>{price ?? "Free"}</CardTitle>
            {price && <CardDescription>per hour</CardDescription>}
          </CardHeader>
          {user.allowBarter && (
            <CardContent>
              <Item variant="outline" size="sm">
                <ItemMedia variant="icon">
                  <ArrowLeftRight />
                </ItemMedia>
                <ItemContent>
                  <ItemTitle>
                    Open to swapping lessons instead of payment
                  </ItemTitle>
                </ItemContent>
              </Item>
            </CardContent>
          )}
          <CardFooter>
            {isMe ? (
              <Button
                variant="outline"
                className="w-full"
                render={<Link to="/dashboard/profile" />}
                nativeButton={false}
              >
                Edit your profile
              </Button>
            ) : teaches.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Not taking lessons right now.
              </p>
            ) : viewer ? (
              <RequestLessonDialog
                data={user}
                trigger={
                  <Button size="lg" className="w-full">
                    Request a lesson
                  </Button>
                }
              />
            ) : (
              <Button
                size="lg"
                className="w-full"
                nativeButton={false}
                // Come back to this teacher inside the app after signing in
                render={
                  <Link
                    to="/sign-in"
                    search={{ redirect: `/dashboard/teachers/${user.id}` }}
                  />
                }
              >
                Sign in to book
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </>
  );
}
