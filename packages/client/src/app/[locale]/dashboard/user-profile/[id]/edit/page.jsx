import { getClient } from "@/lib/apollo-client";
import { gql } from "@apollo/client";
import { UserProfileEditForm } from "../../components/user-profile-edit-form";
import { PageHeader } from "@/components/page-header";
export const metadata = {
  title: "User Profile",
  description: "Manage your user profile and language preferences",
};

const GET_USER_PROFILE = gql`
  query GetUserProfileById($id: PostgresID!) {
    userById(id: $id) {
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

export default async function UserProfilePage({ params }) {
  const { id } = await params;

  const { data } = await getClient().query({
    query: GET_USER_PROFILE,
    variables: { id },
  });

  const user = data?.userById;

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
