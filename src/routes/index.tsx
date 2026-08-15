import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { Shell } from "@/components/veedu/shell";
import { SubTabs, Section, EmptyState } from "@/components/veedu/primitives";
import { TimeBand, ProgressLine, Status } from "@/components/veedu/phase4";
import {
  Deeds,
  GroceryList,
  Kids,
  Meals,
  Tasks,
  isTaskDone,
  type Task,
} from "@/components/home/modules";
import { Notes } from "@/components/home/notes";
import { UnifiedCalendar, eventsOn, type CalEvent } from "@/components/home/calendar";
import { Reminders, useReminderEngine } from "@/components/home/reminders";
import { useNextPrayer, usePrayers, useSalah } from "@/components/deen/modules";
import { isRepeating, occursOn } from "@/lib/recurrence";
import { useTab } from "@/lib/use-tab";
import { todayKey, useNow, useStore } from "@/lib/store";
import { useFamilyMigration } from "@/lib/family-model";
import { calculateBudgetAnalytics } from "@/lib/budget-intelligence";
import { buildDailyThread, type DailyThreadItem } from "@/lib/daily-surface";
import { useRamadanMode } from "@/lib/ramadan";
import type { HifzItem } from "@/lib/hifz-scheduler";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sunnah Home — a handcrafted home for everyday life" },
      {
        name: "description",
        content:
          "Sunnah Home brings family life, prayer, money and personal wellbeing into one calm, beautifully made daily companion.",
      },
      { property: "og:title", content: "Sunnah Home — a handcrafted home for everyday life" },
      {
        property: "og:description",
        content:
          "Family, Deen, budget and wellbeing in one quiet daily companion. Offline-first, private by default.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HomePage,
});

const TABS = [
  { id: "today", label: "Today" },
  { id: "tasks", label: "Tasks" },
  { id: "meals", label: "Meals" },
  { id: "grocery", label: "Grocery" },
  { id: "kids", label: "Kids" },
  { id: "deeds", label: "Deeds" },
  { id: "calendar", label: "Calendar" },
  { id: "notes", label: "Notes" },
  { id: "reminders", label: "Reminders" },
];

function greeting(h: number) {
  if (h < 5) return "Still awake";
  if (h < 12) return "Good morning";
  if (h < 16) return "Good afternoon";
  if (h < 20) return "Good evening";
  return "Winding down";
}

function Today() {
  const now = useNow(60_000);
  const today = todayKey();
  const [profile] = useStore("profile", { name: "", city: "Kozhikode" });
  const [tasks] = useStore<Task[]>("tasks", []);
  const [grocery] = useStore<{ id: string; got: boolean }[]>("grocery", []);
  const [events] = useStore<CalEvent[]>("events", []);
  const [meals] = useStore<Record<string, string>>("meals", {});
  const [habits] = useStore<{ id: string; name: string; days: string[] }[]>("habits", []);
  const [health] = useStore<Record<string, { water: number }>>("health", {});
  const [checkins] = useStore<Record<string, string>>("checkins", {});
  const [expenses] = useStore<{ amount: number; date: string }[]>("expenses", []);
  const [limits] = useStore<Record<string, number>>("limits", {});
  const [hifzItems] = useStore<HifzItem[]>("hifz", []);
  const [salah] = useSalah();
  const countdown = useNextPrayer();
  const prayers = usePrayers();
  const { isActive: isRamadan, ramadanDay } = useRamadanMode();
  const activeReminders = useReminderEngine();

  const hour = now?.getHours() ?? 8;
  const dueToday = tasks.filter((t) =>
    isRepeating(t.recur) ? occursOn(t.recur, today) : !t.done,
  );
  const open = dueToday.filter((t) => !isTaskDone(t));
  const doneCount = dueToday.length - open.length;
  const todayEvents = eventsOn(events, today);
  const prayed = Object.keys(salah[today] ?? {}).length;
  const leftToBuy = grocery.filter((g) => !g.got).length;

  const threadItems = useMemo(
    () =>
      buildDailyThread({
        now: now ?? new Date(),
        profile,
        prayers,
        nextPrayer: countdown,
        salahLog: salah,
        hifzItems,
        isRamadan,
        ramadanDay,
        tasks,
        events,
        meals,
        grocery,
        habits,
        health,
        checkins,
        expenses,
        limits,
        activeReminders,
      }),
    [
      now,
      profile,
      prayers,
      countdown,
      salah,
      hifzItems,
      isRamadan,
      ramadanDay,
      tasks,
      events,
      meals,
      grocery,
      habits,
      health,
      checkins,
      expenses,
      limits,
      activeReminders,
    ]
  );

  const bands = useMemo(() => groupThread(threadItems), [threadItems]);
  const quietDay = threadItems.every((i) => i.done) || threadItems.length === 0;

  return (
    <div className="space-y-12">
      <header className="rise">
        <p className="eyebrow">
          {now?.toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" }) ??
            " "}
        </p>
        <h1 className="display-xl mt-3">
          {greeting(hour)}
          {profile.name ? `, ${profile.name}` : ""}.
        </h1>
        <p className="text-muted-foreground mt-4 max-w-md text-[0.98rem] leading-relaxed">
          {open.length === 0 && todayEvents.length === 0
            ? "Nothing is asking for you right now. That is allowed."
            : `${open.length} thing${open.length === 1 ? "" : "s"} waiting${
                todayEvents.length ? ` · ${todayEvents.length} on the calendar` : ""
              }.`}
        </p>
      </header>

      {/* The thread — today read as one prioritised line, arranged now → next → today → later */}
      {quietDay && bands.length === 0 ? (
        <EmptyState
          glyph="☾"
          headline="A quiet day"
          body="Nothing is due and nothing is waiting. When something arrives, it will appear here first."
        />
      ) : (
        <div className="space-y-10">
          {bands.map((band) => (
            <TimeBand key={band.id} label={band.label} meta={band.meta}>
              <section className="thread space-y-0.5">
                {band.items.map((item, idx) => (
                  <ThreadItem key={item.id} item={item} index={idx} lead={band.id === "now"} />
                ))}
              </section>
            </TimeBand>
          ))}
        </div>
      )}

      <Section
        eyebrow="How today looks"
        title="Progress"
        aside={
          <Link to="/review" className="text-ink-faint hover:text-foreground text-xs">
            Weekly review →
          </Link>
        }
      >
        <div className="grid gap-6 sm:grid-cols-3">
          <ProgressLine
            label="Tasks"
            value={`${doneCount}/${dueToday.length}`}
            pct={dueToday.length ? (doneCount / dueToday.length) * 100 : 0}
          />
          <ProgressLine label="Salah" value={`${prayed}/5`} pct={(prayed / 5) * 100} />
          <ProgressLine
            label="Grocery"
            value={`${grocery.length - leftToBuy}/${grocery.length}`}
            pct={grocery.length ? ((grocery.length - leftToBuy) / grocery.length) * 100 : 0}
          />
        </div>
      </Section>
    </div>
  );
}

/**
 * Presentation-only arrangement of the engine's already-prioritised thread into
 * temporal bands. Priority scores come from buildDailyThread — nothing is
 * recalculated here.
 */
type Band = { id: string; label: string; meta?: string | undefined; items: DailyThreadItem[] };

function groupThread(items: DailyThreadItem[]): Band[] {
  const now = items.filter((i) => !i.done && i.priority <= 2);
  const next = items.filter((i) => !i.done && i.priority >= 3 && i.priority <= 4);
  const today = items.filter((i) => !i.done && i.priority >= 5 && i.priority <= 7);
  const later = items.filter((i) => !i.done && i.priority >= 8);
  const behind = items.filter((i) => i.done);

  return [
    { id: "now", label: "Now", items: now },
    { id: "next", label: "Next", items: next },
    { id: "today", label: "Today", items: today },
    { id: "later", label: "Later", items: later },
    { id: "behind", label: "Behind you", items: behind },
  ].filter((b) => b.items.length > 0);
}

const TONE_BY_BAND: Record<string, "urgent" | "attention" | "ambient" | "settled"> = {
  prayer: "attention",
  ramadan: "urgent",
  reminder: "urgent",
};

function ThreadItem({
  item,
  index,
  lead,
}: {
  item: DailyThreadItem;
  index: number;
  lead: boolean;
}) {
  const tone = item.active ? (TONE_BY_BAND[item.category] ?? "attention") : "ambient";
  const body = (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3 py-3">
      <div className="min-w-0">
        <p className="eyebrow">{item.label}</p>
        <p
          className={`mt-1 ${lead ? "thread-lead" : "text-[1.02rem]"} ${
            item.done ? "text-ink-faint" : "text-foreground"
          }`}
        >
          {item.value}
        </p>
        {item.detail && <p className="text-ink-faint numeric mt-1 text-xs">{item.detail}</p>}
      </div>
      {item.active && !item.done && (
        <span className="shrink-0 pt-0.5">
          <Status tone={tone}>{tone === "urgent" ? "Now" : "Soon"}</Status>
        </span>
      )}
    </div>
  );

  return (
    <div
      className="thread-node thread-in"
      style={{ "--i": index } as React.CSSProperties}
      data-active={item.active ? "true" : undefined}
      data-done={item.done ? "true" : undefined}
    >
      {item.to ? (
        <Link
          to={item.to}
          className="focus-visible:ring-space/40 block rounded-lg transition-colors hover:bg-black/[0.02] dark:hover:bg-white/[0.02]"
        >
          {body}
        </Link>
      ) : (
        body
      )}
    </div>
  );
}

function HomePage() {
  useFamilyMigration();
  const [tab, setTab] = useTab("today");
  return (
    <Shell space="home">
      <div className="mb-8">
        <SubTabs tabs={TABS} value={tab} onChange={setTab} />
      </div>
      {tab === "today" && <Today />}
      {tab === "tasks" && <Tasks />}
      {tab === "meals" && <Meals />}
      {tab === "grocery" && <GroceryList />}
      {tab === "kids" && <Kids />}
      {tab === "deeds" && <Deeds />}
      {tab === "calendar" && <UnifiedCalendar />}
      {tab === "notes" && <Notes />}
      {tab === "reminders" && <Reminders />}
    </Shell>
  );
}
