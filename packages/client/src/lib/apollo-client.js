import { HttpLink } from "@apollo/client";
import {
  registerApolloClient,
  ApolloClient,
  InMemoryCache,
} from "@apollo/experimental-nextjs-app-support";
import { auth } from "@clerk/nextjs/server";
import { setContext } from "@apollo/client/link/context";
import { onError } from "@apollo/client/link/error";

export const { getClient, query, PreloadQuery } = registerApolloClient(() => {
  return new ApolloClient({
    cache: new InMemoryCache(),
    link: getLink(),
  });
});

const getLink = () => {
  const httpLink = new HttpLink({
    uri: `${process.env.NEXT_PUBLIC_API_URL}/graphql`,
    fetchOptions: { cache: "no-store" },
  });
  const authLink = setContext(async (_, { headers = {} }) => {
    if (!headers?.authorization) {
      const { getToken } = await auth();
      const token = await getToken();
      headers.authorization = `Bearer ${token}`;
    }
    return {
      headers,
    };
  });
  const redirectLink = onError(({ graphQLErrors, networkError }) => {
    // Error monitoring etc.
    if (graphQLErrors)
      graphQLErrors.forEach(({ message, locations, path }) =>
        console.error(
          `[GraphQL error]: Message: ${message} , Location: ${locations} , Path: ${path} `
        )
      );
    if (networkError) {
      console.error(`[Network error]: ${networkError} `);
    }
  });
  return authLink.concat(redirectLink).concat(httpLink);
};

// Shared error handler
const handleError = (error) => {
  console.error("GraphQL Error:", error);
  // You can customize this further, e.g., show a toast notification
};

export const serverQuery = async (query, props) => {
  try {
    const result = await getClient().query({ query, ...props });
    return result;
  } catch (error) {
    handleError(error);
    return {};
  }
};

// Abstraction for mutation
export const serverMutate = async (query, props) => {
  try {
    const result = await getClient().mutate({ query, ...props });
    return result;
  } catch (error) {
    handleError(error);
    return {};
  }
};
