"use client";
import { HttpLink } from "@apollo/client";
import {
  ApolloClient,
  InMemoryCache,
} from "@apollo/experimental-nextjs-app-support";
import { ApolloNextAppProvider } from "@apollo/experimental-nextjs-app-support";

const httpLink = new HttpLink({
  uri: `${process.env.NEXT_PUBLIC_API_URL}/graphql`,
  fetchOptions: { cache: "no-store" },
  // Send the Better Auth session cookie to the API
  credentials: "include",
});

const makeClient = () =>
  new ApolloClient({
    cache: new InMemoryCache(),
    link: httpLink,
    // Show cached data instantly on revisits, then refresh in the background
    defaultOptions: {
      watchQuery: {
        fetchPolicy: "cache-and-network",
        nextFetchPolicy: "cache-first",
      },
    },
  });

export function ApolloWrapper({ children }) {
  return (
    <ApolloNextAppProvider makeClient={makeClient}>
      {children}
    </ApolloNextAppProvider>
  );
}
