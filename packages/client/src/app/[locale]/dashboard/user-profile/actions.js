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

const UPDATE_USER_SCHEDULE_SLOTS = gql`
  mutation UpdateUserScheduleSlots(
    $userScheduleId: PostgresID!
    $slots: [UserScheduleSlotInput!]!
  ) {
    updateUserScheduleSlots(userScheduleId: $userScheduleId, slots: $slots) {
      id
      dayOfWeek
      type
      startTime
      endTime
    }
  }
`;

export async function saveUserData({
  userId,
  user,
  userProfile,
  userSchedule,
}) {
  if (user) {
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
  }

  if (userProfile) {
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
  }

  if (userSchedule) {
    await getClient().mutate({
      mutation: UPDATE_USER_SCHEDULE_SLOTS,
      variables: {
        userScheduleId: userSchedule.id,
        slots: userSchedule.slots,
      },
    });
  }

  revalidatePath("/dashboard/user-profile");
  return userId;
}
