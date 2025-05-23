// astro.config.mjs
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
  },
  site: "https://qontinuity-formations.eu/", // ← Mettez votre vraie URL
  integrations: [sitemap()],
});