import { describe, test } from "node:test";
import assert from "node:assert/strict";
import {
  calculateHouseholdWorkload,
  generateWorkloadInsights,
  filterWorkloadForChild,
  WORKLOAD_HEAVIER_RATIO,
  WORKLOAD_HEAVIER_MIN_DELTA,
  WORKLOAD_LIGHT_RATIO,
  WORKLOAD_LIGHT_MIN_DELTA,
  type WorkloadCalculationInput,
} from "./workload-intelligence";
import { type FamilyMember } from "./family-model";
import { type TaskRecord, type CalEventRecord } from "./daily-surface";
import { createRoutine } from "./routine-engine";
import { getWeekRange, isoOffset } from "./intelligence";

describe("Wave 2.0-D — Household Workload & Fairness Intelligence", () => {
  const testDate = "2026-08-18"; // Tuesday
  const currentWeek = getWeekRange(testDate); // 7-day range ending 2026-08-18

  const sampleMembers: FamilyMember[] = [
    { id: "mem_ameen", name: "Ameen", role: "admin", chores: [] },
    { id: "mem_fatima", name: "Fatima", role: "member", chores: [] },
    { id: "mem_yusuf", name: "Yusuf", role: "child", age: "8", chores: [] },
  ];

  // ---------------------------------------------------------------------------
  // 1. ONE MEMBER & MULTIPLE MEMBERS
  // ---------------------------------------------------------------------------
  test("Workload — single member vs multiple members baseline", () => {
    const singleMember: FamilyMember[] = [
      { id: "mem_solo", name: "Zaid", role: "admin", chores: [] },
    ];

    const tasks: TaskRecord[] = [
      { id: "t1", title: "Review taxes", date: "2026-08-18", assignedTo: "mem_solo", durationMinutes: 60 },
      { id: "t2", title: "Fix sink", date: "2026-08-17", assignedTo: "mem_solo", durationMinutes: 45 },
    ];

    const summarySingle = calculateHouseholdWorkload({
      dates: currentWeek,
      members: singleMember,
      tasks,
      todayIso: testDate,
    });

    assert.equal(summarySingle.members.length, 1);
    assert.equal(summarySingle.members[0]?.assignedCount, 2);
    assert.equal(summarySingle.members[0]?.assignedMinutesKnown, 105);
    assert.equal(summarySingle.fairness.status, "balanced");

    // Multiple members
    const summaryMulti = calculateHouseholdWorkload({
      dates: currentWeek,
      members: sampleMembers,
      tasks: [],
      todayIso: testDate,
    });

    assert.equal(summaryMulti.members.length, 3);
    assert.equal(summaryMulti.householdTotal.totalAssigned, 0);
    assert.equal(summaryMulti.fairness.status, "light");
  });

  // ---------------------------------------------------------------------------
  // 2. ASSIGNED TASKS & UNASSIGNED HOUSEHOLD TASKS
  // ---------------------------------------------------------------------------
  test("Responsibility Scoping — assigned tasks vs household unassigned tasks", () => {
    const tasks: TaskRecord[] = [
      { id: "t_ameen", title: "Car maintenance", date: "2026-08-18", assignedTo: "mem_ameen", durationMinutes: 90 },
      { id: "t_fatima", title: "Grocery restock", date: "2026-08-18", assignedTo: "mem_fatima", durationMinutes: 60 },
      { id: "t_unassigned", title: "Clean living room window", date: "2026-08-18", durationMinutes: 45 }, // unassigned
    ];

    const summary = calculateHouseholdWorkload({
      dates: currentWeek,
      members: sampleMembers,
      tasks,
      todayIso: testDate,
    });

    const ameen = summary.members.find((m) => m.memberId === "mem_ameen")!;
    const fatima = summary.members.find((m) => m.memberId === "mem_fatima")!;
    const yusuf = summary.members.find((m) => m.memberId === "mem_yusuf")!;

    assert.equal(ameen.assignedCount, 1);
    assert.equal(ameen.assignedMinutesKnown, 90);
    assert.equal(fatima.assignedCount, 1);
    assert.equal(fatima.assignedMinutesKnown, 60);
    assert.equal(yusuf.assignedCount, 0);

    // Household total includes unassigned tasks
    assert.equal(summary.householdTotal.unassignedCount, 1);
    assert.equal(summary.householdTotal.unassignedMinutesKnown, 45);
    assert.equal(summary.householdTotal.totalAssigned, 3);
  });

  // ---------------------------------------------------------------------------
  // 3. RECURRING TASKS EVALUATION
  // ---------------------------------------------------------------------------
  test("Recurring Tasks — evaluated across date instances in the period", () => {
    // Daily task: occurs 7 times in currentWeek
    const dailyTask: TaskRecord = {
      id: "t_daily",
      title: "Daily Adhkar & Journal",
      assignedTo: "mem_fatima",
      recur: { freq: "daily", start: "2026-08-01" },
      completions: ["2026-08-12", "2026-08-13", "2026-08-14"], // 3 completed in week
      durationMinutes: 20,
    };

    const summary = calculateHouseholdWorkload({
      dates: currentWeek,
      members: sampleMembers,
      tasks: [dailyTask],
      todayIso: testDate,
    });

    const fatima = summary.members.find((m) => m.memberId === "mem_fatima")!;
    assert.equal(fatima.assignedTasksCount, 7, "Daily recurring task counted for each day in period");
    assert.equal(fatima.completedCount, 3, "Accurately counted completed instances in period");
    assert.equal(fatima.assignedMinutesKnown, 140, "7 instances * 20 minutes = 140 minutes");
  });

  // ---------------------------------------------------------------------------
  // 4. ROUTINES & STEP-LEVEL ASSIGNMENTS
  // ---------------------------------------------------------------------------
  test("Routines — step-level attribution without whole-routine leakage", () => {
    const routine = createRoutine({
      id: "rt_kitchen",
      name: "Evening Kitchen Reset",
      steps: [
        { id: "s1", title: "Wipe dining table", assignedTo: "mem_yusuf", durationMinutes: 10 },
        { id: "s2", title: "Load dishwasher", assignedTo: "mem_fatima", durationMinutes: 15 },
        { id: "s3", title: "Clean stovetop", assignedTo: "mem_fatima", durationMinutes: 15 },
        { id: "s4", title: "Take out trash", durationMinutes: 5 }, // unassigned step
      ],
    });

    const summary = calculateHouseholdWorkload({
      dates: ["2026-08-18"], // 1 day
      members: sampleMembers,
      routines: [routine],
      todayIso: testDate,
    });

    const ameen = summary.members.find((m) => m.memberId === "mem_ameen")!;
    const fatima = summary.members.find((m) => m.memberId === "mem_fatima")!;
    const yusuf = summary.members.find((m) => m.memberId === "mem_yusuf")!;

    assert.equal(ameen.routineStepCount, 0, "Ameen has 0 steps in this routine");
    assert.equal(fatima.routineStepCount, 2, "Fatima has 2 assigned steps");
    assert.equal(fatima.assignedMinutesKnown, 30);
    assert.equal(yusuf.routineStepCount, 1, "Yusuf has 1 assigned step");
    assert.equal(yusuf.assignedMinutesKnown, 10);

    assert.equal(summary.householdTotal.totalRoutineSteps, 3);
    assert.equal(summary.householdTotal.unassignedCount, 1, "Unassigned step counted in household aggregate");
  });

  // ---------------------------------------------------------------------------
  // 5. MISSING VS KNOWN DURATION
  // ---------------------------------------------------------------------------
  test("Duration Handling — conservative precision without false fabricated minutes", () => {
    const tasks: TaskRecord[] = [
      { id: "t1", title: "Dentist with explicit duration", date: "2026-08-18", assignedTo: "mem_ameen", durationMinutes: 45 },
      { id: "t2", title: "Unmeasured quick errand", date: "2026-08-18", assignedTo: "mem_ameen" }, // no duration
    ];

    const summary = calculateHouseholdWorkload({
      dates: ["2026-08-18"],
      members: [sampleMembers[0]!],
      tasks,
      todayIso: testDate,
    });

    const ameen = summary.members[0]!;
    assert.equal(ameen.assignedCount, 2);
    assert.equal(ameen.assignedMinutesKnown, 45, "Only explicitly known duration accumulated");
    assert.equal(ameen.hasUnmeasuredDuration, true, "Flags that unmeasured commitments exist");
    assert.ok(summary.methodology.includes("baseline responsibility signal"));
  });

  // ---------------------------------------------------------------------------
  // 6. COMPLETED VS OVERDUE RESPONSIBILITIES
  // ---------------------------------------------------------------------------
  test("Completion & Overdue Metrics — accurate counting of overdue tasks", () => {
    const tasks: TaskRecord[] = [
      { id: "t_done", title: "Completed task", date: "2026-08-17", assignedTo: "mem_ameen", done: true },
      { id: "t_overdue", title: "Overdue task from yesterday", date: "2026-08-17", assignedTo: "mem_ameen", done: false },
      { id: "t_today", title: "Task due today", date: "2026-08-18", assignedTo: "mem_ameen", done: false },
    ];

    const summary = calculateHouseholdWorkload({
      dates: currentWeek,
      members: [sampleMembers[0]!],
      tasks,
      todayIso: "2026-08-18",
    });

    const ameen = summary.members[0]!;
    assert.equal(ameen.assignedCount, 3);
    assert.equal(ameen.completedCount, 1);
    assert.equal(ameen.overdueCount, 1, "Only past due unfinished task flagged as overdue");
    assert.equal(summary.householdTotal.totalOverdue, 1);
  });

  // ---------------------------------------------------------------------------
  // 7. FAIRNESS SKEW DETECTION & THRESHOLDS
  // ---------------------------------------------------------------------------
  test("Fairness Signal — identifies skewed load without ranking or scores", () => {
    // Ameen has 8 tasks, Fatima has 1 task
    const tasks: TaskRecord[] = [
      ...Array.from({ length: 8 }).map((_, i) => ({
        id: `t_am_${i}`,
        title: `Ameen Project ${i}`,
        date: "2026-08-18",
        assignedTo: "mem_ameen",
      })),
      { id: "t_fat_1", title: "Fatima Task", date: "2026-08-18", assignedTo: "mem_fatima" },
    ];

    const summary = calculateHouseholdWorkload({
      dates: currentWeek,
      members: sampleMembers,
      tasks,
      todayIso: testDate,
    });

    assert.equal(summary.fairness.status, "skewed");
    assert.ok(summary.fairness.headline.includes("Ameen is carrying more of the load"));
    assert.equal(summary.fairness.heaviestMemberId, "mem_ameen");

    // Verify no comparative ranking array or leaderboard exists
    assert.equal("leaderboard" in summary, false);
    assert.equal("ranking" in summary, false);
    assert.equal("scores" in summary, false);
  });

  test("Workload Thresholds — verifies WORKLOAD_HEAVIER_RATIO and WORKLOAD_HEAVIER_MIN_DELTA behavior", () => {
    assert.equal(WORKLOAD_HEAVIER_RATIO, 1.4);
    assert.equal(WORKLOAD_HEAVIER_MIN_DELTA, 3);
    assert.equal(WORKLOAD_LIGHT_RATIO, 0.6);
    assert.equal(WORKLOAD_LIGHT_MIN_DELTA, 3);

    // Case A: Ameen has 8, Fatima has 2. Avg = 5.
    // 8 > 5 * 1.4 (= 7.0) AND 8 - 5 >= 3 -> Heavier
    const tasksHeavier: TaskRecord[] = [
      ...Array.from({ length: 8 }).map((_, i) => ({
        id: `t_h_am_${i}`,
        title: `Task A ${i}`,
        date: "2026-08-18",
        assignedTo: "mem_ameen",
      })),
      ...Array.from({ length: 2 }).map((_, i) => ({
        id: `t_h_fat_${i}`,
        title: `Task F ${i}`,
        date: "2026-08-18",
        assignedTo: "mem_fatima",
      })),
    ];
    const summaryHeavier = calculateHouseholdWorkload({
      dates: currentWeek,
      members: [sampleMembers[0]!, sampleMembers[1]!], // 2 adults
      tasks: tasksHeavier,
      todayIso: testDate,
    });
    assert.equal(summaryHeavier.members.find((m) => m.memberId === "mem_ameen")?.qualitativeLoad, "heavier");
    assert.equal(summaryHeavier.members.find((m) => m.memberId === "mem_fatima")?.qualitativeLoad, "light");

    // Case B: Ameen has 5, Fatima has 2. Avg = 3.5.
    // 5 > 3.5 * 1.4 (= 4.9), BUT delta 5 - 3.5 = 1.5 (< 3 min delta) -> Balanced
    const tasksBelowMinDelta: TaskRecord[] = [
      ...Array.from({ length: 5 }).map((_, i) => ({
        id: `t_b_am_${i}`,
        title: `Task B ${i}`,
        date: "2026-08-18",
        assignedTo: "mem_ameen",
      })),
      ...Array.from({ length: 2 }).map((_, i) => ({
        id: `t_b_fat_${i}`,
        title: `Task BF ${i}`,
        date: "2026-08-18",
        assignedTo: "mem_fatima",
      })),
    ];
    const summaryBelowDelta = calculateHouseholdWorkload({
      dates: currentWeek,
      members: [sampleMembers[0]!, sampleMembers[1]!],
      tasks: tasksBelowMinDelta,
      todayIso: testDate,
    });
    assert.equal(summaryBelowDelta.members.find((m) => m.memberId === "mem_ameen")?.qualitativeLoad, "balanced");
  });

  // ---------------------------------------------------------------------------
  // 8. PRIVACY & CHILD FILTERING
  // ---------------------------------------------------------------------------
  test("Child Privacy — sanitized workload view for children completely masks adult totals", () => {
    const tasks: TaskRecord[] = [
      { id: "t1", title: "Adult Financial Audit", date: "2026-08-18", assignedTo: "mem_ameen", durationMinutes: 120 },
      { id: "t2", title: "Adult Overdue Task", date: "2026-08-17", assignedTo: "mem_ameen", done: false, durationMinutes: 60 },
      { id: "t3", title: "Fatima Project", date: "2026-08-18", assignedTo: "mem_fatima", durationMinutes: 45 },
      { id: "t4", title: "Yusuf Quran Revision", date: "2026-08-18", assignedTo: "mem_yusuf", durationMinutes: 20 },
    ];

    const summary = calculateHouseholdWorkload({
      dates: currentWeek,
      members: sampleMembers,
      tasks,
      todayIso: testDate,
    });

    // Verify adult summary has skewed state and adult totals
    assert.equal(summary.householdTotal.totalAssigned, 4);
    assert.equal(summary.householdTotal.totalOverdue, 1);
    assert.equal(summary.householdTotal.totalAssignedMinutesKnown, 245);

    // Apply child filtering
    const childSafeSummary = filterWorkloadForChild(summary, "mem_yusuf");
    const adult1InChildView = childSafeSummary.members.find((m) => m.memberId === "mem_ameen")!;
    const adult2InChildView = childSafeSummary.members.find((m) => m.memberId === "mem_fatima")!;
    const childInChildView = childSafeSummary.members.find((m) => m.memberId === "mem_yusuf")!;

    // Adult individual metrics are completely masked
    assert.equal(adult1InChildView.assignedCount, 0, "Adult assigned count is 0");
    assert.equal(adult1InChildView.assignedTasksCount, 0, "Adult detailed task count sanitized");
    assert.equal(adult1InChildView.assignedMinutesKnown, 0, "Adult duration sanitized");
    assert.equal(adult1InChildView.overdueCount, 0, "Adult overdue sanitized");
    assert.equal(adult1InChildView.qualitativeLoad, "balanced");

    assert.equal(adult2InChildView.assignedCount, 0);
    assert.equal(adult2InChildView.assignedTasksCount, 0);
    assert.equal(adult2InChildView.assignedMinutesKnown, 0);

    // Child sees their own responsibility
    assert.equal(childInChildView.assignedCount, 1, "Child sees their own responsibility");
    assert.equal(childInChildView.assignedMinutesKnown, 20);
    assert.ok(childSafeSummary.fairness.headline.includes("Great progress, Yusuf"));
    assert.equal(childSafeSummary.fairness.status, "balanced", "Fairness disparities not exposed to child");

    // Household aggregates match ONLY the child perspective (adult workload is not inferable)
    assert.equal(childSafeSummary.householdTotal.totalAssigned, 1, "Household total assigned equals child count only");
    assert.equal(childSafeSummary.householdTotal.totalAssignedMinutesKnown, 20, "Household minutes equals child minutes only");
    assert.equal(childSafeSummary.householdTotal.totalOverdue, 0, "Adult overdue items masked from household total");
    assert.equal(childSafeSummary.householdTotal.unassignedCount, 0, "Unassigned count masked");
  });

  // ---------------------------------------------------------------------------
  // 9. WEEKLY REVIEW INTEGRATION (INSIGHTS GENERATION)
  // ---------------------------------------------------------------------------
  test("Weekly Review Insights — generates structured insights for review surface", () => {
    const tasks: TaskRecord[] = [
      { id: "t1", title: "Task 1", date: "2026-08-18", assignedTo: "mem_ameen" },
      { id: "t2", title: "Task 2", date: "2026-08-18", assignedTo: "mem_fatima" },
    ];

    const summary = calculateHouseholdWorkload({
      dates: currentWeek,
      members: sampleMembers,
      tasks,
      todayIso: testDate,
    });

    const insights = generateWorkloadInsights(summary);
    assert.ok(insights.length > 0, "Produces structured Insight items");
    assert.ok(insights.some((i) => i.id.startsWith("workload-fairness")));
    assert.ok(insights.every((i) => typeof i.title === "string" && typeof i.explanation === "string"));
  });

  // ---------------------------------------------------------------------------
  // 10. DETERMINISTIC REPEATABILITY
  // ---------------------------------------------------------------------------
  test("Determinism — repeated runs yield identical outputs", () => {
    const input: WorkloadCalculationInput = {
      dates: currentWeek,
      members: sampleMembers,
      tasks: [
        { id: "t1", title: "Task 1", date: "2026-08-18", assignedTo: "mem_ameen", durationMinutes: 30 },
        { id: "t2", title: "Task 2", date: "2026-08-17", assignedTo: "mem_fatima", durationMinutes: 45 },
      ],
      todayIso: testDate,
    };

    const run1 = calculateHouseholdWorkload(input);
    const run2 = calculateHouseholdWorkload(input);

    assert.deepEqual(run1, run2);
  });
});
