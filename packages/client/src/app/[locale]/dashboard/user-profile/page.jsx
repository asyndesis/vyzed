import { getClient } from "@/lib/apollo-client";
import { gql } from "@apollo/client";
import { UserProfileEditForm } from "./components/user-profile-edit-form";
import { PageHeader } from "@/components/page-header";
export const metadata = {
  title: "User Profile",
  description: "Manage your user profile and language preferences",
};

const GET_USER_PROFILE = gql`
  query GetUserProfile {
    me {
      id
      firstName
      lastName
      lastInitial
      email
      userProfile {
        id
        bio
        languages {
          id
          skillId
          proficiency
          skill {
            id
            name
            framework
          }
        }
      }
    }
  }
`;

export default async function UserProfilePage() {
  const { data } = await getClient().query({
    query: GET_USER_PROFILE,
  });

  const user = data?.me;

  return (
    <>
      <PageHeader
        title="User Profile"
        description="Manage your profile and language preferences"
      />
      <UserProfileEditForm user={user} />
    </>
  );
}
