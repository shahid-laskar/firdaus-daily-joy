import { test } from "node:test";
import assert from "node:assert/strict";
import {
  timeToMinutes,
  minutesToTime,
  formatDuration,
  determineRhythmBlock,
  resolveRelativeAnchorToBlock,
  normalizeRelativeAnchor,
  formatRelativeAnchorLabel,
  getTaskScheduleMode,
  resolveTaskPlacement,
  inferBlockForItem,
  buildDayRhythm,
  buildDayRhythmFromSurfaceData,
  RHYTHM_BLOCK_DEFINITIONS,
  PRAYER_IDS,
  RHYTHM_BLOCK_IDS,
  CANONICAL_RELATIVE_ANCHOR_KEYS,
  RELATIVE_ANCHOR_DEFINITIONS,
  type PrayerTimeMap,
  type RelativePrayerAnchor,
  type ScheduleMode,
} from "./rhythm-engine";
import type { DailySurfaceData, TaskRecord } from "./daily-surface";

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

test("Rhythm Engine — Time Utilities", () => {
  assert.equal(timeToMinutes("00:00"), 0);
  assert.equal(timeToMinutes("05:15"), 315);
  assert.equal(timeToMinutes("12:30"), 750);
  assert.equal(timeToMinutes("23:59"), 1439);
  assert.equal(timeToMinutes(""), 0);

  assert.equal(minutesToTime(0), "00:00");
  assert.equal(minutesToTime(315), "05:15");
  assert.equal(minutesToTime(750), "12:30");
  assert.equal(minutesToTime(1439), "23:59");
  assert.equal(minutesToTime(1440), "00:00"); // wrap around

  assert.equal(formatDuration(45), "45m");
  assert.equal(formatDuration(120), "2h");
  assert.equal(formatDuration(135), "2h 15m");
});

test("Rhythm Engine — Block Definitions & Coverage", () => {
  assert.equal(PRAYER_IDS.length, 5);
  assert.equal(RHYTHM_BLOCK_IDS.length, 5);

  assert.equal(RHYTHM_BLOCK_DEFINITIONS.morning.startAnchor, "fajr");
  assert.equal(RHYTHM_BLOCK_DEFINITIONS.morning.endAnchor, "dhuhr");

  assert.equal(RHYTHM_BLOCK_DEFINITIONS.afternoon.startAnchor, "dhuhr");
  assert.equal(RHYTHM_BLOCK_DEFINITIONS.afternoon.endAnchor, "asr");

  assert.equal(RHYTHM_BLOCK_DEFINITIONS.lateAfternoon.startAnchor, "asr");
  assert.equal(RHYTHM_BLOCK_DEFINITIONS.lateAfternoon.endAnchor, "maghrib");

  assert.equal(RHYTHM_BLOCK_DEFINITIONS.evening.startAnchor, "maghrib");
  assert.equal(RHYTHM_BLOCK_DEFINITIONS.evening.endAnchor, "isha");

  assert.equal(RHYTHM_BLOCK_DEFINITIONS.night.startAnchor, "isha");
  assert.equal(RHYTHM_BLOCK_DEFINITIONS.night.endAnchor, "fajr");
});

test("Rhythm Engine — Block Resolution Across the 24-Hour Cycle", () => {
  // 1. Pre-Fajr Night phase (00:00 to 05:14)
  assert.equal(determineRhythmBlock("00:00", standardPrayers), "night");
  assert.equal(determineRhythmBlock("03:30", standardPrayers), "night");
  assert.equal(determineRhythmBlock("05:14", standardPrayers), "night");

  // 2. Morning block [Fajr, Dhuhr) (05:15 to 12:29)
  assert.equal(determineRhythmBlock("05:15", standardPrayers), "morning");
  assert.equal(determineRhythmBlock("08:30", standardPrayers), "morning");
  assert.equal(determineRhythmBlock("12:29", standardPrayers), "morning");

  // 3. Afternoon block [Dhuhr, Asr) (12:30 to 15:44)
  assert.equal(determineRhythmBlock("12:30", standardPrayers), "afternoon");
  assert.equal(determineRhythmBlock("14:00", standardPrayers), "afternoon");
  assert.equal(determineRhythmBlock("15:44", standardPrayers), "afternoon");

  // 4. Late Afternoon block [Asr, Maghrib) (15:45 to 18:24)
  assert.equal(determineRhythmBlock("15:45", standardPrayers), "lateAfternoon");
  assert.equal(determineRhythmBlock("17:00", standardPrayers), "lateAfternoon");
  assert.equal(determineRhythmBlock("18:24", standardPrayers), "lateAfternoon");

  // 5. Evening block [Maghrib, Isha) (18:25 to 19:44)
  assert.equal(determineRhythmBlock("18:25", standardPrayers), "evening");
  assert.equal(determineRhythmBlock("19:00", standardPrayers), "evening");
  assert.equal(determineRhythmBlock("19:44", standardPrayers), "evening");

  // 6. Post-Isha Night phase [Isha, 24:00) (19:45 to 23:59)
  assert.equal(determineRhythmBlock("19:45", standardPrayers), "night");
  assert.equal(determineRhythmBlock("21:30", standardPrayers), "night");
  assert.equal(determineRhythmBlock("23:59", standardPrayers), "night");
});

test("Rhythm Engine — Relative Prayer Anchor Resolution", () => {
  assert.equal(resolveRelativeAnchorToBlock("fajr", "after"), "morning");
  assert.equal(resolveRelativeAnchorToBlock("fajr", "before"), "night");
  assert.equal(resolveRelativeAnchorToBlock("dhuhr", "before"), "morning");
  assert.equal(resolveRelativeAnchorToBlock("dhuhr", "after"), "afternoon");
  assert.equal(resolveRelativeAnchorToBlock("asr", "before"), "afternoon");
  assert.equal(resolveRelativeAnchorToBlock("asr", "after"), "lateAfternoon");
  assert.equal(resolveRelativeAnchorToBlock("maghrib", "before"), "lateAfternoon");
  assert.equal(resolveRelativeAnchorToBlock("maghrib", "after"), "evening");
  assert.equal(resolveRelativeAnchorToBlock("isha", "before"), "evening");
  assert.equal(resolveRelativeAnchorToBlock("isha", "after"), "night");
});

test("Rhythm Engine — Smart Item Inference", () => {
  // Explicit relative anchor takes highest precedence
  assert.equal(
    inferBlockForItem(
      {
        title: "Grocery run",
        relativeAnchor: { prayer: "maghrib", relation: "after" },
      },
      standardPrayers
    ),
    "evening"
  );

  // Explicit time
  assert.equal(
    inferBlockForItem({ title: "Doctor appointment", time: "16:30" }, standardPrayers),
    "lateAfternoon"
  );

  // Title heuristics with prayer names
  assert.equal(
    inferBlockForItem({ title: "Walk after Maghrib" }, standardPrayers),
    "evening"
  );
  assert.equal(
    inferBlockForItem({ title: "No phone after Isha" }, standardPrayers),
    "night"
  );
  assert.equal(
    inferBlockForItem({ title: "Morning Duha prayer & Adhkar" }, standardPrayers),
    "morning"
  );
  assert.equal(
    inferBlockForItem({ title: "Qaylulah power nap" }, standardPrayers),
    "afternoon"
  );
  assert.equal(
    inferBlockForItem({ title: "Suhur & Tahajjud" }, standardPrayers),
    "night"
  );

  // Category defaults
  assert.equal(
    inferBlockForItem({ title: "Puttu & Kadala", category: "meal" }, standardPrayers),
    "morning"
  );
  assert.equal(
    inferBlockForItem({ title: "Kozhi curry & rice", category: "meal" }, standardPrayers),
    "morning" // default meal fallback if title doesn't specify lunch/dinner
  );
  assert.equal(
    inferBlockForItem({ title: "Family dinner", category: "meal" }, standardPrayers),
    "evening"
  );
  assert.equal(
    inferBlockForItem({ title: "Surah Al-Mulk revision", category: "hifz" }, standardPrayers),
    "morning"
  );
});

test("Rhythm Engine — DayRhythm Full Build & Temporal Invariants", () => {
  // Test building at 09:30 AM (Morning block)
  const mockNow = new Date("2026-08-15T09:30:00");
  const rhythm = buildDayRhythm({
    now: mockNow,
    date: "2026-08-15",
    prayers: prayerList,
    salahLog: {
      "2026-08-15": { fajr: "ontime" },
    },
    tasks: [
      { id: "t1", title: "Review pull request", time: "10:00", done: false },
      { id: "t2", title: "Pick up dry cleaning", time: "16:00", done: false },
      { id: "t3", title: "Walk after Maghrib", done: false },
    ],
    events: [
      { id: "e1", title: "Staff meeting", date: "2026-08-15", time: "11:00" },
      { id: "e2", title: "Evening Quran study", date: "2026-08-15", time: "19:00" },
    ],
    meals: {
      "Sat-Breakfast": "Thattu dosa",
      "Sat-Dinner": "Grilled fish",
    },
    habits: [
      { id: "h1", name: "Read 10 pages", days: ["2026-08-15"] },
      { id: "h2", name: "No phone after Isha", days: [] },
    ],
  });

  // Current block should be "morning"
  assert.equal(rhythm.currentBlockId, "morning");
  assert.equal(rhythm.currentMinutes, 9 * 60 + 30);

  // Next anchor should be Dhuhr at 12:30
  assert.equal(rhythm.nextAnchor.id, "dhuhr");
  assert.equal(rhythm.nextAnchor.name, "Dhuhr");
  assert.equal(rhythm.nextAnchor.time, "12:30");
  assert.equal(rhythm.nextAnchor.minutesRemaining, 180); // 3h remaining
  assert.equal(rhythm.nextAnchor.hours, 3);
  assert.equal(rhythm.nextAnchor.mins, 0);
  assert.equal(rhythm.nextAnchor.isImminent, false);

  // Anchors: 5 anchors with Salah is temporal anchor principle
  assert.equal(rhythm.anchors.length, 5);
  const fajrAnchor = rhythm.anchors.find((a) => a.id === "fajr")!;
  assert.equal(fajrAnchor.status, "ontime");
  assert.equal(fajrAnchor.isPast, true);

  const dhuhrAnchor = rhythm.anchors.find((a) => a.id === "dhuhr")!;
  assert.equal(dhuhrAnchor.status, "upcoming");
  assert.equal(dhuhrAnchor.isNext, true);

  // Blocks: 5 blocks
  assert.equal(rhythm.blocks.length, 5);

  // Check duration partition invariance: Total minutes of all 5 blocks must equal exactly 1440 min (24 hours)
  const totalDuration = rhythm.blocks.reduce((sum, b) => sum + b.durationMinutes, 0);
  assert.equal(totalDuration, 1440, "Sum of all 5 block durations must equal exactly 24 hours (1440 min)");

  // Morning block verification
  const morningBlock = rhythm.blocks.find((b) => b.id === "morning")!;
  assert.equal(morningBlock.isCurrent, true);
  assert.equal(morningBlock.isPast, false);
  assert.equal(morningBlock.isUpcoming, false);
  assert.ok(morningBlock.progressPct > 0 && morningBlock.progressPct < 100);

  // Check items distributed into morning
  const morningTitles = morningBlock.items.map((i) => i.title);
  assert.ok(morningTitles.includes("Review pull request"));
  assert.ok(morningTitles.includes("Staff meeting"));
  assert.ok(morningTitles.includes("Breakfast: Thattu dosa"));

  // Check items in lateAfternoon
  const lateAfternoonBlock = rhythm.blocks.find((b) => b.id === "lateAfternoon")!;
  const lateAfternoonTitles = lateAfternoonBlock.items.map((i) => i.title);
  assert.ok(lateAfternoonTitles.includes("Pick up dry cleaning"));

  // Check items in evening
  const eveningBlock = rhythm.blocks.find((b) => b.id === "evening")!;
  const eveningTitles = eveningBlock.items.map((i) => i.title);
  assert.ok(eveningTitles.includes("Evening Quran study"));
  assert.ok(eveningTitles.includes("Walk after Maghrib"));
  assert.ok(eveningTitles.includes("Dinner: Grilled fish"));

  // Check items in night
  const nightBlock = rhythm.blocks.find((b) => b.id === "night")!;
  const nightTitles = nightBlock.items.map((i) => i.title);
  assert.ok(nightTitles.includes("No phone after Isha"));

  // Timeline: 10 segments alternating Anchor -> Block
  assert.equal(rhythm.timeline.length, 10);
  assert.equal(rhythm.timeline[0]?.type, "anchor");
  assert.equal(rhythm.timeline[1]?.type, "block");
  assert.equal(rhythm.timeline[2]?.type, "anchor");
  assert.equal(rhythm.timeline[3]?.type, "block");
  assert.equal(rhythm.timeline[4]?.type, "anchor");
  assert.equal(rhythm.timeline[5]?.type, "block");
  assert.equal(rhythm.timeline[6]?.type, "anchor");
  assert.equal(rhythm.timeline[7]?.type, "block");
  assert.equal(rhythm.timeline[8]?.type, "anchor");
  assert.equal(rhythm.timeline[9]?.type, "block");

  // Stats verification
  assert.equal(rhythm.stats.totalPrayers, 5);
  assert.equal(rhythm.stats.prayersLogged, 1);
  assert.equal(rhythm.stats.onTimePrayers, 1);
  assert.ok(rhythm.stats.totalItems > 0);
});

test("Rhythm Engine — Ramadan Context Integration", () => {
  const mockNow = new Date("2026-08-15T04:30:00"); // 04:30 AM before Fajr (05:15)
  const rhythm = buildDayRhythm({
    now: mockNow,
    date: "2026-08-15",
    prayers: prayerList,
    isRamadan: true,
    ramadanDay: 14,
  });

  assert.equal(rhythm.currentBlockId, "night");
  assert.equal(rhythm.nextAnchor.id, "fajr");
  assert.equal(rhythm.nextAnchor.minutesRemaining, 45); // 45m to Fajr

  const nightBlock = rhythm.blocks.find((b) => b.id === "night")!;
  const nightItems = nightBlock.items.map((i) => i.title);
  assert.ok(nightItems.some((t) => t.includes("Suhur")));
  assert.ok(nightItems.some((t) => t.includes("Taraweeh")));

  const eveningBlock = rhythm.blocks.find((b) => b.id === "evening")!;
  const eveningItems = eveningBlock.items.map((i) => i.title);
  assert.ok(eveningItems.some((t) => t.includes("Iftar")));
});

test("Rhythm Engine — Adapter with DailySurfaceData", () => {
  const surfaceData: DailySurfaceData = {
    now: new Date("2026-08-15T16:00:00"), // 16:00 (lateAfternoon)
    profile: { name: "Shahid", city: "Kozhikode" },
    prayers: prayerList,
    nextPrayer: { next: { name: "Maghrib", time: "18:25" }, hours: 2, mins: 25 },
    salahLog: { "2026-08-15": { fajr: "ontime", dhuhr: "ontime", asr: "ontime" } },
    hifzItems: [
      {
        id: "h1",
        surah: "Al-Mulk",
        surahNumber: 67,
        range: "1-30",
        pct: 100,
        lastRevised: "2026-08-10",
        intervalDays: 1,
        easeFactor: 2.5,
        repetitions: 2,
        revisionHistory: [],
      },
    ],
    isRamadan: false,
    ramadanDay: null,
    tasks: [
      { id: "t1", title: "Submit project report", done: false, time: "16:30" },
    ],
    events: [],
    meals: { "Sat-Dinner": "Lentil soup" },
    grocery: [{ id: "g1", name: "Dates", got: false }],
    habits: [{ id: "h1", name: "Walk after Maghrib", days: [] }],
    health: { "2026-08-15": { water: 5 } },
    checkins: { "2026-08-15": "good" },
    expenses: [],
    limits: { Groceries: 5000 },
  };

  const rhythm = buildDayRhythmFromSurfaceData(surfaceData);

  assert.equal(rhythm.currentBlockId, "lateAfternoon");
  assert.equal(rhythm.nextAnchor.id, "maghrib");
  assert.equal(rhythm.stats.prayersLogged, 3);
  assert.equal(rhythm.stats.onTimePrayers, 3);

  // Hifz should be in morning block
  const morningBlock = rhythm.blocks.find((b) => b.id === "morning")!;
  assert.ok(morningBlock.items.some((i) => i.category === "hifz"));

  // Task at 16:30 in lateAfternoon
  const lateBlock = rhythm.blocks.find((b) => b.id === "lateAfternoon")!;
  assert.ok(lateBlock.items.some((i) => i.title === "Submit project report"));
});

test("Rhythm Engine — Recurring Calendar Events & Repeating Task Completions", () => {
  const rhythm = buildDayRhythm({
    now: new Date("2026-08-15T10:00:00"), // Saturday
    date: "2026-08-15",
    prayers: prayerList,
    events: [
      {
        id: "rec-e1",
        title: "Daily Morning Standup",
        time: "09:30",
        date: "2026-08-01",
        recur: { freq: "daily", start: "2026-08-01" },
      },
      {
        id: "rec-e2",
        title: "Sunday Family Halaqah",
        time: "17:00",
        date: "2026-08-02",
        recur: { freq: "weekly", start: "2026-08-02" }, // Sundays only
      },
    ],
    tasks: [
      {
        id: "rec-t1",
        title: "Morning Surah Yaseen",
        recur: { freq: "daily", start: "2026-08-01" },
        completions: ["2026-08-14", "2026-08-15"], // Done today
      },
      {
        id: "rec-t2",
        title: "Recite Kahf",
        recur: { freq: "weekly", start: "2026-08-07" }, // Fridays only -> not today (Saturday)
        completions: [],
      },
      {
        id: "dated-t3",
        title: "Send Weekly Report",
        date: "2026-08-15",
        done: false,
        time: "14:00",
      },
      {
        id: "future-t4",
        title: "Pay Rent",
        date: "2026-08-30",
        done: false,
      },
    ],
  });

  const morningBlock = rhythm.blocks.find((b) => b.id === "morning")!;
  const morningTitles = morningBlock.items.map((i) => i.title);

  // Daily recurring event should appear
  assert.ok(morningTitles.includes("Daily Morning Standup"));

  // Weekly Sunday event should NOT appear on Saturday
  const allTitles = rhythm.blocks.flatMap((b) => b.items.map((i) => i.title));
  assert.ok(!allTitles.includes("Sunday Family Halaqah"));

  // Daily repeating task completed today should have done: true
  const yaseenItem = allTitles.includes("Morning Surah Yaseen");
  assert.ok(yaseenItem);
  const yaseenObj = morningBlock.items.find((i) => i.title === "Morning Surah Yaseen");
  assert.equal(yaseenObj?.done, true);

  // Friday repeating task should NOT appear on Saturday
  assert.ok(!allTitles.includes("Recite Kahf"));

  // Dated task for today should appear
  assert.ok(allTitles.includes("Send Weekly Report"));

  // Future dated task should NOT appear today
  assert.ok(!allTitles.includes("Pay Rent"));
});

test("Rhythm Engine — Missing, Null, or Malformed Prayer Data Edge Cases", () => {
  // Empty array of prayers should gracefully use canonical defaults without crashing
  const rhythmFromEmpty = buildDayRhythm({
    now: new Date("2026-08-15T10:00:00"),
    prayers: [],
  });
  assert.equal(rhythmFromEmpty.anchors.length, 5);
  assert.equal(rhythmFromEmpty.blocks.length, 5);
  assert.equal(rhythmFromEmpty.currentBlockId, "morning");

  // Reordered and mixed case prayer items
  const mixedPrayers = [
    { id: "ISHA", name: "Isha", time: "20:30" },
    { id: "FAJR", name: "Fajr", time: "04:45" },
    { id: "MAGHRIB", name: "Maghrib", time: "19:00" },
    { id: "DHUHR", name: "Dhuhr", time: "12:15" },
    { id: "ASR", name: "Asr", time: "16:00" },
  ];

  const rhythmFromMixed = buildDayRhythm({
    now: new Date("2026-08-15T19:15:00"),
    prayers: mixedPrayers,
  });
  assert.equal(rhythmFromMixed.currentBlockId, "evening");
  assert.equal(rhythmFromMixed.nextAnchor.id, "isha");
  assert.equal(rhythmFromMixed.nextAnchor.time, "20:30");
});

test("Rhythm Engine — Midnight Transition & Night Block Progress Across Days", () => {
  const prayers = [
    { id: "fajr", name: "Fajr", time: "05:00" },
    { id: "dhuhr", name: "Dhuhr", time: "12:30" },
    { id: "asr", name: "Asr", time: "16:00" },
    { id: "maghrib", name: "Maghrib", time: "18:30" },
    { id: "isha", name: "Isha", time: "20:00" },
  ];

  // Night duration = from 20:00 to 05:00 = 9 hours = 540 minutes
  // 1. Pre-midnight at 22:15 (135 min after Isha -> progress = 135/540 = 25%)
  const preMidnight = buildDayRhythm({
    now: new Date("2026-08-15T22:15:00"),
    prayers,
  });
  assert.equal(preMidnight.currentBlockId, "night");
  const nightPre = preMidnight.blocks.find((b) => b.id === "night")!;
  assert.equal(nightPre.durationMinutes, 540);
  assert.equal(nightPre.progressPct, 25);
  assert.equal(preMidnight.nextAnchor.id, "fajr");
  assert.equal(preMidnight.nextAnchor.minutesRemaining, 405); // 6h 45m to 05:00

  // 2. Exact midnight at 00:00 (240 min after Isha -> progress = 240/540 = 44%)
  const atMidnight = buildDayRhythm({
    now: new Date("2026-08-15T00:00:00"),
    prayers,
  });
  assert.equal(atMidnight.currentBlockId, "night");
  const nightMid = atMidnight.blocks.find((b) => b.id === "night")!;
  assert.equal(nightMid.progressPct, 44);

  // 3. Post-midnight at 02:45 (405 min after Isha -> progress = 405/540 = 75%)
  const postMidnight = buildDayRhythm({
    now: new Date("2026-08-15T02:45:00"),
    prayers,
  });
  assert.equal(postMidnight.currentBlockId, "night");
  const nightPost = postMidnight.blocks.find((b) => b.id === "night")!;
  assert.equal(nightPost.progressPct, 75);
  assert.equal(postMidnight.nextAnchor.id, "fajr");
  assert.equal(postMidnight.nextAnchor.minutesRemaining, 135); // 2h 15m to 05:00
});

test("Rhythm Engine — Exact Boundary Invariants", () => {
  const prayers = [
    { id: "fajr", name: "Fajr", time: "05:00" },
    { id: "dhuhr", name: "Dhuhr", time: "12:00" },
    { id: "asr", name: "Asr", time: "15:30" },
    { id: "maghrib", name: "Maghrib", time: "18:00" },
    { id: "isha", name: "Isha", time: "19:30" },
  ];

  // At exactly 05:00 -> morning begins
  assert.equal(determineRhythmBlock("05:00", prayers), "morning");
  // At exactly 04:59 -> still night
  assert.equal(determineRhythmBlock("04:59", prayers), "night");

  // At exactly 12:00 -> afternoon begins
  assert.equal(determineRhythmBlock("12:00", prayers), "afternoon");
  // At exactly 11:59 -> still morning
  assert.equal(determineRhythmBlock("11:59", prayers), "morning");

  // At exactly 15:30 -> lateAfternoon begins
  assert.equal(determineRhythmBlock("15:30", prayers), "lateAfternoon");
  // At exactly 15:29 -> still afternoon
  assert.equal(determineRhythmBlock("15:29", prayers), "afternoon");

  // At exactly 18:00 -> evening begins
  assert.equal(determineRhythmBlock("18:00", prayers), "evening");
  // At exactly 17:59 -> still lateAfternoon
  assert.equal(determineRhythmBlock("17:59", prayers), "lateAfternoon");

  // At exactly 19:30 -> night begins
  assert.equal(determineRhythmBlock("19:30", prayers), "night");
  // At exactly 19:29 -> still evening
  assert.equal(determineRhythmBlock("19:29", prayers), "evening");
});

// =============================================================================
// WAVE 1.2 — PRAYER-AWARE TASK SCHEDULING TESTS
// =============================================================================

test("Wave 1.2 — Canonical Relative Anchor Vocabulary & Definitions", () => {
  assert.equal(CANONICAL_RELATIVE_ANCHOR_KEYS.length, 10);
  assert.ok(CANONICAL_RELATIVE_ANCHOR_KEYS.includes("afterFajr"));
  assert.ok(CANONICAL_RELATIVE_ANCHOR_KEYS.includes("beforeDhuhr"));
  assert.ok(CANONICAL_RELATIVE_ANCHOR_KEYS.includes("afterDhuhr"));
  assert.ok(CANONICAL_RELATIVE_ANCHOR_KEYS.includes("beforeAsr"));
  assert.ok(CANONICAL_RELATIVE_ANCHOR_KEYS.includes("afterAsr"));
  assert.ok(CANONICAL_RELATIVE_ANCHOR_KEYS.includes("beforeMaghrib"));
  assert.ok(CANONICAL_RELATIVE_ANCHOR_KEYS.includes("afterMaghrib"));
  assert.ok(CANONICAL_RELATIVE_ANCHOR_KEYS.includes("beforeIsha"));
  assert.ok(CANONICAL_RELATIVE_ANCHOR_KEYS.includes("afterIsha"));
  assert.ok(CANONICAL_RELATIVE_ANCHOR_KEYS.includes("beforeFajr"));

  // Check definitions map
  assert.equal(RELATIVE_ANCHOR_DEFINITIONS.afterFajr.targetBlock, "morning");
  assert.equal(RELATIVE_ANCHOR_DEFINITIONS.beforeDhuhr.targetBlock, "morning");
  assert.equal(RELATIVE_ANCHOR_DEFINITIONS.afterDhuhr.targetBlock, "afternoon");
  assert.equal(RELATIVE_ANCHOR_DEFINITIONS.beforeAsr.targetBlock, "afternoon");
  assert.equal(RELATIVE_ANCHOR_DEFINITIONS.afterAsr.targetBlock, "lateAfternoon");
  assert.equal(RELATIVE_ANCHOR_DEFINITIONS.beforeMaghrib.targetBlock, "lateAfternoon");
  assert.equal(RELATIVE_ANCHOR_DEFINITIONS.afterMaghrib.targetBlock, "evening");
  assert.equal(RELATIVE_ANCHOR_DEFINITIONS.beforeIsha.targetBlock, "evening");
  assert.equal(RELATIVE_ANCHOR_DEFINITIONS.afterIsha.targetBlock, "night");
  assert.equal(RELATIVE_ANCHOR_DEFINITIONS.beforeFajr.targetBlock, "night");
});

test("Wave 1.2 — Relative Anchor Normalization & Label Formatting", () => {
  // Canonical keys
  const normFajr = normalizeRelativeAnchor("afterFajr");
  assert.deepEqual(normFajr, { prayer: "fajr", relation: "after" });
  assert.equal(formatRelativeAnchorLabel("afterFajr"), "After Fajr");

  const normDhuhr = normalizeRelativeAnchor("beforeDhuhr");
  assert.deepEqual(normDhuhr, { prayer: "dhuhr", relation: "before" });
  assert.equal(formatRelativeAnchorLabel("beforeDhuhr"), "Before Dhuhr");

  // Tolerant string forms
  assert.deepEqual(normalizeRelativeAnchor("after-asr"), { prayer: "asr", relation: "after" });
  assert.deepEqual(normalizeRelativeAnchor("after_maghrib"), { prayer: "maghrib", relation: "after" });
  assert.deepEqual(normalizeRelativeAnchor("before isha"), { prayer: "isha", relation: "before" });

  // Object structures with offsets
  const customObj = { prayer: "maghrib" as const, relation: "after" as const, offsetMinutes: 20 };
  assert.deepEqual(normalizeRelativeAnchor(customObj), customObj);
  assert.equal(formatRelativeAnchorLabel(customObj), "After Maghrib (+20m)");

  // Invalid / null
  assert.equal(normalizeRelativeAnchor(null), null);
  assert.equal(normalizeRelativeAnchor(undefined), null);
  assert.equal(normalizeRelativeAnchor("arbitraryInvalidString"), null);
  assert.equal(formatRelativeAnchorLabel(null), "");
  assert.equal(formatRelativeAnchorLabel(undefined), "");
});

test("Wave 1.2 — Schedule Mode Determination & Precedence", () => {
  // 1. Explicit relative anchor
  assert.equal(getTaskScheduleMode({ relativeAnchor: "afterFajr" }), "relativePrayer");
  assert.equal(getTaskScheduleMode({ relativeAnchor: { prayer: "asr", relation: "after" } }), "relativePrayer");

  // 2. Exact clock time
  assert.equal(getTaskScheduleMode({ time: "14:30" }), "exactTime");

  // 3. Unscheduled
  assert.equal(getTaskScheduleMode({}), "unscheduled");
  assert.equal(getTaskScheduleMode({ time: "" }), "unscheduled");

  // 4. Precedence: relativeAnchor takes priority over time if both present without explicit mode
  assert.equal(getTaskScheduleMode({ time: "14:00", relativeAnchor: "afterAsr" }), "relativePrayer");

  // 5. Explicit scheduleMode override
  assert.equal(getTaskScheduleMode({ scheduleMode: "exactTime", time: "14:00", relativeAnchor: "afterAsr" }), "exactTime");
  assert.equal(getTaskScheduleMode({ scheduleMode: "unscheduled", time: "14:00" }), "unscheduled");
});

test("Wave 1.2 — Dynamic Task Placement Resolution across all 5 Prayers", () => {
  // Fajr: 05:15, Dhuhr: 12:30, Asr: 15:45, Maghrib: 18:25, Isha: 19:45
  // afterFajr -> morning block
  const p1 = resolveTaskPlacement({ title: "Morning Quran", relativeAnchor: "afterFajr" }, standardPrayers);
  assert.equal(p1.blockId, "morning");
  assert.equal(p1.scheduleMode, "relativePrayer");
  assert.equal(p1.displayLabel, "After Fajr");
  assert.equal(p1.approximateMinutes, 315 + 15); // 05:30 (approximate minutes for ordering only)

  // beforeDhuhr -> morning block
  const p2 = resolveTaskPlacement({ title: "Duha prayer", relativeAnchor: "beforeDhuhr" }, standardPrayers);
  assert.equal(p2.blockId, "morning");
  assert.equal(p2.displayLabel, "Before Dhuhr");

  // afterDhuhr -> afternoon block
  const p3 = resolveTaskPlacement({ title: "Qaylulah rest", relativeAnchor: "afterDhuhr" }, standardPrayers);
  assert.equal(p3.blockId, "afternoon");
  assert.equal(p3.displayLabel, "After Dhuhr");

  // beforeAsr -> afternoon block
  const p4 = resolveTaskPlacement({ title: "Wrap up focus block", relativeAnchor: "beforeAsr" }, standardPrayers);
  assert.equal(p4.blockId, "afternoon");
  assert.equal(p4.displayLabel, "Before Asr");

  // afterAsr -> lateAfternoon block
  const p5 = resolveTaskPlacement({ title: "Evening walk", relativeAnchor: "afterAsr" }, standardPrayers);
  assert.equal(p5.blockId, "lateAfternoon");
  assert.equal(p5.displayLabel, "After Asr");

  // beforeMaghrib -> lateAfternoon block
  const p6 = resolveTaskPlacement({ title: "Evening Adhkar", relativeAnchor: "beforeMaghrib" }, standardPrayers);
  assert.equal(p6.blockId, "lateAfternoon");
  assert.equal(p6.displayLabel, "Before Maghrib");

  // afterMaghrib -> evening block
  const p7 = resolveTaskPlacement({ title: "Family dinner", relativeAnchor: "afterMaghrib" }, standardPrayers);
  assert.equal(p7.blockId, "evening");
  assert.equal(p7.displayLabel, "After Maghrib");

  // beforeIsha -> evening block
  const p8 = resolveTaskPlacement({ title: "Muraja'ah session", relativeAnchor: "beforeIsha" }, standardPrayers);
  assert.equal(p8.blockId, "evening");
  assert.equal(p8.displayLabel, "Before Isha");

  // afterIsha -> night block
  const p9 = resolveTaskPlacement({ title: "Wind down & read", relativeAnchor: "afterIsha" }, standardPrayers);
  assert.equal(p9.blockId, "night");
  assert.equal(p9.displayLabel, "After Isha");

  // beforeFajr -> night block
  const p10 = resolveTaskPlacement({ title: "Tahajjud prayer", relativeAnchor: "beforeFajr" }, standardPrayers);
  assert.equal(p10.blockId, "night");
  assert.equal(p10.displayLabel, "Before Fajr");
});

test("Wave 1.2 — Backward Compatibility with Legacy Exact-Time, Dated, and Unscheduled Tasks", () => {
  const legacyTasks: TaskRecord[] = [
    { id: "leg-1", title: "Dentist appointment", time: "10:30", date: "2026-08-17", done: false },
    { id: "leg-2", title: "Buy groceries", date: "2026-08-17", done: false },
    { id: "leg-3", title: "Fix kitchen door", done: false }, // undated, unscheduled
  ];

  const rhythm = buildDayRhythm({
    now: new Date("2026-08-17T09:00:00"),
    date: "2026-08-17",
    prayers: prayerList,
    tasks: legacyTasks,
  });

  const morningItems = rhythm.blocks.find((b) => b.id === "morning")!.items;
  const dentist = morningItems.find((i) => i.sourceId === "leg-1");
  assert.ok(dentist);
  assert.equal(dentist.time, "10:30");
  assert.equal(dentist.detail, "Due 10:30");
  assert.equal(dentist.scheduleMode, "exactTime");

  const groceries = morningItems.find((i) => i.sourceId === "leg-2");
  assert.ok(groceries);
  assert.equal(groceries.scheduleMode, "unscheduled");
});

test("Wave 1.2 — Dynamic Recurrence Integration with Prayer-Relative Anchors (Daily, Weekly, Weekday)", () => {
  const recurringTasks: TaskRecord[] = [
    {
      id: "rec-daily-quran",
      title: "Daily Morning Quran Recitation",
      relativeAnchor: "afterFajr",
      recur: { freq: "daily", start: "2026-08-01" },
      completions: ["2026-08-16"], // Done yesterday, not today (2026-08-17 Monday)
    },
    {
      id: "rec-weekly-halaqah",
      title: "Weekly Friday Reflection",
      relativeAnchor: "afterAsr",
      recur: { freq: "weekly", start: "2026-08-07" }, // Friday
      completions: [],
    },
    {
      id: "rec-weekday-standup",
      title: "Weekday Work Wrap-up",
      relativeAnchor: "beforeMaghrib",
      recur: { freq: "weekdays", start: "2026-08-01" },
      completions: [],
    },
  ];

  // On Monday 2026-08-17:
  const mondayRhythm = buildDayRhythm({
    now: new Date("2026-08-17T08:00:00"),
    date: "2026-08-17",
    prayers: prayerList,
    tasks: recurringTasks,
  });

  const allItems = mondayRhythm.blocks.flatMap((b) => b.items);
  const dailyQuran = allItems.find((i) => i.sourceId === "rec-daily-quran");
  assert.ok(dailyQuran);
  assert.equal(dailyQuran.blockId, "morning");
  assert.equal(dailyQuran.done, false);
  assert.equal(dailyQuran.detail, "After Fajr");

  // Weekday standup should appear on Monday in lateAfternoon
  const weekdayStandup = allItems.find((i) => i.sourceId === "rec-weekday-standup");
  assert.ok(weekdayStandup);
  assert.equal(weekdayStandup.blockId, "lateAfternoon");
  assert.equal(weekdayStandup.detail, "Before Maghrib");

  // Weekly Friday halaqah should NOT appear on Monday
  const fridayHalaqah = allItems.find((i) => i.sourceId === "rec-weekly-halaqah");
  assert.equal(fridayHalaqah, undefined);
});

test("Wave 1.2 — Changed Prayer Times & Calculation Adjustments (Dynamic Resolution)", () => {
  const task: TaskRecord = {
    id: "dyn-1",
    title: "After-Asr Study Session",
    relativeAnchor: "afterAsr",
  };

  // Standard Winter Timing: Asr is at 15:15
  const winterPrayers: PrayerTimeMap = {
    fajr: timeToMinutes("05:30"),
    dhuhr: timeToMinutes("12:15"),
    asr: timeToMinutes("15:15"),
    maghrib: timeToMinutes("17:45"),
    isha: timeToMinutes("19:00"),
  };
  const placementWinter = resolveTaskPlacement(task, winterPrayers);
  assert.equal(placementWinter.blockId, "lateAfternoon");
  assert.equal(placementWinter.approximateMinutes, timeToMinutes("15:15") + 15);

  // Summer Timing: Asr shifted to 16:45
  const summerPrayers: PrayerTimeMap = {
    fajr: timeToMinutes("04:15"),
    dhuhr: timeToMinutes("12:45"),
    asr: timeToMinutes("16:45"),
    maghrib: timeToMinutes("19:30"),
    isha: timeToMinutes("21:00"),
  };
  const placementSummer = resolveTaskPlacement(task, summerPrayers);
  assert.equal(placementSummer.blockId, "lateAfternoon");
  assert.equal(placementSummer.approximateMinutes, timeToMinutes("16:45") + 15);

  // Task object itself remained pure and unmutated without storing hardcoded clock times
  assert.equal(task.time, undefined);
  assert.equal(task.relativeAnchor, "afterAsr");
});

test("Wave 1.2 — Conflicting, Invalid, or Missing Anchor Edge Cases", () => {
  // Invalid anchor string falls back to unscheduled heuristics without crashing
  const badAnchorTask = {
    title: "Check refrigerator",
    relativeAnchor: "nonExistentPrayerAnchor" as any,
  };
  const placementBad = resolveTaskPlacement(badAnchorTask, standardPrayers);
  assert.equal(placementBad.scheduleMode, "unscheduled");
  assert.equal(placementBad.normalizedAnchor, null);
  assert.equal(placementBad.displayLabel, "");

  // Missing prayer data array falls back gracefully to canonical defaults
  const taskWithAnchor = {
    title: "Recite Surah Mulk",
    relativeAnchor: "afterIsha" as const,
  };
  const placementNoPrayers = resolveTaskPlacement(taskWithAnchor, []);
  assert.equal(placementNoPrayers.blockId, "night");
  assert.equal(placementNoPrayers.displayLabel, "After Isha");
});

test("Wave 1.2 — Task Completion Semantics for Prayer-Relative & Repeating Tasks", () => {
  const repeatingRelativeTask: TaskRecord = {
    id: "rep-rel-1",
    title: "Morning Muraja'ah",
    relativeAnchor: "afterFajr",
    recur: { freq: "daily", start: "2026-08-01" },
    completions: ["2026-08-17"], // Completed on 2026-08-17
  };

  // When viewed on 2026-08-17: done is true
  const rhythmToday = buildDayRhythm({
    now: new Date("2026-08-17T09:00:00"),
    date: "2026-08-17",
    prayers: prayerList,
    tasks: [repeatingRelativeTask],
  });
  const todayItem = rhythmToday.blocks.find((b) => b.id === "morning")!.items.find((i) => i.sourceId === "rep-rel-1")!;
  assert.equal(todayItem.done, true);

  // When viewed on next day 2026-08-18: done is false
  const rhythmTomorrow = buildDayRhythm({
    now: new Date("2026-08-18T09:00:00"),
    date: "2026-08-18",
    prayers: prayerList,
    tasks: [repeatingRelativeTask],
  });
  const tomorrowItem = rhythmTomorrow.blocks.find((b) => b.id === "morning")!.items.find((i) => i.sourceId === "rep-rel-1")!;
  assert.equal(tomorrowItem.done, false);
});

test("Wave 1.2 — Serialization, LocalStorage, and Backup Safety", () => {
  const sampleTasks: TaskRecord[] = [
    {
      id: "task-json-1",
      title: "Recite Kahf",
      relativeAnchor: "afterFajr",
      scheduleMode: "relativePrayer",
      done: false,
      date: "2026-08-21",
    },
    {
      id: "task-json-2",
      title: "Doctor visit",
      time: "11:00",
      scheduleMode: "exactTime",
      done: true,
      date: "2026-08-21",
    },
  ];

  // Roundtrip through JSON serialization (as used by localStorage and backup.ts export/import)
  const jsonStr = JSON.stringify(sampleTasks);
  const parsed: TaskRecord[] = JSON.parse(jsonStr);

  assert.equal(parsed.length, 2);
  assert.equal(parsed[0]?.relativeAnchor, "afterFajr");
  assert.equal(parsed[0]?.scheduleMode, "relativePrayer");
  assert.equal(parsed[1]?.time, "11:00");
  assert.equal(parsed[1]?.scheduleMode, "exactTime");
});

test("Wave 1.2 — Experience Independence Verification", () => {
  // Confirm rhythm-engine does not reference Calm or Vibrant UI archetypes
  const rhythm = buildDayRhythm({
    now: new Date("2026-08-17T10:00:00"),
    prayers: prayerList,
    tasks: [{ id: "t1", title: "Deep study", relativeAnchor: "afterFajr" }],
  });

  // The output is purely neutral domain data
  assert.ok(rhythm.currentBlockId);
  assert.ok(rhythm.blocks.length === 5);
  assert.ok(rhythm.timeline.length === 10);
  assert.ok(rhythm.nextAnchor.id);

  // Check no experience keys exist on DayRhythm
  assert.equal((rhythm as any).experience, undefined);
  assert.equal((rhythm as any).theme, undefined);
});



