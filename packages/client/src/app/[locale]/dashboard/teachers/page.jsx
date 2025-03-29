import { gql } from "@apollo/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { getClient } from "@/lib/apollo-client";
import UserSkillBadge from "@/components/user-skill-badge";
import { convert } from "html-to-text";
import Link from "next/link";
import { BookOpen, ArrowLeftRight, Euro, Languages } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ClientFilterManager } from "./components/client-filter-manager";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
export const metadata = {
  title: "Teachers",
  description: "Find a teacher",
};

// GraphQL query - clearly named and organized
const GET_TEACHERS = gql`
  query GetTeachers(
    $pagination: PaginationInput
    $filters: TeacherUserFilters
  ) {
    publicTeacherUsers(pagination: $pagination, filters: $filters) {
      users {
        id
        firstName
        lastInitial
        imageUrl
        userProfile {
          id
          bio
          languages {
            id
            proficiency
            skill {
              id
              name
              framework
            }
          }
        }
        teacherProfile {
          id
          priceAmount
          priceCurrency
          skills {
            id
            skill {
              id
              name
              framework
            }
            proficiency
          }
        }
        studentProfile {
          id
          skills {
            id
            skill {
              id
              name
              framework
            }
            proficiency
          }
        }
      }
      pagination {
        total
        limit
        offset
        hasMore
      }
    }
  }
`;

// Extracted teacher card into a separate, focused component
function TeacherCard({ user, filters }) {
  const teacherProfile = user.teacherProfile;
  const languages = user.userProfile?.languages || [];
  const studentSkills = user.studentProfile?.skills || [];

  // Convert HTML bio to plain text for display
  const bioText = user.userProfile?.bio
    ? convert(user.userProfile.bio, {
        wordwrap: 130,
        limits: { maxInputLength: 250 },
      })
    : "";

  // Truncate bio text if it's too long
  const truncatedBio =
    bioText.length > 150 ? bioText.substring(0, 150) + "..." : bioText;

  // Format price for display
  const formattedPrice = teacherProfile.priceAmount
    ? `${(teacherProfile.priceAmount / 100).toFixed(2)} / hr`
    : null;

  return (
    <Link href={`/dashboard/teachers/${user.id}`} className="block">
      <Card className="overflow-hidden transition-all hover:shadow-md">
        <div className="flex">
          <div className="pl-6 pt-6 pb-6">
            <Avatar className="h-40 w-40 rounded-md">
              <AvatarImage
                src={user.imageUrl}
                alt={`${user.firstName} ${user.lastInitial}`}
              />
              <AvatarFallback>
                {user.firstName?.[0] || ""}
                {user.lastInitial || ""}
              </AvatarFallback>
            </Avatar>
          </div>
          <div className="flex-1 pt-2">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <CardTitle>
                  {user.firstName} {user.lastInitial}
                </CardTitle>
                <div className="-mt-3">
                  {formattedPrice && (
                    <Badge
                      variant="outline"
                      className="flex gap-1 items-center text-lg"
                    >
                      <Euro className="h-3.5 w-3.5" />
                      <span>{formattedPrice}</span>
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <SkillSection
                skills={teacherProfile.skills}
                icon={<BookOpen className="h-4 w-4 text-muted-foreground" />}
                tooltipText="Teaching Skills"
              />
              <SkillSection
                skills={languages}
                icon={<Languages className="h-4 w-4 text-muted-foreground" />}
                tooltipText="Spoken Languages"
              />
              {filters.studentSkills && (
                <SkillSection
                  skills={studentSkills}
                  icon={
                    <ArrowLeftRight className="h-4 w-4 text-muted-foreground" />
                  }
                  tooltipText="Barters for these classes"
                />
              )}
              {truncatedBio && (
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {truncatedBio}
                </p>
              )}
            </CardContent>
          </div>
        </div>
      </Card>
    </Link>
  );
}

// Further extraction of skill section to avoid repetition
function SkillSection({ skills, icon, tooltipText }) {
  if (!skills || skills.length === 0) return null;

  return (
    <div className="flex items-center gap-2 mb-2">
      <TooltipProvider>
        <Tooltip delayDuration={100}>
          <TooltipTrigger>{icon}</TooltipTrigger>
          <TooltipContent>
            <p>{tooltipText}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <div className="flex flex-wrap gap-2">
        {skills.map((skillItem) => (
          <UserSkillBadge key={skillItem.id} userSkill={skillItem} />
        ))}
      </div>
    </div>
  );
}

// Clean pagination component
function Pagination({
  offset,
  limit,
  total,
  hasMore,
  teaching,
  student,
  languages,
}) {
  const buildUrl = (newOffset) => {
    const params = new URLSearchParams({ offset: newOffset });
    if (teaching) params.set("teaching", teaching);
    if (student) params.set("student", student);
    if (languages) params.set("languages", languages);
    return `/dashboard/teachers?${params}`;
  };

  return (
    <div className="space-y-2 mt-6">
      <div className="flex justify-center gap-4">
        {offset > 0 && (
          <Link
            href={buildUrl(Math.max(0, offset - limit))}
            className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 transition-colors"
          >
            Previous
          </Link>
        )}

        {hasMore && (
          <Link
            href={buildUrl(offset + limit)}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Next
          </Link>
        )}
      </div>

      <div className="text-center text-sm text-muted-foreground">
        Showing {offset + 1}-{Math.min(offset + limit, total)} of {total}{" "}
        teachers
      </div>
    </div>
  );
}

// Main data fetching component
async function TeachersList({
  offset = 0,
  limit = 10,
  filters = null,
  teaching,
  student,
  languages,
}) {
  const variables = {
    pagination: { limit, offset },
  };

  // Add filters if provided
  if (filters) {
    variables.filters = filters;
  }

  const { data } = await getClient().query({
    query: GET_TEACHERS,
    variables,
    fetchPolicy: "network-only", // Ensure fresh data with filters
  });

  const { users: teachers, pagination } = data.publicTeacherUsers;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-6">
        {teachers.map((user) => (
          <TeacherCard key={user.id} user={user} filters={filters} />
        ))}
      </div>
      <Pagination
        offset={offset}
        limit={limit}
        total={pagination.total}
        hasMore={pagination.hasMore}
        teaching={teaching}
        student={student}
        languages={languages}
      />
    </div>
  );
}

// Simple skeleton with better naming
function TeachersListSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6">
      {[...Array(3)].map((_, i) => (
        <Card key={i} className="overflow-hidden">
          <CardHeader className="flex flex-row items-center gap-4 pb-2">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <SkillSectionSkeleton />
            <SkillSectionSkeleton />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// Helper skeleton component
function SkillSectionSkeleton() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-3 w-32" />
      <div className="flex flex-wrap gap-2">
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-6 w-14 rounded-full" />
      </div>
    </div>
  );
}

// Main page component
export default async function TeachersPage({ searchParams }) {
  const params = await searchParams;
  const offset = parseInt(params?.offset) || 0;
  const limit = 10;
  const teaching = params?.teaching || "";
  const student = params?.student || "";
  const languages = params?.languages || "";

  // Parse filters from URL using the cleaner format
  const filters = {};

  // Parse teaching skills
  if (teaching) {
    filters.teachingSkills = teaching
      .split(",")
      .filter(Boolean)
      .map((item) => {
        const [skillId, proficiency = "5"] = item.split(":");
        return {
          skillId,
          proficiency: parseInt(proficiency, 10),
        };
      });
  }

  // Parse student skills
  if (student) {
    filters.studentSkills = student
      .split(",")
      .filter(Boolean)
      .map((item) => {
        const [skillId, proficiency = "5"] = item.split(":");
        return {
          skillId,
          proficiency: parseInt(proficiency, 10),
        };
      });
  }

  // Parse languages
  if (languages) {
    filters.languages = languages
      .split(",")
      .filter(Boolean)
      .map((item) => {
        const [skillId, proficiency = "5"] = item.split(":");
        return {
          skillId,
          proficiency: parseInt(proficiency, 10),
        };
      });
  }

  return (
    <>
      <PageHeader title="Teachers" description="Find someone who..." />
      <ClientFilterManager initialFilters={filters} />
      <Suspense
        key={`${teaching || ""}-${student || ""}-${languages || ""}-${offset}`}
        fallback={<TeachersListSkeleton />}
      >
        <TeachersList
          offset={offset}
          limit={limit}
          filters={filters}
          teaching={teaching}
          student={student}
          languages={languages}
        />
      </Suspense>
    </>
  );
}
