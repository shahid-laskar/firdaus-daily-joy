/**
 * Intelligent Daily Operating Surface Engine — Synthesizes deen, family, prayer,
 * Hifz revision, Ramadan context, tasks, calendar, health, and budget signals into
 * a prioritized, calm daily stream.
 */

import { isRepeating, occursOn, type Recurrence } from "./recurrence";
import { calculateBudgetAnalytics } from "./budget-intelligence";
import { generateHifzRevisionQueue, type HifzItem } from "./hifz-scheduler";
import { calculateSuhurIftar } from "./ramadan";
import { isoDate } from "./intelligence";
import type { ReminderSignal } from "./reminder-engine";
import { type Routine, generateRoutineSignals } from "./routine-engine";
import { buildDayRhythmFromSurfaceData, type DayRhythm } from "./rhythm-engine";
import { filterEventsForMember } from "./family-model";

export type DailyThreadItemCategory =
  | "prayer"
  | "ramadan"
  | "reminder"
  | "task"
  | "calendar"
  | "hifz"
  | "meal"
  | "grocery"
  | "habit"
  | "health"
  | "checkin"
  | "budget"
  | "completed";

export interface DailyThreadItem {
  id: string;
  category: DailyThreadItemCategory;
  priority: number; // 1 (urgent/now) to 10 (ambient/background)
  label: string;
  value: string;
  detail?: string | undefined;
  active?: boolean | undefined;
  done?: boolean | undefined;
  to?: "/deen" | "/me" | "/budget" | "/review" | "/" | undefined;
}

export interface TaskRecord {
  id: string;
  title: string;
  done?: boolean | undefined;
  time?: string | undefined;
  date?: string | undefined;
  recur?: Recurrence | undefined;
  completions?: string[] | undefined;
  list?: string | undefined;
  assigneeId?: string | undefined;
  assignedTo?: string | undefined; // Wave 2.0-A primary assignment field
  relativeAnchor?: any;
  scheduleMode?: "exactTime" | "relativePrayer" | "unscheduled" | undefined;
}

export interface CalEventRecord {
  id: string;
  title: string;
  time?: string | undefined;
  date: string;
  recur?: Recurrence | undefined;
  assigneeId?: string | undefined;
  assignedTo?: string | undefined;
}

export interface DailySurfaceData {
  now: Date;
  profile: { name?: string | undefined; city?: string | undefined };
  prayers: { id: string; name: string; time: string }[];
  nextPrayer: { next: { name: string; time: string }; hours: number; mins: number } | null;
  salahLog: Record<string, Record<string, any>>;
  hifzItems: HifzItem[];
  isRamadan: boolean;
  ramadanDay: number | null;
  tasks: TaskRecord[];
  events: CalEventRecord[];
  meals: Record<string, string>;
  grocery: { id: string; got: boolean; name?: string | undefined }[];
  habits: { id: string; name: string; days: string[] }[];
  health: Record<string, { water: number }>;
  checkins: Record<string, string>;
  expenses: { id?: string | undefined; amount: number; category?: string | undefined; date: string }[];
  limits: Record<string, number>;
  activeReminders?: ReminderSignal[] | undefined;
  routines?: Routine[] | undefined;
  memberId?: string | undefined; // Optional member context for filtered Daily Surface
}

export function isTaskRecordDone(t: TaskRecord, todayIso = isoDate()): boolean {
  if (!isRepeating(t.recur)) return Boolean(t.done);
  return Boolean(t.completions?.includes(todayIso));
}

/**
 * Checks whether a task is due on the specified date.
 * - For recurring tasks: checks occursOn(t.recur, iso).
 * - For non-recurring tasks with a date: checks t.date === iso.
 * - For non-recurring undated tasks: checks !t.done.
 */
export function isTaskDueOnDate(t: TaskRecord, iso = isoDate()): boolean {
  if (isRepeating(t.recur)) {
    return occursOn(t.recur, iso);
  }
  if (t.date) {
    return t.date === iso;
  }
  return !t.done;
}

/** Check if an event falls on the specified date (explicit date match or recurring schedule) */
export function isEventOnDate(event: CalEventRecord, iso: string): boolean {
  return event.date === iso || occursOn(event.recur, iso);
}

/**
 * Builds the calm, prioritized Daily Thread items for the Home surface.
 */
export function buildDailyThread(
  data: DailySurfaceData,
  today = isoDate(data.now),
  dayRhythm?: DayRhythm
): DailyThreadItem[] {
  const items: DailyThreadItem[] = [];
  const hour = data.now.getHours();

  // Obtain canonical DayRhythm from Rhythm Engine
  const rhythm = dayRhythm || buildDayRhythmFromSurfaceData({
    ...data,
    now: data.now,
  });

  // 1. Ramadan Suhur & Iftar Context (if Ramadan is active)
  if (data.isRamadan) {
    const fajrTime = data.prayers.find((p) => p.id === "fajr")?.time ?? "05:00";
    const maghribTime = data.prayers.find((p) => p.id === "maghrib")?.time ?? "18:30";
    const suhurIftar = calculateSuhurIftar(fajrTime, maghribTime, data.now);

    if (suhurIftar.phase === "suhur") {
      items.push({
        id: "ramadan-suhur",
        category: "ramadan",
        priority: 1,
        active: true,
        label: data.ramadanDay ? `Ramadan Day ${data.ramadanDay}` : "Suhur",
        value: suhurIftar.countdownText,
        detail: `Fajr cutoff: ${suhurIftar.suhurTime} · Tap for Suhur Dua`,
        to: "/deen",
      });
    } else if (suhurIftar.phase === "fasting" && suhurIftar.minutesRemaining <= 120) {
      items.push({
        id: "ramadan-iftar-soon",
        category: "ramadan",
        priority: 2,
        active: true,
        label: data.ramadanDay ? `Ramadan Day ${data.ramadanDay}` : "Iftar",
        value: suhurIftar.countdownText,
        detail: `Maghrib: ${suhurIftar.iftarTime} · Prepare for Iftar`,
        to: "/deen",
      });
    } else if (suhurIftar.phase === "iftar") {
      items.push({
        id: "ramadan-iftar-done",
        category: "ramadan",
        priority: 3,
        active: true,
        label: "Iftar",
        value: suhurIftar.countdownText,
        detail: "Alhamdulillah · Tap for Taraweeh & Deeds",
        to: "/deen",
      });
    }
  }

  // 2. Next Prayer Context
  const prayedCount = Object.keys(data.salahLog[today] ?? {}).length;
  if (data.nextPrayer) {
    const prayerMinsLeft = data.nextPrayer.hours * 60 + data.nextPrayer.mins;
    const isImminent = prayerMinsLeft <= 30;

    items.push({
      id: "prayer-countdown",
      category: "prayer",
      priority: isImminent ? 1 : 3,
      active: isImminent,
      label: isImminent ? "Prayer soon" : "Next prayer",
      value: `${data.nextPrayer.next.name} · ${data.nextPrayer.next.time}`,
      detail: `in ${data.nextPrayer.hours ? `${data.nextPrayer.hours}h ` : ""}${data.nextPrayer.mins}m · ${prayedCount}/5 logged`,
      to: "/deen",
    });
  }

  // 3. Active Reminders (from reminder engine)
  if (data.activeReminders && data.activeReminders.length > 0) {
    for (const rem of data.activeReminders.slice(0, 2)) {
      items.push({
        id: `reminder-${rem.id}`,
        category: "reminder",
        priority: rem.priority === "high" ? 2 : 4,
        active: rem.priority === "high",
        label: "Reminder",
        value: rem.message,
        detail: "Due right now",
        to: (rem.actionTarget as any) || "/",
      });
    }
  }

  // 4. Hifz Revisions Due Today (from Hifz scheduler)
  const hifzQueue = generateHifzRevisionQueue(data.hifzItems, today);
  if (hifzQueue.dueToday.length > 0) {
    const firstDue = hifzQueue.dueToday[0]!;
    items.push({
      id: "hifz-due",
      category: "hifz",
      priority: 4,
      label: "Muraja'ah",
      value:
        hifzQueue.dueToday.length === 1
          ? `Revise ${firstDue.surah}`
          : `${hifzQueue.dueToday.length} portions due for revision (${firstDue.surah}…)`,
      detail: `Retention: ${hifzQueue.summary.averageRetention}% · Keep memorisation firm`,
      to: "/deen",
    });
  }

  // 5. Calendar Events for Today
  const eventsForScope = filterEventsForMember(data.events, data.memberId);
  const todayEvents = eventsForScope.filter((e) => isEventOnDate(e, today));
  for (const ev of todayEvents) {
    items.push({
      id: `event-${ev.id}`,
      category: "calendar",
      priority: 5,
      label: "Today",
      value: ev.title,
      detail: ev.time ? `At ${ev.time}` : undefined,
      to: "/",
    });
  }

  // 6. Actionable Tasks Due Today (Consuming Canonical DayRhythm)
  const openTaskItems: { id: string; title: string; detail?: string | undefined; blockId: string }[] = [];
  for (const block of rhythm.blocks) {
    for (const item of block.items) {
      if (item.category === "task" && !item.done) {
        openTaskItems.push({
          id: item.id,
          title: item.title,
          detail: item.detail,
          blockId: item.blockId,
        });
      }
    }
  }

  for (const t of openTaskItems.slice(0, 3)) {
    const isCurrentBlock = t.blockId === rhythm.currentBlockId;
    items.push({
      id: t.id,
      category: "task",
      priority: isCurrentBlock ? 5 : 6,
      label: isCurrentBlock ? "Current" : "Waiting",
      value: t.title,
      detail: t.detail,
      to: "/",
    });
  }

  // 6.5. Active Family Routines Due Today (Wave 1.3)
  if (data.routines && data.routines.length > 0) {
    const routineSignals = generateRoutineSignals(
      data.routines,
      today,
      data.prayers,
      rhythm.currentBlockId
    );
    for (const sig of routineSignals.slice(0, 2)) {
      items.push({
        id: `routine-${sig.routineId}`,
        category: "task",
        priority: sig.priority,
        label: "Routine",
        value: `${sig.name} (${sig.completedSteps}/${sig.totalSteps})`,
        detail: sig.currentStepTitle ? `Next: ${sig.currentStepTitle}` : sig.displaySchedule || undefined,
        to: "/",
      });
    }
  }

  // 7. Today's Planned Meal Context
  const dayName = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][data.now.getDay() ?? 1];
  const dinner = data.meals[`${dayName}-Dinner`];
  if (dinner) {
    items.push({
      id: "meal-dinner",
      category: "meal",
      priority: hour >= 16 ? 4 : 7,
      label: "Dinner",
      value: dinner,
      detail: "From this week's plan",
      to: "/",
    });
  }

  // 8. Grocery items left to buy
  const leftToBuy = data.grocery.filter((g) => !g.got).length;
  if (leftToBuy > 0) {
    items.push({
      id: "grocery-remaining",
      category: "grocery",
      priority: 7,
      label: "Grocery",
      value: `${leftToBuy} item${leftToBuy === 1 ? "" : "s"} still to pick up`,
      detail: "Ready for your next shop",
      to: "/",
    });
  }

  // 9. Habits
  const habitsHit = data.habits.filter((h) => h.days.includes(today)).length;
  if (data.habits.length > 0) {
    const unkept = data.habits.filter((h) => !h.days.includes(today));
    items.push({
      id: "habits-summary",
      category: "habit",
      priority: 8,
      label: "Habits",
      value: `${habitsHit} of ${data.habits.length} kept today`,
      detail: habitsHit < data.habits.length ? unkept[0]?.name : "All kept today",
      to: "/me",
    });
  }

  // 10. Health: Water intake
  const water = data.health[today]?.water ?? 0;
  if (water < 8) {
    items.push({
      id: "health-water",
      category: "health",
      priority: 8,
      label: "Water",
      value: `${water} of 8 glasses`,
      detail: "Stay hydrated",
      to: "/me",
    });
  }

  // 11. Wellbeing: Check-in / Mood
  const mood = data.checkins[today];
  if (!mood) {
    items.push({
      id: "mood-checkin",
      category: "checkin",
      priority: 8,
      label: "Check in",
      value: "How are you today?",
      detail: "A quiet moment of reflection",
      to: "/me",
    });
  }

  // 12. Budget Signals (if over 80% or category over limit)
  const month = today.slice(0, 7);
  const budgetAnalytics = calculateBudgetAnalytics(data.expenses as any, month);
  const spent = budgetAnalytics.currentMonthTotal;
  const cap = Object.values(data.limits).reduce((s, n) => s + n, 0);
  const overBudget = cap > 0 && spent / cap > 0.8;
  if (overBudget) {
    items.push({
      id: "budget-alert",
      category: "budget",
      priority: 8,
      label: "Money",
      value: `${Math.round((spent / cap) * 100)}% of this month's limits used`,
      detail: "Worth a look before the month ends",
      to: "/budget",
    });
  }

  // 13. Completed count ("Behind you")
  let doneCount = 0;
  for (const block of rhythm.blocks) {
    for (const item of block.items) {
      if (item.category === "task" && item.done) {
        doneCount++;
      }
    }
  }
  if (doneCount > 0) {
    items.push({
      id: "completed-summary",
      category: "completed",
      priority: 9,
      done: true,
      label: "Behind you",
      value: `${doneCount} finished today`,
    });
  }

  // Stable sort by priority score
  return items.sort((a, b) => a.priority - b.priority);
}
