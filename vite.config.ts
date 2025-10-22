import { defineConfig } from "vite";
import { fresh } from "@fresh/plugin-vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [fresh(), tailwindcss()],
  server: {
    port: 5173,
    // host removed - not needed for Deno Deploy, only for local Docker
    // For Docker deployments, set via CLI: --host 0.0.0.0
  },
});
