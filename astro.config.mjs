import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwind from "@astrojs/tailwind";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://audr.dev",
  integrations: [
    react(),
    tailwind({ applyBaseStyles: false }),
    sitemap(),
  ],
  build: {
    inlineStylesheets: "auto",
  },
  vite: {
    build: {
      target: "es2022",
      cssTarget: "es2022",
    },
    assetsInclude: ["**/*.wasm"],
  },
});
