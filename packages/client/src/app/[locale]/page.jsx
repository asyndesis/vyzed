import { getTranslations } from "next-intl/server";
import { getClient } from "@/lib/apollo-client";
import { gql } from "@apollo/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

// GraphQL query to fetch all profiles with their skills
const GET_PROFILES = gql`
  query GetProfiles {
    profiles {
      id
      userId
      user {
        firstName
        lastName
        imageUrl
      }
      profileSkills {
        id
        proficiency
        skill {
          id
          name
        }
      }
      createdAt
    }
  }
`;

// Helper function to render proficiency based on skill type and level
const renderProficiency = (skillItem) => {
  const proficiencyLevel = parseInt(skillItem.proficiency);

  switch (proficiencyLevel) {
    case 0:
      return "Newb";
    case 1:
      return "A1";
    case 2:
      return "A2";
    case 3:
      return "B1";
    case 4:
      return "B2";
    case 5:
      return "C1";
    case 6:
      return "C2";
    case 7:
      return "Native";
    default:
      return "";
  }
};

// Create a ProfileList component that fetches and displays profiles
async function ProfileList() {
  // Fetch profiles data server-side
  const { data } = await getClient().query({
    query: GET_PROFILES,
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {data.profiles.map((profile) => (
        <Card key={profile.id} className="overflow-hidden">
          <CardHeader className="flex flex-row items-center gap-4 pb-2">
            <Avatar className="h-12 w-12">
              <AvatarImage
                src={profile.user.imageUrl}
                alt={`${profile.user.firstName} ${profile.user.lastName}`}
              />
              <AvatarFallback>
                {profile.user.firstName[0]}
                {profile.user.lastName[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle>
                {profile.user.firstName} {profile.user.lastName}
              </CardTitle>
              <CardDescription>
                Joined {new Date(profile.createdAt).toLocaleDateString()}
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2 mt-2">
              {profile.profileSkills.map((skillItem) => (
                <Badge
                  key={skillItem.id}
                  variant="secondary"
                  className="flex items-center gap-1"
                >
                  {skillItem.skill.name}
                  <span className="ml-1 text-xs opacity-70">
                    {renderProficiency(skillItem)}
                  </span>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// Create a loading skeleton component
function ProfileSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <Card key={i} className="overflow-hidden">
          <CardHeader className="flex flex-row items-center gap-4 pb-2">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2 mt-2">
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-6 w-14 rounded-full" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default async function IndexPage() {
  const t = await getTranslations("HomePage");

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">{t("profilesTitle")}</h1>
      <Suspense fallback={<ProfileSkeleton />}>
        <ProfileList />
      </Suspense>
    </div>
  );
}
