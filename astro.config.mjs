import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  // Mode serveur pour l'authentification  
  output: "server",
  
  vite: {
    plugins: [tailwindcss()],
  },
  
  site: "https://qontinuity-formations.eu/",
  
  integrations: [sitemap()],
});