"use server";

import { getClient } from "@/lib/apollo-client";
import { gql } from "@apollo/client";
import { revalidatePath } from "next/cache";

const DELETE_USER_PROFILE = gql`
  mutation DeleteUserProfile($id: PostgresID!) {
    deleteUserProfile(id: $id)
  }
`;

const UPDATE_USER = gql`
  mutation UpdateUser($id: PostgresID!, $input: UpdateUserInput!) {
    updateUser(id: $id, input: $input) {
      id
      firstName
      lastName
    }
  }
`;

const CREATE_USER_PROFILE = gql`
  mutation CreateUserProfile($input: CreateUserProfileInput!) {
    createUserProfile(input: $input) {
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

export async function deleteUserProfile(id) {
  try {
    const { data } = await getClient().mutate({
      mutation: DELETE_USER_PROFILE,
      variables: { id },
    });

    revalidatePath("/dashboard/user-profile");
    return data.deleteUserProfile;
  } catch (error) {
    console.error("Error deleting user profile:", error);
    throw new Error("Failed to delete user profile");
  }
}

export async function saveUserData({
  userId,
  firstName,
  lastName,
  bio,
  languages,
  userProfile,
}) {
  // First, update the user's name
  await getClient().mutate({
    mutation: UPDATE_USER,
    variables: {
      id: userId,
      input: {
        firstName,
        lastName,
      },
    },
  });

  // Then, handle the bio (which is part of userProfile)
  if (userProfile) {
    // Update existing profile
    await getClient().mutate({
      mutation: UPDATE_USER_PROFILE,
      variables: {
        id: userProfile.id,
        input: {
          bio,
          languages,
        },
      },
    });
  } else {
    // Create new profile
    await getClient().mutate({
      mutation: CREATE_USER_PROFILE,
      variables: {
        input: {
          userId,
          bio,
          languages,
        },
      },
    });
  }

  revalidatePath("/dashboard/user-profile");
  return userId;
}
