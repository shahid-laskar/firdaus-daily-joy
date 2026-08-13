import { i as __toESM } from "../_runtime.mjs";
import { n as require_jsx_runtime, r as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { a as Section, c as Tick, d as todayKey, f as uid, h as useStore, i as Meter, n as EmptyState, p as useNow, r as Field, s as SubTabs, t as Action } from "./store-BUFgMFPj.mjs";
import { g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as Shell } from "./shell-2TQT_Cpb.mjs";
import { d as useSalah, u as useNextPrayer } from "./modules-ajys8qie.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-CHb20NdY.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var LISTS = [
	"General",
	"Shopping",
	"Work",
	"Home"
];
function Tasks() {
	const [tasks, setTasks] = useStore("tasks", []);
	const [list, setList] = (0, import_react.useState)("General");
	const [filter, setFilter] = (0, import_react.useState)("all");
	const [title, setTitle] = (0, import_react.useState)("");
	const [time, setTime] = (0, import_react.useState)("");
	const visible = tasks.filter((t) => t.list === list && (filter === "all" ? true : filter === "done" ? t.done : t.date === todayKey() && !t.done));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, {
		eyebrow: "Household",
		title: "Tasks",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-4 flex flex-wrap items-center gap-1.5",
				children: [
					LISTS.map((l) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => setList(l),
						className: `press rounded-full px-3 py-1 text-[0.78rem] ${l === list ? "bg-space-soft text-foreground" : "text-muted-foreground"}`,
						children: l
					}, l)),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "bg-rule mx-1 h-4 w-px" }),
					[
						"all",
						"today",
						"done"
					].map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => setFilter(f),
						className: `press rounded-full px-2.5 py-1 text-[0.72rem] capitalize ${f === filter ? "text-foreground underline decoration-[var(--space-accent)] decoration-2 underline-offset-4" : "text-ink-faint"}`,
						children: f
					}, f))
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				onSubmit: (e) => {
					e.preventDefault();
					if (!title.trim()) return;
					setTasks([{
						id: uid(),
						title: title.trim(),
						list,
						time,
						done: false,
						date: todayKey()
					}, ...tasks]);
					setTitle("");
					setTime("");
				},
				className: "mb-6 flex items-end gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex-1",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Add to this list",
							value: title,
							placeholder: "Something to take care of…",
							onChange: (e) => setTitle(e.target.value)
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "time",
						"aria-label": "Due time",
						value: time,
						onChange: (e) => setTime(e.target.value),
						className: "border-border/80 numeric h-[42px] rounded-xl border bg-transparent px-2.5 text-sm"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Action, {
						type: "submit",
						variant: "solid",
						className: "h-[42px]",
						children: "Add"
					})
				]
			}),
			visible.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
				glyph: "⌂",
				headline: "Nothing waiting here",
				body: `Your ${list.toLowerCase()} list is clear. Add the next thing when it comes to mind.`
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "thread space-y-1",
				children: visible.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					"data-done": t.done,
					className: "thread-node group flex items-start gap-3 py-2.5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tick, {
							done: t.done,
							label: t.title,
							onToggle: () => setTasks(tasks.map((x) => x.id === t.id ? {
								...x,
								done: !x.done
							} : x))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0 flex-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: `text-[0.95rem] ${t.done ? "text-ink-faint line-through" : ""}`,
								children: t.title
							}), t.time && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-ink-faint numeric text-xs",
								children: t.time
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: () => setTasks(tasks.filter((x) => x.id !== t.id)),
							"aria-label": `Remove ${t.title}`,
							className: "text-ink-faint hover:text-destructive text-xs opacity-0 transition group-hover:opacity-100 focus-visible:opacity-100",
							children: "Remove"
						})
					]
				}, t.id))
			})
		]
	});
}
var DAYS = [
	"Mon",
	"Tue",
	"Wed",
	"Thu",
	"Fri",
	"Sat",
	"Sun"
];
var SLOTS = [
	"Breakfast",
	"Lunch",
	"Dinner"
];
function Meals() {
	const [plan, setPlan] = useStore("meals", {});
	const [recipes, setRecipes] = useStore("recipes", []);
	const [name, setName] = (0, import_react.useState)("");
	const [items, setItems] = (0, import_react.useState)("");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-10",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, {
			eyebrow: "This week",
			title: "Meal plan",
			aside: Object.keys(plan).length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				onClick: () => {
					if (confirm("Clear the entire week?")) setPlan({});
				},
				className: "text-xs text-ink-faint hover:text-destructive transition",
				children: "Clear week"
			}) : void 0,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("datalist", {
				id: "saved-recipes",
				children: recipes.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: r.name }, r.id))
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "overflow-x-auto no-scrollbar -mx-5 px-5",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
					className: "w-full min-w-[560px] border-separate border-spacing-y-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "eyebrow w-20 text-left",
						children: " "
					}), SLOTS.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "eyebrow text-left",
						children: s
					}, s))] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: DAYS.map((d) => {
						const isToday = d === [
							"Sun",
							"Mon",
							"Tue",
							"Wed",
							"Thu",
							"Fri",
							"Sat"
						][(/* @__PURE__ */ new Date()).getDay()];
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
							className: isToday ? "bg-space-soft/30 rounded-lg" : "",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: `font-display pr-3 text-sm rounded-l-lg py-1 pl-2 ${isToday ? "text-foreground font-semibold" : "text-ink-soft"}`,
								children: d
							}), SLOTS.map((s, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: `pr-2 ${i === SLOTS.length - 1 ? "rounded-r-lg" : ""}`,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									"aria-label": `${d} ${s}`,
									list: "saved-recipes",
									value: plan[`${d}-${s}`] ?? "",
									placeholder: "—",
									onChange: (e) => setPlan({
										...plan,
										[`${d}-${s}`]: e.target.value
									}),
									className: `w-full border-b bg-transparent py-1.5 text-sm outline-none transition-colors ${isToday ? "border-border/80 focus:border-space" : "border-border/50 focus:border-space"}`
								})
							}, s))]
						}, d);
					}) })]
				})
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, {
			eyebrow: "Repository",
			title: "Recipes",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				onSubmit: (e) => {
					e.preventDefault();
					if (!name.trim()) return;
					setRecipes([{
						id: uid(),
						name: name.trim(),
						items
					}, ...recipes]);
					setName("");
					setItems("");
				},
				className: "mb-5 grid gap-2 sm:grid-cols-[1fr_1.4fr_auto] sm:items-end",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Dish",
						value: name,
						onChange: (e) => setName(e.target.value)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Ingredients (comma separated)",
						value: items,
						onChange: (e) => setItems(e.target.value)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Action, {
						type: "submit",
						variant: "solid",
						className: "h-[42px]",
						children: "Save"
					})
				]
			}), recipes.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
				glyph: "✧",
				headline: "No recipes yet",
				body: "Save the meals your family actually eats — grocery lists build themselves from here."
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "divide-border/70 divide-y",
				children: recipes.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex items-baseline justify-between gap-4 py-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "title-md",
						children: r.name
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-muted-foreground text-xs",
						children: r.items || "No ingredients noted"
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => setRecipes(recipes.filter((x) => x.id !== r.id)),
						className: "text-ink-faint hover:text-destructive text-xs",
						children: "Remove"
					})]
				}, r.id))
			})]
		})]
	});
}
function GroceryList() {
	const [items, setItems] = useStore("grocery", []);
	const [plan] = useStore("meals", {});
	const [recipes] = useStore("recipes", []);
	const [draft, setDraft] = (0, import_react.useState)("");
	const remaining = items.filter((i) => !i.got).length;
	function generate() {
		const planned = new Set(Object.values(plan).map((v) => v.trim().toLowerCase()).filter(Boolean));
		const derived = [];
		recipes.forEach((r) => {
			if (planned.has(r.name.trim().toLowerCase())) r.items.split(",").forEach((i) => i.trim() && derived.push(i.trim()));
		});
		const existing = new Set(items.map((i) => i.name.toLowerCase()));
		const fresh = [...new Set(derived)].filter((d) => !existing.has(d.toLowerCase())).map((name) => ({
			id: uid(),
			name,
			got: false
		}));
		setItems([...fresh, ...items]);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, {
		eyebrow: "Shopping",
		title: "Grocery",
		aside: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Action, {
			onClick: generate,
			children: "From meal plan"
		}),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("form", {
			onSubmit: (e) => {
				e.preventDefault();
				if (!draft.trim()) return;
				setItems([{
					id: uid(),
					name: draft.trim(),
					got: false
				}, ...items]);
				setDraft("");
			},
			className: "mb-5",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "Add item",
				value: draft,
				placeholder: "Rice, onions, olive oil…",
				onChange: (e) => setDraft(e.target.value)
			})
		}), items.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
			glyph: "◦",
			headline: "The basket is empty",
			body: "Add what's missing, or let Firdous read this week's meal plan and fill it for you.",
			action: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Action, {
				variant: "solid",
				onClick: generate,
				children: "Build from meal plan"
			})
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "text-muted-foreground mb-3 text-xs",
			children: [
				remaining,
				" of ",
				items.length,
				" still to pick up"
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "space-y-0.5",
			children: items.map((i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
				className: "group flex items-center gap-3 py-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tick, {
						done: i.got,
						label: i.name,
						onToggle: () => setItems(items.map((x) => x.id === i.id ? {
							...x,
							got: !x.got
						} : x))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: `flex-1 text-[0.95rem] ${i.got ? "text-ink-faint line-through" : ""}`,
						children: i.name
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => setItems(items.filter((x) => x.id !== i.id)),
						className: "text-ink-faint hover:text-destructive text-xs opacity-0 group-hover:opacity-100",
						"aria-label": `Remove ${i.name}`,
						children: "Remove"
					})
				]
			}, i.id))
		})] })]
	});
}
function Kids() {
	const [kids, setKids] = useStore("kids", []);
	const [name, setName] = (0, import_react.useState)("");
	const [age, setAge] = (0, import_react.useState)("");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, {
		eyebrow: "Family",
		title: "Kids",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			onSubmit: (e) => {
				e.preventDefault();
				if (!name.trim()) return;
				setKids([...kids, {
					id: uid(),
					name: name.trim(),
					age,
					chores: []
				}]);
				setName("");
				setAge("");
			},
			className: "mb-6 grid gap-2 sm:grid-cols-[1fr_100px_auto] sm:items-end",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Child",
					value: name,
					onChange: (e) => setName(e.target.value)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Age",
					value: age,
					onChange: (e) => setAge(e.target.value)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Action, {
					type: "submit",
					variant: "solid",
					className: "h-[42px]",
					children: "Add"
				})
			]
		}), kids.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
			glyph: "❋",
			headline: "No little ones added",
			body: "Add a child to track activities, chores and the small wins worth noticing."
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "space-y-8",
			children: kids.map((k) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-3 flex items-baseline justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
					className: "title-md",
					children: [k.name, k.age && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "text-ink-faint text-sm font-normal",
						children: [" · ", k.age]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: () => setKids(kids.filter((x) => x.id !== k.id)),
					className: "text-ink-faint hover:text-destructive text-xs",
					children: "Remove"
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChoreList, {
				kid: k,
				onChange: (chores) => setKids(kids.map((x) => x.id === k.id ? {
					...x,
					chores
				} : x))
			})] }, k.id))
		})]
	});
}
function ChoreList({ kid, onChange }) {
	const [draft, setDraft] = (0, import_react.useState)("");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "thread",
		children: [kid.chores.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			"data-done": c.done,
			className: "thread-node flex items-center gap-3 py-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tick, {
				done: c.done,
				label: c.title,
				onToggle: () => onChange(kid.chores.map((x) => x.id === c.id ? {
					...x,
					done: !x.done
				} : x))
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: `text-[0.95rem] ${c.done ? "text-ink-faint line-through" : ""}`,
				children: c.title
			})]
		}, c.id)), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("form", {
			onSubmit: (e) => {
				e.preventDefault();
				if (!draft.trim()) return;
				onChange([...kid.chores, {
					id: uid(),
					title: draft.trim(),
					done: false
				}]);
				setDraft("");
			},
			className: "thread-node py-2",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				value: draft,
				onChange: (e) => setDraft(e.target.value),
				placeholder: "Add an activity or chore",
				className: "text-ink-faint placeholder:text-ink-faint focus:text-foreground w-full bg-transparent text-sm outline-none"
			})
		})]
	});
}
function Deeds() {
	const [deeds, setDeeds] = useStore("deeds", []);
	const [who, setWho] = (0, import_react.useState)("");
	const [what, setWhat] = (0, import_react.useState)("");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, {
		eyebrow: "Noticed",
		title: "Good deeds",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			onSubmit: (e) => {
				e.preventDefault();
				if (!what.trim()) return;
				setDeeds([{
					id: uid(),
					who: who.trim() || "Family",
					what: what.trim(),
					date: todayKey()
				}, ...deeds]);
				setWhat("");
			},
			className: "mb-6 grid gap-2 sm:grid-cols-[120px_1fr_auto] sm:items-end",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Who",
					value: who,
					onChange: (e) => setWho(e.target.value)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "What they did",
					value: what,
					onChange: (e) => setWhat(e.target.value)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Action, {
					type: "submit",
					variant: "solid",
					className: "h-[42px]",
					children: "Record"
				})
			]
		}), deeds.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
			glyph: "✧",
			headline: "Nothing recorded yet",
			body: "Small kindnesses are easy to forget. Write one down and it stays."
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "thread",
			children: deeds.map((d) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
				"data-active": "true",
				className: "thread-node py-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-[0.95rem]",
					children: d.what
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-ink-faint numeric text-xs",
					children: [
						d.who,
						" · ",
						d.date
					]
				})]
			}, d.id))
		})]
	});
}
function FamilyCalendar() {
	const [events, setEvents] = useStore("events", []);
	const [title, setTitle] = (0, import_react.useState)("");
	const [date, setDate] = (0, import_react.useState)(todayKey());
	const sorted = (0, import_react.useMemo)(() => [...events].sort((a, b) => a.date.localeCompare(b.date)), [events]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, {
		eyebrow: "Shared",
		title: "Calendar",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			onSubmit: (e) => {
				e.preventDefault();
				if (!title.trim()) return;
				setEvents([...events, {
					id: uid(),
					title: title.trim(),
					date
				}]);
				setTitle("");
			},
			className: "mb-6 grid gap-2 sm:grid-cols-[1fr_150px_auto] sm:items-end",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Event",
					value: title,
					onChange: (e) => setTitle(e.target.value)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Date",
					type: "date",
					value: date,
					onChange: (e) => setDate(e.target.value)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Action, {
					type: "submit",
					variant: "solid",
					className: "h-[42px]",
					children: "Add"
				})
			]
		}), sorted.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
			glyph: "◇",
			headline: "An open week",
			body: "Nothing scheduled. Add birthdays, visits and appointments so nobody has to remember."
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "thread",
			children: sorted.map((e) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
				"data-active": e.date === todayKey(),
				className: "thread-node group flex items-baseline justify-between py-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-[0.95rem]",
					children: e.title
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-ink-faint numeric text-xs",
					children: e.date
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: () => setEvents(events.filter((x) => x.id !== e.id)),
					className: "text-ink-faint hover:text-destructive text-xs opacity-0 group-hover:opacity-100",
					children: "Remove"
				})]
			}, e.id))
		})]
	});
}
function Notes() {
	const [note, setNote] = useStore("notes", "");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, {
		eyebrow: "Shared",
		title: "Notes",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
			value: note,
			onChange: (e) => setNote(e.target.value),
			placeholder: "The family scratchpad — codes, reminders, the thing you'll forget by evening.",
			rows: 14,
			className: "focus:border-space/60 w-full resize-none rounded-2xl border border-transparent bg-[linear-gradient(transparent_calc(2rem_-_1px),var(--rule)_calc(2rem_-_1px))] bg-[size:100%_2rem] p-4 text-[0.95rem] leading-8 outline-none"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-ink-faint mt-2 text-xs",
			children: "Saved on this device as you type."
		})]
	});
}
var TABS = [
	{
		id: "today",
		label: "Today"
	},
	{
		id: "tasks",
		label: "Tasks"
	},
	{
		id: "meals",
		label: "Meals"
	},
	{
		id: "grocery",
		label: "Grocery"
	},
	{
		id: "kids",
		label: "Kids"
	},
	{
		id: "deeds",
		label: "Deeds"
	},
	{
		id: "calendar",
		label: "Calendar"
	},
	{
		id: "notes",
		label: "Notes"
	}
];
function greeting(h) {
	if (h < 5) return "Still awake";
	if (h < 12) return "Good morning";
	if (h < 16) return "Good afternoon";
	if (h < 20) return "Good evening";
	return "Winding down";
}
function Today() {
	const now = useNow(6e4);
	const [profile] = useStore("profile", {
		name: "",
		city: "Kozhikode"
	});
	const [tasks] = useStore("tasks", []);
	const [grocery] = useStore("grocery", []);
	const [events] = useStore("events", []);
	const [meals] = useStore("meals", {});
	const [salah] = useSalah();
	const countdown = useNextPrayer();
	const hour = now?.getHours() ?? 8;
	const open = tasks.filter((t) => !t.done);
	const doneCount = tasks.length - open.length;
	const todayEvents = events.filter((e) => e.date === todayKey());
	const dinner = meals[`${[
		"Sun",
		"Mon",
		"Tue",
		"Wed",
		"Thu",
		"Fri",
		"Sat"
	][now?.getDay() ?? 1]}-Dinner`];
	const prayed = Object.keys(salah[todayKey()] ?? {}).length;
	const leftToBuy = grocery.filter((g) => !g.got).length;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-12",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "rise",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "eyebrow",
						children: now?.toLocaleDateString(void 0, {
							weekday: "long",
							day: "numeric",
							month: "long"
						}) ?? " "
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
						className: "display-xl mt-3",
						children: [
							greeting(hour),
							profile.name ? `, ${profile.name}` : "",
							"."
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-muted-foreground mt-4 max-w-md text-[0.98rem] leading-relaxed",
						children: open.length === 0 && todayEvents.length === 0 ? "Nothing is asking for you right now. That is allowed." : `${open.length} thing${open.length === 1 ? "" : "s"} waiting${todayEvents.length ? ` · ${todayEvents.length} on the calendar` : ""}.`
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "thread rise space-y-1",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ThreadItem, {
						active: true,
						label: "Next prayer",
						value: countdown ? `${countdown.next.name} · ${countdown.next.time}` : "—",
						detail: countdown ? `in ${countdown.hours ? `${countdown.hours}h ` : ""}${countdown.mins}m · ${prayed}/5 logged` : void 0,
						to: "/deen"
					}),
					open.slice(0, 3).map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ThreadItem, {
						label: "Waiting",
						value: t.title,
						detail: t.time
					}, t.id)),
					todayEvents.map((e) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ThreadItem, {
						label: "Today",
						value: e.title,
						to: "/"
					}, e.id)),
					dinner && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ThreadItem, {
						label: "Dinner",
						value: dinner,
						detail: "From this week's plan"
					}),
					leftToBuy > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ThreadItem, {
						label: "Grocery",
						value: `${leftToBuy} still to pick up`
					}),
					doneCount > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ThreadItem, {
						done: true,
						label: "Behind you",
						value: `${doneCount} finished today`
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
				eyebrow: "How today looks",
				title: "Progress",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-6 sm:grid-cols-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
							label: "Tasks",
							value: `${doneCount}/${tasks.length}`,
							pct: tasks.length ? doneCount / tasks.length * 100 : 0
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
							label: "Salah",
							value: `${prayed}/5`,
							pct: prayed / 5 * 100
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
							label: "Grocery",
							value: `${grocery.length - leftToBuy}/${grocery.length}`,
							pct: grocery.length ? (grocery.length - leftToBuy) / grocery.length * 100 : 0
						})
					]
				})
			})
		]
	});
}
function Stat({ label, value, pct }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mb-2 flex items-baseline justify-between",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "eyebrow",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "numeric font-display text-lg",
			children: value
		})]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Meter, { value: pct })] });
}
function ThreadItem({ label, value, detail, active, done, to }) {
	const body = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "py-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "eyebrow",
				children: label
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: `mt-0.5 text-[1.02rem] ${done ? "text-ink-faint" : ""}`,
				children: value
			}),
			detail && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-ink-faint numeric mt-0.5 text-xs",
				children: detail
			})
		]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "thread-node",
		"data-active": active ? "true" : void 0,
		"data-done": done ? "true" : void 0,
		children: to === "/deen" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
			to: "/deen",
			className: "block",
			children: body
		}) : body
	});
}
function HomePage() {
	const [tab, setTab] = (0, import_react.useState)("today");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Shell, {
		space: "home",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mb-8",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SubTabs, {
					tabs: TABS,
					value: tab,
					onChange: setTab
				})
			}),
			tab === "today" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Today, {}),
			tab === "tasks" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tasks, {}),
			tab === "meals" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Meals, {}),
			tab === "grocery" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GroceryList, {}),
			tab === "kids" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kids, {}),
			tab === "deeds" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Deeds, {}),
			tab === "calendar" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FamilyCalendar, {}),
			tab === "notes" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Notes, {})
		]
	});
}
//#endregion
export { HomePage as component };
