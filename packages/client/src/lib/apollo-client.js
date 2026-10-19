import { HttpLink } from "@apollo/client";
import {
  registerApolloClient,
  ApolloClient,
  InMemoryCache,
} from "@apollo/experimental-nextjs-app-support";
import { auth } from "@clerk/nextjs/server";
import { setContext } from "@apollo/client/link/context";
import { onError } from "@apollo/client/link/error";

const errorLink = onError(({ graphQLErrors }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, path, extensions }) => {
      console.error(
        `[GraphQL error]: Message: ${message}, Path: ${path}, Code: ${extensions?.code}`,
      );
    });
  }
});

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

  return errorLink.concat(authLink.concat(httpLink));
};
