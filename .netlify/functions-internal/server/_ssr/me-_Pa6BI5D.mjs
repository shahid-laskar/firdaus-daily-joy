import { i as __toESM } from "../_runtime.mjs";
import {
  n as require_jsx_runtime,
  r as require_react,
} from "../_libs/react+tanstack__react-query.mjs";
import {
  a as Section,
  c as Tick,
  d as todayKey,
  f as uid,
  h as useStore,
  i as Meter,
  n as EmptyState,
  r as Field,
  s as SubTabs,
  t as Action,
} from "./store-BUFgMFPj.mjs";
import { t as Shell } from "./shell-2TQT_Cpb.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/me-_Pa6BI5D.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var MOODS = [
  {
    id: "bright",
    label: "Bright",
    glyph: "☀",
  },
  {
    id: "steady",
    label: "Steady",
    glyph: "◐",
  },
  {
    id: "tired",
    label: "Tired",
    glyph: "☾",
  },
  {
    id: "heavy",
    label: "Heavy",
    glyph: "☁",
  },
  {
    id: "grateful",
    label: "Grateful",
    glyph: "✧",
  },
];
function SelfCare() {
  const [checkins, setCheckins] = useStore("checkins", {});
  const today = checkins[todayKey()];
  const rituals = [
    "Step outside for a few minutes",
    "Drink a glass of water",
    "Message someone you love",
    "Sit quietly without a screen",
  ];
  const [done, setDone] = useStore("rituals", {});
  const todayDone = done[todayKey()] ?? [];
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
    className: "space-y-10",
    children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
        className: "rise",
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
            className: "eyebrow",
            children: "Check in",
          }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
            className: "display-lg mt-2",
            children: "How are you, really?",
          }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
            className: "mt-6 flex flex-wrap gap-2",
            children: MOODS.map((m) => {
              const active = today === m.id;
              return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
                "button",
                {
                  onClick: () =>
                    setCheckins({
                      ...checkins,
                      [todayKey()]: m.id,
                    }),
                  "aria-pressed": active,
                  className:
                    "press flex min-w-[84px] flex-col items-center gap-1.5 rounded-2xl border px-4 py-4",
                  style: {
                    borderColor: active ? "var(--space-accent)" : "var(--rule)",
                    background: active ? "var(--space-accent-soft)" : "transparent",
                  },
                  children: [
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
                      className: "text-xl leading-none",
                      children: m.glyph,
                    }),
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
                      className: "text-[0.76rem]",
                      children: m.label,
                    }),
                  ],
                },
                m.id,
              );
            }),
          }),
        ],
      }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
        eyebrow: "Small things",
        title: "Today's rituals",
        children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
          className: "thread",
          children: rituals.map((r) => {
            const isDone = todayDone.includes(r);
            return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
              "li",
              {
                "data-done": isDone,
                className: "thread-node flex items-center gap-3 py-2.5",
                children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tick, {
                    done: isDone,
                    label: r,
                    onToggle: () =>
                      setDone({
                        ...done,
                        [todayKey()]: isDone ? todayDone.filter((x) => x !== r) : [...todayDone, r],
                      }),
                  }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
                    className: `text-[0.95rem] ${isDone ? "text-ink-faint line-through" : ""}`,
                    children: r,
                  }),
                ],
              },
              r,
            );
          }),
        }),
      }),
    ],
  });
}
function Habits() {
  const [habits, setHabits] = useStore("habits", []);
  const [name, setName] = (0, import_react.useState)("");
  const week = [...Array(7)].map((_, i) => {
    const d = /* @__PURE__ */ new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().slice(0, 10);
  });
  function streak(h) {
    let s = 0;
    for (let i = 0; ; i++) {
      const d = /* @__PURE__ */ new Date();
      d.setDate(d.getDate() - i);
      if (h.days.includes(d.toISOString().slice(0, 10))) s++;
      else break;
    }
    return s;
  }
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, {
    eyebrow: "Quietly repeated",
    title: "Habits",
    children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
        onSubmit: (e) => {
          e.preventDefault();
          if (!name.trim()) return;
          setHabits([
            ...habits,
            {
              id: uid(),
              name: name.trim(),
              days: [],
            },
          ]);
          setName("");
        },
        className: "mb-8 grid gap-2 sm:grid-cols-[1fr_auto] sm:items-end",
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
            label: "New habit",
            value: name,
            placeholder: "Walk after Maghrib",
            onChange: (e) => setName(e.target.value),
          }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Action, {
            type: "submit",
            variant: "solid",
            className: "h-[42px]",
            children: "Add",
          }),
        ],
      }),
      habits.length === 0
        ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
            glyph: "❋",
            headline: "No habits yet",
            body: "Start with one small thing you'd like to repeat. Streaks build themselves.",
          })
        : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
            className: "space-y-7",
            children: habits.map((h) =>
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
                "li",
                {
                  children: [
                    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
                      className: "mb-3 flex items-baseline justify-between",
                      children: [
                        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
                          className: "title-md",
                          children: h.name,
                        }),
                        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
                          className: "text-ink-faint numeric text-xs",
                          children: [streak(h), " day streak"],
                        }),
                      ],
                    }),
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
                      className: "flex gap-1.5",
                      children: week.map((d) => {
                        const on = h.days.includes(d);
                        return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                          "button",
                          {
                            "aria-label": `${h.name} on ${d}`,
                            "aria-pressed": on,
                            onClick: () =>
                              setHabits(
                                habits.map((x) =>
                                  x.id === h.id
                                    ? {
                                        ...x,
                                        days: on ? x.days.filter((y) => y !== d) : [...x.days, d],
                                      }
                                    : x,
                                ),
                              ),
                            className: "press numeric h-9 flex-1 rounded-lg border text-[0.66rem]",
                            style: {
                              background: on ? "var(--space-accent)" : "transparent",
                              color: on ? "var(--background)" : "var(--ink-faint)",
                              borderColor: on ? "transparent" : "var(--rule)",
                            },
                            children: d.slice(8),
                          },
                          d,
                        );
                      }),
                    }),
                  ],
                },
                h.id,
              ),
            ),
          }),
    ],
  });
}
function Journal() {
  const [entries, setEntries] = useStore("journal", {});
  const today = entries[todayKey()] ?? {
    mood: "",
    text: "",
  };
  const [saved, setSaved] = (0, import_react.useState)(false);
  const past = Object.entries(entries)
    .filter(([d]) => d !== todayKey())
    .sort((a, b) => b[0].localeCompare(a[0]));
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
    className: "space-y-10",
    children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, {
        eyebrow: /* @__PURE__ */ new Date().toDateString(),
        title: "Journal",
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
            className: "mb-5 flex flex-wrap gap-1.5",
            children: MOODS.map((m) =>
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
                "button",
                {
                  onClick: () =>
                    setEntries({
                      ...entries,
                      [todayKey()]: {
                        ...today,
                        mood: m.id,
                      },
                    }),
                  className: `press rounded-full px-3 py-1 text-[0.78rem] ${today.mood === m.id ? "bg-space-soft text-foreground" : "text-muted-foreground"}`,
                  children: [m.glyph, " ", m.label],
                },
                m.id,
              ),
            ),
          }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
            value: today.text,
            onChange: (e) => {
              setEntries({
                ...entries,
                [todayKey()]: {
                  ...today,
                  text: e.target.value,
                },
              });
              setSaved(false);
            },
            rows: 10,
            placeholder: "Nobody else reads this.",
            className:
              "focus:border-space/50 w-full resize-none rounded-2xl border border-transparent bg-[linear-gradient(transparent_calc(2rem_-_1px),var(--rule)_calc(2rem_-_1px))] bg-[size:100%_2rem] p-4 text-[0.98rem] leading-8 outline-none",
          }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
            className: "mt-3 flex items-center justify-between",
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
                className: "text-ink-faint text-xs",
                children: saved ? "Saved for today" : "Kept privately on this device",
              }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Action, {
                onClick: () => setSaved(true),
                children: "Save",
              }),
            ],
          }),
        ],
      }),
      past.length > 0 &&
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
          eyebrow: "Earlier",
          title: "Entries",
          children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
            className: "thread",
            children: past.map(([date, entry]) =>
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
                "li",
                {
                  className: "thread-node py-3",
                  children: [
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
                      className: "text-ink-faint numeric text-xs",
                      children: date,
                    }),
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
                      className: "text-ink-soft mt-1 line-clamp-2 text-sm",
                      children: entry.text || "—",
                    }),
                  ],
                },
                date,
              ),
            ),
          }),
        }),
    ],
  });
}
function Health() {
  const [metrics, setMetrics] = useStore("health", {});
  const today = metrics[todayKey()] ?? {
    water: 0,
    weight: "",
    sleep: "",
  };
  const [workouts, setWorkouts] = useStore("workouts", []);
  const [w, setW] = (0, import_react.useState)({
    name: "",
    detail: "",
  });
  function set(patch) {
    setMetrics({
      ...metrics,
      [todayKey()]: {
        ...today,
        ...patch,
      },
    });
  }
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
    className: "space-y-10",
    children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, {
        eyebrow: "Today",
        title: "Body",
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
            className: "mb-6",
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
                className: "mb-2 flex items-baseline justify-between",
                children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
                    className: "eyebrow",
                    children: "Water",
                  }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
                    className: "numeric font-display text-lg",
                    children: [today.water, " / 8"],
                  }),
                ],
              }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
                className: "flex gap-1.5",
                children: [...Array(8)].map((_, i) =>
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                    "button",
                    {
                      "aria-label": `${i + 1} glasses`,
                      onClick: () => set({ water: today.water === i + 1 ? i : i + 1 }),
                      className: "press h-10 flex-1 rounded-lg border",
                      style: {
                        background: i < today.water ? "var(--space-accent)" : "transparent",
                        borderColor: i < today.water ? "transparent" : "var(--rule)",
                      },
                    },
                    i,
                  ),
                ),
              }),
            ],
          }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
            className: "grid gap-4 sm:grid-cols-2",
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
                label: "Weight (kg)",
                inputMode: "decimal",
                value: today.weight,
                onChange: (e) => set({ weight: e.target.value }),
              }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
                label: "Sleep (hours)",
                inputMode: "decimal",
                value: today.sleep,
                onChange: (e) => set({ sleep: e.target.value }),
              }),
            ],
          }),
        ],
      }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, {
        eyebrow: "Movement",
        title: "Workouts",
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
            onSubmit: (e) => {
              e.preventDefault();
              if (!w.name.trim()) return;
              setWorkouts([
                {
                  id: uid(),
                  ...w,
                  date: todayKey(),
                },
                ...workouts,
              ]);
              setW({
                name: "",
                detail: "",
              });
            },
            className: "mb-5 grid gap-2 sm:grid-cols-[1fr_1fr_auto] sm:items-end",
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
                label: "Exercise",
                value: w.name,
                onChange: (e) =>
                  setW({
                    ...w,
                    name: e.target.value,
                  }),
              }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
                label: "Sets / distance",
                value: w.detail,
                onChange: (e) =>
                  setW({
                    ...w,
                    detail: e.target.value,
                  }),
              }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Action, {
                type: "submit",
                variant: "solid",
                className: "h-[42px]",
                children: "Log",
              }),
            ],
          }),
          workouts.length === 0
            ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
                glyph: "◇",
                headline: "Nothing logged",
                body: "Record a walk, a set, a swim — whatever counts as moving today.",
              })
            : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
                className: "thread",
                children: workouts.map((x) =>
                  /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
                    "li",
                    {
                      className: "thread-node py-3",
                      children: [
                        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
                          className: "text-[0.95rem]",
                          children: [
                            x.name,
                            " ",
                            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
                              className: "text-ink-faint",
                              children: x.detail,
                            }),
                          ],
                        }),
                        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
                          className: "text-ink-faint numeric text-xs",
                          children: x.date,
                        }),
                      ],
                    },
                    x.id,
                  ),
                ),
              }),
        ],
      }),
    ],
  });
}
function Cycle() {
  const [data, setData] = useStore("cycle", {
    last: "",
    length: 28,
  });
  const next = data.last
    ? new Date(new Date(data.last).getTime() + data.length * 864e5).toISOString().slice(0, 10)
    : "";
  const daysAway = next ? Math.ceil((new Date(next).getTime() - Date.now()) / 864e5) : null;
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, {
    eyebrow: "Private",
    title: "Cycle",
    children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
        className: "grid gap-4 sm:grid-cols-2",
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
            label: "Last period started",
            type: "date",
            value: data.last,
            onChange: (e) =>
              setData({
                ...data,
                last: e.target.value,
              }),
          }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
            label: "Cycle length (days)",
            inputMode: "numeric",
            value: String(data.length),
            onChange: (e) =>
              setData({
                ...data,
                length: Number(e.target.value) || 28,
              }),
          }),
        ],
      }),
      next
        ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
            className: "border-border/70 mt-8 border-t pt-6",
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
                className: "eyebrow",
                children: "Next expected",
              }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
                className: "display-lg numeric mt-1",
                children: next,
              }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
                className: "text-muted-foreground mt-2 text-sm",
                children:
                  daysAway !== null && daysAway >= 0
                    ? `${daysAway} days away`
                    : "Overdue — this is often normal.",
              }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
                className: "mt-5",
                children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Meter, {
                  value: daysAway !== null ? Math.max(0, 100 - (daysAway / data.length) * 100) : 0,
                }),
              }),
            ],
          })
        : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
            className: "mt-8",
            children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
              glyph: "❋",
              headline: "Nothing tracked yet",
              body: "Add the date your last period started and Firdous will keep the rest quiet and simple.",
            }),
          }),
    ],
  });
}
var TABS = [
  {
    id: "care",
    label: "Self care",
  },
  {
    id: "habits",
    label: "Habits",
  },
  {
    id: "journal",
    label: "Journal",
  },
  {
    id: "health",
    label: "Health",
  },
  {
    id: "cycle",
    label: "Cycle",
  },
];
function MePage() {
  const [profile] = useStore("profile", {
    name: "",
    city: "Kozhikode",
    gender: "",
  });
  const [tab, setTab] = (0, import_react.useState)("care");
  const availableTabs = TABS.filter((t) => t.id !== "cycle" || profile.gender === "female");
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Shell, {
    space: "me",
    children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
        className: "mb-8",
        children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SubTabs, {
          tabs: availableTabs,
          value: tab,
          onChange: setTab,
        }),
      }),
      tab === "care" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelfCare, {}),
      tab === "habits" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Habits, {}),
      tab === "journal" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Journal, {}),
      tab === "health" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Health, {}),
      tab === "cycle" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cycle, {}),
    ],
  });
}
//#endregion
export { MePage as component };
