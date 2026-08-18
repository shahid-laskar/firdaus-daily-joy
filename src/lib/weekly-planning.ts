/**
 * FIRDAUS FAMILY WEEKLY PLANNING ENGINE (Wave 2.0-E)
 *
 * An integration surface over the existing domain model (Tasks, Routines, Calendar,
 * Meals, Rhythm Engine, Conflict Detection, and Workload Intelligence).
 *
 * Core Principles:
 * 1. Integration Surface: Operates entirely over existing domain records without
 *    creating a parallel planning database or duplicate task/routine storage.
 * 2. Proposal / Preview Draft Model: Allows staging task assignments, reschedules,
 *    routine step assignments, and meals in-memory before committing.
 * 3. Continuous Conflict & Workload Preview: Continuously re-evaluates the proposed
 *    week using `detectScheduleConflicts` and `calculateHouseholdWorkload`.
 * 4. Rhythm-Based Planning: Groups commitments into canonical prayer-anchored
 *    rhythm blocks without forcing synthetic clock times.
 * 5. Deterministic & Idempotent: Committing the same proposal twice creates 0 duplicate
 *    tasks or routines and produces identical state.
 * 6. Child & Family Safe: Sanitizes sensitive workload insights and scopes commitments
 *    for child members.
 * 7. Experience-Independent & Offline-First: Pure TypeScript domain logic without
 *    presentation, React, or network dependencies.
 */

import { isoDate, isoOffset, getWeekRange, type Insight } from "./intelligence";
import { isRepeating, occursOn, type Recurrence } from "./recurrence";
import {
  type PrayerId,
  type RhythmBlockId,
  type RelativePrayerAnchor,
  type ScheduleMode,
  PRAYER_IDS,
  RHYTHM_BLOCK_IDS,
  RHYTHM_BLOCK_DEFINITIONS,
  timeToMinutes,
  minutesToTime,
  getTaskScheduleMode,
  resolveTaskPlacement,
  formatRelativeAnchorLabel,
} from "./rhythm-engine";
import {
  type TaskRecord,
  type CalEventRecord,
  isTaskDueOnDate,
  isTaskRecordDone,
  isEventOnDate,
} from "./daily-surface";
import {
  type Routine,
  type RoutineStep,
  type RoutineStepInstance,
} from "./routine-engine";
import {
  type FamilyMember,
  type CanonicalFamilyRole,
  getCanonicalFamilyRole,
  getTaskAssignee,
  getRoutineOwner,
  getRoutineStepAssignee,
  isChildMember,
  isTaskHousehold,
  filterTasksForMember,
  filterEventsForMember,
  filterRoutinesForMember,
} from "./family-model";
import {
  type ConflictSignal,
  type ScheduleConflictSummary,
  detectScheduleConflicts,
  summarizeScheduleConflicts,
} from "./conflict-detector";
import {
  type HouseholdWorkloadSummary,
  type MemberWorkload,
  type FairnessSignal,
  calculateHouseholdWorkload,
  filterWorkloadForChild,
} from "./workload-intelligence";

// -----------------------------------------------------------------------------
// CONSTANTS & HELPERS
// -----------------------------------------------------------------------------

export const DAY_NAMES_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;
export const DAY_LETTERS = ["S", "M", "T", "W", "T", "F", "S"] as const;
export const DAY_NAMES_FULL = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

export const MEAL_SLOTS = ["Breakfast", "Lunch", "Dinner"] as const;
export type MealSlotName = (typeof MEAL_SLOTS)[number];

/**
 * Safely parses an ISO date string (YYYY-MM-DD) to a UTC Date object at midday.
 */
export function parseIsoDateSafe(iso: string): Date {
  const parts = iso.split("-").map(Number);
  const year = parts[0] || 2026;
  const month = (parts[1] || 1) - 1;
  const day = parts[2] || 1;
  return new Date(Date.UTC(year, month, day, 12, 0, 0));
}

/**
 * Returns the short day name ("Sun", "Mon", etc.) for an ISO date.
 */
export function getDayNameShort(iso: string): string {
  const d = parseIsoDateSafe(iso);
  return DAY_NAMES_SHORT[d.getUTCDay()] || "Mon";
}

/**
 * Returns the single day letter ("S", "M", "T", etc.) for an ISO date.
 */
export function getDayLetter(iso: string): string {
  const d = parseIsoDateSafe(iso);
  return DAY_LETTERS[d.getUTCDay()] || "M";
}

// -----------------------------------------------------------------------------
// WEEK DEFINITION & NAVIGATION
// -----------------------------------------------------------------------------

export type WeekStartDay = "monday" | "sunday";

/**
 * Computes the 7 ISO dates for the calendar week containing referenceDate.
 * Defaults to Monday-start week.
 */
export function getPlanningWeekRange(
  referenceDate: string | Date = new Date(),
  startDay: WeekStartDay = "monday"
): string[] {
  const refIso = typeof referenceDate === "string" ? referenceDate : isoDate(referenceDate);
  const d = parseIsoDateSafe(refIso);
  const dayOfWeek = d.getUTCDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat

  let daysFromStart = 0;
  if (startDay === "monday") {
    daysFromStart = (dayOfWeek + 6) % 7; // Mon=0, Tue=1, ..., Sun=6
  } else {
    daysFromStart = dayOfWeek; // Sun=0, Mon=1, ..., Sat=6
  }

  const startDateIso = isoOffset(refIso, -daysFromStart);
  return [...Array(7)].map((_, i) => isoOffset(startDateIso, i));
}

/**
 * Navigates to a previous or next planning week by week offset.
 */
export function navigatePlanningWeek(
  referenceDate: string | Date,
  offsetWeeks: number,
  startDay: WeekStartDay = "monday"
): string[] {
  const refIso = typeof referenceDate === "string" ? referenceDate : isoDate(referenceDate);
  const targetIso = isoOffset(refIso, offsetWeeks * 7);
  return getPlanningWeekRange(targetIso, startDay);
}

/**
 * Formats a human-readable title for a week range (e.g. "Aug 17 – Aug 23, 2026").
 */
export function formatWeekRangeTitle(startDate: string, endDate: string): string {
  const s = parseIsoDateSafe(startDate);
  const e = parseIsoDateSafe(endDate);
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const sMonth = monthNames[s.getUTCMonth()];
  const eMonth = monthNames[e.getUTCMonth()];
  const sDay = s.getUTCDate();
  const eDay = e.getUTCDate();
  const year = e.getUTCFullYear();

  if (sMonth === eMonth) {
    return `${sMonth} ${sDay} – ${eDay}, ${year}`;
  }
  return `${sMonth} ${sDay} – ${eMonth} ${eDay}, ${year}`;
}

// -----------------------------------------------------------------------------
// TYPES & DOMAIN MODELS
// -----------------------------------------------------------------------------

export interface PlannedItem {
  id: string;
  sourceId: string;
  title: string;
  category: "task" | "event" | "routine" | "meal";
  scheduleMode: ScheduleMode;
  time?: string | undefined;
  relativeAnchor?: RelativePrayerAnchor | string | undefined;
  displaySchedule: string;
  durationMinutes: number;
  assignedTo?: string | undefined;
  assigneeName?: string | undefined;
  done: boolean;
  blockId: RhythmBlockId;
  isStaged?: boolean | undefined;
}

export interface PlannedRhythmBlock {
  blockId: RhythmBlockId;
  name: string;
  displayTime: string;
  startAnchor: PrayerId;
  endAnchor: PrayerId;
  items: PlannedItem[];
}

export interface PlannedDay {
  date: string; // ISO date YYYY-MM-DD
  dayName: string; // "Mon", "Tue"
  dayLetter: string; // "M", "T"
  isToday: boolean;
  isPast: boolean;
  prayers: { id: string; name: string; time: string }[];
  blocks: PlannedRhythmBlock[];
  tasks: TaskRecord[];
  events: CalEventRecord[];
  routines: Routine[];
  meals: {
    breakfast?: string | undefined;
    lunch?: string | undefined;
    dinner?: string | undefined;
  };
  conflicts: ConflictSignal[];
  totalScheduledMinutes: number;
}

export interface PreviousWeekSummary {
  startDate: string;
  endDate: string;
  completedTasksCount: number;
  unresolvedTasksCount: number;
  completedRoutineStepsCount: number;
  conflictsCount: number;
  workload: HouseholdWorkloadSummary;
  reflectionNotice: string;
}

export interface RoutineOverviewItem {
  routineId: string;
  name: string;
  scheduleLabel: string;
  assignedTo?: string | undefined;
  activeDaysCount: number;
  stepsCount: number;
}

export interface MissingMealDay {
  date: string;
  dayName: string;
  missingSlots: MealSlotName[];
}

export interface WeeklyPlan {
  weekStartDate: string;
  weekEndDate: string;
  dates: string[];
  days: PlannedDay[];
  workload: HouseholdWorkloadSummary;
  conflicts: ScheduleConflictSummary;
  unassignedTasks: TaskRecord[];
  missingMealDays: MissingMealDay[];
  routinesOverview: RoutineOverviewItem[];
  previousWeekSummary: PreviousWeekSummary;
  proposal?: WeeklyPlanProposal | undefined;
  isChildPerspective: boolean;
}

// -----------------------------------------------------------------------------
// PROPOSAL / DRAFT STATE MODEL
// -----------------------------------------------------------------------------

export interface RoutineStepProposalUpdate {
  assignedTo?: string | undefined;
  durationMinutes?: number | undefined;
}

export interface RoutineProposalUpdate {
  assignedTo?: string | undefined;
  steps?: Record<string, RoutineStepProposalUpdate> | undefined;
}

export interface WeeklyPlanProposal {
  id: string;
  createdAt: string;
  weekStartDate: string;
  taskUpdates: Record<string, Partial<TaskRecord>>;
  newTasks: TaskRecord[];
  routineUpdates: Record<string, RoutineProposalUpdate>;
  mealUpdates: Record<string, string>;
}

export interface WeeklyPlanInput {
  dates?: string[] | undefined;
  referenceDate?: string | Date | undefined;
  startDay?: WeekStartDay | undefined;
  memberId?: string | undefined;
  familyMembers: FamilyMember[];
  tasks: TaskRecord[];
  routines: Routine[];
  events: CalEventRecord[];
  meals: Record<string, string>;
  grocery?: { id: string; got: boolean; name?: string | undefined }[] | undefined;
  prayers: { id: string; name: string; time: string }[];
  proposal?: WeeklyPlanProposal | undefined;
  todayIso?: string | undefined;
}

// -----------------------------------------------------------------------------
// PROPOSAL MANAGEMENT FUNCTIONS
// -----------------------------------------------------------------------------

/**
 * Creates an empty weekly plan proposal draft.
 */
export function createWeeklyProposal(weekStartDate: string): WeeklyPlanProposal {
  return {
    id: `proposal-${weekStartDate}-${Date.now()}`,
    createdAt: new Date().toISOString(),
    weekStartDate,
    taskUpdates: {},
    newTasks: [],
    routineUpdates: {},
    mealUpdates: {},
  };
}

/**
 * Stages a task assignment in the proposal draft.
 */
export function stageTaskAssignment(
  proposal: WeeklyPlanProposal,
  taskId: string,
  assignedTo?: string | undefined
): WeeklyPlanProposal {
  // If it's a staged new task, update in place
  const existingNewTask = proposal.newTasks.find((t) => t.id === taskId);
  if (existingNewTask) {
    return {
      ...proposal,
      newTasks: proposal.newTasks.map((t) =>
        t.id === taskId ? { ...t, assignedTo, assigneeId: assignedTo } : t
      ),
    };
  }

  return {
    ...proposal,
    taskUpdates: {
      ...proposal.taskUpdates,
      [taskId]: {
        ...(proposal.taskUpdates[taskId] || {}),
        assignedTo,
        assigneeId: assignedTo,
      },
    },
  };
}

/**
 * Stages task schedule changes (date, time, prayer-relative anchor, schedule mode) in the proposal.
 */
export function stageTaskSchedule(
  proposal: WeeklyPlanProposal,
  taskId: string,
  schedule: {
    date?: string | undefined;
    time?: string | undefined;
    relativeAnchor?: any;
    scheduleMode?: ScheduleMode | undefined;
    durationMinutes?: number | undefined;
  }
): WeeklyPlanProposal {
  const existingNewTask = proposal.newTasks.find((t) => t.id === taskId);
  if (existingNewTask) {
    return {
      ...proposal,
      newTasks: proposal.newTasks.map((t) =>
        t.id === taskId ? { ...t, ...schedule } : t
      ),
    };
  }

  return {
    ...proposal,
    taskUpdates: {
      ...proposal.taskUpdates,
      [taskId]: {
        ...(proposal.taskUpdates[taskId] || {}),
        ...schedule,
      },
    },
  };
}

/**
 * Stages adding a new task to the weekly plan draft.
 */
export function stageNewTask(
  proposal: WeeklyPlanProposal,
  task: Omit<TaskRecord, "id"> & { id?: string | undefined }
): WeeklyPlanProposal {
  const id = task.id || `staged-task-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const fullTask: TaskRecord = {
    ...task,
    id,
    title: task.title.trim() || "Untitled Task",
  };

  return {
    ...proposal,
    newTasks: [...proposal.newTasks.filter((t) => t.id !== id), fullTask],
  };
}

/**
 * Removes a staged new task from the proposal draft.
 */
export function stageRemoveNewTask(
  proposal: WeeklyPlanProposal,
  taskId: string
): WeeklyPlanProposal {
  return {
    ...proposal,
    newTasks: proposal.newTasks.filter((t) => t.id !== taskId),
  };
}

/**
 * Stages a routine step assignment in the proposal draft.
 */
export function stageRoutineStepAssignment(
  proposal: WeeklyPlanProposal,
  routineId: string,
  stepId: string,
  assignedTo?: string | undefined
): WeeklyPlanProposal {
  const routineUpdate = proposal.routineUpdates[routineId] || {};
  const stepUpdates = routineUpdate.steps || {};

  return {
    ...proposal,
    routineUpdates: {
      ...proposal.routineUpdates,
      [routineId]: {
        ...routineUpdate,
        steps: {
          ...stepUpdates,
          [stepId]: {
            ...(stepUpdates[stepId] || {}),
            assignedTo,
          },
        },
      },
    },
  };
}

/**
 * Stages routine ownership in the proposal draft.
 */
export function stageRoutineOwner(
  proposal: WeeklyPlanProposal,
  routineId: string,
  assignedTo?: string | undefined
): WeeklyPlanProposal {
  const routineUpdate = proposal.routineUpdates[routineId] || {};

  return {
    ...proposal,
    routineUpdates: {
      ...proposal.routineUpdates,
      [routineId]: {
        ...routineUpdate,
        assignedTo,
      },
    },
  };
}

/**
 * Stages a meal plan entry in the proposal draft.
 */
export function stageMeal(
  proposal: WeeklyPlanProposal,
  slotKey: string, // e.g. "Mon-Dinner", "Tue-Lunch"
  mealName: string
): WeeklyPlanProposal {
  return {
    ...proposal,
    mealUpdates: {
      ...proposal.mealUpdates,
      [slotKey]: mealName.trim(),
    },
  };
}

/**
 * Checks if a proposal draft contains any staged modifications.
 */
export function hasStagedChanges(proposal?: WeeklyPlanProposal | null): boolean {
  if (!proposal) return false;
  const hasTaskUpdates = Object.keys(proposal.taskUpdates).length > 0;
  const hasNewTasks = proposal.newTasks.length > 0;
  const hasRoutineUpdates = Object.keys(proposal.routineUpdates).length > 0;
  const hasMealUpdates = Object.keys(proposal.mealUpdates).length > 0;
  return hasTaskUpdates || hasNewTasks || hasRoutineUpdates || hasMealUpdates;
}

/**
 * Counts the total number of staged modifications in a proposal draft.
 */
export function countStagedChanges(proposal?: WeeklyPlanProposal | null): number {
  if (!proposal) return 0;
  let count = 0;
  count += Object.keys(proposal.taskUpdates).length;
  count += proposal.newTasks.length;
  for (const r of Object.values(proposal.routineUpdates)) {
    if (r.assignedTo !== undefined) count++;
    if (r.steps) count += Object.keys(r.steps).length;
  }
  count += Object.keys(proposal.mealUpdates).length;
  return count;
}

// -----------------------------------------------------------------------------
// MERGE PROPOSAL IN-MEMORY FOR PREVIEW
// -----------------------------------------------------------------------------

function applyProposalToDomainInMemory(
  tasks: TaskRecord[],
  routines: Routine[],
  meals: Record<string, string>,
  proposal?: WeeklyPlanProposal | null
): {
  mergedTasks: TaskRecord[];
  mergedRoutines: Routine[];
  mergedMeals: Record<string, string>;
  stagedTaskIds: Set<string>;
} {
  if (!proposal || !hasStagedChanges(proposal)) {
    return {
      mergedTasks: [...tasks],
      mergedRoutines: [...routines],
      mergedMeals: { ...meals },
      stagedTaskIds: new Set(),
    };
  }

  const stagedTaskIds = new Set<string>();

  // 1. Merge Tasks
  const mergedTasks: TaskRecord[] = tasks.map((t) => {
    const update = proposal.taskUpdates[t.id];
    if (update) {
      stagedTaskIds.add(t.id);
      return { ...t, ...update };
    }
    return t;
  });

  // Append new tasks from proposal
  for (const nt of proposal.newTasks) {
    stagedTaskIds.add(nt.id);
    mergedTasks.push(nt);
  }

  // 2. Merge Routines
  const mergedRoutines: Routine[] = routines.map((r) => {
    const rUpdate = proposal.routineUpdates[r.id];
    if (!rUpdate) return r;

    let updatedRoutine = { ...r };
    if (rUpdate.assignedTo !== undefined) {
      updatedRoutine.assignedTo = rUpdate.assignedTo;
    }

    if (rUpdate.steps) {
      updatedRoutine.steps = r.steps.map((s) => {
        const stepUpdate = rUpdate.steps?.[s.id];
        if (stepUpdate) {
          return {
            ...s,
            ...(stepUpdate.assignedTo !== undefined ? { assignedTo: stepUpdate.assignedTo, assigneeId: stepUpdate.assignedTo } : {}),
            ...(stepUpdate.durationMinutes !== undefined ? { durationMinutes: stepUpdate.durationMinutes } : {}),
          };
        }
        return s;
      });
    }

    return updatedRoutine;
  });

  // 3. Merge Meals
  const mergedMeals = {
    ...meals,
    ...proposal.mealUpdates,
  };

  return {
    mergedTasks,
    mergedRoutines,
    mergedMeals,
    stagedTaskIds,
  };
}

// -----------------------------------------------------------------------------
// MAIN WEEKLY PLAN BUILDER
// -----------------------------------------------------------------------------

/**
 * Builds the complete, prioritized WeeklyPlan integration model for the given week.
 */
export function buildWeeklyPlan(input: WeeklyPlanInput): WeeklyPlan {
  const today = input.todayIso || isoDate();
  const dates = input.dates && input.dates.length === 7
    ? input.dates
    : getPlanningWeekRange(input.referenceDate || today, input.startDay || "monday");

  const weekStartDate = dates[0] || today;
  const weekEndDate = dates[6] || today;

  const familyMembers = input.familyMembers || [];
  const memberId = input.memberId;
  const isChild = isChildMember(memberId, familyMembers);
  const prayers = input.prayers || [];

  // 1. In-memory proposal merge
  const {
    mergedTasks,
    mergedRoutines,
    mergedMeals,
    stagedTaskIds,
  } = applyProposalToDomainInMemory(
    input.tasks || [],
    input.routines || [],
    input.meals || {},
    input.proposal
  );

  const memberNameMap = new Map<string, string>();
  for (const m of familyMembers) {
    memberNameMap.set(m.id, m.name);
  }

  // 2. Build Daily Rhythm Blocks and Planned Days
  const plannedDays: PlannedDay[] = [];
  const allWeekConflicts: ConflictSignal[] = [];

  for (const d of dates) {
    const dayName = getDayNameShort(d);
    const dayLetter = getDayLetter(d);
    const isToday = d === today;
    const isPast = d < today;

    // Detect conflicts for this day
    const dayConflicts = detectScheduleConflicts({
      date: d,
      memberId,
      tasks: mergedTasks,
      routines: mergedRoutines,
      events: input.events || [],
      prayers,
      familyMembers,
    });
    allWeekConflicts.push(...dayConflicts);

    // Filter items scoped to member perspective
    const dayTasks = filterTasksForMember(mergedTasks, memberId).filter((t) =>
      isTaskDueOnDate(t, d)
    );
    const dayEvents = filterEventsForMember(input.events || [], memberId).filter((e) =>
      isEventOnDate(e, d)
    );
    const dayRoutines = filterRoutinesForMember(mergedRoutines, memberId).filter((r) => {
      if (!r.enabled) return false;
      return isRepeating(r.recur) ? occursOn(r.recur, d) : true;
    });

    // Extract Day Meals
    const dayMeals = {
      breakfast: mergedMeals[`${dayName}-Breakfast`] || undefined,
      lunch: mergedMeals[`${dayName}-Lunch`] || undefined,
      dinner: mergedMeals[`${dayName}-Dinner`] || undefined,
    };

    // Synthesize Rhythm Blocks for Day
    const blocks: PlannedRhythmBlock[] = RHYTHM_BLOCK_IDS.map((blockId) => {
      const def = RHYTHM_BLOCK_DEFINITIONS[blockId];
      const startP = prayers.find((p) => p.id === def.startAnchor)?.time;
      const endP = prayers.find((p) => p.id === def.endAnchor)?.time;
      const displayTime = startP && endP ? `${startP} – ${endP}` : "";
      return {
        blockId,
        name: def.name,
        displayTime,
        startAnchor: def.startAnchor,
        endAnchor: def.endAnchor,
        items: [],
      };
    });

    const blockMap = new Map<RhythmBlockId, PlannedItem[]>();
    for (const b of blocks) {
      blockMap.set(b.blockId, b.items);
    }

    let dayScheduledMinutes = 0;

    // A. Add Calendar Events
    for (const ev of dayEvents) {
      const hasTime = Boolean(ev.time && ev.time.trim());
      const blockId: RhythmBlockId = hasTime
        ? resolveBlockForTimeSafe(ev.time!, prayers)
        : "morning";
      const dur = ev.durationMinutes || ev.duration || 30;
      dayScheduledMinutes += dur;

      const assignee = getTaskAssignee(ev as any);
      blockMap.get(blockId)?.push({
        id: `event-${ev.id}`,
        sourceId: ev.id,
        title: ev.title,
        category: "event",
        scheduleMode: hasTime ? "exactTime" : "unscheduled",
        time: ev.time,
        displaySchedule: ev.time || "All-day",
        durationMinutes: dur,
        assignedTo: assignee,
        assigneeName: assignee ? memberNameMap.get(assignee) : undefined,
        done: false,
        blockId,
      });
    }

    // B. Add Tasks
    for (const t of dayTasks) {
      const scheduleMode = getTaskScheduleMode(t);
      const isDone = isTaskRecordDone(t, d);
      const dur = t.durationMinutes || t.duration || 30;
      const assignee = getTaskAssignee(t);
      const isStaged = stagedTaskIds.has(t.id);

      let blockId: RhythmBlockId = "morning";
      let displaySchedule = "Anytime";

      if (scheduleMode === "exactTime" && t.time) {
        blockId = resolveBlockForTimeSafe(t.time, prayers);
        displaySchedule = t.time;
        dayScheduledMinutes += dur;
      } else if (scheduleMode === "relativePrayer" && t.relativeAnchor) {
        const placement = resolveTaskPlacement(t, prayers);
        blockId = placement.blockId;
        displaySchedule = placement.displayLabel || "Prayer-relative";
        dayScheduledMinutes += dur;
      }

      blockMap.get(blockId)?.push({
        id: `task-${t.id}`,
        sourceId: t.id,
        title: t.title,
        category: "task",
        scheduleMode,
        time: t.time,
        relativeAnchor: t.relativeAnchor,
        displaySchedule,
        durationMinutes: dur,
        assignedTo: assignee,
        assigneeName: assignee ? memberNameMap.get(assignee) : undefined,
        done: isDone,
        blockId,
        isStaged,
      });
    }

    // C. Add Routines
    for (const r of dayRoutines) {
      const routineOwner = getRoutineOwner(r);
      const isSharedRoutine = !routineOwner;

      const relevantSteps = r.steps.filter((s) => {
        const stepAssignee = getRoutineStepAssignee(s);
        if (memberId) {
          if (stepAssignee) return stepAssignee === memberId;
          return routineOwner === memberId || isSharedRoutine;
        }
        return true;
      });

      if (relevantSteps.length === 0) continue;

      const scheduleMode = r.scheduleMode || (r.time ? "exactTime" : r.relativeAnchor ? "relativePrayer" : "unscheduled");
      let blockId: RhythmBlockId = "morning";
      let displaySchedule = "Routine";

      if (scheduleMode === "exactTime" && r.time) {
        blockId = resolveBlockForTimeSafe(r.time, prayers);
        displaySchedule = r.time;
      } else if (scheduleMode === "relativePrayer" && r.relativeAnchor) {
        const placement = resolveTaskPlacement(
          { relativeAnchor: r.relativeAnchor, scheduleMode: "relativePrayer" },
          prayers
        );
        blockId = placement.blockId;
        displaySchedule = placement.displayLabel || "Prayer-relative";
      }

      const totalRoutineDur = relevantSteps.reduce((sum, s) => sum + (s.durationMinutes || 10), 0);
      dayScheduledMinutes += totalRoutineDur;

      const doneSteps = relevantSteps.filter((s) => s.completions?.includes(d)).length;
      const isRoutineDone = doneSteps === relevantSteps.length && relevantSteps.length > 0;

      blockMap.get(blockId)?.push({
        id: `routine-${r.id}`,
        sourceId: r.id,
        title: `${r.name} (${doneSteps}/${relevantSteps.length})`,
        category: "routine",
        scheduleMode,
        time: r.time,
        relativeAnchor: r.relativeAnchor,
        displaySchedule,
        durationMinutes: totalRoutineDur,
        assignedTo: routineOwner,
        assigneeName: routineOwner ? memberNameMap.get(routineOwner) : undefined,
        done: isRoutineDone,
        blockId,
      });
    }

    plannedDays.push({
      date: d,
      dayName,
      dayLetter,
      isToday,
      isPast,
      prayers,
      blocks,
      tasks: dayTasks,
      events: dayEvents,
      routines: dayRoutines,
      meals: dayMeals,
      conflicts: dayConflicts,
      totalScheduledMinutes: dayScheduledMinutes,
    });
  }

  // 3. Compute Household Workload Intelligence for Week
  const rawWorkload = calculateHouseholdWorkload({
    dates,
    members: familyMembers,
    tasks: mergedTasks,
    routines: mergedRoutines,
    events: input.events || [],
    conflicts: allWeekConflicts,
    prayers,
    todayIso: today,
  });

  const workload = isChild && memberId
    ? filterWorkloadForChild(rawWorkload, memberId)
    : rawWorkload;

  // 4. Summarize Schedule Conflicts
  const conflictsSummary = summarizeScheduleConflicts(allWeekConflicts);

  // 5. Identify Unassigned Tasks Due In Week
  const unassignedTasks = mergedTasks.filter((t) => {
    if (!isTaskHousehold(t)) return false;
    return dates.some((d) => isTaskDueOnDate(t, d));
  });

  // 6. Detect Missing Meal Slots
  const missingMealDays: MissingMealDay[] = [];
  for (const d of dates) {
    const dayName = getDayNameShort(d);
    const missingSlots: MealSlotName[] = [];
    for (const slot of MEAL_SLOTS) {
      if (!mergedMeals[`${dayName}-${slot}`]) {
        missingSlots.push(slot);
      }
    }
    if (missingSlots.length > 0) {
      missingMealDays.push({
        date: d,
        dayName,
        missingSlots,
      });
    }
  }

  // 7. Generate Routines Overview
  const routinesOverview: RoutineOverviewItem[] = mergedRoutines.map((r) => {
    const activeDaysCount = dates.filter((d) =>
      r.enabled && (isRepeating(r.recur) ? occursOn(r.recur, d) : true)
    ).length;

    let scheduleLabel = "Anytime";
    if (r.time) scheduleLabel = r.time;
    else if (r.relativeAnchor) scheduleLabel = formatRelativeAnchorLabel(r.relativeAnchor);

    return {
      routineId: r.id,
      name: r.name,
      scheduleLabel,
      assignedTo: getRoutineOwner(r),
      activeDaysCount,
      stepsCount: r.steps.length,
    };
  });

  // 8. Synthesize Previous Week Review
  const prevWeekDates = [...Array(7)].map((_, i) => isoOffset(weekStartDate, -(7 - i)));
  const prevStartDate = prevWeekDates[0] || "";
  const prevEndDate = prevWeekDates[6] || "";

  const prevWorkload = calculateHouseholdWorkload({
    dates: prevWeekDates,
    members: familyMembers,
    tasks: input.tasks || [],
    routines: input.routines || [],
    events: input.events || [],
    prayers,
    todayIso: today,
  });

  const prevCompletedTasks = prevWorkload.householdTotal.totalCompleted;
  const prevOverdueTasks = prevWorkload.householdTotal.totalOverdue;

  const previousWeekSummary: PreviousWeekSummary = {
    startDate: prevStartDate,
    endDate: prevEndDate,
    completedTasksCount: prevCompletedTasks,
    unresolvedTasksCount: prevOverdueTasks,
    completedRoutineStepsCount: prevWorkload.householdTotal.totalCompleted,
    conflictsCount: prevWorkload.conflictsCount,
    workload: isChild && memberId ? filterWorkloadForChild(prevWorkload, memberId) : prevWorkload,
    reflectionNotice:
      prevCompletedTasks > 0
        ? `Alhamdulillah, your family completed ${prevCompletedTasks} responsibilities last week.`
        : "A quiet previous week. Ready to plan the upcoming days together.",
  };

  return {
    weekStartDate,
    weekEndDate,
    dates,
    days: plannedDays,
    workload,
    conflicts: conflictsSummary,
    unassignedTasks,
    missingMealDays,
    routinesOverview,
    previousWeekSummary,
    proposal: input.proposal,
    isChildPerspective: isChild,
  };
}

// -----------------------------------------------------------------------------
// COMMIT & APPROVAL PERSISTENCE ENGINE (IDEMPOTENT)
// -----------------------------------------------------------------------------

export interface CommitPlanResult {
  tasks: TaskRecord[];
  routines: Routine[];
  meals: Record<string, string>;
  summary: {
    tasksUpdated: number;
    tasksCreated: number;
    routinesUpdated: number;
    mealsUpdated: number;
  };
}

/**
 * Commits a weekly plan proposal draft into concrete domain records.
 *
 * Guaranteed Properties:
 * 1. Mutates no external state directly (pure function).
 * 2. Idempotent: Executing this function repeatedly with the same proposal against
 *    its own output produces identical state and 0 duplicate items.
 * 3. Preserves all unrelated task/routine/calendar fields.
 */
export function commitWeeklyPlanProposal(
  proposal: WeeklyPlanProposal | undefined | null,
  currentData: {
    tasks: TaskRecord[];
    routines: Routine[];
    meals: Record<string, string>;
  }
): CommitPlanResult {
  const currentTasks = currentData.tasks || [];
  const currentRoutines = currentData.routines || [];
  const currentMeals = currentData.meals || {};

  if (!proposal || !hasStagedChanges(proposal)) {
    return {
      tasks: [...currentTasks],
      routines: [...currentRoutines],
      meals: { ...currentMeals },
      summary: {
        tasksUpdated: 0,
        tasksCreated: 0,
        routinesUpdated: 0,
        mealsUpdated: 0,
      },
    };
  }

  let tasksUpdated = 0;
  let tasksCreated = 0;
  let routinesUpdated = 0;
  let mealsUpdated = 0;

  // 1. Update Existing Tasks
  const taskMap = new Map<string, TaskRecord>();
  for (const t of currentTasks) {
    taskMap.set(t.id, { ...t });
  }

  for (const [taskId, update] of Object.entries(proposal.taskUpdates)) {
    const existing = taskMap.get(taskId);
    if (existing) {
      taskMap.set(taskId, {
        ...existing,
        ...update,
      });
      tasksUpdated++;
    }
  }

  // 2. Add New Tasks (Deduplicating by ID)
  for (const nt of proposal.newTasks) {
    if (!taskMap.has(nt.id)) {
      taskMap.set(nt.id, { ...nt });
      tasksCreated++;
    } else {
      // Already present, update fields
      taskMap.set(nt.id, {
        ...taskMap.get(nt.id)!,
        ...nt,
      });
    }
  }

  const finalTasks = Array.from(taskMap.values());

  // 3. Update Routines & Steps
  const finalRoutines: Routine[] = currentRoutines.map((r) => {
    const rUpdate = proposal.routineUpdates[r.id];
    if (!rUpdate) return { ...r };

    routinesUpdated++;
    let updated = { ...r };

    if (rUpdate.assignedTo !== undefined) {
      updated.assignedTo = rUpdate.assignedTo;
    }

    if (rUpdate.steps) {
      updated.steps = r.steps.map((s) => {
        const stepUpdate = rUpdate.steps?.[s.id];
        if (stepUpdate) {
          return {
            ...s,
            ...(stepUpdate.assignedTo !== undefined
              ? { assignedTo: stepUpdate.assignedTo, assigneeId: stepUpdate.assignedTo }
              : {}),
            ...(stepUpdate.durationMinutes !== undefined
              ? { durationMinutes: stepUpdate.durationMinutes }
              : {}),
          };
        }
        return { ...s };
      });
    }

    return updated;
  });

  // 4. Update Meals
  const finalMeals = { ...currentMeals };
  for (const [slotKey, mealName] of Object.entries(proposal.mealUpdates)) {
    if (finalMeals[slotKey] !== mealName) {
      finalMeals[slotKey] = mealName;
      mealsUpdated++;
    }
  }

  return {
    tasks: finalTasks,
    routines: finalRoutines,
    meals: finalMeals,
    summary: {
      tasksUpdated,
      tasksCreated,
      routinesUpdated,
      mealsUpdated,
    },
  };
}

// -----------------------------------------------------------------------------
// GUIDED WORKFLOW STEP HELPERS
// -----------------------------------------------------------------------------

export type WeeklyPlanningStepId =
  | "review_previous"
  | "fixed_events"
  | "routines"
  | "assignments"
  | "conflicts"
  | "workload"
  | "meals"
  | "approval";

export interface WeeklyPlanningStepSummary {
  stepId: WeeklyPlanningStepId;
  stepNumber: number;
  title: string;
  subtitle: string;
  status: "complete" | "needs_attention" | "optimal";
  highlights: string[];
}

/**
 * Returns structured, empathetic guidance for each step of the Weekly Planning workflow.
 */
export function getWeeklyPlanningStepSummary(
  stepId: WeeklyPlanningStepId,
  plan: WeeklyPlan
): WeeklyPlanningStepSummary {
  switch (stepId) {
    case "review_previous": {
      const prev = plan.previousWeekSummary;
      return {
        stepId,
        stepNumber: 1,
        title: "Review Previous Week",
        subtitle: "Reflect gently on completed work and carry-forward intentions.",
        status: prev.unresolvedTasksCount > 0 ? "needs_attention" : "optimal",
        highlights: [
          `${prev.completedTasksCount} responsibilities completed last week`,
          `${prev.unresolvedTasksCount} waiting tasks ready to schedule or clear`,
        ],
      };
    }
    case "fixed_events": {
      const totalEvents = plan.days.reduce((sum, d) => sum + d.events.length, 0);
      return {
        stepId,
        stepNumber: 2,
        title: "Upcoming Fixed Events",
        subtitle: "Review school, appointments, and calendar commitments.",
        status: totalEvents > 0 ? "complete" : "optimal",
        highlights: [
          `${totalEvents} calendar event${totalEvents === 1 ? "" : "s"} scheduled this week`,
        ],
      };
    }
    case "routines": {
      const count = plan.routinesOverview.length;
      return {
        stepId,
        stepNumber: 3,
        title: "Family Routines",
        subtitle: "Check recurring morning, prayer, and evening habits.",
        status: count > 0 ? "complete" : "needs_attention",
        highlights: [
          `${count} family routine${count === 1 ? "" : "s"} active across the week`,
        ],
      };
    }
    case "assignments": {
      const unassigned = plan.unassignedTasks.length;
      return {
        stepId,
        stepNumber: 4,
        title: "Assign Responsibilities",
        subtitle: "Ensure family members know what is theirs to carry.",
        status: unassigned > 0 ? "needs_attention" : "optimal",
        highlights: [
          unassigned > 0
            ? `${unassigned} task${unassigned === 1 ? "" : "s"} currently unassigned`
            : "All planned tasks are assigned to family members",
        ],
      };
    }
    case "conflicts": {
      const conflicts = plan.conflicts;
      return {
        stepId,
        stepNumber: 5,
        title: "Schedule Conflicts",
        subtitle: "Identify overlapping commitments and prayer collisions.",
        status: conflicts.hasConflicts ? "needs_attention" : "optimal",
        highlights: [
          conflicts.hardConflicts > 0
            ? `${conflicts.hardConflicts} exact-time overlap${conflicts.hardConflicts === 1 ? "" : "s"} to reschedule`
            : "No hard schedule overlaps detected",
          conflicts.softConflicts > 0
            ? `${conflicts.softConflicts} prayer-time collision${conflicts.softConflicts === 1 ? "" : "s"}`
            : "Prayer windows are clear",
        ],
      };
    }
    case "workload": {
      const fairness = plan.workload.fairness;
      return {
        stepId,
        stepNumber: 6,
        title: "Workload Balance",
        subtitle: "Keep responsibility distribution healthy and considerate.",
        status: fairness.status === "skewed" ? "needs_attention" : "optimal",
        highlights: [
          fairness.headline,
          fairness.explanation,
        ],
      };
    }
    case "meals": {
      const missingCount = plan.missingMealDays.length;
      return {
        stepId,
        stepNumber: 7,
        title: "Meals & Grocery",
        subtitle: "Ensure breakfast, lunch, and dinner plans are settled.",
        status: missingCount > 0 ? "needs_attention" : "optimal",
        highlights: [
          missingCount > 0
            ? `${missingCount} day${missingCount === 1 ? "" : "s"} with unfilled meal slots`
            : "All meal slots for the week are planned",
        ],
      };
    }
    case "approval": {
      const stagedCount = countStagedChanges(plan.proposal);
      return {
        stepId,
        stepNumber: 8,
        title: "Approve Week",
        subtitle: "Review draft and save changes to your family's operating rhythm.",
        status: stagedCount > 0 ? "needs_attention" : "complete",
        highlights: [
          stagedCount > 0
            ? `${stagedCount} staged modification${stagedCount === 1 ? "" : "s"} ready to commit`
            : "Plan is in sync with household records",
        ],
      };
    }
  }
}

// -----------------------------------------------------------------------------
// INTERNAL TIME-TO-BLOCK RESOLUTION
// -----------------------------------------------------------------------------

function resolveBlockForTimeSafe(
  timeStr: string,
  prayers: { id: string; time: string }[]
): RhythmBlockId {
  const prayerMap: Record<PrayerId, number> = {
    fajr: 300,
    dhuhr: 750,
    asr: 945,
    maghrib: 1110,
    isha: 1185,
  };

  for (const p of prayers) {
    if ((PRAYER_IDS as readonly string[]).includes(p.id)) {
      prayerMap[p.id as PrayerId] = timeToMinutes(p.time);
    }
  }

  const mins = timeToMinutes(timeStr);
  const { fajr, dhuhr, asr, maghrib, isha } = prayerMap;

  if (mins >= fajr && mins < dhuhr) return "morning";
  if (mins >= dhuhr && mins < asr) return "afternoon";
  if (mins >= asr && mins < maghrib) return "lateAfternoon";
  if (mins >= maghrib && mins < isha) return "evening";
  return "night";
}
