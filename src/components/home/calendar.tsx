import { useMemo, useState } from "react";
import {
  Calendar as CalendarIcon,
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  Clock,
  Moon,
  Plus,
  Sparkles,
  Trash2,
  UtensilsCrossed,
} from "lucide-react";
import { Action, Field, Section } from "@/components/veedu/primitives";
import { RecurrenceField, RepeatChip } from "@/components/veedu/recurrence-field";
import { hijriLabel, islamicMarker, hijriParts } from "@/lib/hijri";
import { type Recurrence, occursOn } from "@/lib/recurrence";
import { todayKey, uid, useStore } from "@/lib/store";
import { useExperience } from "@/lib/theme-provider";

export type CalEvent = {
  id: string;
  title: string;
  date: string;
  time?: string | undefined;
  recur?: Recurrence | undefined;
  assigneeId?: string;
};

type Task = {
  id: string;
  title: string;
  list: string;
  time?: string;
  done: boolean;
  date: string;
  recur?: Recurrence;
  completions?: string[];
  assigneeId?: string;
};

const WEEK = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const DAY_KEYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const isoOf = (d: Date) => {
  const c = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return c.toISOString().slice(0, 10);
};

export function eventsOn(events: CalEvent[], iso: string) {
  return events
    .filter((e) => e.date === iso || occursOn(e.recur, iso))
    .sort((a, b) => (a.time ?? "99").localeCompare(b.time ?? "99"));
}

export function tasksOn(tasks: Task[], iso: string) {
  return tasks.filter((t) => (t.date === iso && !t.recur) || occursOn(t.recur, iso));
}

/** PROTOTYPE — one visual calendar carrying events, tasks, meals, fasting and Hijri dates. */
export function UnifiedCalendar() {
  const { experience } = useExperience();
  const [events, setEvents] = useStore<CalEvent[]>("events", []);
  const [tasks] = useStore<Task[]>("tasks", []);
  const [meals] = useStore<Record<string, string>>("meals", {});
  const [fasting] = useStore<Record<string, string>>("fasting", {});
  const [cursor, setCursor] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d;
  });
  const [selected, setSelected] = useState(todayKey());
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState<{
    title: string;
    date: string;
    time: string;
    recur: Recurrence;
  }>({
    title: "",
    date: todayKey(),
    time: "",
    recur: { freq: "none", start: todayKey() },
  });

  const grid = useMemo(() => {
    const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
    const offset = (first.getDay() + 6) % 7;
    const days: (string | null)[] = Array.from({ length: offset }, () => null);
    const last = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate();
    for (let i = 1; i <= last; i++)
      days.push(isoOf(new Date(cursor.getFullYear(), cursor.getMonth(), i)));
    while (days.length % 7 !== 0) days.push(null);
    return days;
  }, [cursor]);

  const selDate = new Date(`${selected}T00:00:00`);
  const selEvents = eventsOn(events, selected);
  const selTasks = tasksOn(tasks, selected);
  const selMeal = meals[`${DAY_KEYS[selDate.getDay()]}-Dinner`];
  const marker = islamicMarker(selDate);

  if (experience === "vibrant") {
    const midMonthDate = new Date(cursor.getFullYear(), cursor.getMonth(), 15);
    const midMonthHijri = hijriLabel(midMonthDate);

    return (
      <div className="space-y-8" data-tone="prayer">
        {/* ── Month Header & Navigator ── */}
        <section aria-label="Month navigator" className="space-y-4">
          <div className="tile tile-vivid bloom-in p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="size-12 rounded-2xl bg-[color-mix(in_oklab,var(--tone,var(--space-accent))_15%,transparent)] grid place-items-center flex-none">
                <CalendarIcon className="size-6 text-[var(--tone,var(--space-accent))]" />
              </div>
              <div>
                <p className="eyebrow" style={{ color: "var(--tone)" }}>
                  {midMonthHijri ? `Hijri ${midMonthHijri}` : "Household & Islamic Rhythm"}
                </p>
                <h2 className="title-md text-[1.15rem] mt-0.5 capitalize">
                  {cursor.toLocaleDateString(undefined, { month: "long", year: "numeric" })}
                </h2>
                <p className="text-ink-soft text-xs mt-0.5">
                  Unified view of events, tasks, meal schedules, fasting, and Hijri markers.
                </p>
              </div>
            </div>

            {/* Navigation controls */}
            <div className="flex items-center gap-1.5 self-end sm:self-center">
              <button
                type="button"
                aria-label="Previous month"
                onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}
                className="icon-btn press size-8 text-foreground hover:bg-card border border-border/70"
              >
                <ChevronLeft className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => {
                  const d = new Date();
                  setCursor(new Date(d.getFullYear(), d.getMonth(), 1));
                  setSelected(todayKey());
                }}
                className="btn-quiet press rounded-full px-3.5 py-1 text-xs font-semibold"
              >
                Today
              </button>
              <button
                type="button"
                aria-label="Next month"
                onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}
                className="icon-btn press size-8 text-foreground hover:bg-card border border-border/70"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>
          </div>

          {/* ── Monthly Grid Board ── */}
          <div className="tile bloom-in border border-border/70 p-4 sm:p-5">
            <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
              {WEEK.map((w) => (
                <div key={w} className="eyebrow pb-2 text-center text-xs font-bold text-ink-faint">
                  {w}
                </div>
              ))}
              {grid.map((iso, i) => {
                if (!iso) return <div key={`empty-${i}`} className="aspect-square" />;
                const dayEvents = eventsOn(events, iso);
                const dayTasks = tasksOn(tasks, iso);
                const d = new Date(`${iso}T00:00:00`);
                const hasMeal = !!meals[`${DAY_KEYS[d.getDay()]}-Dinner`];
                const fasted = !!fasting[iso];
                const isSel = iso === selected;
                const isToday = iso === todayKey();
                const hp = hijriParts(d);
                const imarker = islamicMarker(d);

                return (
                  <button
                    key={iso}
                    type="button"
                    onClick={() => setSelected(iso)}
                    className={`press relative flex aspect-square flex-col items-center justify-center gap-1 rounded-xl border text-[0.78rem] transition-all cursor-pointer ${
                      isSel
                        ? "border-[var(--tone,var(--space-accent))] bg-[color-mix(in_oklab,var(--tone,var(--space-accent))_15%,transparent)] shadow-[0_4px_16px_-6px_color-mix(in_oklab,var(--tone,var(--space-accent))_60%,transparent)] font-bold"
                        : isToday
                          ? "border-border/90 bg-card/80 font-semibold hover:border-[var(--tone,var(--space-accent))]/40"
                          : "border-transparent bg-card/30 hover:bg-card/70 hover:border-border/60"
                    }`}
                  >
                    {hp && (
                      <span
                        className={`absolute top-1.5 right-1.5 text-[0.58rem] leading-none font-medium ${
                          imarker ? "text-amber-500 font-bold" : "text-ink-faint opacity-60"
                        }`}
                      >
                        {hp.day}
                      </span>
                    )}
                    <span
                      className={`numeric mt-0.5 ${
                        isToday ? "text-foreground font-bold" : isSel ? "text-foreground" : "text-ink-soft"
                      }`}
                    >
                      {iso.slice(8)}
                    </span>
                    <span className="flex h-1.5 items-center gap-[3px]">
                      {imarker && (
                        <i className="size-[5px] rounded-full" style={{ background: "var(--clay, #d97706)" }} />
                      )}
                      {dayEvents.length > 0 && (
                        <i className="size-[5px] rounded-full" style={{ background: "var(--tone, var(--space-accent))" }} />
                      )}
                      {dayTasks.length > 0 && (
                        <i className="size-[5px] rounded-full" style={{ background: "var(--brass, #eab308)" }} />
                      )}
                      {fasted && (
                        <i className="size-[5px] rounded-full" style={{ background: "var(--leaf, #10b981)" }} />
                      )}
                      {hasMeal && !dayEvents.length && !dayTasks.length && !fasted && !imarker && (
                        <i className="bg-rule size-[5px] rounded-full" />
                      )}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="text-ink-faint mt-4 pt-3 border-t border-border/50 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-[0.72rem]">
              <Legend color="var(--tone, var(--space-accent))" label="Events" />
              <Legend color="var(--brass, #eab308)" label="Tasks due" />
              <Legend color="var(--leaf, #10b981)" label="Fasting" />
              <Legend color="var(--rule, #94a3b8)" label="Meal planned" />
              <Legend color="var(--clay, #d97706)" label="Islamic Event" />
            </div>
          </div>
        </section>

        {/* ── Selected Day Schedule Panel ── */}
        <section aria-label="Selected day schedule" className="tile bloom-in border border-border/70 p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/60">
            <div>
              <p className="eyebrow" style={{ color: "var(--tone)" }}>
                {hijriLabel(selDate) || selected}
              </p>
              <h3 className="title-md text-[1.1rem] mt-0.5">
                {selDate.toLocaleDateString(undefined, {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </h3>
            </div>

            <button
              type="button"
              onClick={() => {
                setDraft({
                  title: "",
                  date: selected,
                  time: "",
                  recur: { freq: "none", start: selected },
                });
                setAdding(!adding);
              }}
              className={`press inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-bold transition-all ${
                adding ? "btn-quiet" : "btn-solid"
              }`}
            >
              {adding ? (
                "Cancel"
              ) : (
                <>
                  <Plus className="size-3.5" />
                  Add Event
                </>
              )}
            </button>
          </div>

          {marker && (
            <div className="p-3 rounded-xl bg-[color-mix(in_oklab,var(--tone,var(--space-accent))_10%,transparent)] border border-[var(--tone,var(--space-accent))]/30 flex items-center gap-2 text-xs font-medium text-foreground">
              <Sparkles className="size-4 text-[var(--tone,var(--space-accent))]" />
              <span>{marker}</span>
            </div>
          )}

          {/* Add Event Form */}
          {adding && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!draft.title.trim()) return;
                setEvents([
                  ...events,
                  {
                    id: uid(),
                    title: draft.title.trim(),
                    date: draft.date,
                    time: draft.time || undefined,
                    recur:
                      draft.recur.freq === "none" ? undefined : { ...draft.recur, start: draft.date },
                  },
                ]);
                setAdding(false);
              }}
              className="tile tile-vivid bloom-in border border-border/70 p-4 sm:p-5 space-y-3"
            >
              <div className="grid gap-2.5 sm:grid-cols-[1fr_150px_120px] sm:items-end">
                <Field
                  label="Event Title"
                  value={draft.title}
                  placeholder="e.g. Family Gathering, Doctor visit…"
                  onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                />
                <Field
                  label="Date"
                  type="date"
                  value={draft.date}
                  onChange={(e) => setDraft({ ...draft, date: e.target.value })}
                />
                <Field
                  label="Time"
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
                  Save Event
                </Action>
              </div>
            </form>
          )}

          {/* Schedule List */}
          {selEvents.length === 0 && selTasks.length === 0 && !selMeal && !fasting[selected] ? (
            <div className="empty-field bloom-in py-6">
              <span className="text-2xl leading-none">🕊️</span>
              <p className="title-md mt-2 text-sm">Nothing scheduled for this day</p>
              <p className="text-ink-soft text-xs mt-0.5">
                Enjoy a peaceful, unhurried day with family.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {selEvents.map((e) => (
                <div
                  key={e.id}
                  className="row-item group flex items-start justify-between gap-3 p-3.5 border border-border/70 bg-card/70 hover:border-[var(--tone,var(--space-accent))]/40 transition-all rounded-xl"
                >
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <div className="size-8 rounded-lg bg-[color-mix(in_oklab,var(--tone,var(--space-accent))_15%,transparent)] grid place-items-center flex-none mt-0.5">
                      <Clock className="size-4 text-[var(--tone,var(--space-accent))]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="eyebrow text-xs" style={{ color: "var(--tone)" }}>
                        {e.time || "All day"}
                      </p>
                      <p className="text-[0.95rem] font-medium text-foreground mt-0.5">{e.title}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <RepeatChip recur={e.recur} />
                    <button
                      type="button"
                      onClick={() => setEvents(events.filter((x) => x.id !== e.id))}
                      className="icon-btn press size-7 text-ink-faint hover:text-destructive opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity"
                      title="Remove event"
                      aria-label="Remove event"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>
              ))}

              {selTasks.map((t) => (
                <div
                  key={t.id}
                  className="row-item flex items-center gap-3 p-3.5 border border-border/60 bg-card/50 rounded-xl"
                >
                  <div className="size-8 rounded-lg bg-amber-500/10 grid place-items-center flex-none">
                    <CheckSquare className="size-4 text-amber-500" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="eyebrow text-xs text-amber-500/90">Task · {t.list}</p>
                    <p className="text-[0.95rem] font-medium text-foreground mt-0.5">{t.title}</p>
                  </div>
                </div>
              ))}

              {selMeal && (
                <div className="row-item flex items-center gap-3 p-3.5 border border-border/60 bg-card/50 rounded-xl">
                  <div className="size-8 rounded-lg bg-orange-500/10 grid place-items-center flex-none">
                    <UtensilsCrossed className="size-4 text-orange-500" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="eyebrow text-xs text-orange-500/90">Dinner</p>
                    <p className="text-[0.95rem] font-medium text-foreground mt-0.5">{selMeal}</p>
                  </div>
                </div>
              )}

              {fasting[selected] && (
                <div className="row-item flex items-center gap-3 p-3.5 border border-border/60 bg-card/50 rounded-xl">
                  <div className="size-8 rounded-lg bg-emerald-500/10 grid place-items-center flex-none">
                    <Moon className="size-4 text-emerald-500" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="eyebrow text-xs text-emerald-500/90">Fasting</p>
                    <p className="text-[0.95rem] font-medium text-foreground mt-0.5 capitalize">
                      {fasting[selected]}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <Section
        eyebrow="Everything, one month at a time"
        title={cursor.toLocaleDateString(undefined, { month: "long", year: "numeric" })}
        aside={
          <div className="flex items-center gap-1">
            <button
              aria-label="Previous month"
              onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}
              className="press text-ink-soft hover:text-foreground grid size-8 place-items-center rounded-full"
            >
              ‹
            </button>
            <button
              onClick={() => {
                const d = new Date();
                setCursor(new Date(d.getFullYear(), d.getMonth(), 1));
                setSelected(todayKey());
              }}
              className="text-ink-faint hover:text-foreground px-1 text-xs"
            >
              Today
            </button>
            <button
              aria-label="Next month"
              onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}
              className="press text-ink-soft hover:text-foreground grid size-8 place-items-center rounded-full"
            >
              ›
            </button>
          </div>
        }
      >
        <div className="grid grid-cols-7 gap-1">
          {WEEK.map((w) => (
            <div key={w} className="eyebrow pb-1 text-center">
              {w.slice(0, 1)}
            </div>
          ))}
          {grid.map((iso, i) => {
            if (!iso) return <div key={`x${i}`} />;
            const dayEvents = eventsOn(events, iso);
            const dayTasks = tasksOn(tasks, iso);
            const d = new Date(`${iso}T00:00:00`);
            const hasMeal = !!meals[`${DAY_KEYS[d.getDay()]}-Dinner`];
            const fasted = !!fasting[iso];
            const isSel = iso === selected;
            const isToday = iso === todayKey();
            const hp = hijriParts(d);
            const imarker = islamicMarker(d);
            return (
              <button
                key={iso}
                onClick={() => setSelected(iso)}
                className="press relative flex aspect-square flex-col items-center justify-center gap-1 rounded-xl border text-[0.72rem] transition-colors"
                style={{
                  borderColor: isSel
                    ? "var(--space-accent)"
                    : isToday
                      ? "var(--rule)"
                      : "transparent",
                  background: isSel ? "var(--space-accent-soft)" : "transparent",
                }}
              >
                {hp && (
                  <span
                    className="absolute top-1.5 right-1.5 text-[0.55rem] leading-none"
                    style={{
                      color: imarker ? "var(--clay)" : "var(--ink-faint)",
                      opacity: imarker ? 1 : 0.5,
                    }}
                  >
                    {hp.day}
                  </span>
                )}
                <span
                  className={`numeric mt-1 ${isToday ? "text-foreground font-semibold" : "text-ink-soft"}`}
                >
                  {iso.slice(8)}
                </span>
                <span className="flex h-1.5 items-center gap-[3px]">
                  {imarker && (
                    <i className="size-[5px] rounded-full" style={{ background: "var(--clay)" }} />
                  )}
                  {dayEvents.length > 0 && (
                    <i
                      className="size-[5px] rounded-full"
                      style={{ background: "var(--space-accent)" }}
                    />
                  )}
                  {dayTasks.length > 0 && (
                    <i className="size-[5px] rounded-full" style={{ background: "var(--brass)" }} />
                  )}
                  {fasted && (
                    <i className="size-[5px] rounded-full" style={{ background: "var(--leaf)" }} />
                  )}
                  {hasMeal && !dayEvents.length && !dayTasks.length && !fasted && !imarker && (
                    <i className="bg-rule size-[5px] rounded-full" />
                  )}
                </span>
              </button>
            );
          })}
        </div>
        <div className="text-ink-faint mt-4 flex flex-wrap gap-x-4 gap-y-1 text-[0.68rem]">
          <Legend color="var(--space-accent)" label="Events" />
          <Legend color="var(--brass)" label="Tasks due" />
          <Legend color="var(--leaf)" label="Fasting" />
          <Legend color="var(--rule)" label="Meal planned" />
          <Legend color="var(--clay)" label="Islamic Event" />
        </div>
      </Section>

      <Section
        eyebrow={hijriLabel(selDate) || selected}
        title={selDate.toLocaleDateString(undefined, {
          weekday: "long",
          day: "numeric",
          month: "long",
        })}
        aside={
          <Action
            variant={adding ? "quiet" : "solid"}
            onClick={() => {
              setDraft({
                title: "",
                date: selected,
                time: "",
                recur: { freq: "none", start: selected },
              });
              setAdding(!adding);
            }}
          >
            {adding ? "Cancel" : "Add event"}
          </Action>
        }
      >
        {marker && (
          <p className="border-space/50 text-ink-soft mb-5 border-l-2 pl-4 text-sm italic">
            {marker}
          </p>
        )}

        {adding && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!draft.title.trim()) return;
              setEvents([
                ...events,
                {
                  id: uid(),
                  title: draft.title.trim(),
                  date: draft.date,
                  time: draft.time || undefined,
                  recur:
                    draft.recur.freq === "none" ? undefined : { ...draft.recur, start: draft.date },
                },
              ]);
              setAdding(false);
            }}
            className="border-border/70 mb-7 space-y-4 rounded-2xl border p-4"
          >
            <div className="grid gap-2 sm:grid-cols-[1fr_140px_110px]">
              <Field
                label="Event"
                value={draft.title}
                onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              />
              <Field
                label="Date"
                type="date"
                value={draft.date}
                onChange={(e) => setDraft({ ...draft, date: e.target.value })}
              />
              <Field
                label="Time"
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
                Save event
              </Action>
            </div>
          </form>
        )}

        <div className="thread">
          {selEvents.length === 0 && selTasks.length === 0 && !selMeal && !fasting[selected] && (
            <p className="text-muted-foreground py-3 text-sm">Nothing on this day.</p>
          )}
          {selEvents.map((e) => (
            <div
              key={e.id}
              className="thread-node group flex items-baseline justify-between gap-3 py-3"
              data-active="true"
            >
              <div className="min-w-0">
                <p className="eyebrow">{e.time ? e.time : "All day"}</p>
                <p className="mt-0.5 text-[0.98rem]">{e.title}</p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <RepeatChip recur={e.recur} />
                <button
                  onClick={() => setEvents(events.filter((x) => x.id !== e.id))}
                  className="text-ink-faint hover:text-destructive text-xs opacity-0 group-hover:opacity-100"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
          {selTasks.map((t) => (
            <div key={t.id} className="thread-node py-3">
              <p className="eyebrow">Task · {t.list}</p>
              <p className="mt-0.5 text-[0.98rem]">{t.title}</p>
            </div>
          ))}
          {selMeal && (
            <div className="thread-node py-3">
              <p className="eyebrow">Dinner</p>
              <p className="mt-0.5 text-[0.98rem]">{selMeal}</p>
            </div>
          )}
          {fasting[selected] && (
            <div className="thread-node py-3">
              <p className="eyebrow">Fasting</p>
              <p className="mt-0.5 text-[0.98rem] capitalize">{fasting[selected]}</p>
            </div>
          )}
        </div>
      </Section>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <i className="size-[5px] rounded-full" style={{ background: color }} />
      {label}
    </span>
  );
}
