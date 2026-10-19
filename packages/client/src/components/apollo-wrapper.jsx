"use client";
import { HttpLink } from "@apollo/client";
import {
  ApolloClient,
  InMemoryCache,
} from "@apollo/experimental-nextjs-app-support";
import { ApolloNextAppProvider } from "@apollo/experimental-nextjs-app-support";
import { useAuth } from "@clerk/nextjs";

// Clerk gets stuck and does not get a token right away.
// We'll force it to try until we run out of attempts
const fetchTokenWithRetries = async (
  getToken,
  maxRetries = 10,
  delay = 250,
) => {
  let retries = 0;
  let token = await getToken();
  while (!token && retries < maxRetries) {
    await new Promise((resolve) => setTimeout(resolve, delay));
    token = await getToken();
    retries++;
  }
  if (!token) throw new Error("Failed to fetch token.");
  return token;
};

const createHttpLink = (getToken) =>
  new HttpLink({
    uri: `${process.env.NEXT_PUBLIC_API_URL}/graphql`,
    fetchOptions: { cache: "no-store" },
    fetch: async (uri, options) => {
      const token = await fetchTokenWithRetries(getToken);
      options.headers = {
        ...options.headers,
        Authorization: `Bearer ${token}`,
      };
      return fetch(uri, options);
    },
  });

const makeClient = (getToken) =>
  new ApolloClient({
    cache: new InMemoryCache(),
    link: createHttpLink(getToken),
  });

export function ApolloWrapper({ children }) {
  const { getToken } = useAuth();
  return (
    <ApolloNextAppProvider makeClient={() => makeClient(getToken)}>
      {children}
    </ApolloNextAppProvider>
  );
}
