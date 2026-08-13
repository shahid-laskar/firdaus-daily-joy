import { i as __toESM } from "../_runtime.mjs";
import { n as require_jsx_runtime, r as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { a as Section, c as Tick, d as todayKey, f as uid, h as useStore, i as Meter, n as EmptyState, p as useNow, r as Field, t as Action } from "./store-BUFgMFPj.mjs";
import { i as Madhab, n as CalculationMethod, r as Coordinates, t as PrayerTimes } from "../_libs/adhan.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/modules-ajys8qie.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function usePrayers(date = /* @__PURE__ */ new Date()) {
	const [profile] = useStore("profile", {
		name: "",
		city: "Kozhikode",
		gender: "",
		lat: 11.2588,
		lng: 75.7804,
		madhab: "shafi",
		method: "MuslimWorldLeague"
	});
	return (0, import_react.useMemo)(() => {
		const pLat = profile.lat ?? 11.2588;
		const pLng = profile.lng ?? 75.7804;
		const pMethod = profile.method ?? "MuslimWorldLeague";
		const pMadhab = profile.madhab ?? "shafi";
		const coordinates = new Coordinates(pLat, pLng);
		let params = CalculationMethod[pMethod] ? CalculationMethod[pMethod]() : CalculationMethod.MuslimWorldLeague();
		params.madhab = pMadhab === "hanafi" ? Madhab.Hanafi : Madhab.Shafi;
		const prayerTimes = new PrayerTimes(coordinates, date, params);
		const formatTime = (d) => {
			return d.toLocaleTimeString([], {
				hour: "2-digit",
				minute: "2-digit",
				hour12: false
			});
		};
		return [
			{
				id: "fajr",
				name: "Fajr",
				time: formatTime(prayerTimes.fajr)
			},
			{
				id: "dhuhr",
				name: "Dhuhr",
				time: formatTime(prayerTimes.dhuhr)
			},
			{
				id: "asr",
				name: "Asr",
				time: formatTime(prayerTimes.asr)
			},
			{
				id: "maghrib",
				name: "Maghrib",
				time: formatTime(prayerTimes.maghrib)
			},
			{
				id: "isha",
				name: "Isha",
				time: formatTime(prayerTimes.isha)
			}
		];
	}, [profile, date.toISOString().slice(0, 10)]);
}
function useSalah() {
	return useStore("salah", {});
}
function minutes(t) {
	const [h = 0, m = 0] = t.split(":").map(Number);
	return h * 60 + m;
}
function useNextPrayer() {
	const now = useNow(15e3);
	const prayers = usePrayers(now || /* @__PURE__ */ new Date());
	return (0, import_react.useMemo)(() => {
		if (!now) return null;
		const cur = now.getHours() * 60 + now.getMinutes();
		const next = prayers.find((p) => minutes(p.time) > cur) ?? prayers[0];
		let diff = minutes(next.time) - cur;
		if (diff < 0) diff += 1440;
		return {
			next,
			hours: Math.floor(diff / 60),
			mins: diff % 60
		};
	}, [now, prayers]);
}
function DeenHero() {
	const [log] = useSalah();
	const [profile] = useStore("profile", {
		name: "",
		city: "Kozhikode"
	});
	const countdown = useNextPrayer();
	const today = log[todayKey()] ?? {};
	const count = Object.keys(today).length;
	const isFriday = (/* @__PURE__ */ new Date()).getDay() === 5;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
		className: "rise mb-10",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "eyebrow",
				children: profile.city
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "display-xl mt-3",
				children: countdown ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
					countdown.next.name,
					" in",
					" ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "numeric text-space",
						children: [
							countdown.hours > 0 ? `${countdown.hours}h ` : "",
							countdown.mins,
							"m"
						]
					})
				] }) : "Peace be upon you"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-muted-foreground mt-3 text-sm",
				children: [
					count,
					" of 5 logged today · ",
					countdown?.next.time ?? "—"
				]
			}),
			isFriday && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "border-space/50 text-ink-soft mt-5 border-l-2 pl-4 text-sm italic",
				children: "It's Friday — a good time for Surah Al-Kahf."
			})
		]
	});
}
var VERSES = [
	{
		ar: "إِنَّ مَعَ الْعُسْرِ يُسْرًا",
		en: "Indeed, with hardship comes ease.",
		ref: "Ash-Sharh 94:6"
	},
	{
		ar: "وَبَشِّرِ الصَّابِرِينَ",
		en: "And give good tidings to the patient.",
		ref: "Al-Baqarah 2:155"
	},
	{
		ar: "فَاذْكُرُونِي أَذْكُرْكُمْ",
		en: "So remember Me; I will remember you.",
		ref: "Al-Baqarah 2:152"
	}
];
function DailyVerse() {
	const verse = VERSES[(/* @__PURE__ */ new Date()).getDate() % VERSES.length];
	const [copied, setCopied] = (0, import_react.useState)(false);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "rise border-border/70 border-y py-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "eyebrow mb-5",
				children: "Verse of the day"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "arabic text-[1.9rem] leading-[2.4]",
				children: verse.ar
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-ink-soft mt-5 text-[1.02rem] leading-relaxed",
				children: verse.en
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 flex items-center justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-ink-faint text-xs tracking-wide",
					children: verse.ref
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: () => {
						navigator.clipboard?.writeText(`${verse.ar}\n\n${verse.en}\n— ${verse.ref}`);
						setCopied(true);
						setTimeout(() => setCopied(false), 1600);
					},
					className: "text-ink-faint hover:text-foreground text-xs",
					children: copied ? "Copied" : "Copy"
				})]
			})
		]
	});
}
function Salah() {
	const [log, setLog] = useSalah();
	const today = log[todayKey()] ?? {};
	const prayers = usePrayers();
	const week = [...Array(7)].map((_, i) => {
		const d = /* @__PURE__ */ new Date();
		d.setDate(d.getDate() - (6 - i));
		return d.toISOString().slice(0, 10);
	});
	function mark(id, state) {
		const day = { ...log[todayKey()] ?? {} };
		if (day[id] === state) delete day[id];
		else day[id] = state;
		setLog({
			...log,
			[todayKey()]: day
		});
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-10",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
			eyebrow: "Today",
			title: "Salah",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "thread",
				children: prayers.map((p) => {
					const state = today[p.id];
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						"data-done": !!state,
						className: "thread-node flex items-center gap-3 py-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tick, {
								done: !!state,
								label: p.name,
								onToggle: () => mark(p.id, "ontime")
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: `title-md ${state ? "text-ink-faint" : ""}`,
									children: p.name
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-ink-faint numeric text-xs",
									children: p.time
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: () => mark(p.id, "late"),
								className: `press rounded-full px-2.5 py-1 text-[0.7rem] ${state === "late" ? "bg-space-soft text-foreground" : "text-ink-faint"}`,
								children: "Late"
							})
						]
					}, p.id);
				})
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
			eyebrow: "Last seven days",
			title: "Consistency",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-7 gap-2",
				children: week.map((d) => {
					const day = log[d] ?? {};
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "text-center",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex flex-col gap-1",
							children: prayers.map((p) => {
								const s = day[p.id];
								return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									title: `${p.name} — ${s ?? "missed"}`,
									className: "h-2.5 rounded-[3px]",
									style: { background: s === "ontime" ? "var(--space-accent)" : s === "late" ? "var(--space-accent-soft)" : "var(--muted)" }
								}, p.id);
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-ink-faint mt-2 text-[0.62rem]",
							children: d.slice(8)
						})]
					}, d);
				})
			})
		})]
	});
}
var PHRASES = [
	"SubhanAllah",
	"Alhamdulillah",
	"Allahu Akbar",
	"Astaghfirullah"
];
var TARGETS = [
	33,
	100,
	1e3
];
function Tasbih() {
	const [phrase, setPhrase] = (0, import_react.useState)(PHRASES[0]);
	const [target, setTarget] = (0, import_react.useState)(33);
	const [count, setCount] = (0, import_react.useState)(0);
	const [haptic, setHaptic] = (0, import_react.useState)(true);
	const done = count >= target;
	const r = 74;
	const circ = 2 * Math.PI * r;
	function tap() {
		setCount((c) => Math.min(target, c + 1));
		if (haptic && typeof navigator !== "undefined") navigator.vibrate?.(8);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, {
		eyebrow: "Dhikr",
		title: "Tasbih",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex flex-wrap gap-1.5",
				children: PHRASES.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: () => {
						setPhrase(p);
						setCount(0);
					},
					className: `press rounded-full px-3 py-1 text-[0.78rem] ${p === phrase ? "bg-space-soft text-foreground" : "text-muted-foreground"}`,
					children: p
				}, p))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				onClick: tap,
				"aria-label": `Count ${phrase}. ${count} of ${target}`,
				className: "press mx-auto mt-8 block",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
					viewBox: "0 0 180 180",
					className: "size-56 sm:size-64",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
							cx: "90",
							cy: "90",
							r,
							fill: "none",
							stroke: "var(--muted)",
							strokeWidth: "6"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
							cx: "90",
							cy: "90",
							r,
							fill: "none",
							stroke: "var(--space-accent)",
							strokeWidth: "6",
							strokeLinecap: "round",
							strokeDasharray: circ,
							strokeDashoffset: circ - Math.min(count, target) / target * circ,
							transform: "rotate(-90 90 90)",
							style: { transition: "stroke-dashoffset 260ms cubic-bezier(.2,.8,.2,1)" }
						}),
						[...Array(target <= 100 ? target : 20)].map((_, i, arr) => {
							const a = i / arr.length * Math.PI * 2 - Math.PI / 2;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
								cx: 90 + Math.cos(a) * 58,
								cy: 90 + Math.sin(a) * 58,
								r: "1.6",
								fill: i < count / target * arr.length ? "var(--space-accent)" : "var(--rule)"
							}, i);
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
							x: "90",
							y: "92",
							textAnchor: "middle",
							className: "numeric",
							style: {
								fontFamily: "var(--font-display)",
								fontSize: 40,
								fill: "var(--foreground)"
							},
							children: count
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("text", {
							x: "90",
							y: "112",
							textAnchor: "middle",
							style: {
								fontSize: 9,
								letterSpacing: 2,
								fill: "var(--ink-faint)"
							},
							children: ["OF ", target]
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-ink-soft mt-2 text-center text-sm",
				children: done ? "Complete — may it be accepted." : `Tap the ring for ${phrase}`
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 flex flex-wrap items-center justify-center gap-2",
				children: [
					TARGETS.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => {
							setTarget(t);
							setCount(0);
						},
						className: `press numeric rounded-full px-3 py-1 text-[0.78rem] ${t === target ? "bg-space-soft text-foreground" : "text-muted-foreground"}`,
						children: t
					}, t)),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Action, {
						onClick: () => setCount(0),
						children: "Reset"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Action, {
						onClick: () => setHaptic(!haptic),
						children: haptic ? "Feedback on" : "Feedback off"
					})
				]
			})
		]
	});
}
var SURAHS = [
	{
		n: 1,
		name: "Al-Fatihah",
		meaning: "The Opening",
		ayahs: [
			{
				n: 1,
				ar: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
				en: "In the name of Allah, the Entirely Merciful, the Especially Merciful."
			},
			{
				n: 2,
				ar: "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ",
				en: "All praise is due to Allah, Lord of the worlds."
			},
			{
				n: 3,
				ar: "الرَّحْمَٰنِ الرَّحِيمِ",
				en: "The Entirely Merciful, the Especially Merciful."
			},
			{
				n: 4,
				ar: "مَالِكِ يَوْمِ الدِّينِ",
				en: "Sovereign of the Day of Recompense."
			},
			{
				n: 5,
				ar: "إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ",
				en: "It is You we worship and You we ask for help."
			},
			{
				n: 6,
				ar: "اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ",
				en: "Guide us to the straight path."
			},
			{
				n: 7,
				ar: "صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ",
				en: "The path of those upon whom You have bestowed favour, not of those who have earned Your anger, nor of those who go astray."
			}
		]
	},
	{
		n: 112,
		name: "Al-Ikhlas",
		meaning: "Sincerity",
		ayahs: [
			{
				n: 1,
				ar: "قُلْ هُوَ اللَّهُ أَحَدٌ",
				en: "Say, He is Allah, One."
			},
			{
				n: 2,
				ar: "اللَّهُ الصَّمَدُ",
				en: "Allah, the Eternal Refuge."
			},
			{
				n: 3,
				ar: "لَمْ يَلِدْ وَلَمْ يُولَدْ",
				en: "He neither begets nor is born."
			},
			{
				n: 4,
				ar: "وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ",
				en: "Nor is there to Him any equivalent."
			}
		]
	},
	{
		n: 113,
		name: "Al-Falaq",
		meaning: "The Daybreak",
		ayahs: [
			{
				n: 1,
				ar: "قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ",
				en: "Say, I seek refuge in the Lord of daybreak."
			},
			{
				n: 2,
				ar: "مِن شَرِّ مَا خَلَقَ",
				en: "From the evil of that which He created."
			},
			{
				n: 3,
				ar: "وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ",
				en: "And from the evil of darkness when it settles."
			},
			{
				n: 4,
				ar: "وَمِن شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ",
				en: "And from the evil of the blowers in knots."
			},
			{
				n: 5,
				ar: "وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ",
				en: "And from the evil of an envier when he envies."
			}
		]
	}
];
function Quran() {
	const [openSurah, setOpenSurah] = (0, import_react.useState)(null);
	const [bookmarks, setBookmarks] = useStore("quran-bookmarks", []);
	const [translation, setTranslation] = useStore("quran-translation", true);
	const [sessions, setSessions] = useStore("quran-log", []);
	const [form, setForm] = (0, import_react.useState)({
		surah: "",
		range: "",
		mins: ""
	});
	const surah = SURAHS.find((s) => s.n === openSurah);
	if (surah) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rise",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-8 flex items-center justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: () => setOpenSurah(null),
					className: "text-ink-soft hover:text-foreground text-sm",
					children: "← Surahs"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: () => setTranslation(!translation),
					className: "text-ink-faint hover:text-foreground text-xs",
					children: translation ? "Arabic only" : "Show translation"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-10 text-center",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "eyebrow",
						children: ["Surah ", surah.n]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "display-lg mt-2",
						children: surah.name
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-ink-faint text-sm",
						children: surah.meaning
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				dir: "rtl",
				className: "space-y-8",
				children: surah.ayahs.map((a) => {
					const key = `${surah.n}:${a.n}`;
					const marked = bookmarks.includes(key);
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
						className: "group",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "arabic text-[1.75rem] sm:text-[2rem]",
								children: [a.ar, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-ink-faint mr-2 inline-grid size-7 place-items-center rounded-full border border-[var(--rule)] align-middle text-[0.7rem]",
									children: a.n
								})]
							}),
							translation && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								dir: "ltr",
								className: "text-ink-soft mt-3 text-[0.95rem] leading-relaxed",
								children: a.en
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								dir: "ltr",
								className: "mt-3 flex gap-3 opacity-0 transition group-hover:opacity-100 focus-within:opacity-100",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									onClick: () => setBookmarks(marked ? bookmarks.filter((b) => b !== key) : [...bookmarks, key]),
									className: "text-ink-faint hover:text-foreground text-xs",
									children: marked ? "Bookmarked" : "Bookmark"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									onClick: () => navigator.clipboard?.writeText(`${a.ar}\n${a.en}`),
									className: "text-ink-faint hover:text-foreground text-xs",
									children: "Copy"
								})]
							})
						]
					}, a.n);
				})
			})
		]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-10",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, {
			eyebrow: "Read",
			title: "Quran",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "divide-border/70 divide-y",
				children: SURAHS.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					onClick: () => setOpenSurah(s.n),
					className: "group flex w-full items-center gap-4 py-4 text-left",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-ink-faint numeric w-6 text-sm",
							children: s.n
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "flex-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "title-md block",
								children: s.name
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-ink-faint text-xs",
								children: s.meaning
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "arabic text-ink-soft text-lg",
							children: [s.ayahs.length, " آيات"]
						})
					]
				}, s.n))
			}), bookmarks.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-ink-faint mt-4 text-xs",
				children: [bookmarks.length, " bookmarked ayah(s)"]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, {
			eyebrow: "Reading log",
			title: "Sessions",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				onSubmit: (e) => {
					e.preventDefault();
					if (!form.surah.trim()) return;
					setSessions([{
						id: uid(),
						...form,
						date: todayKey()
					}, ...sessions]);
					setForm({
						surah: "",
						range: "",
						mins: ""
					});
				},
				className: "mb-5 grid gap-2 sm:grid-cols-[1fr_1fr_90px_auto] sm:items-end",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Surah",
						value: form.surah,
						onChange: (e) => setForm({
							...form,
							surah: e.target.value
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Ayah range",
						value: form.range,
						onChange: (e) => setForm({
							...form,
							range: e.target.value
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Minutes",
						value: form.mins,
						onChange: (e) => setForm({
							...form,
							mins: e.target.value
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Action, {
						type: "submit",
						variant: "solid",
						className: "h-[42px]",
						children: "Log"
					})
				]
			}), sessions.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
				glyph: "☾",
				headline: "No sessions logged",
				body: "Log what you read today — even a few ayahs are worth keeping track of."
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "thread",
				children: sessions.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "thread-node py-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-[0.95rem]",
						children: [
							s.surah,
							" ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-ink-faint",
								children: s.range
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-ink-faint numeric text-xs",
						children: [
							s.date,
							" · ",
							s.mins || "—",
							" min"
						]
					})]
				}, s.id))
			})]
		})]
	});
}
var DUAS = [
	{
		ar: "رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً",
		en: "Our Lord, give us good in this world and good in the Hereafter.",
		when: "Anytime"
	},
	{
		ar: "اللَّهُمَّ بِاسْمِكَ أَمُوتُ وَأَحْيَا",
		en: "O Allah, in Your name I die and I live.",
		when: "Before sleep"
	},
	{
		ar: "بِسْمِ اللَّهِ تَوَكَّلْتُ عَلَى اللَّهِ",
		en: "In the name of Allah, I place my trust in Allah.",
		when: "Leaving home"
	},
	{
		ar: "اللَّهُمَّ إِنِّي أَسْأَلُكَ عِلْمًا نَافِعًا",
		en: "O Allah, I ask You for beneficial knowledge.",
		when: "Studying"
	}
];
function Duas() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
		eyebrow: "Adhkar",
		title: "Duas",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "space-y-8",
			children: DUAS.map((d) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
				className: "border-border/70 border-b pb-8 last:border-0",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "eyebrow mb-3",
						children: d.when
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "arabic text-[1.55rem]",
						children: d.ar
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-ink-soft mt-3 text-[0.95rem] leading-relaxed",
						children: d.en
					})
				]
			}, d.en))
		})
	});
}
function Hifz() {
	const [items, setItems] = useStore("hifz", []);
	const [surah, setSurah] = (0, import_react.useState)("");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, {
		eyebrow: "Memorisation",
		title: "Hifz",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			onSubmit: (e) => {
				e.preventDefault();
				if (!surah.trim()) return;
				setItems([...items, {
					id: uid(),
					surah: surah.trim(),
					pct: 0
				}]);
				setSurah("");
			},
			className: "mb-6 grid gap-2 sm:grid-cols-[1fr_auto] sm:items-end",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "Surah in progress",
				value: surah,
				onChange: (e) => setSurah(e.target.value)
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Action, {
				type: "submit",
				variant: "solid",
				className: "h-[42px]",
				children: "Track"
			})]
		}), items.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
			glyph: "◈",
			headline: "Nothing in progress",
			body: "Add a surah you're memorising and move it forward a little each day."
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "space-y-6",
			children: items.map((i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-2 flex items-baseline justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "title-md",
						children: i.surah
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "numeric text-ink-soft text-sm",
						children: [i.pct, "%"]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Meter, { value: i.pct }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-2 flex gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Action, {
						onClick: () => setItems(items.map((x) => x.id === i.id ? {
							...x,
							pct: Math.max(0, x.pct - 10)
						} : x)),
						children: "−10%"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Action, {
						onClick: () => setItems(items.map((x) => x.id === i.id ? {
							...x,
							pct: Math.min(100, x.pct + 10)
						} : x)),
						children: "+10%"
					})]
				})
			] }, i.id))
		})]
	});
}
function Fasting() {
	const [fasts, setFasts] = useStore("fasting", {});
	const days = [...Array(28)].map((_, i) => {
		const d = /* @__PURE__ */ new Date();
		d.setDate(d.getDate() - (27 - i));
		return d.toISOString().slice(0, 10);
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, {
		eyebrow: "Last four weeks",
		title: "Fasting",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid grid-cols-7 gap-1.5",
			children: days.map((d) => {
				const s = fasts[d];
				return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: () => {
						const next = { ...fasts };
						if (s === "voluntary") next[d] = "obligatory";
						else if (s === "obligatory") delete next[d];
						else next[d] = "voluntary";
						setFasts(next);
					},
					"aria-label": `${d} ${s ?? "not fasted"}`,
					className: "press numeric grid aspect-square place-items-center rounded-lg border text-[0.68rem]",
					style: {
						background: s === "obligatory" ? "var(--space-accent)" : s === "voluntary" ? "var(--space-accent-soft)" : "transparent",
						color: s === "obligatory" ? "var(--background)" : "var(--ink-faint)",
						borderColor: s ? "transparent" : "var(--rule)"
					},
					children: d.slice(8)
				}, d);
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-ink-faint mt-4 text-xs",
			children: "Tap once for voluntary, twice for obligatory."
		})]
	});
}
function Qibla() {
	const [heading, setHeading] = (0, import_react.useState)(null);
	const qibla = 293;
	const ref = (0, import_react.useRef)(false);
	(0, import_react.useEffect)(() => {
		function onOrient(e) {
			if (e.alpha != null) setHeading(e.alpha);
		}
		window.addEventListener("deviceorientation", onOrient);
		return () => window.removeEventListener("deviceorientation", onOrient);
	}, []);
	async function request() {
		const anyDO = DeviceOrientationEvent;
		if (anyDO.requestPermission) await anyDO.requestPermission();
		ref.current = true;
	}
	const rotation = heading == null ? qibla : qibla - heading;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, {
		eyebrow: "Direction",
		title: "Qibla",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mx-auto mt-4 w-fit",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
					viewBox: "0 0 200 200",
					className: "size-64",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
							cx: "100",
							cy: "100",
							r: "92",
							fill: "none",
							stroke: "var(--rule)"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
							cx: "100",
							cy: "100",
							r: "70",
							fill: "none",
							stroke: "var(--rule)",
							strokeDasharray: "2 6"
						}),
						[
							"N",
							"E",
							"S",
							"W"
						].map((d, i) => {
							const a = (i * 90 - 90) * (Math.PI / 180);
							return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
								x: 100 + Math.cos(a) * 82,
								y: 100 + Math.sin(a) * 82 + 4,
								textAnchor: "middle",
								style: {
									fontSize: 10,
									letterSpacing: 1,
									fill: "var(--ink-faint)"
								},
								children: d
							}, d);
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
							style: {
								transform: `rotate(${rotation}deg)`,
								transformOrigin: "100px 100px",
								transition: "transform 400ms cubic-bezier(.2,.8,.2,1)"
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
								x1: "100",
								y1: "100",
								x2: "100",
								y2: "26",
								stroke: "var(--space-accent)",
								strokeWidth: "2",
								strokeLinecap: "round"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
								cx: "100",
								cy: "24",
								r: "6",
								fill: "var(--space-accent)"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
							cx: "100",
							cy: "100",
							r: "3",
							fill: "var(--ink)"
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-muted-foreground mt-4 text-center text-sm",
				children: heading == null ? "Holding steady at the compass bearing for Mecca." : `Facing ${Math.round(heading)}° — turn until the marker points up.`
			}),
			heading == null && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4 flex justify-center",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Action, {
					onClick: request,
					children: "Use device compass"
				})
			})
		]
	});
}
//#endregion
export { Hifz as a, Salah as c, useSalah as d, Fasting as i, Tasbih as l, DeenHero as n, Qibla as o, Duas as r, Quran as s, DailyVerse as t, useNextPrayer as u };
