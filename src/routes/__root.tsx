import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "../lib/theme-provider";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { useReminderEngine } from "../components/home/reminders";
import { registerServiceWorker } from "../lib/pwa";
import { isExperienceId, DEFAULT_EXPERIENCE, type ExperienceId } from "../lib/experiences";
import { isThemeId, DEFAULT_THEME, type ThemeId, type ColorMode } from "../lib/themes";

const getInitialPreferences = createServerFn({ method: "GET" }).handler(async () => {
  const { getCookie } = await import("@tanstack/react-start/server");
  const exp = getCookie("veedu.experience");
  const theme = getCookie("veedu.theme");
  const mode = getCookie("theme");

  return {
    experience: (isExperienceId(exp) ? exp : DEFAULT_EXPERIENCE) as ExperienceId,
    theme: (isThemeId(theme) ? theme : DEFAULT_THEME) as ThemeId,
    mode: (mode === "dark" || mode === "light" ? mode : "light") as ColorMode,
  };
});

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
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
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
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
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { title: "Sunnah Home" },
      {
        name: "description",
        content: "A calm, handcrafted daily companion for prayer, family, wellbeing, and budgeting.",
      },
      { name: "theme-color", content: "#fbf9f5" },
      { name: "mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "default" },
      { name: "apple-mobile-web-app-title", content: "Sunnah Home" },
      { name: "application-name", content: "Sunnah Home" },
      { property: "og:title", content: "Sunnah Home" },
      {
        property: "og:description",
        content: "A calm, handcrafted daily companion for prayer, family, wellbeing, and budgeting.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        href: "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Inter+Tight:wght@400;500;600;700&family=Sora:wght@400;500;600;700;800&family=Manrope:wght@400;500;600;700;800&family=Amiri+Quran&family=Aref+Ruqaa:wght@400;700&family=Amiri:ital,wght@0,400;0,700;1,400;1,700&family=Great+Vibes&display=swap",
        rel: "stylesheet",
      },
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
      { rel: "manifest", href: "/manifest.webmanifest" },
    ],
  }),
  loader: async () => {
    return await getInitialPreferences();
  },
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
        <script
          dangerouslySetInnerHTML={{
            __html: `
(function() {
  try {
    var cExp = document.cookie.match(/(?:^|; )veedu\\.experience=([^;]*)/);
    var exp = (cExp && decodeURIComponent(cExp[1])) || 'calm';
    if (exp !== 'calm' && exp !== 'vibrant') exp = 'calm';
    var cTh = document.cookie.match(/(?:^|; )veedu\\.theme=([^;]*)/);
    var th = (cTh && decodeURIComponent(cTh[1])) || 'veedu';
    var cMode = document.cookie.match(/(?:^|; )theme=([^;]*)/);
    var m = (cMode && decodeURIComponent(cMode[1])) || 'light';
    
    var lsExp = localStorage.getItem('veedu.experience');
    if (!cExp && (lsExp === 'calm' || lsExp === 'vibrant')) {
      document.cookie = 'veedu.experience=' + lsExp + '; path=/; max-age=31536000; SameSite=Lax';
    }
    var lsTh = localStorage.getItem('veedu.theme');
    if (!cTh && lsTh) {
      document.cookie = 'veedu.theme=' + lsTh + '; path=/; max-age=31536000; SameSite=Lax';
    }
    var lsMode = (localStorage.getItem('theme') || '').replace(/"/g, '');
    if (!cMode && (lsMode === 'dark' || lsMode === 'light')) {
      document.cookie = 'theme=' + lsMode + '; path=/; max-age=31536000; SameSite=Lax';
    }

    var root = document.documentElement;
    root.dataset.experience = exp;
    root.dataset.theme = th;
    if (m === 'dark') {
      root.classList.add('dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.style.colorScheme = 'light';
    }
  } catch(e) {}
})();
`,
          }}
        />
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
  const loaderData = Route.useLoaderData();
  useReminderEngine();

  useEffect(() => {
    registerServiceWorker();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        defaultTheme={loaderData?.theme ?? "veedu"}
        defaultExperience={loaderData?.experience ?? "calm"}
        defaultMode={loaderData?.mode ?? "light"}
      >
        {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
        <Outlet />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

