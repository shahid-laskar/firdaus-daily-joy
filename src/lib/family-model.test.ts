import { describe, test } from "node:test";
import assert from "node:assert/strict";
import {
  type FamilyMember,
  type FamilyRole,
  type CanonicalFamilyRole,
  getCanonicalFamilyRole,
  isChildMember,
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
import { buildDailyThread, type DailySurfaceData, type TaskRecord, type CalEventRecord } from "./daily-surface";
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

  // ---------------------------------------------------------------------------
  // 7. WAVE 2.0-B: PER-MEMBER DAILY SURFACE & PERSPECTIVE SWITCHING
  // ---------------------------------------------------------------------------
  test("Wave 2.0-B — Household View vs Member View vs Child View Filtering", () => {
    const today = "2026-08-18";
    const prayers = [
      { id: "fajr", name: "Fajr", time: "05:15" },
      { id: "dhuhr", name: "Dhuhr", time: "12:30" },
      { id: "asr", name: "Asr", time: "15:45" },
      { id: "maghrib", name: "Maghrib", time: "18:30" },
      { id: "isha", name: "Isha", time: "19:45" },
    ];

    const family: FamilyMember[] = [
      { id: "m_admin", name: "Ameen", role: "admin", chores: [] },
      { id: "m_member", name: "Fatima", role: "member", chores: [] },
      { id: "m_child", name: "Yusuf", role: "child", age: "9", chores: [] },
      { id: "m_empty", name: "Guest", role: "other", chores: [] },
    ];

    assert.equal(isChildMember("m_child", family), true);
    assert.equal(isChildMember("m_admin", family), false);
    assert.equal(isChildMember("m_member", family), false);
    assert.equal(isChildMember(undefined, family), false);

    const tasks: TaskRecord[] = [
      { id: "t_unassigned", title: "Clean living room window", date: today }, // household
      { id: "t_admin", title: "Review quarterly tax invoice", date: today, assignedTo: "m_admin" },
      { id: "t_fatima", title: "Purchase pharmacy supplies", date: today, assignedTo: "m_member" },
      {
        id: "t_child_pr",
        title: "Yusuf Quran revision",
        date: today,
        assignedTo: "m_child",
        scheduleMode: "relativePrayer",
        relativeAnchor: "afterFajr",
      },
    ];

    const events: CalEventRecord[] = [
      { id: "ev_shared", title: "Family Dinner", date: today },
      { id: "ev_admin", title: "Ameen Work Meeting", date: today, assignedTo: "m_admin" },
      { id: "ev_child", title: "Yusuf Karate Class", date: today, assignedTo: "m_child" },
    ];

    const routines = [
      createRoutine({
        id: "r_shared",
        name: "Morning Family Adhkar",
        relativeAnchor: "afterFajr",
        steps: [{ title: "Dua" }],
      }),
      createRoutine({
        id: "r_admin",
        name: "Ameen Fitness Routine",
        assignedTo: "m_admin",
        steps: [{ title: "Pushups" }],
      }),
      createRoutine({
        id: "r_multi",
        name: "Evening Kitchen Cleanup",
        steps: [
          { title: "Wipe Counters", assignedTo: "m_member" },
          { title: "Put away toys", assignedTo: "m_child" },
        ],
      }),
    ];

    // Data with expenses causing budget alert (>80% of limit)
    const baseData: DailySurfaceData = {
      now: new Date("2026-08-18T08:00:00"),
      profile: { name: "Household", city: "Kozhikode" },
      prayers,
      nextPrayer: { next: { name: "Dhuhr", time: "12:30" }, hours: 4, mins: 30 },
      salahLog: {},
      hifzItems: [],
      isRamadan: false,
      ramadanDay: null,
      tasks,
      events,
      meals: { "Tue-Dinner": "Biryani" },
      grocery: [{ id: "g1", name: "Rice", got: false }],
      habits: [],
      health: { [today]: { water: 4 } },
      checkins: {},
      expenses: [{ amount: 900, category: "Home", date: "2026-08-10" }],
      limits: { Home: 1000 }, // 90% spent -> triggers budget alert for adults
      routines,
      familyMembers: family,
    };

    // 1. Household Perspective (memberId: undefined)
    const householdRhythm = buildDayRhythmFromSurfaceData({ ...baseData, memberId: undefined });
    const householdRhythmItems = householdRhythm.blocks.flatMap((b) => b.items);
    assert.ok(householdRhythmItems.some((i) => i.id === "task-t_unassigned"), "Household task present in household rhythm");
    assert.ok(householdRhythmItems.some((i) => i.id === "task-t_admin"), "Admin task present in household rhythm");
    assert.ok(householdRhythmItems.some((i) => i.id === "task-t_fatima"), "Fatima task present in household rhythm");
    assert.ok(householdRhythmItems.some((i) => i.id === "task-t_child_pr"), "Child prayer-relative task present in household rhythm");

    const householdThread = buildDailyThread({ ...baseData, memberId: undefined }, today, householdRhythm);
    assert.ok(householdThread.some((i) => i.id === "task-t_unassigned"), "Household task present in household thread");
    assert.ok(householdThread.some((i) => i.id === "event-ev_shared"), "Shared event present in household thread");
    assert.ok(householdThread.some((i) => i.id === "event-ev_admin"), "Admin event present in household thread");
    assert.ok(householdThread.some((i) => i.id === "budget-alert"), "Budget alert present in household/adult view");

    // 2. Admin Perspective (memberId: "m_admin")
    const adminThread = buildDailyThread({ ...baseData, memberId: "m_admin" });
    assert.ok(adminThread.some((i) => i.id === "task-t_unassigned"), "Household unassigned task visible to admin");
    assert.ok(adminThread.some((i) => i.id === "task-t_admin"), "Admin task visible to admin");
    assert.equal(adminThread.some((i) => i.id === "task-t_fatima"), false, "Fatima task excluded from admin view");
    assert.equal(adminThread.some((i) => i.id === "task-t_child_pr"), false, "Child task excluded from admin view");
    assert.ok(adminThread.some((i) => i.id === "budget-alert"), "Budget alert visible to admin");

    // 3. Child Perspective (memberId: "m_child")
    const childThread = buildDailyThread({ ...baseData, memberId: "m_child" });
    assert.ok(childThread.some((i) => i.id === "task-t_unassigned"), "Household unassigned task visible to child");
    assert.ok(childThread.some((i) => i.id === "task-t_child_pr"), "Child task visible to child");
    assert.equal(childThread.some((i) => i.id === "task-t_admin"), false, "Admin adult task excluded from child view");
    assert.equal(childThread.some((i) => i.id === "task-t_fatima"), false, "Fatima task excluded from child view");
    assert.ok(childThread.some((i) => i.id === "event-ev_child"), "Child event visible to child");
    assert.equal(childThread.some((i) => i.id === "event-ev_admin"), false, "Admin adult event excluded from child view");
    // Child privacy protection: budget alerts must NEVER appear in child view
    assert.equal(childThread.some((i) => i.id === "budget-alert"), false, "Budget alert suppressed for child");

    // 4. Multi-Member Shared Routine Step Filtering
    const fatimaThread = buildDailyThread({ ...baseData, memberId: "m_member" });
    assert.ok(fatimaThread.some((i) => i.id === "routine-r_multi"), "Multi-assignee routine visible to member who has a step");
    assert.ok(childThread.some((i) => i.id === "routine-r_multi"), "Multi-assignee routine visible to child who has a step");
    assert.equal(fatimaThread.some((i) => i.id === "routine-r_admin"), false, "Admin-only routine excluded from Fatima");

    // 5. Member with Zero Personal Assignments
    const emptyMemberThread = buildDailyThread({ ...baseData, memberId: "m_empty" });
    assert.ok(emptyMemberThread.some((i) => i.id === "task-t_unassigned"), "Household tasks visible to empty member");
    assert.equal(emptyMemberThread.some((i) => i.id === "task-t_admin"), false);
    assert.equal(emptyMemberThread.some((i) => i.id === "task-t_fatima"), false);
    assert.equal(emptyMemberThread.some((i) => i.id === "task-t_child_pr"), false);

    // 6. Data Immutability Guarantee: Switching perspectives does NOT mutate domain arrays or objects
    const tasksSnapshot = JSON.stringify(tasks);
    const routinesSnapshot = JSON.stringify(routines);
    const eventsSnapshot = JSON.stringify(events);

    buildDailyThread({ ...baseData, memberId: "m_admin" });
    buildDailyThread({ ...baseData, memberId: "m_child" });
    buildDailyThread({ ...baseData, memberId: undefined });

    assert.equal(JSON.stringify(tasks), tasksSnapshot, "Tasks array remained immutable across switches");
    assert.equal(JSON.stringify(routines), routinesSnapshot, "Routines array remained immutable across switches");
    assert.equal(JSON.stringify(events), eventsSnapshot, "Events array remained immutable across switches");
  });

  test("Wave 2.0-B — Prayer-Relative Task Placement in DayRhythm Across Perspectives", () => {
    const today = "2026-08-18";
    const prayers = [
      { id: "fajr", name: "Fajr", time: "05:15" },
      { id: "dhuhr", name: "Dhuhr", time: "12:30" },
      { id: "asr", name: "Asr", time: "15:45" },
      { id: "maghrib", name: "Maghrib", time: "18:30" },
      { id: "isha", name: "Isha", time: "19:45" },
    ];

    const tasks: TaskRecord[] = [
      {
        id: "t_yusuf_fajr",
        title: "Morning Quran Hifz",
        date: today,
        assignedTo: "mem_yusuf",
        scheduleMode: "relativePrayer",
        relativeAnchor: "afterFajr",
      },
      {
        id: "t_ameen_dhuhr",
        title: "Dhuhr Family Work Break",
        date: today,
        assignedTo: "mem_ameen",
        scheduleMode: "relativePrayer",
        relativeAnchor: "afterDhuhr",
      },
    ];

    const rhythmYusuf = buildDayRhythmFromSurfaceData({
      now: new Date("2026-08-18T08:00:00"),
      profile: { name: "Yusuf" },
      prayers,
      nextPrayer: null,
      salahLog: {},
      hifzItems: [],
      isRamadan: false,
      ramadanDay: null,
      tasks,
      events: [],
      meals: {},
      grocery: [],
      habits: [],
      health: {},
      checkins: {},
      expenses: [],
      limits: {},
      memberId: "mem_yusuf",
    });

    const morningItems = rhythmYusuf.blocks.find((b) => b.id === "morning")?.items ?? [];
    const afternoonItems = rhythmYusuf.blocks.find((b) => b.id === "afternoon")?.items ?? [];

    assert.ok(morningItems.some((i) => i.id === "task-t_yusuf_fajr"), "Yusuf afterFajr task placed in Morning block");
    assert.equal(afternoonItems.some((i) => i.id === "task-t_ameen_dhuhr"), false, "Ameen task excluded from Yusuf rhythm");
  });
});


