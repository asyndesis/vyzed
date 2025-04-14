"use server";

import { getClient } from "@/lib/apollo-client";
import { gql } from "@apollo/client";
import { revalidatePath } from "next/cache";

const UPDATE_USER = gql`
  mutation UpdateUser($id: PostgresID!, $input: UpdateUserInput!) {
    updateUser(id: $id, input: $input) {
      id
      firstName
      lastName
    }
  }
`;

const UPDATE_USER_PROFILE = gql`
  mutation UpdateUserProfile(
    $id: PostgresID!
    $input: UpdateUserProfileInput!
  ) {
    updateUserProfile(id: $id, input: $input) {
      id
      bio
      languages {
        id
        skillId
        proficiency
      }
    }
  }
`;

export async function saveUserData({ userId, user, userProfile }) {
  // First, update the user's name
  await getClient().mutate({
    mutation: UPDATE_USER,
    variables: {
      id: userId,
      input: {
        firstName: user.firstName,
        lastName: user.lastName,
      },
    },
  });

  // Then, handle the userProfile update - assuming userProfile always exists
  await getClient().mutate({
    mutation: UPDATE_USER_PROFILE,
    variables: {
      id: userProfile.id,
      input: {
        bio: userProfile.bio,
        languages: userProfile.languages,
      },
    },
  });

  revalidatePath("/dashboard/user-profile");
  return userId;
}
