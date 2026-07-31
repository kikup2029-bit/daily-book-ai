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
//
// NOTE: ANTHROPIC_API_KEY is a real secret and is also inlined here, because
// this host provides no way to set runtime-only variables for this Worker. The
// built Worker bundle is not publicly downloadable, but if you later move to a
// host with proper runtime secrets (or Cloudflare's Secrets Store), read it
// from there instead and drop it from this list. Rotate the key if the built
// artifact is ever exposed.
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
      "process.env.BUILD_ANTHROPIC_API_KEY": inlinedEnv("ANTHROPIC_API_KEY"),
      "process.env.BUILD_GEMINI_API_KEY": inlinedEnv("GEMINI_API_KEY"),
      "process.env.BUILD_GEMINI_MODEL": inlinedEnv("GEMINI_MODEL"),
      "process.env.BUILD_GROQ_API_KEY": inlinedEnv("GROQ_API_KEY"),
      "process.env.BUILD_GROQ_MODEL": inlinedEnv("GROQ_MODEL"),
      "process.env.BUILD_CLOUDFLARE_ACCOUNT_ID": inlinedEnv("CLOUDFLARE_ACCOUNT_ID"),
      "process.env.BUILD_CLOUDFLARE_AI_TOKEN": inlinedEnv("CLOUDFLARE_AI_TOKEN"),
    },
  },
});
