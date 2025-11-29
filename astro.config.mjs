import { defineConfig } from "astro/config";

import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  build: { format: "file" },
  site: "https://execut.nl/",
  vite: { plugins: [tailwindcss()] },
});
