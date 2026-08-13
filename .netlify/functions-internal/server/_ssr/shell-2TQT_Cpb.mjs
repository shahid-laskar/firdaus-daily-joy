import { i as __toESM } from "../_runtime.mjs";
import { n as require_jsx_runtime, r as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { h as useStore, m as useOnline, o as Sheet, r as Field, t as Action } from "./store-BUFgMFPj.mjs";
import { g as Link, l as useRouterState } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as useTheme, r as themes } from "./router-CLxIJSQY.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/shell-2TQT_Cpb.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function swatchFor(theme, mode) {
	return mode === "dark" ? theme.swatchDark : theme.swatch;
}
/**
* Minimal theme picker. Drop it anywhere (settings screen, dev toolbar).
* It only writes `data-theme` + `.dark` on <html>; no component styles change.
*/
function ThemeSwitcher({ className = "" }) {
	const { theme, setTheme, mode, toggleMode } = useTheme();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-3 flex items-center justify-between",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase",
				children: "Theme"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: toggleMode,
				className: "rounded-md border border-border bg-card px-2.5 py-1 text-xs font-medium text-foreground transition-colors hover:bg-muted",
				children: mode === "dark" ? "Night" : "Day"
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid grid-cols-2 gap-2 sm:grid-cols-3",
			children: themes.map((t) => {
				const s = swatchFor(t, mode);
				const active = t.id === theme;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => setTheme(t.id),
					"aria-pressed": active,
					className: `rounded-lg border p-2.5 text-left transition-colors ${active ? "border-ring ring-2 ring-ring/40" : "border-border hover:border-border-strong"}`,
					style: {
						background: s.bg,
						color: s.fg
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "flex items-center gap-1.5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "size-3 rounded-full",
								style: {
									background: s.primary,
									outline: `1px solid ${s.border}`
								}
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "size-3 rounded-full",
								style: { background: s.accent }
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "size-3 rounded-full",
								style: { background: s.border }
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "mt-1.5 block text-[13px] font-semibold",
						children: t.name
					})]
				}, t.id);
			})
		})]
	});
}
var SPACES = [
	{
		id: "home",
		to: "/",
		label: "Home",
		glyph: "⌂"
	},
	{
		id: "deen",
		to: "/deen",
		label: "Deen",
		glyph: "☾"
	},
	{
		id: "budget",
		to: "/budget",
		label: "Budget",
		glyph: "◈"
	},
	{
		id: "me",
		to: "/me",
		label: "Me",
		glyph: "❋"
	}
];
function Shell({ space, children }) {
	const online = useOnline();
	const [settings, setSettings] = (0, import_react.useState)(false);
	const [profile, setProfile] = useStore("profile", {
		name: "",
		city: "Kozhikode",
		gender: "",
		lat: 11.2588,
		lng: 75.7804,
		madhab: "shafi",
		method: "MuslimWorldLeague"
	});
	const [account] = useStore("account", null);
	const path = useRouterState({ select: (s) => s.location.pathname });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		"data-space": space,
		className: "relative z-[1] min-h-dvh",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
				className: "border-border/60 bg-background/85 sticky top-0 z-30 border-b backdrop-blur-md",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto flex max-w-3xl items-center justify-between px-5 py-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/",
						className: "flex items-center gap-2",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: "/logo.jpg",
							alt: "Firdous Logo",
							className: "size-10 object-cover rounded-xl shadow-sm"
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-1.5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-ink-faint flex items-center gap-1.5 rounded-full px-2 py-1 text-[0.7rem]",
								title: online ? "Synced with Firdous Cloud" : "Saved on this device",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "size-[6px] rounded-full",
									style: { background: online ? "var(--leaf)" : "var(--brass)" }
								}), online ? "Synced" : "On device"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: () => setSettings(true),
								"aria-label": "Settings",
								className: "press text-ink-soft hover:text-foreground grid size-9 place-items-center rounded-full",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
									viewBox: "0 0 24 24",
									className: "size-[18px]",
									fill: "none",
									stroke: "currentColor",
									strokeWidth: "1.6",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
										cx: "12",
										cy: "12",
										r: "3"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
										d: "M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1",
										strokeLinecap: "round"
									})]
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/auth",
								"aria-label": "Account",
								className: "press border-border grid size-9 place-items-center rounded-full border text-[0.7rem] font-semibold",
								children: (account?.email?.[0] ?? profile.name?.[0] ?? "G").toUpperCase()
							})
						]
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
				className: "mx-auto max-w-3xl px-5 pt-6 pb-32",
				children
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
				"aria-label": "Firdous spaces",
				className: "fixed inset-x-0 bottom-0 z-30 flex justify-center pb-[max(0.75rem,env(safe-area-inset-bottom))]",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "border-border/70 bg-background/90 flex gap-1 rounded-full border p-1.5 shadow-[var(--shadow-float)] backdrop-blur-xl",
					children: SPACES.map((s) => {
						const active = s.to === "/" ? path === "/" : path.startsWith(s.to);
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: s.to,
							"data-space": s.id,
							"aria-current": active ? "page" : void 0,
							className: "press relative flex min-w-[68px] flex-col items-center gap-0.5 rounded-full px-3 py-1.5",
							style: active ? {
								background: "var(--space-accent-soft)",
								color: "var(--foreground)"
							} : { color: "var(--ink-faint)" },
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-[15px] leading-none",
								children: s.glyph
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-[0.66rem] font-medium tracking-wide",
								children: s.label
							})]
						}, s.id);
					})
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sheet, {
				open: settings,
				onClose: () => setSettings(false),
				title: "Settings",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Your name",
							value: profile.name,
							placeholder: "How should Firdous greet you?",
							onChange: (e) => setProfile({
								...profile,
								name: e.target.value
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "City",
							value: profile.city,
							onChange: (e) => setProfile({
								...profile,
								city: e.target.value
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "title-md",
								children: "Location Coordinates"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-muted-foreground text-xs",
								children: [
									(profile.lat ?? 11.2588).toFixed(4),
									", ",
									(profile.lng ?? 75.7804).toFixed(4)
								]
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Action, {
								onClick: () => {
									if (navigator.geolocation) navigator.geolocation.getCurrentPosition((pos) => {
										setProfile({
											...profile,
											lat: pos.coords.latitude,
											lng: pos.coords.longitude
										});
									});
								},
								children: "Detect"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								className: "text-foreground/80 block text-[0.8rem] font-semibold tracking-wide",
								children: "Madhab (Asr Method)"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
								value: profile.madhab ?? "shafi",
								onChange: (e) => setProfile({
									...profile,
									madhab: e.target.value
								}),
								className: "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "shafi",
									children: "Shafi'i, Maliki, Hanbali (Standard)"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "hanafi",
									children: "Hanafi"
								})]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								className: "text-foreground/80 block text-[0.8rem] font-semibold tracking-wide",
								children: "Calculation Method"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
								value: profile.method ?? "MuslimWorldLeague",
								onChange: (e) => setProfile({
									...profile,
									method: e.target.value
								}),
								className: "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "MuslimWorldLeague",
										children: "Muslim World League"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "Egyptian",
										children: "Egyptian General Authority of Survey"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "Karachi",
										children: "University of Islamic Sciences, Karachi"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "UmmAlQura",
										children: "Umm Al-Qura University, Makkah"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "Dubai",
										children: "Dubai"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "MoonsightingCommittee",
										children: "Moonsighting Committee"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "NorthAmerica",
										children: "ISNA (North America)"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "Kuwait",
										children: "Kuwait"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "Qatar",
										children: "Qatar"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "Singapore",
										children: "Singapore"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "Tehran",
										children: "Tehran"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "Turkey",
										children: "Turkey"
									})
								]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "rule-line" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "rule-line" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ThemeSwitcher, {}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "rule-line" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-muted-foreground text-xs leading-relaxed",
							children: "Everything you write lives on this device first. When you're online it quietly syncs — nothing is ever lost while you wait."
						})
					]
				})
			})
		]
	});
}
//#endregion
export { Shell as t };
