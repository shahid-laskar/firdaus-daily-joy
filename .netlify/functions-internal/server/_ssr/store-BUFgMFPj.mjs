import { i as __toESM } from "../_runtime.mjs";
import {
  n as require_jsx_runtime,
  r as require_react,
} from "../_libs/react+tanstack__react-query.mjs";
import { t as createClient } from "../_libs/supabase__supabase-js.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/store-BUFgMFPj.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Eyebrow({ children }) {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
    className: "eyebrow",
    children,
  });
}
function Section({ eyebrow, title, aside, children, className = "" }) {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
    className: `rise ${className}`,
    children: [
      (eyebrow || title || aside) &&
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
          className: "mb-4 flex items-end justify-between gap-4",
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
              children: [
                eyebrow &&
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eyebrow, { children: eyebrow }),
                title &&
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
                    className: "display-lg mt-1.5",
                    children: title,
                  }),
              ],
            }),
            aside &&
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
                className: "shrink-0 pb-1",
                children: aside,
              }),
          ],
        }),
      children,
    ],
  });
}
function SubTabs({ tabs, value, onChange }) {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
    className: "-mx-5 px-5",
    children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
      role: "tablist",
      "aria-label": "Sections",
      className: "flex flex-wrap gap-1.5 pb-px",
      children: tabs.map((t) => {
        const active = t.id === value;
        return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
          "button",
          {
            role: "tab",
            "aria-selected": active,
            onClick: () => onChange(t.id),
            className: `press relative shrink-0 rounded-full px-3.5 py-1.5 text-[0.8rem] font-medium whitespace-nowrap transition-colors ${active ? "bg-space-soft text-foreground" : "text-muted-foreground hover:text-foreground"}`,
            children: [
              t.label,
              active &&
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
                  className: "bg-space absolute inset-x-3.5 -bottom-px h-[2px] rounded-full",
                }),
            ],
          },
          t.id,
        );
      }),
    }),
  });
}
function EmptyState({ headline, body, action, glyph = "◦" }) {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
    className: "border-border/70 rounded-2xl border border-dashed px-6 py-10 text-center",
    children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
        className: "text-ink-faint/70 font-display mx-auto mb-3 text-3xl leading-none",
        children: glyph,
      }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
        className: "title-md",
        children: headline,
      }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
        className: "text-muted-foreground mx-auto mt-1.5 max-w-xs text-sm leading-relaxed",
        children: body,
      }),
      action &&
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
          className: "mt-4 flex justify-center",
          children: action,
        }),
    ],
  });
}
function Action({
  children,
  onClick,
  variant = "quiet",
  type = "button",
  className = "",
  disabled,
  ariaLabel,
}) {
  const styles = {
    quiet:
      "border border-border bg-card text-foreground hover:border-space/60 hover:bg-space-soft/40",
    solid: "bg-space text-background hover:opacity-90 border border-transparent",
    ghost: "text-muted-foreground hover:text-foreground border border-transparent",
  }[variant];
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
    type,
    "aria-label": ariaLabel,
    disabled,
    onClick,
    className: `press inline-flex min-h-9 items-center justify-center gap-1.5 rounded-full px-4 text-[0.82rem] font-medium disabled:opacity-40 ${styles} ${className}`,
    children,
  });
}
function Field({ label, ...props }) {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
    className: "block",
    children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
        className: "eyebrow",
        children: label,
      }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
        ...props,
        className: `border-border/80 focus:border-space mt-1.5 w-full rounded-xl border bg-transparent px-3.5 py-2.5 text-[0.95rem] outline-none transition-colors ${props.className ?? ""}`,
      }),
    ],
  });
}
function Meter({ value, label }) {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
    children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
        className: "bg-muted h-[6px] w-full overflow-hidden rounded-full",
        children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
          className: "bg-space h-full rounded-full transition-[width] duration-700 ease-out",
          style: { width: `${Math.max(0, Math.min(100, value))}%` },
        }),
      }),
      label &&
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
          className: "text-muted-foreground mt-1.5 text-xs",
          children: label,
        }),
    ],
  });
}
/** Quietly rewarding completion tick — draws itself, no confetti. */
function Tick({ done, onToggle, label }) {
  const [burst, setBurst] = (0, import_react.useState)(false);
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
    onClick: () => {
      if (!done) {
        setBurst(true);
        setTimeout(() => setBurst(false), 900);
      }
      onToggle();
    },
    "aria-pressed": done,
    "aria-label": label,
    className:
      "press relative grid size-6 shrink-0 place-items-center rounded-full border transition-colors",
    style: {
      borderColor: done ? "var(--space-accent)" : "var(--rule)",
      background: done ? "var(--space-accent)" : "transparent",
    },
    children: [
      burst &&
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
          className: "border-space pulse-ring absolute inset-0 rounded-full border",
        }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
        viewBox: "0 0 24 24",
        className: "size-3.5",
        fill: "none",
        children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
          d: "M5 12.5l4.5 4.5L19 7",
          stroke: "var(--background)",
          strokeWidth: "2.6",
          strokeLinecap: "round",
          strokeLinejoin: "round",
          style: {
            strokeDasharray: 24,
            strokeDashoffset: done ? 0 : 24,
            transition: "stroke-dashoffset 340ms cubic-bezier(.2,.8,.2,1)",
          },
        }),
      }),
    ],
  });
}
function Sheet({ open, onClose, title, children }) {
  (0, import_react.useEffect)(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);
  if (!open) return null;
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
    className: "fixed inset-0 z-50 flex items-end justify-center sm:items-center",
    children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
        "aria-label": "Close",
        onClick: onClose,
        className: "absolute inset-0 bg-black/25 backdrop-blur-[2px]",
      }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
        role: "dialog",
        "aria-modal": "true",
        "aria-label": title,
        className:
          "bg-card rise relative max-h-[86vh] w-full overflow-y-auto rounded-t-3xl border p-6 shadow-[var(--shadow-float)] sm:max-w-md sm:rounded-3xl",
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
            className: "bg-rule mx-auto mb-5 h-1 w-9 rounded-full sm:hidden",
          }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
            className: "mb-4 flex items-baseline justify-between",
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
                className: "display-lg",
                children: title,
              }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
                onClick: onClose,
                className: "text-muted-foreground text-sm",
                children: "Done",
              }),
            ],
          }),
          children,
        ],
      }),
    ],
  });
}
var supabase = createClient(
  "https://wmyrpejbgnvmokiccgpx.supabase.co",
  "sb_publishable_NpJFewrEUlFs1XOnzKxXwA_vRYCsM-3",
);
/** Offline-first local store. Every module reads/writes through this. */
var PREFIX = "veedu:";
var listeners = /* @__PURE__ */ new Map();
function emit(key) {
  listeners.get(key)?.forEach((fn) => fn());
}
function readStore(key, fallback) {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(PREFIX + key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}
function writeStore(key, value) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {}
  emit(key);
  supabase.auth.getSession().then(({ data: { session } }) => {
    if (session?.user)
      supabase
        .from("user_data")
        .upsert(
          {
            user_id: session.user.id,
            key,
            value,
            updated_at: /* @__PURE__ */ new Date().toISOString(),
          },
          { onConflict: "user_id,key" },
        )
        .then(({ error }) => {
          if (error) console.error("Sync push error for key", key, ":", error);
        });
  });
}
async function syncFromCloud() {
  const { data: sessionData } = await supabase.auth.getSession();
  if (!sessionData.session?.user) return;
  const { data, error } = await supabase.from("user_data").select("key, value");
  if (error || !data) {
    console.error("Failed to sync pull from cloud:", error);
    return;
  }
  data.forEach((row) => {
    const current = window.localStorage.getItem(PREFIX + row.key);
    const incoming = JSON.stringify(row.value);
    if (current !== incoming) {
      window.localStorage.setItem(PREFIX + row.key, incoming);
      emit(row.key);
    }
  });
}
if (typeof window !== "undefined")
  supabase.auth.onAuthStateChange((event, session) => {
    if (event === "SIGNED_IN" || event === "INITIAL_SESSION") {
      if (session) syncFromCloud();
    }
  });
/** Hydration-safe persisted state. */
function useStore(key, initial) {
  const [value, setValue] = (0, import_react.useState)(initial);
  const [ready, setReady] = (0, import_react.useState)(false);
  (0, import_react.useEffect)(() => {
    setValue(readStore(key, initial));
    setReady(true);
    const set = listeners.get(key) ?? /* @__PURE__ */ new Set();
    const fn = () => setValue(readStore(key, initial));
    set.add(fn);
    listeners.set(key, set);
    return () => {
      set.delete(fn);
    };
  }, [key]);
  return [
    value,
    (0, import_react.useCallback)(
      (next) => {
        setValue((prev) => {
          const resolved = typeof next === "function" ? next(prev) : next;
          writeStore(key, resolved);
          return resolved;
        });
      },
      [key],
    ),
    ready,
  ];
}
var todayKey = () => /* @__PURE__ */ new Date().toISOString().slice(0, 10);
function uid() {
  return Math.random().toString(36).slice(2, 10);
}
function useNow(intervalMs = 3e4) {
  const [now, setNow] = (0, import_react.useState)(null);
  (0, import_react.useEffect)(() => {
    setNow(/* @__PURE__ */ new Date());
    const t = setInterval(() => setNow(/* @__PURE__ */ new Date()), intervalMs);
    return () => clearInterval(t);
  }, [intervalMs]);
  return now;
}
function useOnline() {
  const [online, setOnline] = (0, import_react.useState)(true);
  (0, import_react.useEffect)(() => {
    const sync = () => setOnline(navigator.onLine);
    sync();
    window.addEventListener("online", sync);
    window.addEventListener("offline", sync);
    return () => {
      window.removeEventListener("online", sync);
      window.removeEventListener("offline", sync);
    };
  }, []);
  return online;
}
//#endregion
export {
  Section as a,
  Tick as c,
  todayKey as d,
  uid as f,
  useStore as h,
  Meter as i,
  supabase as l,
  useOnline as m,
  EmptyState as n,
  Sheet as o,
  useNow as p,
  Field as r,
  SubTabs as s,
  Action as t,
  syncFromCloud as u,
};
