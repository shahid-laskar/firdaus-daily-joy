import { describe, test } from "node:test";
import assert from "node:assert/strict";
import {
  createRoutine,
  normalizeRoutine,
  isRoutineDueOnDate,
  resolveRoutineSchedule,
  deriveRoutineDayInstance,
  getTodayRoutineInstances,
  toggleRoutineStepCompletion,
  setRoutineStepCompletion,
  skipRoutineStep,
  getRoutineSummaryStats,
  generateRoutineSignals,
  type Routine,
  type RoutineStep,
} from "./routine-engine";
import { timeToMinutes, type PrayerTimeMap } from "./rhythm-engine";
import { buildDailyThread, type DailySurfaceData } from "./daily-surface";
import type { FamilyMember } from "./family-model";

const standardPrayers: PrayerTimeMap = {
  fajr: timeToMinutes("05:15"), // 315
  dhuhr: timeToMinutes("12:30"), // 750
  asr: timeToMinutes("15:45"), // 945
  maghrib: timeToMinutes("18:25"), // 1105
  isha: timeToMinutes("19:45"), // 1185
};

const prayerList = [
  { id: "fajr", name: "Fajr", time: "05:15" },
  { id: "dhuhr", name: "Dhuhr", time: "12:30" },
  { id: "asr", name: "Asr", time: "15:45" },
  { id: "maghrib", name: "Maghrib", time: "18:25" },
  { id: "isha", name: "Isha", time: "19:45" },
];

const sampleFamily: FamilyMember[] = [
  { id: "parent-1", name: "Ameen", role: "parent", chores: [] },
  { id: "parent-2", name: "Fatima", role: "parent", chores: [] },
  { id: "child-1", name: "Yusuf", role: "child", age: "7", chores: [] },
  { id: "child-2", name: "Maryam", role: "child", age: "4", chores: [] },
];

describe("Family Routines Engine (Wave 1.3)", () => {
  // ---------------------------------------------------------------------------
  // 1. ROUTINE MODEL & NORMALIZATION
  // ---------------------------------------------------------------------------
  test("Routine Model — Creation, Stable IDs, and Step Ordering", () => {
    const routine = createRoutine({
      name: "School Morning Routine",
      category: "school",
      relativeAnchor: "afterFajr",
      steps: [
        { title: "Get dressed & make bed", order: 2 },
        { title: "Morning Dua & Fajr reflection", order: 1 },
        { title: "Healthy breakfast", order: 3 },
        { title: "Pack school bag & water bottle", order: 4 },
      ],
    });

    assert.ok(routine.id.startsWith("rt_"));
    assert.equal(routine.name, "School Morning Routine");
    assert.equal(routine.enabled, true);
    assert.equal(routine.category, "school");
    assert.equal(routine.scheduleMode, "relativePrayer");
    assert.equal(routine.steps.length, 4);

    // Verify ordering is sorted by step order
    assert.equal(routine.steps[0]?.order, 1);
    assert.equal(routine.steps[0]?.title, "Morning Dua & Fajr reflection");
    assert.equal(routine.steps[1]?.order, 2);
    assert.equal(routine.steps[1]?.title, "Get dressed & make bed");
    assert.ok(routine.steps[0]?.id.startsWith("step_"));
  });

  test("Routine Model — Defensive Normalization of Legacy or Malformed Data", () => {
    assert.equal(normalizeRoutine(null), null);
    assert.equal(normalizeRoutine({}), null);
    assert.equal(normalizeRoutine({ name: "" }), null);

    const raw = {
      id: "custom-id",
      name: "Evening Wind Down",
      enabled: true,
      time: "21:00",
      steps: [{ title: "Brush teeth" }, { title: "Read book" }],
    };

    const normalized = normalizeRoutine(raw);
    assert.ok(normalized);
    assert.equal(normalized.id, "custom-id");
    assert.equal(normalized.scheduleMode, "exactTime");
    assert.equal(normalized.steps.length, 2);
    assert.equal(normalized.steps[0]?.order, 1);
    assert.equal(normalized.steps[1]?.order, 2);
  });

  // ---------------------------------------------------------------------------
  // 2. SCHEDULING (EXACT TIME, PRAYER-RELATIVE, UNSCHEDULED)
  // ---------------------------------------------------------------------------
  test("Scheduling — Exact Time vs Prayer-Relative vs Unscheduled", () => {
    // 1. Prayer-relative
    const afterMaghribRoutine = createRoutine({
      name: "After Maghrib Family Halaqah",
      relativeAnchor: "afterMaghrib",
      steps: [{ title: "Recite Surah" }, { title: "Discuss hadith" }],
    });
    const sched1 = resolveRoutineSchedule(afterMaghribRoutine, standardPrayers);
    assert.equal(sched1.blockId, "evening");
    assert.equal(sched1.scheduleMode, "relativePrayer");
    assert.equal(sched1.displaySchedule, "After Maghrib");
    assert.equal(sched1.approximateMinutes, 1105 + 15); // Maghrib (18:25 = 1105m) + 15m

    // 2. Exact time
    const exactTimeRoutine = createRoutine({
      name: "School Departure",
      time: "07:45",
      steps: [{ title: "Shoes on" }, { title: "Board van" }],
    });
    const sched2 = resolveRoutineSchedule(exactTimeRoutine, standardPrayers);
    assert.equal(sched2.blockId, "morning");
    assert.equal(sched2.scheduleMode, "exactTime");
    assert.equal(sched2.displaySchedule, "07:45");
    assert.equal(sched2.approximateMinutes, 7 * 60 + 45);

    // 3. Unscheduled
    const unscheduledRoutine = createRoutine({
      name: "Household Weekend Reset",
      steps: [{ title: "Dust shelves" }, { title: "Laundry" }],
    });
    const sched3 = resolveRoutineSchedule(unscheduledRoutine, standardPrayers);
    assert.equal(sched3.scheduleMode, "unscheduled");
    assert.equal(sched3.displaySchedule, "");
  });

  // ---------------------------------------------------------------------------
  // 3. RECURRENCE INTEGRATION
  // ---------------------------------------------------------------------------
  test("Recurrence — Daily, Weekly, and Weekday Rules", () => {
    const dailyRoutine = createRoutine({
      name: "Daily Morning Duha",
      relativeAnchor: "afterFajr",
      recur: { freq: "daily", start: "2026-08-01" },
    });

    const weekdayRoutine = createRoutine({
      name: "Weekday School Prep",
      time: "07:00",
      recur: { freq: "weekdays", start: "2026-08-01" },
    });

    const fridayRoutine = createRoutine({
      name: "Friday Kahf & Ghusl",
      relativeAnchor: "beforeDhuhr",
      recur: { freq: "weekly", start: "2026-08-07" }, // Friday
    });

    // 2026-08-17 is Monday
    assert.equal(isRoutineDueOnDate(dailyRoutine, "2026-08-17"), true);
    assert.equal(isRoutineDueOnDate(weekdayRoutine, "2026-08-17"), true);
    assert.equal(isRoutineDueOnDate(fridayRoutine, "2026-08-17"), false);

    // 2026-08-21 is Friday
    assert.equal(isRoutineDueOnDate(dailyRoutine, "2026-08-21"), true);
    assert.equal(isRoutineDueOnDate(weekdayRoutine, "2026-08-21"), true);
    assert.equal(isRoutineDueOnDate(fridayRoutine, "2026-08-21"), true);

    // 2026-08-23 is Sunday
    assert.equal(isRoutineDueOnDate(weekdayRoutine, "2026-08-23"), false);
  });

  // ---------------------------------------------------------------------------
  // 4. DAILY INSTANCE & COMPLETION STATES (NOT_STARTED, IN_PROGRESS, COMPLETED, RESET)
  // ---------------------------------------------------------------------------
  test("Daily Instance — Progression, Partial Completion, and Next-Day Reset", () => {
    let routine = createRoutine({
      id: "rt_bedtime",
      name: "Bedtime Routine",
      relativeAnchor: "afterIsha",
      steps: [
        { id: "s1", title: "Brush teeth", order: 1 },
        { id: "s2", title: "Wudu before sleep", order: 2 },
        { id: "s3", title: "Ayat al-Kursi & 3 Quls", order: 3 },
        { id: "s4", title: "Lights out", order: 4 },
      ],
    });

    const today = "2026-08-17";
    const tomorrow = "2026-08-18";

    // 1. Initial state today: Not started
    let instance = deriveRoutineDayInstance(routine, today, standardPrayers);
    assert.equal(instance.status, "not_started");
    assert.equal(instance.progressPct, 0);
    assert.equal(instance.completedSteps, 0);
    assert.equal(instance.totalSteps, 4);
    assert.equal(instance.currentStep?.id, "s1");
    assert.equal(instance.currentStep?.title, "Brush teeth");

    // 2. Complete Step 1 & Step 2 today -> In progress (50%)
    routine = toggleRoutineStepCompletion(routine, "s1", today);
    routine = toggleRoutineStepCompletion(routine, "s2", today);

    instance = deriveRoutineDayInstance(routine, today, standardPrayers);
    assert.equal(instance.status, "in_progress");
    assert.equal(instance.completedSteps, 2);
    assert.equal(instance.progressPct, 50);
    assert.equal(instance.currentStep?.id, "s3");
    assert.equal(instance.currentStep?.title, "Ayat al-Kursi & 3 Quls");

    // 3. Complete Step 3 & Step 4 today -> Completed (100%)
    routine = setRoutineStepCompletion(routine, "s3", today, true);
    routine = setRoutineStepCompletion(routine, "s4", today, true);

    instance = deriveRoutineDayInstance(routine, today, standardPrayers);
    assert.equal(instance.status, "completed");
    assert.equal(instance.completedSteps, 4);
    assert.equal(instance.progressPct, 100);
    assert.equal(instance.currentStep, undefined); // All complete

    // 4. Verification of Next-Day Clean Reset:
    // When evaluating tomorrow (2026-08-18), routine starts completely fresh at 0%
    const instanceTomorrow = deriveRoutineDayInstance(routine, tomorrow, standardPrayers);
    assert.equal(instanceTomorrow.status, "not_started");
    assert.equal(instanceTomorrow.completedSteps, 0);
    assert.equal(instanceTomorrow.progressPct, 0);
    assert.equal(instanceTomorrow.currentStep?.id, "s1");
  });

  test("Daily Instance — Skipping Steps", () => {
    let routine = createRoutine({
      name: "Morning Focus",
      steps: [
        { id: "step-a", title: "Morning Walk", order: 1 },
        { id: "step-b", title: "Journaling", order: 2 },
      ],
    });

    const dateIso = "2026-08-17";
    // Skip Step A
    routine = skipRoutineStep(routine, "step-a", dateIso, true);

    const instance = deriveRoutineDayInstance(routine, dateIso, standardPrayers);
    assert.equal(instance.skippedSteps, 1);
    assert.equal(instance.completedSteps, 0);
    assert.equal(instance.steps[0]?.isSkipped, true);
    assert.equal(instance.currentStep?.id, "step-b"); // Skips past step-a to step-b
  });

  // ---------------------------------------------------------------------------
  // 5. FAMILY MEMBER INTEGRATION
  // ---------------------------------------------------------------------------
  test("Family Integration — Household, Single-Member, and Multi-Member Steps", () => {
    // Multi-member routine where different steps belong to different family members
    const schoolRoutine = createRoutine({
      name: "Family School Launch",
      relativeAnchor: "afterFajr",
      steps: [
        { title: "Get dressed", assigneeId: "child-1" }, // Yusuf
        { title: "Brush hair", assigneeId: "child-2" }, // Maryam
        { title: "Pack lunchboxes", assigneeId: "parent-2" }, // Fatima
        { title: "Check homework", assigneeId: "parent-1" }, // Ameen
      ],
    });

    const instance = deriveRoutineDayInstance(schoolRoutine, "2026-08-17", standardPrayers, sampleFamily);

    assert.equal(instance.steps[0]?.assigneeName, "Yusuf");
    assert.equal(instance.steps[1]?.assigneeName, "Maryam");
    assert.equal(instance.steps[2]?.assigneeName, "Fatima");
    assert.equal(instance.steps[3]?.assigneeName, "Ameen");

    // Routine with non-existent memberId handles gracefully without crashing
    const orphanRoutine = createRoutine({
      name: "Solo Study",
      memberId: "non-existent-member",
      steps: [{ title: "Read textbook" }],
    });
    const orphanInstance = deriveRoutineDayInstance(orphanRoutine, "2026-08-17", standardPrayers, sampleFamily);
    assert.equal(orphanInstance.memberName, undefined);
  });

  // ---------------------------------------------------------------------------
  // 6. RHYTHM INTEGRATION & PRAYER SHIFTS
  // ---------------------------------------------------------------------------
  test("Rhythm Integration — Dynamic Adjustment When Prayer Times Shift", () => {
    const halaqahRoutine = createRoutine({
      name: "Family Quran Halaqah",
      relativeAnchor: "afterMaghrib",
      steps: [{ title: "Muraja'ah" }, { title: "Tafsir story" }],
    });

    // Winter: Maghrib at 17:45
    const winterPrayers: PrayerTimeMap = {
      fajr: timeToMinutes("05:30"),
      dhuhr: timeToMinutes("12:15"),
      asr: timeToMinutes("15:15"),
      maghrib: timeToMinutes("17:45"),
      isha: timeToMinutes("19:00"),
    };
    const winterInst = deriveRoutineDayInstance(halaqahRoutine, "2026-01-15", winterPrayers);
    assert.equal(winterInst.targetBlock, "evening");
    assert.equal(winterInst.approximateMinutes, timeToMinutes("17:45") + 15);

    // Summer: Maghrib shifted to 19:30
    const summerPrayers: PrayerTimeMap = {
      fajr: timeToMinutes("04:15"),
      dhuhr: timeToMinutes("12:45"),
      asr: timeToMinutes("16:45"),
      maghrib: timeToMinutes("19:30"),
      isha: timeToMinutes("21:00"),
    };
    const summerInst = deriveRoutineDayInstance(halaqahRoutine, "2026-07-15", summerPrayers);
    assert.equal(summerInst.targetBlock, "evening");
    assert.equal(summerInst.approximateMinutes, timeToMinutes("19:30") + 15);
  });

  // ---------------------------------------------------------------------------
  // 7. SUMMARY STATS & SIGNALS
  // ---------------------------------------------------------------------------
  test("Summary Stats & Signals — Accurate Aggregates and Operational Alerts", () => {
    let r1 = createRoutine({
      name: "Morning Routine",
      relativeAnchor: "afterFajr",
      steps: [{ id: "r1_s1", title: "Step 1" }, { id: "r1_s2", title: "Step 2" }],
    });
    let r2 = createRoutine({
      name: "Evening Routine",
      relativeAnchor: "afterMaghrib",
      steps: [{ id: "r2_s1", title: "Dinner" }, { id: "r2_s2", title: "Dishes" }],
    });

    const today = "2026-08-17";
    // Complete r1 fully
    r1 = setRoutineStepCompletion(r1, "r1_s1", today, true);
    r1 = setRoutineStepCompletion(r1, "r1_s2", today, true);

    // Complete r2 partially
    r2 = setRoutineStepCompletion(r2, "r2_s1", today, true);

    const instances = getTodayRoutineInstances([r1, r2], today, standardPrayers);
    const stats = getRoutineSummaryStats(instances);

    assert.equal(stats.totalRoutines, 2);
    assert.equal(stats.completedRoutines, 1);
    assert.equal(stats.inProgressRoutines, 1);
    assert.equal(stats.totalSteps, 4);
    assert.equal(stats.completedSteps, 3);
    assert.equal(stats.overallPct, 75);

    // Signals: Only in-progress / uncompleted routines produce signals
    const signals = generateRoutineSignals([r1, r2], today, standardPrayers, "evening");
    assert.equal(signals.length, 1);
    assert.equal(signals[0]?.name, "Evening Routine");
    assert.equal(signals[0]?.status, "in_progress");
    assert.ok(signals[0]?.message.includes("Next: Dishes"));
  });

  // ---------------------------------------------------------------------------
  // 8. DAILY SURFACE INTEGRATION
  // ---------------------------------------------------------------------------
  test("Daily Surface — Contextual Routine Item Injection", () => {
    const routine = createRoutine({
      id: "rt_school",
      name: "School Morning",
      relativeAnchor: "afterFajr",
      steps: [
        { id: "st1", title: "Dress up" },
        { id: "st2", title: "Eat breakfast" },
        { id: "st3", title: "Grab school bag" },
      ],
    });

    const mockSurfaceData: DailySurfaceData = {
      now: new Date("2026-08-17T07:00:00"),
      profile: { name: "Shahid", city: "Kozhikode" },
      prayers: prayerList,
      nextPrayer: { next: { name: "Dhuhr", time: "12:30" }, hours: 5, mins: 30 },
      salahLog: {},
      hifzItems: [],
      isRamadan: false,
      ramadanDay: null,
      tasks: [],
      events: [],
      meals: {},
      grocery: [],
      habits: [],
      health: { "2026-08-17": { water: 2 } },
      checkins: {},
      expenses: [],
      limits: {},
      routines: [routine],
    };

    const thread = buildDailyThread(mockSurfaceData, "2026-08-17");
    const routineItem = thread.find((i) => i.id === "routine-rt_school");

    assert.ok(routineItem);
    assert.equal(routineItem.label, "Routine");
    assert.ok(routineItem.value.includes("School Morning"));
    assert.ok(routineItem.detail?.includes("Next: Dress up"));
  });

  // ---------------------------------------------------------------------------
  // 9. PERSISTENCE & DATA INTEGRITY
  // ---------------------------------------------------------------------------
  test("Persistence & Data Integrity — JSON Roundtrip and Store Compatibility", () => {
    const original = createRoutine({
      id: "rt_persist_test",
      name: "Nightly Reflection",
      relativeAnchor: "afterIsha",
      category: "bedtime",
      steps: [
        { id: "s1", title: "Read Mulk", completions: ["2026-08-16", "2026-08-17"] },
        { id: "s2", title: "Sleep Dua", completions: ["2026-08-16"] },
      ],
    });

    // Simulate JSON storage serialization and deserialization
    const serialized = JSON.stringify([original]);
    const parsed = JSON.parse(serialized);
    const restored = normalizeRoutine(parsed[0]);

    assert.ok(restored);
    assert.equal(restored.id, original.id);
    assert.equal(restored.name, original.name);
    assert.equal(restored.steps.length, 2);
    assert.deepEqual(restored.steps[0]?.completions, ["2026-08-16", "2026-08-17"]);
    assert.deepEqual(restored.steps[1]?.completions, ["2026-08-16"]);
  });

  // ---------------------------------------------------------------------------
  // 10. EXPERIENCE INDEPENDENCE
  // ---------------------------------------------------------------------------
  test("Experience Independence — Pure Domain Data Without Presentation Archetypes", () => {
    const routine = createRoutine({
      name: "Pure Routine",
      relativeAnchor: "afterDhuhr",
      steps: [{ title: "Step A" }],
    });

    const instance = deriveRoutineDayInstance(routine, "2026-08-17", standardPrayers);

    // Confirm no visual experience tokens or archetype references exist
    assert.equal((instance as any).experience, undefined);
    assert.equal((instance as any).tone, undefined);
    assert.equal((instance as any).style, undefined);
  });
});
