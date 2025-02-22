import { readdirSync, readFileSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Helper function to get all .graphql files one level deep
const getGraphqlFilesOneLevelDeep = (dir) => {
  const files = [];

  // Read the current directory
  const entries = readdirSync(dir, { withFileTypes: true });

  entries.forEach((entry) => {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      // Check for .graphql files in subdirectories
      const subFiles = readdirSync(fullPath).filter((file) =>
        file.endsWith(".graphql")
      );
      subFiles.forEach((file) => files.push(path.join(fullPath, file)));
    } else if (entry.isFile() && entry.name.endsWith(".graphql")) {
      // Add .graphql files from the current directory
      files.push(fullPath);
    }
  });

  return files;
};

// Get all .graphql files one level deep
const schemaFiles = getGraphqlFilesOneLevelDeep(__dirname);

// Read the contents of each .graphql file
const typeDefs = schemaFiles.map((file) => readFileSync(file, "utf-8"));

export { typeDefs };
