import { paraglideVitePlugin } from "@inlang/paraglide-js";
import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { defineConfig } from "vite";

export default defineConfig({
  resolve: { tsconfigPaths: true },
  plugins: [
    devtools(),
    paraglideVitePlugin({
      project: "./src/i18n/project.inlang",
      outdir: "./src/i18n/paraglide",
      // English at /, other languages under /de, /es
      strategy: ["url", "baseLocale"],
    }),
    nitro(),
    tailwindcss(),
    // Explicit, since src/server/ (a folder) would otherwise shadow src/server.ts
    tanstackStart({ server: { entry: "server.ts" } }),
    viteReact(),
  ],
});
