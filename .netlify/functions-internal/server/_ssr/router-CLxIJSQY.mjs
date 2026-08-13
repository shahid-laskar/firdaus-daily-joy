import { i as __toESM } from "../_runtime.mjs";
import { n as require_jsx_runtime, r as require_react, t as QueryClientProvider } from "../_libs/react+tanstack__react-query.mjs";
import { c as HeadContent, d as createRouter, f as Outlet, g as Link, h as createRootRouteWithContext, m as createFileRoute, p as lazyRouteComponent, s as Scripts, v as useRouter } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as QueryClient } from "../_libs/tanstack__query-core.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/router-CLxIJSQY.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var __defProp = Object.defineProperty;
var __exportAll = (all, no_symbols) => {
	let target = {};
	for (var name in all) __defProp(target, name, {
		get: all[name],
		enumerable: true
	});
	if (!no_symbols) __defProp(target, Symbol.toStringTag, { value: "Module" });
	return target;
};
var DEFAULT_THEME = "veedu";
var themes = [
	{
		id: "veedu",
		name: "Veedu Paper",
		description: "Warm handcrafted paper-and-ink ground with a quiet leaf-green accent (existing default).",
		swatch: {
			bg: "oklch(0.973 0.011 84)",
			fg: "oklch(0.255 0.021 60)",
			primary: "oklch(0.255 0.021 60)",
			accent: "oklch(0.5 0.072 148)",
			border: "oklch(0.885 0.014 80)"
		},
		swatchDark: {
			bg: "oklch(0.185 0.011 65)",
			fg: "oklch(0.94 0.012 85)",
			primary: "oklch(0.94 0.012 85)",
			accent: "oklch(0.72 0.088 148)",
			border: "oklch(0.315 0.012 70)"
		}
	},
	{
		id: "noir",
		name: "Atelier Noir",
		description: "Luxury couture: near-black ground, ivory type, restrained antique-gold accent.",
		swatch: {
			bg: "oklch(0.965 0.004 85)",
			fg: "oklch(0.19 0.006 60)",
			primary: "oklch(0.19 0.006 60)",
			accent: "oklch(0.62 0.086 78)",
			border: "oklch(0.885 0.005 80)"
		},
		swatchDark: {
			bg: "oklch(0.145 0.004 70)",
			fg: "oklch(0.955 0.006 85)",
			primary: "oklch(0.955 0.006 85)",
			accent: "oklch(0.78 0.088 82)",
			border: "oklch(0.285 0.006 75)"
		}
	},
	{
		id: "editorial",
		name: "Editorial Minimal",
		description: "Magazine whitespace: pure paper, black serif headlines, one ink-red accent, hairline rules.",
		swatch: {
			bg: "oklch(0.995 0 0)",
			fg: "oklch(0.145 0 0)",
			primary: "oklch(0.145 0 0)",
			accent: "oklch(0.52 0.2 27)",
			border: "oklch(0.9 0 0)"
		},
		swatchDark: {
			bg: "oklch(0.145 0 0)",
			fg: "oklch(0.975 0 0)",
			primary: "oklch(0.975 0 0)",
			accent: "oklch(0.68 0.2 27)",
			border: "oklch(0.3 0 0)"
		}
	},
	{
		id: "meridian",
		name: "Meridian Enterprise",
		description: "Cool neutral greys with a confident corporate blue; calm, dense, dashboard-ready.",
		swatch: {
			bg: "oklch(0.982 0.003 250)",
			fg: "oklch(0.22 0.02 258)",
			primary: "oklch(0.52 0.14 254)",
			accent: "oklch(0.52 0.14 254)",
			border: "oklch(0.9 0.008 252)"
		},
		swatchDark: {
			bg: "oklch(0.17 0.015 258)",
			fg: "oklch(0.96 0.005 250)",
			primary: "oklch(0.66 0.14 254)",
			accent: "oklch(0.66 0.14 254)",
			border: "oklch(0.3 0.015 256)"
		}
	},
	{
		id: "obsidian",
		name: "Obsidian",
		description: "Dark-first graphite with a cool platinum accent; the light mode is a muted mirror.",
		swatch: {
			bg: "oklch(0.95 0.004 260)",
			fg: "oklch(0.2 0.012 262)",
			primary: "oklch(0.28 0.02 262)",
			accent: "oklch(0.55 0.07 218)",
			border: "oklch(0.88 0.006 260)"
		},
		swatchDark: {
			bg: "oklch(0.135 0.008 264)",
			fg: "oklch(0.965 0.004 260)",
			primary: "oklch(0.88 0.01 250)",
			accent: "oklch(0.78 0.07 214)",
			border: "oklch(0.27 0.01 262)"
		}
	},
	{
		id: "helix",
		name: "Helix",
		description: "Futuristic deep space-blue ground, electric cyan signal, tight geometric shapes.",
		swatch: {
			bg: "oklch(0.97 0.008 230)",
			fg: "oklch(0.2 0.03 250)",
			primary: "oklch(0.5 0.13 248)",
			accent: "oklch(0.62 0.13 205)",
			border: "oklch(0.88 0.014 232)"
		},
		swatchDark: {
			bg: "oklch(0.15 0.025 258)",
			fg: "oklch(0.95 0.012 230)",
			primary: "oklch(0.75 0.13 205)",
			accent: "oklch(0.82 0.14 195)",
			border: "oklch(0.3 0.03 250)"
		}
	},
	{
		id: "lumen",
		name: "Lumen",
		description: "Soft elegant blush neutrals, generous radii, muted mauve accent, feather shadows.",
		swatch: {
			bg: "oklch(0.98 0.008 40)",
			fg: "oklch(0.28 0.02 20)",
			primary: "oklch(0.52 0.07 340)",
			accent: "oklch(0.68 0.06 20)",
			border: "oklch(0.915 0.012 30)"
		},
		swatchDark: {
			bg: "oklch(0.19 0.012 20)",
			fg: "oklch(0.955 0.008 40)",
			primary: "oklch(0.78 0.07 340)",
			accent: "oklch(0.8 0.06 24)",
			border: "oklch(0.32 0.014 24)"
		}
	},
	{
		id: "contrast",
		name: "High Contrast",
		description: "Pure black-on-white, thick borders, no shadows, vivid focus ring for maximum legibility.",
		swatch: {
			bg: "oklch(1 0 0)",
			fg: "oklch(0 0 0)",
			primary: "oklch(0 0 0)",
			accent: "oklch(0.45 0.24 264)",
			border: "oklch(0.18 0 0)"
		},
		swatchDark: {
			bg: "oklch(0 0 0)",
			fg: "oklch(1 0 0)",
			primary: "oklch(1 0 0)",
			accent: "oklch(0.82 0.19 100)",
			border: "oklch(0.86 0 0)"
		}
	},
	{
		id: "command",
		name: "Command Center",
		description: "Cockpit slate with phosphor-green data and amber alerts; dense, monospaced, operational.",
		swatch: {
			bg: "oklch(0.955 0.004 200)",
			fg: "oklch(0.21 0.015 220)",
			primary: "oklch(0.34 0.03 220)",
			accent: "oklch(0.58 0.13 155)",
			border: "oklch(0.87 0.008 205)"
		},
		swatchDark: {
			bg: "oklch(0.145 0.012 226)",
			fg: "oklch(0.94 0.008 200)",
			primary: "oklch(0.82 0.15 150)",
			accent: "oklch(0.82 0.15 150)",
			border: "oklch(0.29 0.015 222)"
		}
	},
	{
		id: "terracotta",
		name: "Terracotta",
		description: "Warm contemporary sun-baked clay and oat neutrals; friendly, tactile, midcentury.",
		swatch: {
			bg: "oklch(0.968 0.014 70)",
			fg: "oklch(0.26 0.024 45)",
			primary: "oklch(0.55 0.12 42)",
			accent: "oklch(0.6 0.1 150)",
			border: "oklch(0.885 0.018 66)"
		},
		swatchDark: {
			bg: "oklch(0.185 0.014 45)",
			fg: "oklch(0.95 0.012 70)",
			primary: "oklch(0.74 0.12 45)",
			accent: "oklch(0.76 0.1 150)",
			border: "oklch(0.315 0.016 50)"
		}
	},
	{
		id: "vermillion",
		name: "Vermillion",
		description: "Bold modern flat vermillion on stark neutrals; poster-like blocks, zero gloss.",
		swatch: {
			bg: "oklch(0.975 0.002 90)",
			fg: "oklch(0.16 0.01 40)",
			primary: "oklch(0.58 0.22 28)",
			accent: "oklch(0.28 0.06 264)",
			border: "oklch(0.88 0.006 80)"
		},
		swatchDark: {
			bg: "oklch(0.155 0.008 40)",
			fg: "oklch(0.965 0.004 90)",
			primary: "oklch(0.68 0.22 30)",
			accent: "oklch(0.78 0.12 258)",
			border: "oklch(0.3 0.012 50)"
		}
	},
	{
		id: "archive",
		name: "Archive",
		description: "Timeless professional navy and parchment with serif authority; conservative and durable.",
		swatch: {
			bg: "oklch(0.968 0.006 95)",
			fg: "oklch(0.23 0.03 255)",
			primary: "oklch(0.33 0.08 258)",
			accent: "oklch(0.48 0.08 200)",
			border: "oklch(0.885 0.01 90)"
		},
		swatchDark: {
			bg: "oklch(0.175 0.018 258)",
			fg: "oklch(0.955 0.008 95)",
			primary: "oklch(0.8 0.08 250)",
			accent: "oklch(0.72 0.08 200)",
			border: "oklch(0.305 0.02 256)"
		}
	},
	{
		id: "blanc",
		name: "Blanc",
		description: "Ultra-minimal greyscale: near-invisible borders, no colour, type and spacing carry the UI.",
		swatch: {
			bg: "oklch(0.985 0 0)",
			fg: "oklch(0.24 0 0)",
			primary: "oklch(0.3 0 0)",
			accent: "oklch(0.45 0 0)",
			border: "oklch(0.93 0 0)"
		},
		swatchDark: {
			bg: "oklch(0.16 0 0)",
			fg: "oklch(0.95 0 0)",
			primary: "oklch(0.88 0 0)",
			accent: "oklch(0.78 0 0)",
			border: "oklch(0.28 0 0)"
		}
	}
];
var themeIds = themes.map((t) => t.id);
function isThemeId(value) {
	return typeof value === "string" && themeIds.includes(value);
}
var THEME_KEY = "veedu.theme";
var MODE_KEY = "theme";
var ThemeContext = (0, import_react.createContext)(null);
function applyToDocument(theme, mode) {
	if (typeof document === "undefined") return;
	const root = document.documentElement;
	root.dataset["theme"] = theme;
	root.classList.toggle("dark", mode === "dark");
	root.style.colorScheme = mode;
}
function ThemeProvider({ children, defaultTheme = DEFAULT_THEME, defaultMode = "light" }) {
	const [theme, setThemeState] = (0, import_react.useState)(defaultTheme);
	const [mode, setModeState] = (0, import_react.useState)(defaultMode);
	(0, import_react.useEffect)(() => {
		try {
			const storedTheme = window.localStorage.getItem(THEME_KEY);
			if (isThemeId(storedTheme)) setThemeState(storedTheme);
			const storedMode = window.localStorage.getItem(MODE_KEY)?.replace(/"/g, "");
			if (storedMode === "dark" || storedMode === "light") setModeState(storedMode);
		} catch {}
	}, []);
	(0, import_react.useEffect)(() => {
		applyToDocument(theme, mode);
	}, [theme, mode]);
	const setTheme = (0, import_react.useCallback)((next) => {
		setThemeState(next);
		try {
			window.localStorage.setItem(THEME_KEY, next);
		} catch {}
	}, []);
	const setMode = (0, import_react.useCallback)((next) => {
		setModeState(next);
		try {
			window.localStorage.setItem(MODE_KEY, next);
		} catch {}
	}, []);
	const value = (0, import_react.useMemo)(() => ({
		theme,
		mode,
		setTheme,
		setMode,
		toggleMode: () => setMode(mode === "dark" ? "light" : "dark")
	}), [
		theme,
		mode,
		setTheme,
		setMode
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ThemeContext.Provider, {
		value,
		children
	});
}
function useTheme() {
	const ctx = (0, import_react.useContext)(ThemeContext);
	if (!ctx) throw new Error("useTheme must be used inside <ThemeProvider>");
	return ctx;
}
var styles_default = "/assets/styles-eGcEVnGw.css";
function reportLovableError(error, context = {}) {
	if (typeof window === "undefined") return;
	window.__lovableEvents?.captureException?.(error, {
		source: "react_error_boundary",
		route: window.location.pathname,
		...context
	}, {
		mechanism: "react_error_boundary",
		handled: false,
		severity: "error"
	});
	const message = error instanceof Response ? `Response ${error.status}${error.url ? ` at ${error.url}` : ""}` : error instanceof Error ? error.message : String(error);
	const stack = error instanceof Error ? error.stack : void 0;
	window.__lovableReportRuntimeError?.({
		message,
		...stack !== void 0 && { stack },
		filename: window.location.pathname
	});
}
function NotFoundComponent() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-md text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-7xl font-bold text-foreground",
					children: "404"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mt-4 text-xl font-semibold text-foreground",
					children: "Page not found"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: "The page you're looking for doesn't exist or has been moved."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-6",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/",
						className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
						children: "Go home"
					})
				})
			]
		})
	});
}
function ErrorComponent({ error, reset }) {
	console.error(error);
	const router = useRouter();
	(0, import_react.useEffect)(() => {
		reportLovableError(error, { boundary: "tanstack_root_error_component" });
	}, [error]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-md text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-xl font-semibold tracking-tight text-foreground",
					children: "This page didn't load"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: "Something went wrong on our end. You can try refreshing or head back home."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-6 flex flex-wrap justify-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => {
							router.invalidate();
							reset();
						},
						className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
						children: "Try again"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						href: "/",
						className: "inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent",
						children: "Go home"
					})]
				})
			]
		})
	});
}
var Route$6 = createRootRouteWithContext()({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1"
			},
			{ title: "Lovable App" },
			{
				name: "description",
				content: "Lovable Generated Project"
			},
			{
				name: "author",
				content: "Lovable"
			},
			{
				property: "og:title",
				content: "Lovable App"
			},
			{
				property: "og:description",
				content: "Lovable Generated Project"
			},
			{
				property: "og:type",
				content: "website"
			},
			{
				name: "twitter:card",
				content: "summary_large_image"
			},
			{
				name: "twitter:site",
				content: "@Lovable"
			}
		],
		links: [
			{
				rel: "preconnect",
				href: "https://fonts.googleapis.com"
			},
			{
				rel: "preconnect",
				href: "https://fonts.gstatic.com",
				crossOrigin: "anonymous"
			},
			{
				href: "https://fonts.googleapis.com/css2?family=Aref+Ruqaa:wght@400;700&family=Amiri:ital,wght@0,400;0,700;1,400;1,700&display=swap",
				rel: "stylesheet"
			},
			{
				rel: "stylesheet",
				href: styles_default
			},
			{
				rel: "icon",
				href: "/favicon.ico",
				type: "image/x-icon"
			}
		]
	}),
	shellComponent: RootShell,
	component: RootComponent,
	notFoundComponent: NotFoundComponent,
	errorComponent: ErrorComponent
});
function RootShell({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("html", {
		lang: "en",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("head", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeadContent, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("body", { children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scripts, {})] })]
	});
}
function RootComponent() {
	const { queryClient } = Route$6.useRouteContext();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QueryClientProvider, {
		client: queryClient,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ThemeProvider, {
			defaultTheme: "veedu",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {})
		})
	});
}
var $$splitComponentImporter$5 = () => import("./routes-CHb20NdY.mjs");
var Route$5 = createFileRoute("/")({
	head: () => ({ meta: [
		{ title: "Firdous — a handcrafted home for everyday life" },
		{
			name: "description",
			content: "Firdous brings family life, prayer, money and personal wellbeing into one calm, beautifully made daily companion."
		},
		{
			property: "og:title",
			content: "Firdous — a handcrafted home for everyday life"
		},
		{
			property: "og:description",
			content: "Family, Deen, budget and wellbeing in one quiet daily companion. Offline-first, private by default."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary_large_image"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$5, "component")
});
var $$splitComponentImporter$4 = () => import("./auth-68Y0hS3U.mjs");
var Route$4 = createFileRoute("/auth")({
	head: () => ({ meta: [
		{ title: "Sign in to Firdous" },
		{
			name: "description",
			content: "Sign in to sync Firdous across your devices, or continue as a guest with everything stored privately on this device."
		},
		{
			property: "og:title",
			content: "Sign in to Firdous"
		},
		{
			property: "og:description",
			content: "Sync across devices, or keep everything local as a guest."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary_large_image"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$4, "component")
});
var $$splitComponentImporter$3 = () => import("./budget-DSm1WXhb.mjs");
var Route$3 = createFileRoute("/budget")({
	head: () => ({ meta: [
		{ title: "Budget — clear, calm money tracking in Firdous" },
		{
			name: "description",
			content: "Record expenses in seconds, see where the month is going, and calculate zakat — without spreadsheets or anxiety."
		},
		{
			property: "og:title",
			content: "Budget — clear, calm money tracking in Firdous"
		},
		{
			property: "og:description",
			content: "Quick expense entry, monthly limits and a zakat calculator, made understandable."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary_large_image"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$3, "component")
});
var $$splitComponentImporter$2 = () => import("./deen-DyyO3-1D.mjs");
var Route$2 = createFileRoute("/deen")({
	head: () => ({ meta: [
		{ title: "Deen — prayer, Quran and dhikr in Firdous" },
		{
			name: "description",
			content: "A calm space for Salah times, Quran reading, dhikr, duas, hifz and fasting — designed for focus and reverence."
		},
		{
			property: "og:title",
			content: "Deen — prayer, Quran and dhikr in Firdous"
		},
		{
			property: "og:description",
			content: "Salah, Quran, dhikr, duas, hifz and fasting in one quiet, reverent space."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary_large_image"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$2, "component")
});
var $$splitComponentImporter$1 = () => import("./me-_Pa6BI5D.mjs");
var Route$1 = createFileRoute("/me")({
	head: () => ({ meta: [
		{ title: "Me — your private corner of Firdous" },
		{
			name: "description",
			content: "Check in with yourself, keep habits, write a private journal and track health — quietly, on your own device."
		},
		{
			property: "og:title",
			content: "Me — your private corner of Firdous"
		},
		{
			property: "og:description",
			content: "Mood check-ins, habits, journaling, health and cycle tracking, kept private."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary_large_image"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
var $$splitComponentImporter = () => import("./onboarding-DZmdw30U.mjs");
var Route = createFileRoute("/onboarding")({
	head: () => ({ meta: [{ title: "Welcome to Firdous" }] }),
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
var rootRouteChildren = {
	IndexRoute: Route$5.update({
		id: "/",
		path: "/",
		getParentRoute: () => Route$6
	}),
	AuthRoute: Route$4.update({
		id: "/auth",
		path: "/auth",
		getParentRoute: () => Route$6
	}),
	BudgetRoute: Route$3.update({
		id: "/budget",
		path: "/budget",
		getParentRoute: () => Route$6
	}),
	DeenRoute: Route$2.update({
		id: "/deen",
		path: "/deen",
		getParentRoute: () => Route$6
	}),
	MeRoute: Route$1.update({
		id: "/me",
		path: "/me",
		getParentRoute: () => Route$6
	}),
	OnboardingRoute: Route.update({
		id: "/onboarding",
		path: "/onboarding",
		getParentRoute: () => Route$6
	})
};
var routeTree = Route$6._addFileChildren(rootRouteChildren)._addFileTypes();
var router_exports = /* @__PURE__ */ __exportAll({ getRouter: () => getRouter });
var getRouter = () => {
	const queryClient = new QueryClient();
	return createRouter({
		routeTree,
		context: { queryClient },
		scrollRestoration: true,
		defaultPreloadStaleTime: 0
	});
};
//#endregion
export { useTheme as n, themes as r, router_exports as t };
