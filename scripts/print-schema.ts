// npm run gql — after changing the GraphQL schema.
// Writes the SDL (also handy for other apps); `gql.tada generate-output` then turns it into types.
import "dotenv/config";
import { writeFileSync } from "node:fs";
import { lexicographicSortSchema, printSchema } from "graphql";
import { schema } from "../src/server/graphql/schema";

writeFileSync(
  "src/generated/graphql/schema.graphql",
  printSchema(lexicographicSortSchema(schema)) + "\n",
);
console.log("✓ src/generated/graphql/schema.graphql");
process.exit(0);
