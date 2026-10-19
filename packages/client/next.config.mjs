import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

// In production the GraphQL server runs in the same container; proxy it so the
// browser talks to one origin (no CORS, auth cookies just work).
const API_INTERNAL_URL = process.env.API_INTERNAL_URL || "http://localhost:4000";

/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [{ source: "/graphql", destination: `${API_INTERNAL_URL}/graphql` }];
  },
};

export default withNextIntl(nextConfig);
