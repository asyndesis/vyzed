import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { nitro } from "nitro/vite";
import viteReact from "@vitejs/plugin-react";

// Server code (Better Auth, Prisma) reads process.env. In production the host
// sets it; locally it comes from .env.
if (existsSync(".env")) process.loadEnvFile(".env");

export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  server: { port: 3000 },
  // Order matters: Start, then Nitro (Node server output), then React
  plugins: [tanstackStart(), nitro(), viteReact()],
});
