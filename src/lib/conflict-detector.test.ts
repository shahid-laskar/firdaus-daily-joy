import { describe, test } from "node:test";
import assert from "node:assert/strict";
import {
  detectScheduleConflicts,
  summarizeScheduleConflicts,
  type ConflictDetectorInput,
  type ConflictSignal,
} from "./conflict-detector";
import { type TaskRecord, type CalEventRecord } from "./daily-surface";
import { createRoutine } from "./routine-engine";
import { type FamilyMember } from "./family-model";

describe("Wave 2.0-C — Family Schedule Conflict Detection Engine", () => {
  const standardPrayers = [
    { id: "fajr", name: "Fajr", time: "05:15" },
    { id: "dhuhr", name: "Dhuhr", time: "12:30" },
    { id: "asr", name: "Asr", time: "15:45" },
    { id: "maghrib", name: "Maghrib", time: "18:30" },
    { id: "isha", name: "Isha", time: "19:45" },
  ];

  const testDate = "2026-08-18"; // Tuesday

  // ---------------------------------------------------------------------------
  // 1. EXACT-TIME CONFLICTS & OVERLAPS
  // ---------------------------------------------------------------------------
  test("Exact-Time Overlap — detects overlapping events and tasks", () => {
    const tasks: TaskRecord[] = [
      {
        id: "t_school_pickup",
        title: "School Pickup",
        date: testDate,
        time: "15:00",
        durationMinutes: 30, // 15:00 - 15:30
      },
    ];

    const events: CalEventRecord[] = [
      {
        id: "ev_dentist",
        title: "Dentist Appointment",
        date: testDate,
        time: "15:15",
        durationMinutes: 45, // 15:15 - 16:00 (overlaps with 15:00-15:30)
      },
    ];

    const conflicts = detectScheduleConflicts({
      date: testDate,
      tasks,
      events,
      prayers: standardPrayers,
    });

    const summary = summarizeScheduleConflicts(conflicts);
    assert.equal(summary.hasConflicts, true);
    assert.equal(summary.hardConflicts, 1);

    const hard = conflicts.find((c) => c.type === "hard_conflict")!;
    assert.ok(hard, "Hard conflict signal produced");
    assert.equal(hard.severity, "high");
    assert.equal(hard.suggestedAction, "reschedule");
    assert.ok(hard.explanation.includes("School Pickup"));
    assert.ok(hard.explanation.includes("Dentist Appointment"));
  });

  test("Non-Overlapping Exact Times — back-to-back commitments do not conflict", () => {
    const events: CalEventRecord[] = [
      {
        id: "ev_1",
        title: "Morning Meeting",
        date: testDate,
        time: "09:00",
        durationMinutes: 60, // 09:00 - 10:00
      },
      {
        id: "ev_2",
        title: "Client Follow-up",
        date: testDate,
        time: "10:00", // Exactly starts when previous ends
        durationMinutes: 30, // 10:00 - 10:30
      },
    ];

    const conflicts = detectScheduleConflicts({
      date: testDate,
      events,
      prayers: standardPrayers,
    });

    const hardConflicts = conflicts.filter((c) => c.type === "hard_conflict");
    assert.equal(hardConflicts.length, 0, "Back-to-back commitments do not trigger hard conflict");
  });

  test("Zero / Missing Duration — uses safe minimum commitment duration assumption", () => {
    const tasks: TaskRecord[] = [
      {
        id: "t_dropoff",
        title: "Drop off package",
        date: testDate,
        time: "14:00",
        // no duration specified -> defaults to 30 mins (14:00 - 14:30)
      },
    ];

    const events: CalEventRecord[] = [
      {
        id: "ev_call",
        title: "Team Standup",
        date: testDate,
        time: "14:15",
        // no duration specified -> defaults to 30 mins (14:15 - 14:45)
      },
    ];

    const conflicts = detectScheduleConflicts({
      date: testDate,
      tasks,
      events,
      prayers: standardPrayers,
    });

    const hardConflicts = conflicts.filter((c) => c.type === "hard_conflict");
    assert.equal(hardConflicts.length, 1, "Collision detected using safe default durations");
  });

  // ---------------------------------------------------------------------------
  // 2. PRAYER TIME INTERSECTIONS (SOFT CONFLICTS)
  // ---------------------------------------------------------------------------
  test("Prayer-Relative Soft Conflict — exact commitment during prayer window", () => {
    const events: CalEventRecord[] = [
      {
        id: "ev_sync",
        title: "Vendor Sync",
        date: testDate,
        time: "12:30", // Dhuhr is at 12:30
        durationMinutes: 30,
      },
    ];

    const conflicts = detectScheduleConflicts({
      date: testDate,
      events,
      prayers: standardPrayers,
    });

    const softPrayers = conflicts.filter((c) => c.type === "soft_conflict" && c.id.startsWith("conflict-prayer"));
    assert.equal(softPrayers.length, 1);
    assert.ok(softPrayers[0]?.explanation.includes("Dhuhr prayer time"));
    assert.equal(softPrayers[0]?.suggestedAction, "reschedule");
  });

  // ---------------------------------------------------------------------------
  // 3. OVERLOAD HEURISTICS
  // ---------------------------------------------------------------------------
  test("Overload Heuristics — excessive exact commitments in single rhythm block", () => {
    // 4 exact-time tasks in the Morning Block (05:15 to 12:30)
    const tasks: TaskRecord[] = [
      { id: "t1", title: "Task 1", date: testDate, time: "07:00", durationMinutes: 30 },
      { id: "t2", title: "Task 2", date: testDate, time: "08:00", durationMinutes: 30 },
      { id: "t3", title: "Task 3", date: testDate, time: "09:30", durationMinutes: 30 },
      { id: "t4", title: "Task 4", date: testDate, time: "11:00", durationMinutes: 30 },
    ];

    const conflicts = detectScheduleConflicts({
      date: testDate,
      tasks,
      prayers: standardPrayers,
    });

    const overloadSignal = conflicts.find((c) => c.type === "overload" && c.blockId === "morning");
    assert.ok(overloadSignal, "Overload signal produced for crowded morning block");
    assert.equal(overloadSignal.suggestedAction, "split");
    assert.ok(overloadSignal.explanation.includes("4 fixed-time commitments"));
  });

  test("Overload Heuristics — high density of prayer-relative commitments in one block", () => {
    // 4 prayer-relative tasks after Asr (lateAfternoon block)
    const tasks: TaskRecord[] = [
      { id: "pr1", title: "Quran Review", date: testDate, scheduleMode: "relativePrayer", relativeAnchor: "afterAsr" },
      { id: "pr2", title: "Evening Walk", date: testDate, scheduleMode: "relativePrayer", relativeAnchor: "afterAsr" },
      { id: "pr3", title: "Water Garden", date: testDate, scheduleMode: "relativePrayer", relativeAnchor: "afterAsr" },
      { id: "pr4", title: "Read Hadith", date: testDate, scheduleMode: "relativePrayer", relativeAnchor: "afterAsr" },
    ];

    const conflicts = detectScheduleConflicts({
      date: testDate,
      tasks,
      prayers: standardPrayers,
    });

    const softDensity = conflicts.find((c) => c.id.includes("overload-relative-lateAfternoon"));
    assert.ok(softDensity, "High density prayer-relative soft conflict signaled");
    assert.equal(softDensity.suggestedAction, "split");
  });

  test("Overload Heuristics — total daily scheduled burden exceeding limit", () => {
    // Total commitments exceeding 480 mins (8 hours)
    const events: CalEventRecord[] = [
      { id: "e1", title: "Work Shift 1", date: testDate, time: "08:00", durationMinutes: 300 }, // 5 hours
      { id: "e2", title: "Work Shift 2", date: testDate, time: "14:00", durationMinutes: 240 }, // 4 hours
    ];

    const conflicts = detectScheduleConflicts({
      date: testDate,
      events,
      prayers: standardPrayers,
    });

    const dailyOverload = conflicts.find((c) => c.id.startsWith("overload-daily"));
    assert.ok(dailyOverload, "Daily aggregate overload signaled");
    assert.equal(dailyOverload.severity, "high");
    assert.ok(dailyOverload.explanation.includes("exceed 9.0 hours"));
  });

  // ---------------------------------------------------------------------------
  // 4. ROUTINE CONFLICTS & STEP SCOPING
  // ---------------------------------------------------------------------------
  test("Routine Conflicts — member-specific steps vs shared routine isolation", () => {
    const routine = createRoutine({
      id: "rt_kitchen",
      name: "Evening Kitchen Reset",
      time: "19:00",
      steps: [
        { id: "s1", title: "Wipe counters", assignedTo: "mem_fatima", durationMinutes: 15 },
        { id: "s2", title: "Take out trash", assignedTo: "mem_yusuf", durationMinutes: 10 },
      ],
    });

    const yusufTask: TaskRecord = {
      id: "t_yusuf_study",
      title: "Yusuf Math Tutor Call",
      date: testDate,
      time: "19:00",
      durationMinutes: 30,
      assignedTo: "mem_yusuf",
    };

    // 1. For Yusuf: Routine step at 19:00 conflicts with tutor call at 19:00
    const yusufConflicts = detectScheduleConflicts({
      date: testDate,
      memberId: "mem_yusuf",
      tasks: [yusufTask],
      routines: [routine],
      prayers: standardPrayers,
    });

    const yusufHard = yusufConflicts.filter((c) => c.type === "hard_conflict");
    assert.equal(yusufHard.length, 1, "Yusuf has a conflict between his assigned step and his tutor call");

    // 2. For Fatima: Yusuf's tutor call does NOT create a conflict for Fatima
    const fatimaConflicts = detectScheduleConflicts({
      date: testDate,
      memberId: "mem_fatima",
      tasks: [yusufTask],
      routines: [routine],
      prayers: standardPrayers,
    });

    const fatimaHard = fatimaConflicts.filter((c) => c.type === "hard_conflict");
    assert.equal(fatimaHard.length, 0, "Fatima is isolated from Yusuf's personal task conflict");
  });

  // ---------------------------------------------------------------------------
  // 5. RECURRENCE EVALUATION
  // ---------------------------------------------------------------------------
  test("Recurrence — evaluated strictly against requested date instance", () => {
    // 2026-08-18 is Tuesday
    const weeklyTuesdayTask: TaskRecord = {
      id: "t_tuesday",
      title: "Tuesday Workshop",
      time: "10:00",
      durationMinutes: 60,
      recur: { freq: "weekly", start: "2026-08-18" },
    };

    const weeklyWednesdayTask: TaskRecord = {
      id: "t_wednesday",
      title: "Wednesday Lab",
      time: "10:00",
      durationMinutes: 60,
      recur: { freq: "weekly", start: "2026-08-19" },
    };

    const tuesdayEvent: CalEventRecord = {
      id: "ev_tue_meeting",
      title: "Tuesday Board Meeting",
      date: "2026-08-18",
      time: "10:30",
      durationMinutes: 60,
    };

    // 1. Evaluate on Tuesday 2026-08-18: Weekly Tuesday task conflicts with Tuesday meeting
    const tuesdayConflicts = detectScheduleConflicts({
      date: "2026-08-18",
      tasks: [weeklyTuesdayTask, weeklyWednesdayTask],
      events: [tuesdayEvent],
      prayers: standardPrayers,
    });

    const tueHard = tuesdayConflicts.filter((c) => c.type === "hard_conflict");
    assert.equal(tueHard.length, 1, "Conflicts on Tuesday for Tuesday recurring task");
    assert.ok(tueHard[0]?.explanation.includes("Tuesday Workshop"));

    // 2. Evaluate on Wednesday 2026-08-19: Tuesday task is NOT due, so no conflict with Tuesday meeting
    const wednesdayConflicts = detectScheduleConflicts({
      date: "2026-08-19",
      tasks: [weeklyTuesdayTask, weeklyWednesdayTask],
      events: [tuesdayEvent],
      prayers: standardPrayers,
    });

    const wedHard = wednesdayConflicts.filter((c) => c.type === "hard_conflict");
    assert.equal(wedHard.length, 0, "No conflict on Wednesday since date-filtered items do not overlap");
  });

  // ---------------------------------------------------------------------------
  // 6. MEMBER ISOLATION & HOUSEHOLD SCOPING
  // ---------------------------------------------------------------------------
  test("Member Isolation — commitments between different members do not collide", () => {
    const ameenTask: TaskRecord = {
      id: "t_ameen",
      title: "Ameen Work Call",
      date: testDate,
      time: "14:00",
      durationMinutes: 60,
      assignedTo: "mem_ameen",
    };

    const fatimaTask: TaskRecord = {
      id: "t_fatima",
      title: "Fatima Doctor Visit",
      date: testDate,
      time: "14:00",
      durationMinutes: 60,
      assignedTo: "mem_fatima",
    };

    // Ameen scope
    const ameenConflicts = detectScheduleConflicts({
      date: testDate,
      memberId: "mem_ameen",
      tasks: [ameenTask, fatimaTask],
      prayers: standardPrayers,
    });

    assert.equal(ameenConflicts.filter((c) => c.type === "hard_conflict").length, 0, "Ameen scope ignores Fatima task");

    // Fatima scope
    const fatimaConflicts = detectScheduleConflicts({
      date: testDate,
      memberId: "mem_fatima",
      tasks: [ameenTask, fatimaTask],
      prayers: standardPrayers,
    });

    assert.equal(fatimaConflicts.filter((c) => c.type === "hard_conflict").length, 0, "Fatima scope ignores Ameen task");
  });

  // ---------------------------------------------------------------------------
  // 7. CHANGED PRAYER TIMES & DYNAMIC RESOLUTION
  // ---------------------------------------------------------------------------
  test("Changed Prayer Times — dynamic prayer window shift adjustments", () => {
    const winterPrayers = [
      { id: "fajr", name: "Fajr", time: "06:00" },
      { id: "dhuhr", name: "Dhuhr", time: "12:15" },
      { id: "asr", name: "Asr", time: "15:15" },
      { id: "maghrib", name: "Maghrib", time: "17:45" },
      { id: "isha", name: "Isha", time: "19:00" },
    ];

    const meetingAt545: CalEventRecord = {
      id: "ev_sunset_meeting",
      title: "Sunset Project Meeting",
      date: testDate,
      time: "17:45",
      durationMinutes: 30,
    };

    // Under standard prayers (Maghrib at 18:30): 17:45 does not collide with Maghrib prayer window
    const standardConflicts = detectScheduleConflicts({
      date: testDate,
      events: [meetingAt545],
      prayers: standardPrayers,
    });
    assert.equal(
      standardConflicts.some((c) => c.id.startsWith("conflict-prayer-maghrib")),
      false,
      "No Maghrib collision under standard prayer times"
    );

    // Under winter prayers (Maghrib at 17:45): 17:45 directly collides with Maghrib prayer window
    const winterConflicts = detectScheduleConflicts({
      date: testDate,
      events: [meetingAt545],
      prayers: winterPrayers,
    });
    assert.ok(
      winterConflicts.some((c) => c.id.startsWith("conflict-prayer-maghrib")),
      "Maghrib collision detected when prayer time shifts to 17:45"
    );
  });

  // ---------------------------------------------------------------------------
  // 8. MIDNIGHT & NIGHT BLOCK BOUNDARIES
  // ---------------------------------------------------------------------------
  test("Midnight Boundaries — items spanning night block and late hours", () => {
    const nightTask1: TaskRecord = {
      id: "t_night1",
      title: "Late Night Code Review",
      date: testDate,
      time: "23:30",
      durationMinutes: 45, // 23:30 - 00:15
    };

    const nightTask2: TaskRecord = {
      id: "t_night2",
      title: "Server Deployment",
      date: testDate,
      time: "23:45",
      durationMinutes: 30, // 23:45 - 00:15 (overlaps)
    };

    const conflicts = detectScheduleConflicts({
      date: testDate,
      tasks: [nightTask1, nightTask2],
      prayers: standardPrayers,
    });

    const hardConflicts = conflicts.filter((c) => c.type === "hard_conflict");
    assert.equal(hardConflicts.length, 1, "Midnight crossing collision detected properly");
  });

  // ---------------------------------------------------------------------------
  // 9. EMPTY SCHEDULE & DETERMINISM
  // ---------------------------------------------------------------------------
  test("Empty Schedule — gracefully returns empty conflicts array", () => {
    const conflicts = detectScheduleConflicts({
      date: testDate,
      tasks: [],
      events: [],
      routines: [],
      prayers: standardPrayers,
    });

    assert.deepEqual(conflicts, []);
    const summary = summarizeScheduleConflicts(conflicts);
    assert.equal(summary.hasConflicts, false);
    assert.equal(summary.totalConflicts, 0);
  });

  test("Determinism — repeated runs produce exact identical signals and ordering", () => {
    const input: ConflictDetectorInput = {
      date: testDate,
      tasks: [
        { id: "t1", title: "Task 1", date: testDate, time: "10:00", durationMinutes: 45 },
        { id: "t2", title: "Task 2", date: testDate, time: "10:15", durationMinutes: 30 },
        { id: "t3", title: "Task 3", date: testDate, time: "12:30", durationMinutes: 20 },
      ],
      events: [
        { id: "e1", title: "Event 1", date: testDate, time: "10:30", durationMinutes: 30 },
      ],
      prayers: standardPrayers,
    };

    const run1 = detectScheduleConflicts(input);
    const run2 = detectScheduleConflicts(input);
    const run3 = detectScheduleConflicts(input);

    assert.deepEqual(run1, run2);
    assert.deepEqual(run2, run3);
  });
});
