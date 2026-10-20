import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { nitro } from "nitro/vite";
import viteReact from "@vitejs/plugin-react";

export default defineConfig({
  server: { port: 3000 },
  // "@/..." imports come from jsconfig.json paths
  resolve: { tsconfigPaths: true },
  // Order matters: Start, then Nitro (Node server output), then React
  plugins: [tanstackStart(), nitro(), viteReact()],
});
