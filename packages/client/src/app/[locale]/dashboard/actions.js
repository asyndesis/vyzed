"use server";

import { getClient } from "@/lib/apollo-client";
import { gql } from "@apollo/client";
import { revalidatePath } from "next/cache";

// Delete mutations
const DELETE_TEACHER_PROFILE = gql`
  mutation DeleteTeacherProfile($id: PostgresID!) {
    deleteTeacherProfile(id: $id)
  }
`;

const DELETE_USER_PROFILE = gql`
  mutation DeleteUserProfile($id: PostgresID!) {
    deleteUserProfile(id: $id)
  }
`;

// Create mutations
const CREATE_TEACHER_PROFILE = gql`
  mutation CreateTeacherProfile($input: CreateTeacherProfileInput!) {
    createTeacherProfile(input: $input) {
      id
    }
  }
`;

// Mutation to update user (for firstName and lastName)
const UPDATE_USER = gql`
  mutation UpdateUser($id: PostgresID!, $input: UpdateUserInput!) {
    updateUser(id: $id, input: $input) {
      id
      firstName
      lastName
    }
  }
`;

// Mutation to create user profile (for bio)
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

// Mutation to update user profile (for bio)
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

// Add these mutations to the existing file
const DELETE_STUDENT_PROFILE = gql`
  mutation DeleteStudentProfile($id: PostgresID!) {
    deleteStudentProfile(id: $id)
  }
`;

const CREATE_STUDENT_PROFILE = gql`
  mutation CreateStudentProfile($input: CreateStudentProfileInput!) {
    createStudentProfile(input: $input) {
      id
    }
  }
`;

export async function deleteTeacherProfile(id) {
  try {
    const { data } = await getClient().mutate({
      mutation: DELETE_TEACHER_PROFILE,
      variables: { id },
    });

    // Revalidate the dashboard path to refresh the data
    revalidatePath("/dashboard");

    return data.deleteTeacherProfile;
  } catch (error) {
    console.error("Error deleting teacher profile:", error);
    throw new Error("Failed to delete teacher profile");
  }
}

export async function createTeacherProfile(userId) {
  try {
    const { data } = await getClient().mutate({
      mutation: CREATE_TEACHER_PROFILE,
      variables: {
        input: {
          userId,
        },
      },
    });

    // Revalidate the dashboard path to refresh the data
    revalidatePath("/dashboard");

    return data.createTeacherProfile.id;
  } catch (error) {
    console.error("Error creating teacher profile:", error);
    throw new Error("Failed to create teacher profile");
  }
}

export async function deleteUserProfile(id) {
  try {
    const { data } = await getClient().mutate({
      mutation: DELETE_USER_PROFILE,
      variables: { id },
    });

    // Revalidate the dashboard path to refresh the data
    revalidatePath("/dashboard");

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

  // Revalidate the dashboard path
  revalidatePath("/dashboard");

  return userId;
}

// Add these functions after the existing ones
export async function deleteStudentProfile(id) {
  try {
    const { data } = await getClient().mutate({
      mutation: DELETE_STUDENT_PROFILE,
      variables: { id },
    });

    // Revalidate the dashboard path to refresh the data
    revalidatePath("/dashboard");

    return data.deleteStudentProfile;
  } catch (error) {
    console.error("Error deleting student profile:", error);
    throw new Error("Failed to delete student profile");
  }
}

export async function createStudentProfile(userId) {
  try {
    const { data } = await getClient().mutate({
      mutation: CREATE_STUDENT_PROFILE,
      variables: {
        input: {
          userId,
        },
      },
    });

    // Revalidate the dashboard path to refresh the data
    revalidatePath("/dashboard");

    return data.createStudentProfile.id;
  } catch (error) {
    console.error("Error creating student profile:", error);
    throw new Error("Failed to create student profile");
  }
}
