import { i as __toESM } from "../_runtime.mjs";
import {
  n as require_jsx_runtime,
  r as require_react,
} from "../_libs/react+tanstack__react-query.mjs";
import {
  h as useStore,
  l as supabase,
  r as Field,
  t as Action,
  u as syncFromCloud,
} from "./store-BUFgMFPj.mjs";
import { _ as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/auth-68Y0hS3U.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var COPY = {
  signin: {
    title: "Welcome back",
    body: "Your home, exactly as you left it.",
    cta: "Sign in",
  },
  register: {
    title: "Make it yours",
    body: "One account keeps Firdous with you across devices.",
    cta: "Create account",
  },
  magic: {
    title: "No password",
    body: "We'll send a link that signs you straight in.",
    cta: "Send link",
  },
  reset: {
    title: "Reset password",
    body: "We'll email you a way back in.",
    cta: "Send reset",
  },
};
function AuthPage() {
  const [mode, setMode] = (0, import_react.useState)("signin");
  const [email, setEmail] = (0, import_react.useState)("");
  const [password, setPassword] = (0, import_react.useState)("");
  const [account, setAccount] = useStore("account", null);
  const [profile] = useStore("profile", {
    name: "",
    city: "Kozhikode",
    gender: "",
    lat: 11.2588,
    lng: 75.7804,
    madhab: "shafi",
    method: "MuslimWorldLeague",
  });
  const [sent, setSent] = (0, import_react.useState)(false);
  const navigate = useNavigate();
  const copy = COPY[mode];
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
    "data-space": "home",
    className: "relative z-[1] flex min-h-dvh flex-col justify-center px-6 py-16",
    children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
      className: "mx-auto w-full max-w-sm",
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
          className: "mb-10 flex items-baseline gap-2",
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
              className: "font-display text-xl",
              children: "Firdous",
            }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
              className: "bg-space size-[5px] rounded-full",
            }),
          ],
        }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
          className: "display-lg",
          children: copy.title,
        }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
          className: "text-muted-foreground mt-2 text-sm leading-relaxed",
          children: copy.body,
        }),
        account
          ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
              className: "mt-8",
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
                  className: "text-[0.95rem]",
                  children: ["Signed in as ", account.email],
                }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
                  className: "mt-4 flex gap-2",
                  children: [
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Action, {
                      variant: "solid",
                      onClick: () => navigate({ to: "/" }),
                      children: "Go home",
                    }),
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Action, {
                      onClick: async () => {
                        await supabase.auth.signOut();
                        setAccount(null);
                      },
                      children: "Sign out",
                    }),
                  ],
                }),
              ],
            })
          : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
              onSubmit: async (e) => {
                e.preventDefault();
                if (!email.trim()) return;
                if (mode === "magic") {
                  const { error } = await supabase.auth.signInWithOtp({ email: email.trim() });
                  if (!error) setSent(true);
                  else alert(error.message);
                  return;
                }
                if (mode === "reset") {
                  const { error } = await supabase.auth.resetPasswordForEmail(email.trim());
                  if (!error) setSent(true);
                  else alert(error.message);
                  return;
                }
                if (mode === "register") {
                  const { data, error } = await supabase.auth.signUp({
                    email: email.trim(),
                    password,
                  });
                  if (error) {
                    alert(error.message);
                    return;
                  }
                  if (data.user) setAccount({ email: data.user.email });
                  navigate({ to: "/onboarding" });
                  return;
                }
                if (mode === "signin") {
                  const { data, error } = await supabase.auth.signInWithPassword({
                    email: email.trim(),
                    password,
                  });
                  if (error) {
                    alert(error.message);
                    return;
                  }
                  if (data.user) setAccount({ email: data.user.email });
                  await syncFromCloud();
                  const rawProfile = window.localStorage.getItem("veedu:profile");
                  if ((rawProfile ? JSON.parse(rawProfile) : {}).name) navigate({ to: "/" });
                  else navigate({ to: "/onboarding" });
                }
              },
              className: "mt-8 space-y-4",
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
                  label: "Email",
                  type: "email",
                  value: email,
                  onChange: (e) => setEmail(e.target.value),
                }),
                (mode === "signin" || mode === "register") &&
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
                    label: "Password",
                    type: "password",
                    value: password,
                    onChange: (e) => setPassword(e.target.value),
                  }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Action, {
                  type: "submit",
                  variant: "solid",
                  className: "w-full",
                  children: copy.cta,
                }),
                sent &&
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
                    className: "text-ink-soft text-xs",
                    children: "Check your inbox — the link is on its way.",
                  }),
              ],
            }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
          className: "mt-8 flex flex-wrap gap-x-4 gap-y-2 text-xs",
          children: ["signin", "register", "magic", "reset"]
            .filter((m) => m !== mode)
            .map((m) =>
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                "button",
                {
                  type: "button",
                  onClick: () => {
                    setMode(m);
                    setSent(false);
                  },
                  className: "text-muted-foreground hover:text-foreground",
                  children:
                    m === "signin"
                      ? "Sign in"
                      : m === "register"
                        ? "Create account"
                        : m === "magic"
                          ? "Magic link"
                          : "Forgot password",
                },
                m,
              ),
            ),
        }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "rule-line my-8" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
          onClick: () => navigate({ to: "/" }),
          className: "press text-ink-soft hover:text-foreground text-left text-sm",
          children: [
            "Continue as guest →",
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
              className: "text-muted-foreground mt-1 block text-xs leading-relaxed",
              children:
                "Everything stays on this device. Nothing is sent anywhere until you decide.",
            }),
          ],
        }),
      ],
    }),
  });
}
//#endregion
export { AuthPage as component };
