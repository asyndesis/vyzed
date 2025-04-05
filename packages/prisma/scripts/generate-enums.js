import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths
const PRISMA_SCHEMA_PATH = path.join(__dirname, "..", "schema.prisma");
const ENUMS_OUTPUT_PATH = path.join(__dirname, "../enums.js");
const ENUM_TYPEDEFS_OUTPUT_PATH = path.join(__dirname, "../enumTypeDefs.js");

// Read the Prisma schema
const schemaContent = fs.readFileSync(PRISMA_SCHEMA_PATH, "utf8");

// Regular expression to match enum definitions in Prisma schema
const enumRegex = /enum\s+(\w+)\s+{([^}]*)}/g;

// Store all enums
const enums = [];

// Extract all enums from the schema
let match;
while ((match = enumRegex.exec(schemaContent)) !== null) {
  const enumName = match[1];
  const enumValues = match[2]
    .trim()
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("//"));

  enums.push({
    name: enumName,
    values: enumValues,
  });
}

// Generate JavaScript enum constants file
const enumsContent = `// Generated from Prisma schema - DO NOT EDIT MANUALLY
// To regenerate, run: npm run generate:enums -w @vyzed/prisma

// JavaScript Constants
${enums
  .map(
    (enumObj) => `export const ${enumObj.name} = {
${enumObj.values.map((value) => `  ${value}: '${value}',`).join("\n")}
};
`
  )
  .join("\n")}
`;

// Generate GraphQL enum type definitions file
const enumTypeDefsContent = `// Generated from Prisma schema - DO NOT EDIT MANUALLY
// To regenerate, run: npm run generate:enums -w @vyzed/prisma

import { gql } from 'graphql-tag';
import { ${enums.map((enumObj) => enumObj.name).join(", ")} } from './enums.js';

// GraphQL Enum Definitions
${enums
  .map(
    (enumObj) => `export const ${enumObj.name}Enum = gql\`
  enum ${enumObj.name} {
    \${Object.values(${enumObj.name}).join('\\n    ')}
  }
\`;`
  )
  .join("\n\n")}

export const enumTypeDefs = [
${enums.map((enumObj) => `  ${enumObj.name}Enum`).join(",\n")}
];
`;

fs.writeFileSync(ENUMS_OUTPUT_PATH, enumsContent);
console.log(`✅ Generated enums at ${ENUMS_OUTPUT_PATH}`);

fs.writeFileSync(ENUM_TYPEDEFS_OUTPUT_PATH, enumTypeDefsContent);
console.log(
  `✅ Generated enum type definitions at ${ENUM_TYPEDEFS_OUTPUT_PATH}`
);

console.log("🎉 Enum generation complete!");
