import { Link, useRouterState } from "@tanstack/react-router";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { useOnline, useStore } from "@/lib/store";
import { downloadExport, importFromFile } from "@/lib/backup";
import { GlobalSearch } from "./search";
import { Sheet, Field, Action } from "./primitives";

const SPACES = [
  { id: "home", to: "/", label: "Home", glyph: "⌂" },
  { id: "deen", to: "/deen", label: "Deen", glyph: "☾" },
  { id: "budget", to: "/budget", label: "Budget", glyph: "◈" },
  { id: "me", to: "/me", label: "Me", glyph: "❋" },
] as const;

import { ThemeSwitcher } from "./theme-switcher";
export function Shell({
  space,
  children,
}: {
  space: "home" | "deen" | "budget" | "me";
  children: ReactNode;
}) {
  const online = useOnline();
  const [settings, setSettings] = useState(false);
  const [profile, setProfile] = useStore("profile", { 
    name: "", 
    city: "Kozhikode", 
    gender: "",
    lat: 11.2588,
    lng: 75.7804,
    madhab: "shafi",
    method: "MuslimWorldLeague"
  });
  const [account] = useStore<{ email: string } | null>("account", null);
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [search, setSearch] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const [restored, setRestored] = useState<string | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearch(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div data-space={space} className="relative z-[1] min-h-dvh">
      <header className="border-border/60 bg-background/85 sticky top-0 z-30 border-b backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-5 py-3">
          <Link to="/" className="flex items-center gap-2">
            <img src="/logo.jpg" alt="Firdous Logo" className="size-10 object-cover rounded-xl shadow-sm" />
          </Link>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setSearch(true)}
              aria-label="Search everything"
              title="Search everything (⌘K)"
              className="press text-ink-soft hover:text-foreground grid size-9 place-items-center rounded-full"
            >
              <svg viewBox="0 0 24 24" className="size-[18px]" fill="none" stroke="currentColor" strokeWidth="1.6">
                <circle cx="11" cy="11" r="6.5" />
                <path d="M16 16l4.5 4.5" strokeLinecap="round" />
              </svg>
            </button>

            <span
              className="text-ink-faint flex items-center gap-1.5 rounded-full px-2 py-1 text-[0.7rem]"
              title={online ? "Synced with Firdous Cloud" : "Saved on this device"}
            >
              <span
                className="size-[6px] rounded-full"
                style={{ background: online ? "var(--leaf)" : "var(--brass)" }}
              />
              {online ? "Synced" : "On device"}
            </span>
            <button
              onClick={() => setSettings(true)}
              aria-label="Settings"
              className="press text-ink-soft hover:text-foreground grid size-9 place-items-center rounded-full"
            >
              <svg viewBox="0 0 24 24" className="size-[18px]" fill="none" stroke="currentColor" strokeWidth="1.6">
                <circle cx="12" cy="12" r="3" />
                <path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" strokeLinecap="round" />
              </svg>
            </button>
            <Link
              to="/auth"
              aria-label="Account"
              className="press border-border grid size-9 place-items-center rounded-full border text-[0.7rem] font-semibold"
            >
              {(account?.email?.[0] ?? profile.name?.[0] ?? "G").toUpperCase()}
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-5 pt-6 pb-32">{children}</main>

      <nav
        aria-label="Firdous spaces"
        className="fixed inset-x-0 bottom-0 z-30 flex justify-center pb-[max(0.75rem,env(safe-area-inset-bottom))]"
      >
        <div className="border-border/70 bg-background/90 flex gap-1 rounded-full border p-1.5 shadow-[var(--shadow-float)] backdrop-blur-xl">
          {SPACES.map((s) => {
            const active = s.to === "/" ? path === "/" : path.startsWith(s.to);
            return (
              <Link
                key={s.id}
                to={s.to}
                data-space={s.id}
                aria-current={active ? "page" : undefined}
                className="press relative flex min-w-[68px] flex-col items-center gap-0.5 rounded-full px-3 py-1.5"
                style={
                  active
                    ? { background: "var(--space-accent-soft)", color: "var(--foreground)" }
                    : { color: "var(--ink-faint)" }
                }
              >
                <span className="text-[15px] leading-none">{s.glyph}</span>
                <span className="text-[0.66rem] font-medium tracking-wide">{s.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      <Sheet open={settings} onClose={() => setSettings(false)} title="Settings">
        <div className="space-y-5">
          <Field
            label="Your name"
            value={profile.name}
            placeholder="How should Firdous greet you?"
            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
          />
          <Field
            label="City"
            value={profile.city}
            onChange={(e) => setProfile({ ...profile, city: e.target.value })}
          />
          <div className="flex items-center justify-between">
            <div>
              <p className="title-md">Location Coordinates</p>
              <p className="text-muted-foreground text-xs">{(profile.lat ?? 11.2588).toFixed(4)}, {(profile.lng ?? 75.7804).toFixed(4)}</p>
            </div>
            <Action onClick={() => {
              if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition((pos) => {
                  setProfile({ ...profile, lat: pos.coords.latitude, lng: pos.coords.longitude });
                });
              }
            }}>Detect</Action>
          </div>
          <div className="space-y-2">
            <label className="text-foreground/80 block text-[0.8rem] font-semibold tracking-wide">
              Madhab (Asr Method)
            </label>
            <select 
              value={profile.madhab ?? "shafi"}
              onChange={(e) => setProfile({ ...profile, madhab: e.target.value })}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            >
              <option value="shafi">Shafi'i, Maliki, Hanbali (Standard)</option>
              <option value="hanafi">Hanafi</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-foreground/80 block text-[0.8rem] font-semibold tracking-wide">
              Calculation Method
            </label>
            <select 
              value={profile.method ?? "MuslimWorldLeague"}
              onChange={(e) => setProfile({ ...profile, method: e.target.value })}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            >
              <option value="MuslimWorldLeague">Muslim World League</option>
              <option value="Egyptian">Egyptian General Authority of Survey</option>
              <option value="Karachi">University of Islamic Sciences, Karachi</option>
              <option value="UmmAlQura">Umm Al-Qura University, Makkah</option>
              <option value="Dubai">Dubai</option>
              <option value="MoonsightingCommittee">Moonsighting Committee</option>
              <option value="NorthAmerica">ISNA (North America)</option>
              <option value="Kuwait">Kuwait</option>
              <option value="Qatar">Qatar</option>
              <option value="Singapore">Singapore</option>
              <option value="Tehran">Tehran</option>
              <option value="Turkey">Turkey</option>
            </select>
          </div>
          <div className="rule-line" />
          <ThemeSwitcher />
          <div className="rule-line" />
          <div>
            <p className="title-md">Your data</p>
            <p className="text-muted-foreground mt-1 mb-3 text-xs leading-relaxed">
              Take a copy of everything Firdous holds, or bring it back on another device.
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <Action onClick={() => downloadExport()}>Export a backup</Action>
              <Action onClick={() => fileInput.current?.click()}>Restore</Action>
              <input
                ref={fileInput}
                type="file"
                accept="application/json"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  try {
                    const n = await importFromFile(file);
                    setRestored(`${n} sections restored — reloading…`);
                    setTimeout(() => window.location.reload(), 900);
                  } catch {
                    setRestored("That file couldn't be read.");
                  }
                }}
              />
            </div>
            {restored && <p className="text-space mt-3 text-xs">{restored}</p>}
          </div>
          <div className="rule-line" />
          <p className="text-muted-foreground text-xs leading-relaxed">
            Everything you write lives on this device first. When you're online it quietly
            syncs — nothing is ever lost while you wait.
          </p>
        </div>
      </Sheet>

      <GlobalSearch open={search} onClose={() => setSearch(false)} />
    </div>
  );

}
