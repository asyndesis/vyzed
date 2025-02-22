import { clerkClient } from "@clerk/nextjs/server";
import { gql } from "@apollo/client";
import { getClient } from "@/lib/apollo-client";

const getUserQuery = gql`
  query checkClerkUserIdExists($clerkUserId: String!) {
    checkClerkUserIdExists(clerkUserId: $clerkUserId)
  }
`;

const createUserMutation = gql`
  mutation createMyUser($input: CreateUserInput!) {
    createMyUser(input: $input) {
      id
    }
  }
`;

/* Someday we'll have a page that handles this  so user can fill in extra info after signup */
export const completeOnboarding = async ({ clerkUserId, token }) => {
  const { data } = await getClient().query({
    query: getUserQuery,
    variables: {
      clerkUserId,
    },
    context: {
      headers: {
        authorization: `Bearer ${token}`,
      },
    },
  });

  // If the user already exists in the database, skip onboarding
  if (data?.checkClerkUserIdExists) return;

  // Fetch user information from Clerk
  const client = await clerkClient();
  const clerkUser = await client.users.getUser(clerkUserId);

  if (!clerkUser) {
    throw new Error("No user found in Clerk for the provided ID.");
  }

  const email =
    clerkUser.emailAddresses.find(
      (email) => email.id === clerkUser.primaryEmailAddressId
    )?.emailAddress || "";

  // Save the new user to the database
  await getClient().mutate({
    mutation: createUserMutation,
    variables: {
      input: {
        clerkUserId: clerkUser.id,
        email,
        firstName: clerkUser.firstName,
        lastName: clerkUser.lastName,
        imageUrl: clerkUser.imageUrl,
      },
    },
    context: {
      headers: {
        authorization: `Bearer ${token}`,
      },
    },
  });
};
