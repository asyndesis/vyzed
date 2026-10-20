import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";

// One client per request on the server (never shared between users), one in the browser.
// /graphql is same-origin: proxied to the API server by routes/graphql.js
export const createApolloClient = () =>
  new ApolloClient({
    ssrMode: typeof window === "undefined",
    cache: new InMemoryCache(),
    link: new HttpLink({ uri: "/graphql", credentials: "include" }),
    // Show cached data instantly on revisits, then refresh in the background
    defaultOptions: {
      watchQuery: {
        fetchPolicy: "cache-and-network",
        nextFetchPolicy: "cache-first",
      },
    },
  });
