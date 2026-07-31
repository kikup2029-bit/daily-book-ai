// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// Bake build-time environment values into the bundle.
//
// Why: on Cloudflare Workers, "build variables" (available while this build
// runs) and "runtime bindings" (available to the deployed Worker) are
// configured separately. If the values are only set as build variables, the
// deployed Worker sees an empty process.env and every server-side call fails.
// Inlining them here means the server code works regardless of whether runtime
// bindings are configured.
//
// The Supabase URL and publishable key are designed to be public (the
// publishable key is protected by Row Level Security), so inlining them is safe.
const inlinedEnv = (key: string) => JSON.stringify(process.env[key] ?? "");

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  vite: {
    define: {
      "process.env.BUILD_SUPABASE_URL": inlinedEnv("SUPABASE_URL"),
      "process.env.BUILD_SUPABASE_PUBLISHABLE_KEY": inlinedEnv("SUPABASE_PUBLISHABLE_KEY"),
    },
  },
});
