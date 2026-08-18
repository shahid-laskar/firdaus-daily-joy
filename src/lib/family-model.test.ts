import { describe, test } from "node:test";
import assert from "node:assert/strict";
import {
  type FamilyMember,
  type FamilyRole,
  type CanonicalFamilyRole,
  getCanonicalFamilyRole,
  getTaskAssignee,
  getRoutineOwner,
  getRoutineStepAssignee,
  isTaskHousehold,
  isTaskAssignedTo,
  filterTasksForMember,
  filterRoutinesForMember,
  filterEventsForMember,
  getHouseholdTasks,
  getMemberTasks,
  getHouseholdRoutines,
  getMemberRoutines,
} from "./family-model";
import { createRoutine } from "./routine-engine";
import { buildDailyThread, type DailySurfaceData, type TaskRecord } from "./daily-surface";
import { buildDayRhythmFromSurfaceData } from "./rhythm-engine";

describe("Wave 2.0-A — Family Roles & Responsibility Assignment", () => {
  // ---------------------------------------------------------------------------
  // 1. FAMILY MEMBER ROLES
  // ---------------------------------------------------------------------------
  test("Family Roles — canonical resolution, typed representation & default mapping", () => {
    // Canonical roles
    assert.equal(getCanonicalFamilyRole("admin"), "admin");
    assert.equal(getCanonicalFamilyRole("member"), "member");
    assert.equal(getCanonicalFamilyRole("child"), "child");

    // Legacy role backward-compatibility
    assert.equal(getCanonicalFamilyRole("parent"), "admin");
    assert.equal(getCanonicalFamilyRole("other"), "member");
    assert.equal(getCanonicalFamilyRole(undefined), "member");
    assert.equal(getCanonicalFamilyRole(null), "member");
    assert.equal(getCanonicalFamilyRole(""), "member");

    // Typed FamilyMember structures
    const adminMember: FamilyMember = {
      id: "mem_admin",
      name: "Ameen",
      role: "admin",
      color: "#2b5a45",
      chores: [],
    };

    const generalMember: FamilyMember = {
      id: "mem_general",
      name: "Fatima",
      role: "member",
      color: "#b45309",
      chores: [],
    };

    const childMember: FamilyMember = {
      id: "mem_child",
      name: "Yusuf",
      role: "child",
      age: "6",
      color: "#3b82f6",
      chores: [{ id: "c1", title: "Tidy toys", done: false }],
    };

    // Legacy member
    const legacyMember: FamilyMember = {
      id: "mem_legacy",
      name: "Grandpa",
      role: "parent",
      chores: [],
    };

    assert.equal(adminMember.role, "admin");
    assert.equal(generalMember.role, "member");
    assert.equal(childMember.role, "child");
    assert.equal(getCanonicalFamilyRole(legacyMember.role), "admin");
  });

  // ---------------------------------------------------------------------------
  // 2. TASK ASSIGNMENT & NORMALIZATION
  // ---------------------------------------------------------------------------
  test("Task Assignment — assignedTo priority, fallback to assigneeId & household semantics", () => {
    const unassignedTask: TaskRecord = {
      id: "t_unassigned",
      title: "Buy groceries for house",
    };

    const newAssignedTask: TaskRecord = {
      id: "t_assigned",
      title: "Pick up dry cleaning",
      assignedTo: "mem_ameen",
    };

    const legacyAssignedTask: TaskRecord = {
      id: "t_legacy",
      title: "Fix kitchen faucet",
      assigneeId: "mem_fatima",
    };

    const bothAssignedTask: TaskRecord = {
      id: "t_both",
      title: "Prepare guest room",
      assignedTo: "mem_yusuf",
      assigneeId: "mem_ameen", // assignedTo takes precedence
    };

    // Assignee normalization
    assert.equal(getTaskAssignee(unassignedTask), undefined);
    assert.equal(getTaskAssignee(newAssignedTask), "mem_ameen");
    assert.equal(getTaskAssignee(legacyAssignedTask), "mem_fatima");
    assert.equal(getTaskAssignee(bothAssignedTask), "mem_yusuf");

    // Household semantics
    assert.equal(isTaskHousehold(unassignedTask), true);
    assert.equal(isTaskHousehold(newAssignedTask), false);
    assert.equal(isTaskHousehold(legacyAssignedTask), false);

    // Explicit assignment check
    assert.equal(isTaskAssignedTo(unassignedTask, undefined), true);
    assert.equal(isTaskAssignedTo(unassignedTask, "mem_ameen"), false);
    assert.equal(isTaskAssignedTo(newAssignedTask, "mem_ameen"), true);
    assert.equal(isTaskAssignedTo(newAssignedTask, "mem_fatima"), false);
    assert.equal(isTaskAssignedTo(legacyAssignedTask, "mem_fatima"), true);
  });

  // ---------------------------------------------------------------------------
  // 3. ROUTINE ASSIGNMENT & NORMALIZATION
  // ---------------------------------------------------------------------------
  test("Routine Assignment — routine owner & step assignee normalization", () => {
    const householdRoutine = createRoutine({
      id: "rt_house",
      name: "Family Fajr & Adhkar",
      steps: [
        { id: "s1", title: "Wake up" },
        { id: "s2", title: "Recite Adhkar together" },
      ],
    });

    const memberOwnedRoutine = createRoutine({
      id: "rt_yusuf",
      name: "Yusuf School Morning",
      assignedTo: "mem_yusuf",
      steps: [
        { id: "s1", title: "Brush teeth" },
        { id: "s2", title: "Uniform on" },
      ],
    });

    const multiAssigneeRoutine = createRoutine({
      id: "rt_multi",
      name: "Evening Kitchen Reset",
      steps: [
        { id: "s1", title: "Clear dining table", assignedTo: "mem_yusuf" },
        { id: "s2", title: "Load dishwasher", assigneeId: "mem_fatima" }, // legacy fallback
      ],
    });

    assert.equal(getRoutineOwner(householdRoutine), undefined);
    assert.equal(getRoutineOwner(memberOwnedRoutine), "mem_yusuf");
    assert.equal(getRoutineStepAssignee(multiAssigneeRoutine.steps[0]), "mem_yusuf");
    assert.equal(getRoutineStepAssignee(multiAssigneeRoutine.steps[1]), "mem_fatima");
  });

  // ---------------------------------------------------------------------------
  // 4. FILTERING API — TASKS, ROUTINES & EVENTS
  // ---------------------------------------------------------------------------
  test("Filtering API — household aggregate view vs member-specific view", () => {
    const tasks: TaskRecord[] = [
      { id: "t1", title: "Household milk" }, // unassigned
      { id: "t2", title: "Ameen work task", assignedTo: "mem_ameen" },
      { id: "t3", title: "Fatima clinic appointment", assignedTo: "mem_fatima" },
      { id: "t4", title: "Yusuf homework", assigneeId: "mem_yusuf" }, // legacy assigneeId
    ];

    const routines = [
      createRoutine({
        id: "r_shared",
        name: "Shared Household Morning",
        steps: [{ title: "Fajr" }],
      }),
      createRoutine({
        id: "r_ameen",
        name: "Ameen Gym",
        assignedTo: "mem_ameen",
        steps: [{ title: "Workout" }],
      }),
      createRoutine({
        id: "r_yusuf",
        name: "Yusuf Bedtime",
        assignedTo: "mem_yusuf",
        steps: [{ title: "Surah Mulk" }],
      }),
    ];

    // Household view (memberId: undefined) returns all items
    assert.equal(filterTasksForMember(tasks, undefined).length, 4);
    assert.equal(filterRoutinesForMember(routines, undefined).length, 3);
    assert.equal(getHouseholdTasks(tasks).length, 1);
    assert.equal(getHouseholdTasks(tasks)[0]?.id, "t1");
    assert.equal(getHouseholdRoutines(routines).length, 1);
    assert.equal(getHouseholdRoutines(routines)[0]?.id, "r_shared");

    // Member view for Ameen (includes assigned to Ameen + unassigned household tasks)
    const ameenTasks = filterTasksForMember(tasks, "mem_ameen");
    assert.equal(ameenTasks.length, 2);
    assert.ok(ameenTasks.some((t) => t.id === "t1")); // household
    assert.ok(ameenTasks.some((t) => t.id === "t2")); // Ameen's
    assert.ok(!ameenTasks.some((t) => t.id === "t3")); // Fatima's excluded
    assert.ok(!ameenTasks.some((t) => t.id === "t4")); // Yusuf's excluded

    // Strict member tasks (only assigned to Ameen)
    const ameenStrict = getMemberTasks(tasks, "mem_ameen");
    assert.equal(ameenStrict.length, 1);
    assert.equal(ameenStrict[0]?.id, "t2");

    // Member view for Yusuf (legacy assigneeId is handled properly)
    const yusufTasks = filterTasksForMember(tasks, "mem_yusuf");
    assert.equal(yusufTasks.length, 2);
    assert.ok(yusufTasks.some((t) => t.id === "t1")); // household
    assert.ok(yusufTasks.some((t) => t.id === "t4")); // Yusuf's

    // Member routines for Ameen
    const ameenRoutines = filterRoutinesForMember(routines, "mem_ameen");
    assert.equal(ameenRoutines.length, 2);
    assert.ok(ameenRoutines.some((r) => r.id === "r_shared"));
    assert.ok(ameenRoutines.some((r) => r.id === "r_ameen"));
    assert.ok(!ameenRoutines.some((r) => r.id === "r_yusuf"));

    // Member routines strict
    const ameenRoutinesStrict = getMemberRoutines(routines, "mem_ameen");
    assert.equal(ameenRoutinesStrict.length, 1);
    assert.equal(ameenRoutinesStrict[0]?.id, "r_ameen");
  });

  // ---------------------------------------------------------------------------
  // 5. DAILY SURFACE & RHYTHM ENGINE PREPARATION
  // ---------------------------------------------------------------------------
  test("Daily Surface & Rhythm Engine — member-scoped DayRhythm and DailyThread", () => {
    const prayers = [
      { id: "fajr", name: "Fajr", time: "05:15" },
      { id: "dhuhr", name: "Dhuhr", time: "12:30" },
      { id: "asr", name: "Asr", time: "15:45" },
      { id: "maghrib", name: "Maghrib", time: "18:30" },
      { id: "isha", name: "Isha", time: "19:45" },
    ];

    const today = "2026-08-18";

    const tasks: TaskRecord[] = [
      { id: "t_shared", title: "Common Household Water Filters", date: today },
      { id: "t_ameen", title: "Ameen Audit Documents", date: today, assignedTo: "mem_ameen" },
      { id: "t_fatima", title: "Fatima Dental Checkup", date: today, assignedTo: "mem_fatima" },
    ];

    const routines = [
      createRoutine({
        id: "rt_shared",
        name: "Morning Family Adhkar",
        relativeAnchor: "afterFajr",
        steps: [{ title: "Adhkar" }],
      }),
      createRoutine({
        id: "rt_fatima",
        name: "Fatima Morning Study",
        relativeAnchor: "afterFajr",
        assignedTo: "mem_fatima",
        steps: [{ title: "Study" }],
      }),
    ];

    const baseData: DailySurfaceData = {
      now: new Date("2026-08-18T08:00:00"),
      profile: { name: "Ameen" },
      prayers,
      nextPrayer: { next: { name: "Dhuhr", time: "12:30" }, hours: 4, mins: 30 },
      salahLog: {},
      hifzItems: [],
      isRamadan: false,
      ramadanDay: null,
      tasks,
      events: [
        { id: "ev_shared", title: "Family Dinner", date: today },
        { id: "ev_fatima", title: "Fatima Conference", date: today, assignedTo: "mem_fatima" },
      ],
      meals: {},
      grocery: [],
      habits: [],
      health: {},
      checkins: {},
      expenses: [],
      limits: {},
      routines,
    };

    // 1. Household DayRhythm (no memberId specified)
    const householdRhythm = buildDayRhythmFromSurfaceData(baseData);
    const householdItems = householdRhythm.blocks.flatMap((b) => b.items);
    assert.ok(householdItems.some((i) => i.id === "task-t_shared"));
    assert.ok(householdItems.some((i) => i.id === "task-t_ameen"));
    assert.ok(householdItems.some((i) => i.id === "task-t_fatima"));
    assert.ok(householdItems.some((i) => i.id === "routine-rt_shared"));
    assert.ok(householdItems.some((i) => i.id === "routine-rt_fatima"));

    // 2. Ameen-scoped DayRhythm (memberId: "mem_ameen")
    const ameenSurfaceData: DailySurfaceData = {
      ...baseData,
      memberId: "mem_ameen",
    };

    const ameenRhythm = buildDayRhythmFromSurfaceData(ameenSurfaceData);
    const ameenItems = ameenRhythm.blocks.flatMap((b) => b.items);

    assert.ok(ameenItems.some((i) => i.id === "task-t_shared"), "Household task is visible to Ameen");
    assert.ok(ameenItems.some((i) => i.id === "task-t_ameen"), "Ameen's task is visible to Ameen");
    assert.equal(ameenItems.some((i) => i.id === "task-t_fatima"), false, "Fatima's task is excluded from Ameen's view");
    assert.ok(ameenItems.some((i) => i.id === "routine-rt_shared"), "Household routine is visible to Ameen");
    assert.equal(ameenItems.some((i) => i.id === "routine-rt_fatima"), false, "Fatima's routine is excluded from Ameen's view");

    // 3. Ameen Daily Thread
    const ameenThread = buildDailyThread(ameenSurfaceData, today, ameenRhythm);
    assert.ok(ameenThread.some((i) => i.id === "task-t_shared"));
    assert.ok(ameenThread.some((i) => i.id === "task-t_ameen"));
    assert.equal(ameenThread.some((i) => i.id === "task-t_fatima"), false);
    assert.ok(ameenThread.some((i) => i.id === "event-ev_shared"));
    assert.equal(ameenThread.some((i) => i.id === "event-ev_fatima"), false);
  });

  // ---------------------------------------------------------------------------
  // 6. SERIALIZATION & BACKUP INTEGRITY
  // ---------------------------------------------------------------------------
  test("Serialization — JSON backup roundtrip and persistence safety", () => {
    const member: FamilyMember = {
      id: "mem_roundtrip",
      name: "Maryam",
      role: "child",
      age: "8",
      color: "#ec4899",
      chores: [{ id: "c_1", title: "Fold prayer mats", done: true }],
    };

    const task: TaskRecord = {
      id: "t_roundtrip",
      title: "Memorize Ayah 255",
      assignedTo: "mem_roundtrip",
      scheduleMode: "relativePrayer",
      relativeAnchor: "afterFajr",
    };

    const serializedMember = JSON.parse(JSON.stringify(member));
    const serializedTask = JSON.parse(JSON.stringify(task));

    assert.equal(serializedMember.id, "mem_roundtrip");
    assert.equal(serializedMember.role, "child");
    assert.equal(serializedTask.assignedTo, "mem_roundtrip");
    assert.equal(getTaskAssignee(serializedTask), "mem_roundtrip");
    assert.equal(getCanonicalFamilyRole(serializedMember.role), "child");
  });
});

