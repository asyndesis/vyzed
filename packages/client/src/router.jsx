import { createRouter } from "@tanstack/react-router";
import { ApolloProvider } from "@apollo/client/react";
import { routeTree } from "./routeTree.gen";
import { createApolloClient } from "@/lib/apollo";

// Search params stay plain strings (?swap=1 is "1", not the number 1)
const parseSearch = (search) => Object.fromEntries(new URLSearchParams(search));
const stringifySearch = (search) => {
  const params = new URLSearchParams();
  Object.entries(search).forEach(([k, v]) => v != null && params.set(k, String(v)));
  const query = params.toString();
  return query ? `?${query}` : "";
};

// Start calls this once per request on the server and once in the browser
export function getRouter() {
  const apollo = createApolloClient();
  return createRouter({
    routeTree,
    parseSearch,
    stringifySearch,
    scrollRestoration: true,
    defaultPreload: "intent",
    Wrap: ({ children }) => <ApolloProvider client={apollo}>{children}</ApolloProvider>,
  });
}
