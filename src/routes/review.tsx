import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { Shell } from "@/components/veedu/shell";
import { Meter, Section } from "@/components/veedu/primitives";
import { money } from "@/components/budget/modules";
import { useStore } from "@/lib/store";
import { getWeekRange, isoOffset, sum, trendDelta } from "@/lib/intelligence";
import { compareSalahPeriods, generateSalahInsights, type SalahData } from "@/lib/salah-intelligence";
import { calculateMoodAnalytics, generateMoodInsights, type DailyActivityData } from "@/lib/mood-intelligence";

export const Route = createFileRoute("/review")({
  head: () => ({
    meta: [
      { title: "Weekly review — how your week actually went | Sunnah Home" },
      {
        name: "description",
        content:
          "A quiet weekly reflection: salah consistency, tasks completed, spending, habits, mood and Quran reading, gathered from what you already logged.",
      },
      { property: "og:title", content: "Weekly review — how your week actually went" },
      {
        property: "og:description",
        content: "One calm page that answers a single question: how did my week go?",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ReviewPage,
});

const MOOD_LABELS: Record<string, string> = {
  bright: "Bright",
  steady: "Steady",
  tired: "Tired",
  heavy: "Heavy",
  grateful: "Grateful",
};

function ReviewPage() {
  const week = useMemo(() => getWeekRange(new Date()), []);
  const prevWeek = useMemo(() => [...Array(7)].map((_, i) => isoOffset(new Date(), -(13 - i))), []);

  const [salah] = useStore<SalahData>("salah", {});
  const [tasks] = useStore<{ id: string; title: string; done: boolean; date: string; recur?: any; completions?: string[] }[]>("tasks", []);
  const [expenses] = useStore<{ amount: number; category: string; date: string }[]>("expenses", []);
  const [habits] = useStore<{ id: string; name: string; days: string[] }[]>("habits", []);
  const [checkins] = useStore<Record<string, string>>("checkins", {});
  const [health] = useStore<Record<string, { water: number; sleep: string }>>("health", {});
  const [sessions] = useStore<{ date: string; surah?: string; mins?: string }[]>("quran-log", []);
  const [fasting] = useStore<Record<string, string>>("fasting", {});
  const [deeds] = useStore<{ who: string; what: string; date: string }[]>("deeds", []);

  // Centralized Salah Intelligence
  const salahComparison = useMemo(() => compareSalahPeriods(salah, week, prevWeek), [salah, week, prevWeek]);
  const salahAnalytics = salahComparison.current;
  const salahInsights = useMemo(() => generateSalahInsights(salahComparison), [salahComparison]);
  const prayed = salahAnalytics.totalLogged;
  const onTime = salahAnalytics.onTimeCount;

  const tasksDone = tasks.filter(
    (t) =>
      (t.done && week.includes(t.date)) ||
      (t.completions ?? []).filter((c) => week.includes(c)).length > 0,
  ).length;
  const taskCompletions =
    tasks.filter((t) => t.done && week.includes(t.date)).length +
    tasks.reduce((s, t) => s + (t.completions ?? []).filter((c) => week.includes(c)).length, 0);
  const openNow = tasks.filter((t) => !t.done && !t.recur).length;

  // Centralized Spending Analytics
  const weekExpenses = useMemo(() => expenses.filter((e) => week.includes(e.date)), [expenses, week]);
  const prevWeekExpenses = useMemo(() => expenses.filter((e) => prevWeek.includes(e.date)), [expenses, prevWeek]);
  const weekSpend = sum(weekExpenses.map((e) => e.amount));
  const prevSpend = sum(prevWeekExpenses.map((e) => e.amount));
  const spendDelta = useMemo(() => trendDelta(weekSpend, prevSpend), [weekSpend, prevSpend]);

  const topCategory = useMemo(() => {
    const map = new Map<string, number>();
    weekExpenses.forEach((e) => map.set(e.category, (map.get(e.category) ?? 0) + e.amount));
    return [...map.entries()].sort((a, b) => b[1] - a[1])[0];
  }, [weekExpenses]);

  const habitHits = habits.map((h) => ({ name: h.name, hits: week.filter((d) => h.days.includes(d)).length }));

  // Centralized Mood Intelligence
  const dailyActivityData: DailyActivityData[] = useMemo(() => {
    return week.map((date) => {
      const daySalah = salah[date] || {};
      const sLogged = Object.keys(daySalah).length;
      const sOnTime = Object.values(daySalah).filter((s) => s === "ontime").length;
      const h = health[date];
      const entry: DailyActivityData = {
        date,
        waterGlasses: h?.water ?? 0,
        habitsCompleted: habits.filter((h) => h.days.includes(date)).length,
      };
      if (checkins[date]) entry.mood = checkins[date];
      if (h?.sleep && Number(h.sleep) > 0) entry.sleepHours = Number(h.sleep);
      if (sLogged > 0) entry.salahOnTimePct = (sOnTime / sLogged) * 100;
      return entry;
    });
  }, [week, salah, health, checkins, habits]);

  const moodAnalytics = useMemo(() => calculateMoodAnalytics(dailyActivityData), [dailyActivityData]);
  const moodInsights = useMemo(() => generateMoodInsights(moodAnalytics), [moodAnalytics]);

  const moodDays = week.filter((d) => checkins[d]);
  const dominantMood = useMemo(() => {
    const map = new Map<string, number>();
    moodDays.forEach((d) => map.set(checkins[d] as string, (map.get(checkins[d] as string) ?? 0) + 1));
    return [...map.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
  }, [moodDays, checkins]);

  const water = week.reduce((s, d) => s + (health[d]?.water ?? 0), 0);
  const sleepDays = week.filter((d) => Number(health[d]?.sleep ?? 0) > 0);
  const avgSleep = sleepDays.length
    ? (sleepDays.reduce((s, d) => s + Number(health[d]?.sleep ?? 0), 0) / sleepDays.length).toFixed(1)
    : null;
  const quranSessions = sessions.filter((s) => week.includes(s.date)).length;
  const fasts = week.filter((d) => fasting[d]).length;
  const weekDeeds = deeds.filter((d) => week.includes(d.date));

  const highlights: string[] = [];
  if (onTime / Math.max(1, prayed) > 0.8 && prayed >= 25) highlights.push("Salah was steady and mostly on time.");
  salahInsights.filter((i) => i.severity === "success").forEach((i) => {
    if (!highlights.includes(i.explanation)) highlights.push(i.explanation);
  });
  if (taskCompletions >= 5) highlights.push(`${taskCompletions} things closed out.`);
  if (prevSpend > 0 && weekSpend < prevSpend) highlights.push("You spent less than last week.");
  if (habitHits.some((h) => h.hits >= 5)) highlights.push("A habit held for most of the week.");
  moodInsights.filter((i) => i.severity === "success").forEach((i) => {
    if (!highlights.includes(i.explanation)) highlights.push(i.explanation);
  });
  if (weekDeeds.length) highlights.push(`${weekDeeds.length} small kindness${weekDeeds.length > 1 ? "es" : ""} noticed.`);

  const attention: string[] = [];
  if (prayed < 30) attention.push(`${35 - prayed} prayers weren't logged.`);
  salahInsights.filter((i) => i.severity === "warning" || i.id === "salah-weakest" || i.id === "salah-trend-down").forEach((i) => {
    if (!attention.includes(i.explanation)) attention.push(i.explanation);
  });
  if (openNow > 5) attention.push(`${openNow} tasks are still open.`);
  if (prevSpend > 0 && spendDelta.percentage > 15) attention.push("Spending rose noticeably.");
  if (avgSleep && Number(avgSleep) < 6.5) attention.push("Sleep averaged under 6.5 hours.");

  return (
    <Shell space="home">
      <header className="rise mb-10">
        <p className="eyebrow">
          {week[0]} → {week[6]}
        </p>
        <h1 className="display-xl mt-3">How your week went</h1>
        <p className="text-muted-foreground mt-3 text-sm">
          Gathered from what you already logged. Nothing extra to fill in.
        </p>
      </header>

      <div className="space-y-12">
        <Section eyebrow="Deen" title="Salah & Quran">
          <div className="grid gap-6 sm:grid-cols-3">
            <Stat label="Prayers logged" value={`${prayed}/35`} pct={(prayed / 35) * 100} />
            <Stat label="On time" value={`${onTime}/${Math.max(prayed, 1)}`} pct={(onTime / Math.max(prayed, 1)) * 100} />
            <Stat label="Quran sessions" value={String(quranSessions)} pct={Math.min(100, quranSessions * 20)} />
          </div>
          <p className="text-muted-foreground mt-6 text-sm">
            {fasts > 0 ? `${fasts} day${fasts > 1 ? "s" : ""} of fasting this week.` : "No fasting logged this week."}
          </p>
        </Section>

        <Section eyebrow="Household" title="Tasks & habits">
          <div className="grid gap-6 sm:grid-cols-2">
            <Stat label="Completed" value={String(taskCompletions)} pct={Math.min(100, taskCompletions * 8)} />
            <Stat label="Still open" value={String(openNow)} pct={Math.min(100, openNow * 10)} />
          </div>
          {habitHits.length > 0 && (
            <ul className="mt-8 space-y-4">
              {habitHits.map((h) => (
                <li key={h.name}>
                  <div className="mb-1.5 flex items-baseline justify-between">
                    <span className="text-[0.95rem]">{h.name}</span>
                    <span className="numeric text-ink-soft text-sm">{h.hits}/7</span>
                  </div>
                  <Meter value={(h.hits / 7) * 100} />
                </li>
              ))}
            </ul>
          )}
        </Section>

        <Section eyebrow="Money" title="Spending">
          <p className="display-lg numeric">₹{money(weekSpend)}</p>
          <p className="text-muted-foreground mt-2 text-sm">
            {prevSpend
              ? `${weekSpend >= prevSpend ? "▲" : "▼"} ${Math.abs(Math.round(((weekSpend - prevSpend) / prevSpend) * 100))}% vs the week before`
              : "First week with records"}
            {topCategory ? ` · most on ${topCategory[0]}` : ""}
          </p>
          <div className="mt-5">
            <Link to="/budget" search={{ tab: "history" }} className="text-space text-xs underline underline-offset-4">
              See the full history
            </Link>
          </div>
        </Section>

        <Section eyebrow="You" title="Mood & body">
          <div className="grid gap-6 sm:grid-cols-3">
            <Stat label="Check-ins" value={`${moodDays.length}/7`} pct={(moodDays.length / 7) * 100} />
            <Stat label="Water" value={`${water} glasses`} pct={Math.min(100, (water / 56) * 100)} />
            <Stat label="Avg sleep" value={avgSleep ? `${avgSleep}h` : "—"} pct={avgSleep ? Math.min(100, (Number(avgSleep) / 8) * 100) : 0} />
          </div>
          {dominantMood && (
            <p className="text-muted-foreground mt-6 text-sm">
              Mostly {MOOD_LABELS[dominantMood]?.toLowerCase()} this week.
            </p>
          )}
        </Section>

        <Section eyebrow="In a sentence" title="What stood out">
          <div className="grid gap-8 sm:grid-cols-2">
            <div>
              <p className="eyebrow mb-3">Went well</p>
              <ul className="thread">
                {(highlights.length ? highlights : ["Not enough logged yet to say."]).map((h) => (
                  <li key={h} data-active="true" className="thread-node py-2.5 text-[0.95rem]">
                    {h}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="eyebrow mb-3">Worth a look</p>
              <ul className="thread">
                {(attention.length ? attention : ["Nothing pressing."]).map((h) => (
                  <li key={h} className="thread-node py-2.5 text-[0.95rem]">
                    {h}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Section>

        {weekDeeds.length > 0 && (
          <Section eyebrow="Noticed" title="Good deeds">
            <ul className="thread">
              {weekDeeds.map((d) => (
                <li key={`${d.date}${d.what}`} className="thread-node py-3">
                  <p className="text-[0.95rem]">{d.what}</p>
                  <p className="text-ink-faint numeric text-xs">
                    {d.who} · {d.date}
                  </p>
                </li>
              ))}
            </ul>
          </Section>
        )}
      </div>
    </Shell>
  );
}

function Stat({ label, value, pct }: { label: string; value: string; pct: number }) {
  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between">
        <span className="eyebrow">{label}</span>
        <span className="numeric font-display text-lg">{value}</span>
      </div>
      <Meter value={pct} />
    </div>
  );
}
