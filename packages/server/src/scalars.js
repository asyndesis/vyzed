import { GraphQLScalarType, Kind } from "graphql";

// Custom scalar for PostgreSQL IDs (handles both UUID and integer IDs)
export const PostgresID = new GraphQLScalarType({
  name: "PostgresID",
  description:
    "PostgreSQL ID scalar type representing either UUID or integer primary keys",

  // Convert outgoing values from your resolver to the client
  serialize(value) {
    // Return the ID as a string regardless of whether it's a UUID or integer
    return String(value);
  },

  // Convert incoming values from variables
  parseValue(value) {
    // Accept string input and return as is (your resolvers will handle the conversion)
    return value;
  },

  // Convert incoming values from literal values in the query
  parseLiteral(ast) {
    if (ast.kind === Kind.STRING || ast.kind === Kind.INT) {
      return ast.value;
    }
    return null;
  },
});

// Export all custom scalars
export const customScalars = {
  PostgresID,
};
