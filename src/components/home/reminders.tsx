import { useEffect, useMemo, useState } from "react";
import { Bell, Clock, Plus, Sparkles, Trash2 } from "lucide-react";
import { Action, EmptyState, Field, Section } from "@/components/veedu/primitives";
import { RecurrenceField, RepeatChip } from "@/components/veedu/recurrence-field";
import { type Recurrence, describeRecurrence, nextOccurrence, occursOn } from "@/lib/recurrence";
import { todayKey, uid, useNow, useStore } from "@/lib/store";
import { useNextPrayer } from "@/components/deen/modules";
import { evaluateReminders, coreReminderRules, type ReminderContext, type ReminderSignal } from "@/lib/reminder-engine";
import { useExperience } from "@/lib/theme-provider";

export type Reminder = { id: string; title: string; time: string; recur: Recurrence };
export type NotifPrefs = { prayers: boolean; reminders: boolean; leadMinutes: number };

export function useNotifPrefs() {
  return useStore<NotifPrefs>("notifPrefs", { prayers: false, reminders: false, leadMinutes: 10 });
}

export function useReminderEngine(): ReminderSignal[] {
  const [reminders] = useStore<Reminder[]>("reminders", []);
  const [prefs] = useNotifPrefs();
  const [history, setHistory] = useStore<Record<string, string>>("reminderHistory", {});
  const countdown = useNextPrayer();
  const now = useNow(30_000);

  const activeReminders = useMemo(() => {
    if (!now) return [];
    if (!prefs.prayers && !prefs.reminders) return [];

    const ctx: ReminderContext = {
      currentTime: now,
      prefs,
      history: {},
      nextPrayer: countdown,
      customReminders: reminders,
    };

    return evaluateReminders(ctx, coreReminderRules);
  }, [now, prefs, countdown, reminders]);

  useEffect(() => {
    if (!now || typeof Notification === "undefined" || Notification.permission !== "granted")
      return;
    if (activeReminders.length === 0) return;

    const unnotified = activeReminders.filter((sig) => !history[sig.dedupeKey]);
    if (unnotified.length === 0) return;

    const newHistory = { ...history };
    for (const sig of unnotified) {
      newHistory[sig.dedupeKey] = sig.timestamp;
      try {
        new Notification("Sunnah Home", {
          body: sig.message,
        });
      } catch (e) {
        console.error("Failed to show notification:", e);
      }
    }
    setHistory(newHistory);
  }, [now, activeReminders, history, setHistory]);

  return activeReminders;
}

/** PROTOTYPE — one reminder system, plus prayer nudges, using the browser's own notifications. */
export function Reminders() {
  const { experience } = useExperience();
  const [reminders, setReminders] = useStore<Reminder[]>("reminders", []);
  const [prefs, setPrefs] = useNotifPrefs();
  const [permission, setPermission] = useState<string>("default");
  const [draft, setDraft] = useState<{ title: string; time: string; recur: Recurrence }>({
    title: "",
    time: "08:00",
    recur: { freq: "daily", start: todayKey() },
  });
  const countdown = useNextPrayer();

  useEffect(() => {
    if (typeof Notification !== "undefined") setPermission(Notification.permission);
  }, []);

  async function enable(kind: "prayers" | "reminders") {
    if (typeof Notification === "undefined") return;
    let state = Notification.permission;
    if (state === "default") state = await Notification.requestPermission();
    setPermission(state);
    if (state === "granted") {
      setPrefs({ ...prefs, [kind]: !prefs[kind] });
      new Notification("Sunnah Home", {
        body: kind === "prayers" ? "Prayer reminders are on." : "Reminders are on.",
      });
    }
  }

  const dueToday = reminders
    .filter((r) => occursOn(r.recur, todayKey()))
    .sort((a, b) => a.time.localeCompare(b.time));

  if (experience === "vibrant") {
    return (
      <div className="space-y-8" data-tone="prayer">
        {/* ── Nudges Overview Header ── */}
        <section aria-label="Reminders header" className="space-y-4">
          <div className="tile tile-vivid bloom-in p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="size-12 rounded-2xl bg-[color-mix(in_oklab,var(--tone,var(--space-accent))_15%,transparent)] grid place-items-center flex-none">
                <Bell className="size-6 text-[var(--tone,var(--space-accent))]" />
              </div>
              <div>
                <p className="eyebrow" style={{ color: "var(--tone)" }}>
                  Personal Nudges & Prayer Awareness
                </p>
                <h2 className="title-md text-[1.1rem] mt-0.5">
                  {countdown
                    ? `Next: ${countdown.next.name} at ${countdown.next.time}`
                    : "Gentle Household Reminders"}
                </h2>
                <p className="text-ink-soft text-xs mt-0.5">
                  {dueToday.length === 0
                    ? "No personal reminders due for today."
                    : `${dueToday.length} reminder${dueToday.length === 1 ? "" : "s"} scheduled for today`}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Notification Preferences Card ── */}
        <section aria-label="Notification settings" className="tile bloom-in border border-border/70 p-5 space-y-4">
          <h3 className="title-md text-[1rem]">Nudge Settings</h3>
          <div className="divide-border/60 divide-y">
            <Toggle
              label="Prayer times"
              detail={
                countdown
                  ? `Next: ${countdown.next.name} at ${countdown.next.time} · ${prefs.leadMinutes} min before`
                  : "Reminds you shortly before each prayer"
              }
              on={prefs.prayers}
              onToggle={() => enable("prayers")}
            />
            <Toggle
              label="Personal reminders"
              detail={dueToday.length ? `${dueToday.length} due today` : "Your repeating daily/weekly nudges"}
              on={prefs.reminders}
              onToggle={() => enable("reminders")}
            />
            <div className="flex items-center justify-between py-3.5">
              <div>
                <p className="title-md text-sm">Prayer lead time</p>
                <p className="text-ink-soft text-xs">How early the prayer nudge arrives</p>
              </div>
              <div className="flex gap-1.5">
                {[5, 10, 15, 20].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setPrefs({ ...prefs, leadMinutes: m })}
                    className={`press numeric rounded-full px-3 py-1 text-xs font-semibold transition-all ${
                      prefs.leadMinutes === m
                        ? "bg-[var(--tone,var(--space-accent))] text-[oklch(0.995_0.008_70)] shadow-[0_4px_14px_-6px_color-mix(in_oklab,var(--tone,var(--space-accent))_80%,transparent)]"
                        : "bg-card/70 border border-border/70 text-ink-soft hover:text-foreground"
                    }`}
                  >
                    {m}m
                  </button>
                ))}
              </div>
            </div>
          </div>

          {permission === "denied" && (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs">
              Browser notifications are blocked in your settings. Nudges will stay active inside the app.
            </div>
          )}
        </section>

        {/* ── Add Reminder Form ── */}
        <section aria-label="Add reminder" className="space-y-4">
          <h3 className="title-md text-[1rem]">Repeating Reminders</h3>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!draft.title.trim()) return;
              setReminders([
                ...reminders,
                { id: uid(), title: draft.title.trim(), time: draft.time, recur: { ...draft.recur } },
              ]);
              setDraft({ title: "", time: "08:00", recur: { freq: "daily", start: todayKey() } });
            }}
            className="tile bloom-in border border-border/70 p-4 sm:p-5 space-y-3"
          >
            <div className="grid gap-2.5 sm:grid-cols-[1fr_140px]">
              <Field
                label="Remind me to"
                value={draft.title}
                placeholder="e.g. Give vitamins, watering plants, read Surah Al-Kahf…"
                onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              />
              <Field
                label="At"
                type="time"
                value={draft.time}
                onChange={(e) => setDraft({ ...draft, time: e.target.value })}
              />
            </div>
            <RecurrenceField
              value={draft.recur}
              onChange={(recur) => setDraft({ ...draft, recur })}
              compact
            />
            <div className="flex justify-end pt-1">
              <Action type="submit" variant="solid" className="btn-solid h-[38px] px-5 font-bold text-xs">
                Add Reminder
              </Action>
            </div>
          </form>

          {/* Reminders List */}
          {reminders.length === 0 ? (
            <div className="empty-field bloom-in">
              <span className="text-3xl leading-none">🕊️</span>
              <p className="title-md mt-3">No active reminders</p>
              <p className="text-ink-soft mt-1 max-w-sm mx-auto text-xs leading-relaxed">
                Set small repeating things you'd rather not hold in your head.
              </p>
            </div>
          ) : (
            <ul className="space-y-2">
              {reminders.map((r) => {
                const next = nextOccurrence(r.recur, todayKey());
                const isToday = next === todayKey();
                return (
                  <li
                    key={r.id}
                    className={`row-item group flex items-center justify-between gap-3 p-3.5 border transition-all ${
                      isToday
                        ? "border-[var(--tone,var(--space-accent))]/30 bg-[color-mix(in_oklab,var(--tone,var(--space-accent))_8%,transparent)]"
                        : "border-border/70 bg-card/70 hover:border-border"
                    }`}
                  >
                    <div className="flex items-center gap-3.5 min-w-0 flex-1">
                      <div className="size-8 rounded-lg bg-[color-mix(in_oklab,var(--tone,var(--space-accent))_15%,transparent)] grid place-items-center flex-none">
                        <Clock className="size-4 text-[var(--tone,var(--space-accent))]" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[0.95rem] font-medium text-foreground truncate">{r.title}</p>
                        <p className="text-ink-faint text-xs mt-0.5 flex flex-wrap items-center gap-1.5">
                          <span className="numeric font-semibold text-foreground">{r.time}</span>
                          <span>·</span>
                          <span>{describeRecurrence(r.recur)}</span>
                          {next && (
                            <>
                              <span>·</span>
                              <span className={isToday ? "text-[var(--tone,var(--space-accent))] font-bold" : ""}>
                                next {isToday ? "today" : next}
                              </span>
                            </>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <RepeatChip recur={r.recur} />
                      <button
                        type="button"
                        onClick={() => setReminders(reminders.filter((x) => x.id !== r.id))}
                        aria-label={`Remove reminder ${r.title}`}
                        className="icon-btn press size-7 text-ink-faint hover:text-destructive opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <Section eyebrow="Gentle nudges" title="Notifications">
        <div className="divide-border/70 divide-y">
          <Toggle
            label="Prayer times"
            detail={
              countdown
                ? `Next: ${countdown.next.name} at ${countdown.next.time} · ${prefs.leadMinutes} min before`
                : "Reminds you shortly before each prayer"
            }
            on={prefs.prayers}
            onToggle={() => enable("prayers")}
          />
          <Toggle
            label="Reminders"
            detail={dueToday.length ? `${dueToday.length} due today` : "Your own repeating nudges"}
            on={prefs.reminders}
            onToggle={() => enable("reminders")}
          />
          <div className="flex items-center justify-between py-4">
            <div>
              <p className="title-md">Lead time</p>
              <p className="text-muted-foreground text-xs">How early the prayer nudge arrives</p>
            </div>
            <div className="flex gap-1.5">
              {[5, 10, 15, 20].map((m) => (
                <button
                  key={m}
                  onClick={() => setPrefs({ ...prefs, leadMinutes: m })}
                  className={`press numeric rounded-full px-3 py-1 text-[0.74rem] ${
                    prefs.leadMinutes === m
                      ? "bg-space-soft text-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  {m}m
                </button>
              ))}
            </div>
          </div>
        </div>
        {permission === "denied" && (
          <p className="text-ink-faint mt-4 text-xs">
            Notifications are blocked in this browser's settings, so nudges stay inside Sunnah Home.
          </p>
        )}
      </Section>

      <Section eyebrow="Repeating" title="Reminders">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!draft.title.trim()) return;
            setReminders([
              ...reminders,
              { id: uid(), title: draft.title.trim(), time: draft.time, recur: { ...draft.recur } },
            ]);
            setDraft({ title: "", time: "08:00", recur: { freq: "daily", start: todayKey() } });
          }}
          className="border-border/70 mb-7 space-y-4 rounded-2xl border p-4"
        >
          <div className="grid gap-2 sm:grid-cols-[1fr_120px]">
            <Field
              label="Remind me to"
              value={draft.title}
              placeholder="Give Yusuf his vitamins"
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
            />
            <Field
              label="At"
              type="time"
              value={draft.time}
              onChange={(e) => setDraft({ ...draft, time: e.target.value })}
            />
          </div>
          <RecurrenceField
            value={draft.recur}
            onChange={(recur) => setDraft({ ...draft, recur })}
            compact
          />
          <div className="flex justify-end">
            <Action type="submit" variant="solid">
              Add reminder
            </Action>
          </div>
        </form>

        {reminders.length === 0 ? (
          <EmptyState
            glyph="◦"
            headline="No reminders"
            body="Set the small repeating things you'd rather not hold in your head."
          />
        ) : (
          <ul className="thread">
            {reminders.map((r) => {
              const next = nextOccurrence(r.recur, todayKey());
              return (
                <li
                  key={r.id}
                  data-active={next === todayKey() ? "true" : undefined}
                  className="thread-node group flex items-baseline justify-between gap-3 py-3"
                >
                  <div className="min-w-0">
                    <p className="eyebrow numeric">{r.time}</p>
                    <p className="mt-0.5 text-[0.98rem]">{r.title}</p>
                    <p className="text-ink-faint mt-0.5 text-xs">
                      {describeRecurrence(r.recur)}
                      {next ? ` · next ${next === todayKey() ? "today" : next}` : ""}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <RepeatChip recur={r.recur} />
                    <button
                      onClick={() => setReminders(reminders.filter((x) => x.id !== r.id))}
                      className="text-ink-faint hover:text-destructive text-xs opacity-0 group-hover:opacity-100"
                    >
                      Remove
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Section>
    </div>
  );
}

function Toggle({
  label,
  detail,
  on,
  onToggle,
}: {
  label: string;
  detail: string;
  on: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-4">
      <div className="min-w-0">
        <p className="title-md">{label}</p>
        <p className="text-muted-foreground text-xs">{detail}</p>
      </div>
      <button
        role="switch"
        aria-checked={on}
        aria-label={label}
        onClick={onToggle}
        className="press relative h-6 w-11 shrink-0 rounded-full border transition-colors"
        style={{
          background: on ? "var(--space-accent)" : "transparent",
          borderColor: on ? "transparent" : "var(--rule)",
        }}
      >
        <span
          className="absolute top-[3px] size-[16px] rounded-full transition-all"
          style={{
            left: on ? "24px" : "4px",
            background: on ? "var(--background)" : "var(--ink-faint)",
          }}
        />
      </button>
    </div>
  );
}
