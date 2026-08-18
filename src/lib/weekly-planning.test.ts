import { describe, test } from "node:test";
import assert from "node:assert/strict";

import {
  getPlanningWeekRange,
  navigatePlanningWeek,
  formatWeekRangeTitle,
  getDayNameShort,
  getDayLetter,
  createWeeklyProposal,
  stageTaskAssignment,
  stageTaskSchedule,
  stageNewTask,
  stageRemoveNewTask,
  stageRoutineStepAssignment,
  stageRoutineOwner,
  stageMeal,
  hasStagedChanges,
  countStagedChanges,
  buildWeeklyPlan,
  commitWeeklyPlanProposal,
  getWeeklyPlanningStepSummary,
  type WeeklyPlanInput,
  type WeeklyPlanProposal,
} from "./weekly-planning";
import type { TaskRecord, CalEventRecord } from "./daily-surface";
import type { Routine } from "./routine-engine";
import type { FamilyMember } from "./family-model";

const MOCK_PRAYERS = [
  { id: "fajr", name: "Fajr", time: "05:00" },
  { id: "dhuhr", name: "Dhuhr", time: "12:30" },
  { id: "asr", name: "Asr", time: "15:45" },
  { id: "maghrib", name: "Maghrib", time: "18:30" },
  { id: "isha", name: "Isha", time: "19:45" },
];

const MOCK_FAMILY: FamilyMember[] = [
  { id: "parent-1", name: "Rashid", role: "admin", chores: [] },
  { id: "parent-2", name: "Amina", role: "parent", chores: [] },
  { id: "child-1", name: "Zayd", role: "child", age: "8", chores: [] },
];

describe("Wave 2.0-E: Family Weekly Planning Engine", () => {
  // ---------------------------------------------------------------------------
  // 1. Week Definition & Boundaries
  // ---------------------------------------------------------------------------
  describe("Week Definition & Boundaries", () => {
    test("getPlanningWeekRange returns 7 days starting on Monday by default", () => {
      // 2026-08-18 is Tuesday
      const week = getPlanningWeekRange("2026-08-18", "monday");
      assert.equal(week.length, 7);
      assert.equal(week[0], "2026-08-17"); // Monday
      assert.equal(week[1], "2026-08-18"); // Tuesday
      assert.equal(week[6], "2026-08-23"); // Sunday
    });

    test("getPlanningWeekRange supports Sunday start", () => {
      const week = getPlanningWeekRange("2026-08-18", "sunday");
      assert.equal(week.length, 7);
      assert.equal(week[0], "2026-08-16"); // Sunday
      assert.equal(week[2], "2026-08-18"); // Tuesday
      assert.equal(week[6], "2026-08-22"); // Saturday
    });

    test("navigatePlanningWeek moves forward and backward by whole weeks", () => {
      const currentWeek = getPlanningWeekRange("2026-08-18", "monday");
      const nextWeek = navigatePlanningWeek("2026-08-18", 1, "monday");
      const prevWeek = navigatePlanningWeek("2026-08-18", -1, "monday");

      assert.equal(nextWeek[0], "2026-08-24");
      assert.equal(nextWeek[6], "2026-08-30");

      assert.equal(prevWeek[0], "2026-08-10");
      assert.equal(prevWeek[6], "2026-08-16");
    });

    test("formatWeekRangeTitle formats human friendly title across months and same month", () => {
      const sameMonth = formatWeekRangeTitle("2026-08-17", "2026-08-23");
      assert.equal(sameMonth, "Aug 17 – 23, 2026");

      const diffMonth = formatWeekRangeTitle("2026-08-31", "2026-09-06");
      assert.equal(diffMonth, "Aug 31 – Sep 6, 2026");
    });

    test("getDayNameShort and getDayLetter compute correct timezone-safe values", () => {
      assert.equal(getDayNameShort("2026-08-17"), "Mon");
      assert.equal(getDayLetter("2026-08-17"), "M");
      assert.equal(getDayNameShort("2026-08-21"), "Fri");
      assert.equal(getDayLetter("2026-08-21"), "F");
      assert.equal(getDayNameShort("2026-08-23"), "Sun");
      assert.equal(getDayLetter("2026-08-23"), "S");
    });
  });

  // ---------------------------------------------------------------------------
  // 2. Proposal / Draft Model
  // ---------------------------------------------------------------------------
  describe("Proposal / Draft Model", () => {
    test("createWeeklyProposal initializes empty draft", () => {
      const proposal = createWeeklyProposal("2026-08-17");
      assert.equal(proposal.weekStartDate, "2026-08-17");
      assert.equal(hasStagedChanges(proposal), false);
      assert.equal(countStagedChanges(proposal), 0);
    });

    test("stageTaskAssignment stages assignment for existing or new tasks", () => {
      let proposal = createWeeklyProposal("2026-08-17");
      proposal = stageTaskAssignment(proposal, "t-1", "parent-1");

      assert.equal(hasStagedChanges(proposal), true);
      assert.equal(proposal.taskUpdates["t-1"]?.assignedTo, "parent-1");
      assert.equal(countStagedChanges(proposal), 1);
    });

    test("stageTaskSchedule stages date, time, and prayer anchors", () => {
      let proposal = createWeeklyProposal("2026-08-17");
      proposal = stageTaskSchedule(proposal, "t-1", {
        date: "2026-08-19",
        relativeAnchor: "afterAsr",
        scheduleMode: "relativePrayer",
      });

      assert.equal(proposal.taskUpdates["t-1"]?.date, "2026-08-19");
      assert.equal(proposal.taskUpdates["t-1"]?.relativeAnchor, "afterAsr");
      assert.equal(proposal.taskUpdates["t-1"]?.scheduleMode, "relativePrayer");
    });

    test("stageNewTask and stageRemoveNewTask manage draft new tasks", () => {
      let proposal = createWeeklyProposal("2026-08-17");
      proposal = stageNewTask(proposal, {
        id: "draft-task-1",
        title: "Buy groceries for weekend",
        date: "2026-08-21",
        assignedTo: "parent-2",
      });

      assert.equal(proposal.newTasks.length, 1);
      assert.equal(proposal.newTasks[0]?.title, "Buy groceries for weekend");
      assert.equal(countStagedChanges(proposal), 1);

      proposal = stageRemoveNewTask(proposal, "draft-task-1");
      assert.equal(proposal.newTasks.length, 0);
      assert.equal(hasStagedChanges(proposal), false);
    });

    test("stageRoutineStepAssignment and stageRoutineOwner stage routine changes", () => {
      let proposal = createWeeklyProposal("2026-08-17");
      proposal = stageRoutineOwner(proposal, "r-1", "parent-1");
      proposal = stageRoutineStepAssignment(proposal, "r-1", "step-2", "child-1");

      assert.equal(proposal.routineUpdates["r-1"]?.assignedTo, "parent-1");
      assert.equal(proposal.routineUpdates["r-1"]?.steps?.["step-2"]?.assignedTo, "child-1");
      assert.equal(countStagedChanges(proposal), 2);
    });

    test("stageMeal stages meal updates for slot", () => {
      let proposal = createWeeklyProposal("2026-08-17");
      proposal = stageMeal(proposal, "Tue-Dinner", "Lamb Tagine");

      assert.equal(proposal.mealUpdates["Tue-Dinner"], "Lamb Tagine");
      assert.equal(countStagedChanges(proposal), 1);
    });
  });

  // ---------------------------------------------------------------------------
  // 3. Weekly Plan Synthesis & Rhythm Integration
  // ---------------------------------------------------------------------------
  describe("Weekly Plan Synthesis & Rhythm Integration", () => {
    test("buildWeeklyPlan maps tasks, routines, and events into canonical rhythm blocks across 7 days", () => {
      const tasks: TaskRecord[] = [
        {
          id: "t-1",
          title: "Morning Qur'an recitation",
          date: "2026-08-18",
          time: "06:00",
          scheduleMode: "exactTime",
          assignedTo: "parent-1",
        },
        {
          id: "t-2",
          title: "Math revision with Zayd",
          date: "2026-08-18",
          relativeAnchor: "afterAsr",
          scheduleMode: "relativePrayer",
          assignedTo: "parent-2",
        },
      ];

      const events: CalEventRecord[] = [
        {
          id: "ev-1",
          title: "Dentist Appointment",
          date: "2026-08-18",
          time: "14:00",
          durationMinutes: 45,
          assignedTo: "parent-1",
        },
      ];

      const routines: Routine[] = [
        {
          id: "r-morning",
          name: "School Morning Routine",
          enabled: true,
          recur: { freq: "daily", start: "2026-08-17" },
          time: "06:30",
          steps: [
            { id: "s-1", title: "Fajr & Dua", order: 1, durationMinutes: 15, assignedTo: "parent-1" },
            { id: "s-2", title: "Pack backpack", order: 2, durationMinutes: 10, assignedTo: "child-1" },
          ],
        },
      ];

      const meals = {
        "Tue-Dinner": "Vegetable Biryani",
      };

      const plan = buildWeeklyPlan({
        dates: ["2026-08-17", "2026-08-18", "2026-08-19", "2026-08-20", "2026-08-21", "2026-08-22", "2026-08-23"],
        familyMembers: MOCK_FAMILY,
        tasks,
        events,
        routines,
        meals,
        prayers: MOCK_PRAYERS,
        todayIso: "2026-08-18",
      });

      assert.equal(plan.days.length, 7);
      const tuesday = plan.days.find((d) => d.date === "2026-08-18")!;
      assert.ok(tuesday);
      assert.equal(tuesday.isToday, true);
      assert.equal(tuesday.tasks.length, 2);
      assert.equal(tuesday.events.length, 1);
      assert.equal(tuesday.routines.length, 1);
      assert.equal(tuesday.meals.dinner, "Vegetable Biryani");

      // Verify rhythm block placement
      const morningBlock = tuesday.blocks.find((b) => b.blockId === "morning")!;
      assert.ok(morningBlock.items.some((i) => i.id === "task-t-1"));
      assert.ok(morningBlock.items.some((i) => i.id === "routine-r-morning"));

      const afternoonBlock = tuesday.blocks.find((b) => b.blockId === "afternoon")!;
      assert.ok(afternoonBlock.items.some((i) => i.id === "event-ev-1"));

      const lateAfternoonBlock = tuesday.blocks.find((b) => b.blockId === "lateAfternoon")!;
      assert.ok(lateAfternoonBlock.items.some((i) => i.id === "task-t-2"));
    });

    test("buildWeeklyPlan identifies missing meal slots across the week", () => {
      const plan = buildWeeklyPlan({
        dates: ["2026-08-17", "2026-08-18", "2026-08-19", "2026-08-20", "2026-08-21", "2026-08-22", "2026-08-23"],
        familyMembers: MOCK_FAMILY,
        tasks: [],
        events: [],
        routines: [],
        meals: {
          "Mon-Breakfast": "Eggs",
          "Mon-Lunch": "Salad",
          "Mon-Dinner": "Soup",
          "Tue-Dinner": "Fish",
        },
        prayers: MOCK_PRAYERS,
      });

      // Monday has all 3 slots filled
      assert.ok(!plan.missingMealDays.some((m) => m.date === "2026-08-17"));

      // Tuesday is missing Breakfast and Lunch
      const tueMissing = plan.missingMealDays.find((m) => m.date === "2026-08-18");
      assert.ok(tueMissing);
      assert.deepEqual(tueMissing.missingSlots, ["Breakfast", "Lunch"]);
    });

    test("buildWeeklyPlan identifies unassigned tasks due in the week", () => {
      const tasks: TaskRecord[] = [
        { id: "t-1", title: "Assigned Task", date: "2026-08-18", assignedTo: "parent-1" },
        { id: "t-2", title: "Unassigned Task", date: "2026-08-19" }, // unassigned
        { id: "t-3", title: "Future Unassigned", date: "2026-09-01" }, // not in this week
      ];

      const plan = buildWeeklyPlan({
        dates: ["2026-08-17", "2026-08-18", "2026-08-19", "2026-08-20", "2026-08-21", "2026-08-22", "2026-08-23"],
        familyMembers: MOCK_FAMILY,
        tasks,
        events: [],
        routines: [],
        meals: {},
        prayers: MOCK_PRAYERS,
      });

      assert.equal(plan.unassignedTasks.length, 1);
      assert.equal(plan.unassignedTasks[0]?.id, "t-2");
    });
  });

  // ---------------------------------------------------------------------------
  // 4. In-Memory Proposal Conflict & Workload Preview
  // ---------------------------------------------------------------------------
  describe("Proposal Conflict & Workload Preview", () => {
    test("Staging an overlapping task immediately surfaces a conflict in the proposal preview", () => {
      const events: CalEventRecord[] = [
        { id: "ev-1", title: "School Pick-up", date: "2026-08-18", time: "15:00", durationMinutes: 45, assignedTo: "parent-1" },
      ];

      // Base plan: no conflicts
      const basePlan = buildWeeklyPlan({
        dates: ["2026-08-17", "2026-08-18", "2026-08-19", "2026-08-20", "2026-08-21", "2026-08-22", "2026-08-23"],
        familyMembers: MOCK_FAMILY,
        tasks: [],
        events,
        routines: [],
        meals: {},
        prayers: MOCK_PRAYERS,
      });
      assert.equal(basePlan.conflicts.hasConflicts, false);

      // Proposal stages a conflicting task at 15:15 for parent-1
      let proposal = createWeeklyProposal("2026-08-17");
      proposal = stageNewTask(proposal, {
        id: "staged-t1",
        title: "Doctor consultation",
        date: "2026-08-18",
        time: "15:15",
        scheduleMode: "exactTime",
        durationMinutes: 30,
        assignedTo: "parent-1",
      });

      const previewPlan = buildWeeklyPlan({
        dates: ["2026-08-17", "2026-08-18", "2026-08-19", "2026-08-20", "2026-08-21", "2026-08-22", "2026-08-23"],
        familyMembers: MOCK_FAMILY,
        tasks: [],
        events,
        routines: [],
        meals: {},
        prayers: MOCK_PRAYERS,
        proposal,
      });

      assert.equal(previewPlan.conflicts.hasConflicts, true);
      assert.equal(previewPlan.conflicts.hardConflicts, 1);
      assert.ok(previewPlan.conflicts.conflicts[0]?.explanation.includes("Doctor consultation"));
    });

    test("Staging assignments dynamically shifts household workload in proposal preview", () => {
      const tasks: TaskRecord[] = [
        { id: "t-1", title: "Clean car", date: "2026-08-18", durationMinutes: 60 },
        { id: "t-2", title: "Mow lawn", date: "2026-08-19", durationMinutes: 45 },
        { id: "t-3", title: "Fix garage door", date: "2026-08-20", durationMinutes: 30 },
      ];

      // Base: all unassigned
      const basePlan = buildWeeklyPlan({
        dates: ["2026-08-17", "2026-08-18", "2026-08-19", "2026-08-20", "2026-08-21", "2026-08-22", "2026-08-23"],
        familyMembers: MOCK_FAMILY,
        tasks,
        events: [],
        routines: [],
        meals: {},
        prayers: MOCK_PRAYERS,
      });
      assert.equal(basePlan.workload.householdTotal.unassignedCount, 3);
      assert.equal(basePlan.workload.members.find((m) => m.memberId === "parent-1")?.assignedCount, 0);

      // Proposal stages assigning all 3 tasks to parent-1
      let proposal = createWeeklyProposal("2026-08-17");
      proposal = stageTaskAssignment(proposal, "t-1", "parent-1");
      proposal = stageTaskAssignment(proposal, "t-2", "parent-1");
      proposal = stageTaskAssignment(proposal, "t-3", "parent-1");

      const previewPlan = buildWeeklyPlan({
        dates: ["2026-08-17", "2026-08-18", "2026-08-19", "2026-08-20", "2026-08-21", "2026-08-22", "2026-08-23"],
        familyMembers: MOCK_FAMILY,
        tasks,
        events: [],
        routines: [],
        meals: {},
        prayers: MOCK_PRAYERS,
        proposal,
      });

      assert.equal(previewPlan.workload.householdTotal.unassignedCount, 0);
      const rashidWorkload = previewPlan.workload.members.find((m) => m.memberId === "parent-1");
      assert.equal(rashidWorkload?.assignedCount, 3);
      assert.equal(rashidWorkload?.assignedMinutesKnown, 135);
    });
  });

  // ---------------------------------------------------------------------------
  // 5. Commit / Approval & Idempotency
  // ---------------------------------------------------------------------------
  describe("Commit / Approval & Idempotency", () => {
    test("commitWeeklyPlanProposal updates tasks, adds new tasks, updates routines and meals cleanly", () => {
      const initialTasks: TaskRecord[] = [
        { id: "t-1", title: "Unassigned task", date: "2026-08-18" },
      ];
      const initialRoutines: Routine[] = [
        {
          id: "r-1",
          name: "Morning Habit",
          enabled: true,
          steps: [
            { id: "s-1", title: "Step 1", order: 1 },
          ],
        },
      ];
      const initialMeals = { "Mon-Dinner": "Soup" };

      let proposal = createWeeklyProposal("2026-08-17");
      proposal = stageTaskAssignment(proposal, "t-1", "parent-1");
      proposal = stageNewTask(proposal, {
        id: "t-new",
        title: "New committed task",
        date: "2026-08-20",
        assignedTo: "parent-2",
      });
      proposal = stageRoutineStepAssignment(proposal, "r-1", "s-1", "child-1");
      proposal = stageMeal(proposal, "Tue-Dinner", "Kebab");

      const result = commitWeeklyPlanProposal(proposal, {
        tasks: initialTasks,
        routines: initialRoutines,
        meals: initialMeals,
      });

      assert.equal(result.tasks.length, 2);
      assert.equal(result.tasks.find((t) => t.id === "t-1")?.assignedTo, "parent-1");
      assert.equal(result.tasks.find((t) => t.id === "t-new")?.assignedTo, "parent-2");

      assert.equal(result.routines[0]?.steps[0]?.assignedTo, "child-1");
      assert.equal(result.meals["Tue-Dinner"], "Kebab");
      assert.equal(result.meals["Mon-Dinner"], "Soup");

      assert.equal(result.summary.tasksUpdated, 1);
      assert.equal(result.summary.tasksCreated, 1);
      assert.equal(result.summary.routinesUpdated, 1);
      assert.equal(result.summary.mealsUpdated, 1);
    });

    test("IDEMPOTENCY: Committing the same proposal twice against the committed state causes 0 duplicate tasks or routines", () => {
      const initialTasks: TaskRecord[] = [
        { id: "t-1", title: "Unassigned task", date: "2026-08-18" },
      ];
      const initialRoutines: Routine[] = [
        {
          id: "r-1",
          name: "Routine",
          enabled: true,
          steps: [{ id: "s-1", title: "Step 1", order: 1 }],
        },
      ];
      const initialMeals = { "Mon-Dinner": "Pasta" };

      let proposal = createWeeklyProposal("2026-08-17");
      proposal = stageTaskAssignment(proposal, "t-1", "parent-1");
      proposal = stageNewTask(proposal, {
        id: "t-2",
        title: "Brand New Task",
        date: "2026-08-21",
        assignedTo: "parent-2",
      });
      proposal = stageMeal(proposal, "Wed-Dinner", "Rice");

      // First Commit
      const pass1 = commitWeeklyPlanProposal(proposal, {
        tasks: initialTasks,
        routines: initialRoutines,
        meals: initialMeals,
      });

      assert.equal(pass1.tasks.length, 2);
      assert.equal(pass1.summary.tasksCreated, 1);

      // Second Commit on pass1 output with same proposal
      const pass2 = commitWeeklyPlanProposal(proposal, {
        tasks: pass1.tasks,
        routines: pass1.routines,
        meals: pass1.meals,
      });

      assert.equal(pass2.tasks.length, 2);
      assert.equal(pass2.summary.tasksCreated, 0); // zero duplicate tasks created
      assert.deepEqual(pass2.tasks, pass1.tasks);
      assert.deepEqual(pass2.routines, pass1.routines);
      assert.deepEqual(pass2.meals, pass1.meals);
    });
  });

  // ---------------------------------------------------------------------------
  // 6. Child Perspective & Privacy
  // ---------------------------------------------------------------------------
  describe("Child Perspective & Privacy", () => {
    test("buildWeeklyPlan filters tasks and sanitizes workload when memberId is a child", () => {
      const tasks: TaskRecord[] = [
        { id: "t-adult", title: "File taxes", date: "2026-08-18", assignedTo: "parent-1" },
        { id: "t-child", title: "Read Surah Al-Mulk", date: "2026-08-18", assignedTo: "child-1" },
      ];

      const plan = buildWeeklyPlan({
        dates: ["2026-08-17", "2026-08-18", "2026-08-19", "2026-08-20", "2026-08-21", "2026-08-22", "2026-08-23"],
        memberId: "child-1",
        familyMembers: MOCK_FAMILY,
        tasks,
        events: [],
        routines: [],
        meals: {},
        prayers: MOCK_PRAYERS,
        todayIso: "2026-08-18",
      });

      assert.equal(plan.isChildPerspective, true);
      const tue = plan.days.find((d) => d.date === "2026-08-18")!;
      // Child only sees child task (and unassigned tasks if any)
      assert.equal(tue.tasks.length, 1);
      assert.equal(tue.tasks[0]?.id, "t-child");

      // Workload summary is sanitized for child view
      const parentWorkload = plan.workload.members.find((m) => m.memberId === "parent-1");
      assert.equal(parentWorkload?.assignedTasksCount, 0); // masked
      assert.ok(plan.workload.fairness.headline.includes("Zayd"));
    });
  });

  // ---------------------------------------------------------------------------
  // 7. Guided Workflow Step Summaries
  // ---------------------------------------------------------------------------
  describe("Guided Workflow Step Summaries", () => {
    test("getWeeklyPlanningStepSummary provides appropriate status and highlights for all 8 steps", () => {
      const plan = buildWeeklyPlan({
        dates: ["2026-08-17", "2026-08-18", "2026-08-19", "2026-08-20", "2026-08-21", "2026-08-22", "2026-08-23"],
        familyMembers: MOCK_FAMILY,
        tasks: [
          { id: "t-1", title: "Unassigned", date: "2026-08-18" },
        ],
        events: [
          { id: "ev-1", title: "Meeting", date: "2026-08-19" },
        ],
        routines: [
          { id: "r-1", name: "Routine", enabled: true, steps: [] },
        ],
        meals: {},
        prayers: MOCK_PRAYERS,
      });

      const step1 = getWeeklyPlanningStepSummary("review_previous", plan);
      assert.equal(step1.stepNumber, 1);
      assert.equal(step1.title, "Review Previous Week");

      const step4 = getWeeklyPlanningStepSummary("assignments", plan);
      assert.equal(step4.status, "needs_attention"); // because t-1 is unassigned
      assert.ok(step4.highlights[0]?.includes("1 task currently unassigned"));

      const step5 = getWeeklyPlanningStepSummary("conflicts", plan);
      assert.equal(step5.status, "optimal"); // no conflicts

      const step7 = getWeeklyPlanningStepSummary("meals", plan);
      assert.equal(step7.status, "needs_attention"); // missing meal slots

      const step8 = getWeeklyPlanningStepSummary("approval", plan);
      assert.equal(step8.stepNumber, 8);
    });
  });
});
