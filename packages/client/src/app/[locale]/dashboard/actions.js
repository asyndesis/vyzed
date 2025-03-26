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

// Create mutations
const CREATE_TEACHER_PROFILE = gql`
  mutation CreateTeacherProfile($input: CreateTeacherProfileInput!) {
    createTeacherProfile(input: $input) {
      id
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
