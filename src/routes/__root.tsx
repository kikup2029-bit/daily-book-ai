import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { getPublicConfig } from "../lib/public-config.functions";
import { setSupabaseRuntimeConfig } from "../integrations/supabase/client";
import { registerServiceWorker } from "../lib/register-sw";
import { I18nProvider } from "../lib/i18n";

function NotFoundComponent() {
  return (
    <div className="screen-y flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="screen-y flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  // Hand the public Supabase config from the server to the browser, so the app
  // doesn't depend on VITE_* values being present at build time.
  loader: async () => {
    const config = await getPublicConfig();
    setSupabaseRuntimeConfig(config.supabaseUrl, config.supabaseKey);
    return config;
  },
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      // viewport-fit=cover so the installed app can paint into the safe area
      // rather than leaving a pale band under the notch.
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1, viewport-fit=cover",
      },
      { title: "SimpleBooks — your daily books, in seconds" },
      {
        name: "description",
        content:
          "Log the money in and out of your business in seconds, see where you stand, and keep working even with no signal.",
      },
      { property: "og:title", content: "SimpleBooks" },
      {
        property: "og:description",
        content: "Log the money in and out of your business in seconds, and see where you stand.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      // Installed-app chrome. The colour matches the dark canvas so the status
      // bar blends into the page instead of framing it.
      { name: "theme-color", content: "#0e0f12" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      // "default" rather than "black-translucent": translucent forces white
      // status bar text, which disappears against the light theme. This lets
      // iOS colour the bar from theme-color, which the theme toggle keeps in
      // step with whichever mode you're in.
      { name: "apple-mobile-web-app-status-bar-style", content: "default" },
      { name: "apple-mobile-web-app-title", content: "SimpleBooks" },
      { name: "mobile-web-app-capable", content: "yes" },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        // Inter covers Latin. The Noto families cover the scripts it doesn't:
        // without them, Gujarati, Devanagari, Urdu and Chinese fall back to
        // whatever the device happens to have, which on many machines is
        // nothing at all — rows of empty boxes instead of words.
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Inter+Tight:wght@500;600;700&family=Noto+Sans+Devanagari:wght@400;500;600&family=Noto+Sans+Gujarati:wght@400;500;600&family=Noto+Naskh+Arabic:wght@400;500;600&family=Noto+Sans+SC:wght@400;500;600&display=swap",
      },
      {
        rel: "stylesheet",
        href: appCss,
      },
      // .ico first for old browsers, SVG second — anything modern prefers the
      // SVG and gets a mark that stays sharp on a retina tab strip, where a
      // 32px bitmap goes soft.
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
      { rel: "icon", href: "/brand/simplebooks-icon.svg", type: "image/svg+xml" },
      { rel: "manifest", href: "/manifest.webmanifest" },
      { rel: "apple-touch-icon", href: "/icons/apple-touch-icon.png", sizes: "180x180" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const config = Route.useLoaderData();

  // Apply synchronously during render (before any child route can touch
  // Supabase). On client hydration the loader may not re-run, so this covers
  // the case where the config arrives as serialized loader data.
  setSupabaseRuntimeConfig(config.supabaseUrl, config.supabaseKey);

  useEffect(() => {
    registerServiceWorker();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      {/* Language wraps everything, including the sign-in screen — someone who
          doesn't read English needs it before they have an account. */}
      <I18nProvider>
        {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
        <Outlet />
      </I18nProvider>
    </QueryClientProvider>
  );
}
