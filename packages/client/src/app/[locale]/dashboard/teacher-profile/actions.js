"use server";

import { getClient } from "@/lib/apollo-client";
import { gql } from "@apollo/client";
import { revalidatePath } from "next/cache";

const UPDATE_TEACHER_PROFILE = gql`
  mutation UpdateTeacherProfile(
    $id: PostgresID!
    $input: UpdateTeacherProfileInput!
  ) {
    updateTeacherProfile(id: $id, input: $input) {
      id
      priceAmount
      priceCurrency
      allowBarter
      skills {
        id
        proficiency
        skill {
          id
          name
          framework
        }
      }
    }
  }
`;

export async function updateTeacherProfile(id, input) {
  try {
    const { data } = await getClient().mutate({
      mutation: UPDATE_TEACHER_PROFILE,
      variables: {
        id,
        input,
      },
    });

    revalidatePath("/dashboard/teacher-profile");
    return data.updateTeacherProfile;
  } catch (error) {
    console.error("Error updating teacher profile:", error);
    throw new Error("Failed to update teacher profile");
  }
}
