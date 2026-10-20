import { createRouter } from "@tanstack/react-router";
import { ApolloProvider } from "@apollo/client/react";
import { routeTree } from "./routeTree.gen";
import { createApolloClient } from "@/lib/apollo";

// Start calls this once per request on the server and once in the browser
export function getRouter() {
  const apollo = createApolloClient();
  return createRouter({
    routeTree,
    scrollRestoration: true,
    defaultPreload: "intent",
    Wrap: ({ children }) => <ApolloProvider client={apollo}>{children}</ApolloProvider>,
  });
}
