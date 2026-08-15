import { i as __toESM } from "../_runtime.mjs";
import {
  n as require_jsx_runtime,
  r as require_react,
} from "../_libs/react+tanstack__react-query.mjs";
import {
  a as Section,
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
//#region node_modules/.nitro/vite/services/ssr/assets/budget-DSm1WXhb.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var DEFAULT_CATEGORIES = ["Groceries", "Transport", "Home", "Health", "Giving", "Other"];
function useExpenses() {
  return useStore("expenses", []);
}
function useLimits() {
  return useStore("limits", {
    Groceries: 8e3,
    Transport: 3e3,
    Home: 5e3,
  });
}
var money = (n) =>
  new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(Math.round(n));
var month = () => todayKey().slice(0, 7);
function QuickEntry() {
  const [expenses, setExpenses] = useExpenses();
  const [limits] = useLimits();
  const categories = [.../* @__PURE__ */ new Set([...DEFAULT_CATEGORIES, ...Object.keys(limits)])];
  const [amount, setAmount] = (0, import_react.useState)("");
  const [category, setCategory] = (0, import_react.useState)(categories[0] ?? "Other");
  const [note, setNote] = (0, import_react.useState)("");
  const recent = expenses.filter((e) => e.date.startsWith(month()));
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
    className: "space-y-10",
    children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
        eyebrow: "Log it and move on",
        title: "Quick entry",
        children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
          onSubmit: (e) => {
            e.preventDefault();
            const n = Number(amount);
            if (!n) return;
            setExpenses([
              {
                id: uid(),
                amount: n,
                category,
                note,
                date: todayKey(),
              },
              ...expenses,
            ]);
            setAmount("");
            setNote("");
          },
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
              className: "flex items-baseline gap-2",
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
                  className: "font-display text-ink-faint text-3xl",
                  children: "₹",
                }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
                  inputMode: "decimal",
                  value: amount,
                  onChange: (e) => setAmount(e.target.value),
                  placeholder: "0",
                  "aria-label": "Amount",
                  className:
                    "numeric font-display placeholder:text-ink-faint/50 w-full bg-transparent text-5xl outline-none",
                }),
              ],
            }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "bg-rule my-5 h-px" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
              className: "no-scrollbar -mx-5 flex gap-1.5 overflow-x-auto px-5",
              children: categories.map((c) =>
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                  "button",
                  {
                    type: "button",
                    onClick: () => setCategory(c),
                    className: `press shrink-0 rounded-full px-3 py-1.5 text-[0.78rem] ${c === category ? "bg-space-soft text-foreground" : "text-muted-foreground"}`,
                    children: c,
                  },
                  c,
                ),
              ),
            }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
              className: "mt-5 flex items-end gap-2",
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
                  className: "flex-1",
                  children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
                    label: "Note (optional)",
                    value: note,
                    onChange: (e) => setNote(e.target.value),
                  }),
                }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Action, {
                  type: "submit",
                  variant: "solid",
                  className: "h-[42px]",
                  children: "Record",
                }),
              ],
            }),
          ],
        }),
      }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
        eyebrow: "This month",
        title: "Recent",
        children:
          recent.length === 0
            ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
                glyph: "◈",
                headline: "Nothing spent yet this month",
                body: "A clean slate. Record the first expense above and the picture builds itself.",
              })
            : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
                className: "divide-border/70 divide-y",
                children: recent.map((e) =>
                  /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
                    "li",
                    {
                      className: "group flex items-baseline justify-between gap-4 py-3",
                      children: [
                        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
                          className: "min-w-0",
                          children: [
                            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
                              className: "text-[0.95rem]",
                              children: e.category,
                            }),
                            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
                              className: "text-ink-faint truncate text-xs",
                              children: [e.date, e.note ? ` · ${e.note}` : ""],
                            }),
                          ],
                        }),
                        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
                          className: "flex items-baseline gap-3",
                          children: [
                            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
                              className: "numeric font-display text-[1.05rem]",
                              children: ["₹", money(e.amount)],
                            }),
                            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
                              onClick: () => setExpenses(expenses.filter((x) => x.id !== e.id)),
                              className:
                                "text-ink-faint hover:text-destructive text-xs opacity-0 group-hover:opacity-100",
                              "aria-label": "Delete expense",
                              children: "✕",
                            }),
                          ],
                        }),
                      ],
                    },
                    e.id,
                  ),
                ),
              }),
      }),
    ],
  });
}
function Overview() {
  const [expenses] = useExpenses();
  const [limits, setLimits] = useLimits();
  const [newCat, setNewCat] = (0, import_react.useState)("");
  const [newLimit, setNewLimit] = (0, import_react.useState)("");
  const monthly = expenses.filter((e) => e.date.startsWith(month()));
  const total = monthly.reduce((s, e) => s + e.amount, 0);
  const cap = Object.values(limits).reduce((s, n) => s + n, 0);
  const byCategory = (0, import_react.useMemo)(() => {
    const map = /* @__PURE__ */ new Map();
    monthly.forEach((e) => map.set(e.category, (map.get(e.category) ?? 0) + e.amount));
    Object.keys(limits).forEach((k) => !map.has(k) && map.set(k, 0));
    return [...map.entries()].sort((a, b) => b[1] - a[1]);
  }, [monthly, limits]);
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
    className: "space-y-10",
    children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
        className: "rise",
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
            className: "eyebrow",
            children: "Spent this month",
          }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
            className: "display-xl numeric mt-3",
            children: ["₹", money(total)],
          }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
            className: "text-muted-foreground mt-2 text-sm",
            children: cap
              ? `of ₹${money(cap)} planned · ₹${money(Math.max(0, cap - total))} left`
              : "No monthly limit set yet",
          }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
            className: "mt-5",
            children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Meter, {
              value: cap ? (total / cap) * 100 : 0,
            }),
          }),
        ],
      }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, {
        eyebrow: "Where it went",
        title: "Categories",
        children: [
          byCategory.length === 0
            ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
                glyph: "◦",
                headline: "No categories in play",
                body: "Once you log expenses, they group themselves here so you can see the shape of the month.",
              })
            : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
                className: "space-y-5",
                children: byCategory.map(([cat, amt]) => {
                  const limit = limits[cat];
                  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
                    "li",
                    {
                      children: [
                        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
                          className: "mb-2 flex items-baseline justify-between",
                          children: [
                            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
                              className: "text-[0.95rem]",
                              children: cat,
                            }),
                            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
                              className: "numeric text-ink-soft text-sm",
                              children: [
                                "₹",
                                money(amt),
                                limit
                                  ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
                                      className: "text-ink-faint",
                                      children: [" / ", money(limit)],
                                    })
                                  : null,
                              ],
                            }),
                          ],
                        }),
                        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Meter, {
                          value: limit ? (amt / limit) * 100 : total ? (amt / total) * 100 : 0,
                        }),
                      ],
                    },
                    cat,
                  );
                }),
              }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
            onSubmit: (e) => {
              e.preventDefault();
              if (!newCat.trim()) return;
              setLimits({
                ...limits,
                [newCat.trim()]: Number(newLimit) || 0,
              });
              setNewCat("");
              setNewLimit("");
            },
            className: "mt-8 grid gap-2 sm:grid-cols-[1fr_140px_auto] sm:items-end",
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
                label: "Category",
                value: newCat,
                onChange: (e) => setNewCat(e.target.value),
              }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
                label: "Monthly limit",
                inputMode: "decimal",
                value: newLimit,
                onChange: (e) => setNewLimit(e.target.value),
              }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Action, {
                type: "submit",
                className: "h-[42px]",
                children: "Set",
              }),
            ],
          }),
        ],
      }),
    ],
  });
}
function Zakat() {
  const [v, setV] = useStore("zakat", {
    cash: "",
    gold: "",
    business: "",
    debts: "",
  });
  const net =
    (Number(v.cash) || 0) +
    (Number(v.gold) || 0) +
    (Number(v.business) || 0) -
    (Number(v.debts) || 0);
  const nisab = 65e3;
  const due = net >= nisab ? net * 0.025 : 0;
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, {
    eyebrow: "Purification of wealth",
    title: "Zakat",
    children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
        className: "grid gap-4 sm:grid-cols-2",
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
            label: "Cash & savings",
            inputMode: "decimal",
            value: v.cash,
            onChange: (e) =>
              setV({
                ...v,
                cash: e.target.value,
              }),
          }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
            label: "Gold & silver value",
            inputMode: "decimal",
            value: v.gold,
            onChange: (e) =>
              setV({
                ...v,
                gold: e.target.value,
              }),
          }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
            label: "Business assets",
            inputMode: "decimal",
            value: v.business,
            onChange: (e) =>
              setV({
                ...v,
                business: e.target.value,
              }),
          }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
            label: "Debts owed",
            inputMode: "decimal",
            value: v.debts,
            onChange: (e) =>
              setV({
                ...v,
                debts: e.target.value,
              }),
          }),
        ],
      }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
        className: "border-border/70 mt-8 border-t pt-6",
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
            className: "eyebrow",
            children: "Zakatable wealth",
          }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
            className: "numeric font-display mt-1 text-2xl",
            children: ["₹", money(Math.max(0, net))],
          }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
            className: "eyebrow mt-6",
            children: "Due at 2.5%",
          }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
            className: "numeric display-lg text-space mt-1",
            children: ["₹", money(due)],
          }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
            className: "text-muted-foreground mt-3 text-xs leading-relaxed",
            children:
              net >= nisab
                ? "Your wealth is above the nisab threshold for a full lunar year."
                : `Below the nisab estimate of ₹${money(nisab)} — no zakat is due on this amount.`,
          }),
        ],
      }),
    ],
  });
}
var TABS = [
  {
    id: "overview",
    label: "Overview",
  },
  {
    id: "entry",
    label: "Quick entry",
  },
  {
    id: "zakat",
    label: "Zakat",
  },
];
function BudgetPage() {
  const [tab, setTab] = (0, import_react.useState)("overview");
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Shell, {
    space: "budget",
    children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
        className: "mb-8",
        children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SubTabs, {
          tabs: TABS,
          value: tab,
          onChange: setTab,
        }),
      }),
      tab === "overview" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Overview, {}),
      tab === "entry" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QuickEntry, {}),
      tab === "zakat" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Zakat, {}),
    ],
  });
}
//#endregion
export { BudgetPage as component };
