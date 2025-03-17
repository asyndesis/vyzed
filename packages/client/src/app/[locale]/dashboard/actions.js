"use server";

import { getClient } from "@/lib/apollo-client";
import { gql } from "@apollo/client";
import { revalidatePath } from "next/cache";

// Delete mutation
const DELETE_TEACHER_PROFILE = gql`
  mutation DeleteTeacherProfile($id: PostgresID!) {
    deleteTeacherProfile(id: $id)
  }
`;

// Create mutation
const CREATE_TEACHER_PROFILE = gql`
  mutation CreateTeacherProfile($input: CreateTeacherProfileInput!) {
    createTeacherProfile(input: $input) {
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
          bio: "",
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
