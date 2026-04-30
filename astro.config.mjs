// @ts-check
import { defineConfig, fontProviders } from "astro/config";

import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";
import clerk from "@clerk/astro";
import vercel from "@astrojs/vercel";

// https://astro.build/config
export default defineConfig({
  integrations: [react(), clerk()],
  adapter: vercel(),
  vite: {
    plugins: [tailwindcss()],
  },
  fonts: [
    {
      provider: fontProviders.fontsource(),
      name: "Geist",
      cssVariable: "--font-geist",
      weights: [400, 500, 600, 700],
    },
    {
      provider: fontProviders.fontsource(),
      name: "Geist Mono",
      cssVariable: "--font-geist-mono",
      weights: [400, 500, 600, 700],
    },
  ],

  output: "server",
  security: {
      csp: true,
    },
  redirects: {
    "/login": "/sign-in",
    "/signup": "/sign-up",
  },
});