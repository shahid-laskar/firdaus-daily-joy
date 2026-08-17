/**
 * FIRDAUS FAMILY ROUTINES ENGINE (Wave 1.3)
 *
 * A routine is an ordered sequence of related activities (e.g. School Morning,
 * After Maghrib Family Time, Bedtime Reset).
 *
 * Core Principles:
 * 1. A routine is NOT a simple recurring task list; it has identity, ordered steps,
 *    temporal rhythm placement, and date-aware instance state.
 * 2. Routine definitions are static templates. They do NOT store permanent completion.
 * 3. Daily instance state (progress, step completion) is date-aware and resets each day.
 * 4. Prayer-relative scheduling dynamically resolves through the Rhythm Engine.
 * 5. Works seamlessly with Family Members, Daily Surface, and Reminders.
 * 6. Experience-agnostic neutral domain logic.
 */

import { occursOn, isRepeating, type Recurrence } from "./recurrence";
import {
  type PrayerId,
  type RhythmBlockId,
  type RelativePrayerAnchor,
  type RelativePrayerAnchorObj,
  type ScheduleMode,
  type PrayerTimeMap,
  extractPrayerTimeMap,
  resolveTaskPlacement,
  formatRelativeAnchorLabel,
  getTaskScheduleMode,
  normalizeRelativeAnchor,
} from "./rhythm-engine";
import type { FamilyMember } from "./family-model";
import { isoDate } from "./intelligence";

// -----------------------------------------------------------------------------
// TYPES & DOMAIN MODELS
// -----------------------------------------------------------------------------

export type RoutineCategory =
  | "morning"
  | "evening"
  | "prayer"
  | "school"
  | "bedtime"
  | "household"
  | "general";

export interface RoutineStep {
  id: string;
  title: string;
  order: number;
  durationMinutes?: number | undefined;
  assigneeId?: string | undefined; // family member ID
  note?: string | undefined;
  completions?: string[] | undefined; // ISO dates (YYYY-MM-DD) when step was completed
  skipped?: string[] | undefined; // ISO dates (YYYY-MM-DD) when step was skipped
}

export interface Routine {
  id: string;
  name: string;
  description?: string | undefined;
  enabled: boolean;
  category?: RoutineCategory | undefined;
  icon?: string | undefined;
  scheduleMode?: ScheduleMode | undefined;
  time?: string | undefined; // "HH:mm" if exact clock time
  relativeAnchor?: RelativePrayerAnchor | string | undefined; // e.g. "afterFajr", "afterMaghrib"
  recur?: Recurrence | undefined; // Recurrence rule (daily, weekly, weekdays, etc.)
  memberId?: string | undefined; // Optional routine-level family member ownership (undefined = household)
  steps: RoutineStep[];
  createdAt?: string | undefined;
}

export type RoutineStatus = "not_started" | "in_progress" | "completed" | "skipped";

export interface RoutineStepInstance {
  id: string;
  routineId: string;
  title: string;
  order: number;
  durationMinutes?: number | undefined;
  assigneeId?: string | undefined;
  assigneeName?: string | undefined;
  note?: string | undefined;
  isCompleted: boolean;
  isSkipped: boolean;
}

export interface RoutineDayInstance {
  routineId: string;
  date: string; // ISO date YYYY-MM-DD
  name: string;
  description?: string | undefined;
  category: RoutineCategory;
  scheduleMode: ScheduleMode;
  displaySchedule: string; // e.g. "After Maghrib", "07:30", or ""
  targetBlock: RhythmBlockId;
  targetPrayer?: PrayerId | undefined;
  approximateMinutes?: number | undefined;
  memberId?: string | undefined;
  memberName?: string | undefined;
  totalSteps: number;
  completedSteps: number;
  skippedSteps: number;
  progressPct: number; // 0..100
  status: RoutineStatus;
  isDueToday: boolean;
  steps: RoutineStepInstance[];
  currentStep?: RoutineStepInstance | undefined; // First uncompleted step
  nextStep?: RoutineStepInstance | undefined;
}

export interface RoutineSignal {
  routineId: string;
  name: string;
  status: RoutineStatus;
  progressPct: number;
  completedSteps: number;
  totalSteps: number;
  currentStepTitle?: string | undefined;
  targetBlock: RhythmBlockId;
  displaySchedule: string;
  message: string;
  priority: number; // 1 (urgent) to 10 (ambient)
}

// -----------------------------------------------------------------------------
// PURE UTILITIES & CONSTRUCTORS
// -----------------------------------------------------------------------------

function generateId(prefix = "rt"): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * Creates a validated Routine instance with stable IDs and standard defaults.
 */
export function createRoutine(
  input: {
    id?: string | undefined;
    name: string;
    description?: string | undefined;
    enabled?: boolean | undefined;
    category?: RoutineCategory | undefined;
    icon?: string | undefined;
    scheduleMode?: ScheduleMode | undefined;
    time?: string | undefined;
    relativeAnchor?: RelativePrayerAnchor | string | undefined;
    recur?: Recurrence | undefined;
    memberId?: string | undefined;
    steps?: (Partial<RoutineStep> & { title: string })[] | undefined;
    createdAt?: string | undefined;
  },
  todayIso = isoDate()
): Routine {
  const routineId = input.id || generateId("rt");
  const rawSteps = input.steps || [];

  const steps: RoutineStep[] = rawSteps.map((s, idx) => ({
    id: s.id || generateId("step"),
    title: (s.title || "").trim(),
    order: typeof s.order === "number" ? s.order : idx + 1,
    durationMinutes: typeof s.durationMinutes === "number" ? s.durationMinutes : undefined,
    assigneeId: s.assigneeId,
    note: s.note,
    completions: Array.isArray(s.completions) ? [...s.completions] : [],
    skipped: Array.isArray(s.skipped) ? [...s.skipped] : [],
  }));

  // Sort steps by order
  steps.sort((a, b) => a.order - b.order);

  const mode = getTaskScheduleMode({
    scheduleMode: input.scheduleMode,
    time: input.time,
    relativeAnchor: input.relativeAnchor,
  });

  return {
    id: routineId,
    name: input.name.trim(),
    description: input.description?.trim(),
    enabled: input.enabled ?? true,
    category: input.category ?? "general",
    icon: input.icon,
    scheduleMode: mode,
    time: input.time,
    relativeAnchor: input.relativeAnchor,
    recur: input.recur ?? { freq: "daily", start: todayIso },
    memberId: input.memberId,
    steps,
    createdAt: input.createdAt || new Date().toISOString(),
  };
}

/**
 * Defensively normalizes a raw or stored routine object.
 */
export function normalizeRoutine(raw: unknown, todayIso = isoDate()): Routine | null {
  if (!raw || typeof raw !== "object") return null;
  const obj = raw as Record<string, any>;
  if (!obj["name"] || typeof obj["name"] !== "string") return null;

  return createRoutine(
    {
      id: typeof obj["id"] === "string" ? obj["id"] : undefined,
      name: obj["name"],
      description: typeof obj["description"] === "string" ? obj["description"] : undefined,
      enabled: typeof obj["enabled"] === "boolean" ? obj["enabled"] : true,
      category: obj["category"],
      icon: typeof obj["icon"] === "string" ? obj["icon"] : undefined,
      scheduleMode: obj["scheduleMode"],
      time: typeof obj["time"] === "string" ? obj["time"] : undefined,
      relativeAnchor: obj["relativeAnchor"],
      recur: obj["recur"],
      memberId: typeof obj["memberId"] === "string" ? obj["memberId"] : undefined,
      steps: Array.isArray(obj["steps"]) ? obj["steps"] : [],
      createdAt: typeof obj["createdAt"] === "string" ? obj["createdAt"] : undefined,
    },
    todayIso
  );
}

/**
 * Checks whether a routine is scheduled to occur on a given ISO date.
 */
export function isRoutineDueOnDate(routine: Routine, dateIso: string): boolean {
  if (routine.enabled === false) return false;
  if (!routine.recur) return true;
  return occursOn(routine.recur, dateIso);
}

/**
 * Dynamically resolves a routine's rhythm block, schedule display label,
 * and presentation ordering minutes for a given day's prayer times.
 */
export function resolveRoutineSchedule(
  routine: Routine,
  prayers: PrayerTimeMap | { id: string; time: string }[]
): {
  blockId: RhythmBlockId;
  scheduleMode: ScheduleMode;
  displaySchedule: string;
  targetPrayer?: PrayerId | undefined;
  approximateMinutes?: number | undefined;
} {
  const placement = resolveTaskPlacement(
    {
      title: routine.name,
      time: routine.time,
      relativeAnchor: routine.relativeAnchor,
      scheduleMode: routine.scheduleMode,
      category: routine.category,
    },
    prayers
  );

  return {
    blockId: placement.blockId,
    scheduleMode: placement.scheduleMode,
    displaySchedule: placement.displayLabel,
    targetPrayer: placement.targetPrayer,
    approximateMinutes: placement.approximateMinutes,
  };
}

/**
 * Derives a complete date-aware RoutineDayInstance for a specific day.
 * Pure, deterministic, and immutable.
 */
export function deriveRoutineDayInstance(
  routine: Routine,
  dateIso: string,
  prayers: PrayerTimeMap | { id: string; time: string }[],
  familyMembers: FamilyMember[] = []
): RoutineDayInstance {
  const schedule = resolveRoutineSchedule(routine, prayers);
  const isDue = isRoutineDueOnDate(routine, dateIso);

  const memberMap = new Map<string, string>();
  for (const m of familyMembers) {
    if (m && m.id) memberMap.set(m.id, m.name);
  }

  const routineMemberName = routine.memberId ? memberMap.get(routine.memberId) : undefined;

  let completedSteps = 0;
  let skippedSteps = 0;

  const sortedSteps = [...routine.steps].sort((a, b) => a.order - b.order);

  const stepInstances: RoutineStepInstance[] = sortedSteps.map((s, idx) => {
    const isCompleted = Boolean(s.completions && s.completions.includes(dateIso));
    const isSkipped = Boolean(s.skipped && s.skipped.includes(dateIso));

    if (isCompleted) completedSteps++;
    else if (isSkipped) skippedSteps++;

    const assigneeId = s.assigneeId || routine.memberId;
    const assigneeName = assigneeId ? memberMap.get(assigneeId) : undefined;

    return {
      id: s.id,
      routineId: routine.id,
      title: s.title,
      order: typeof s.order === "number" ? s.order : idx + 1,
      durationMinutes: s.durationMinutes,
      assigneeId,
      assigneeName,
      note: s.note,
      isCompleted,
      isSkipped,
    };
  });

  const totalSteps = stepInstances.length;
  const activeCount = completedSteps + skippedSteps;

  let progressPct = 0;
  if (totalSteps > 0) {
    progressPct = Math.round((completedSteps / totalSteps) * 100);
  }

  let status: RoutineStatus = "not_started";
  if (totalSteps > 0 && activeCount === totalSteps) {
    status = completedSteps === 0 && skippedSteps > 0 ? "skipped" : "completed";
  } else if (activeCount > 0) {
    status = "in_progress";
  }

  // Identify current actionable step (first non-completed and non-skipped step)
  const pendingSteps = stepInstances.filter((s) => !s.isCompleted && !s.isSkipped);
  const currentStep = pendingSteps[0];
  const nextStep = pendingSteps[1];

  return {
    routineId: routine.id,
    date: dateIso,
    name: routine.name,
    description: routine.description,
    category: routine.category || "general",
    scheduleMode: schedule.scheduleMode,
    displaySchedule: schedule.displaySchedule,
    targetBlock: schedule.blockId,
    targetPrayer: schedule.targetPrayer,
    approximateMinutes: schedule.approximateMinutes,
    memberId: routine.memberId,
    memberName: routineMemberName,
    totalSteps,
    completedSteps,
    skippedSteps,
    progressPct,
    status,
    isDueToday: isDue,
    steps: stepInstances,
    currentStep,
    nextStep,
  };
}

/**
 * Returns all active routine instances due for a given ISO date,
 * sorted chronologically by approximateMinutes where available.
 */
export function getTodayRoutineInstances(
  routines: Routine[],
  dateIso: string,
  prayers: PrayerTimeMap | { id: string; time: string }[],
  familyMembers: FamilyMember[] = []
): RoutineDayInstance[] {
  const instances: RoutineDayInstance[] = [];

  for (const r of routines) {
    if (!r || r.enabled === false) continue;
    if (isRoutineDueOnDate(r, dateIso)) {
      instances.push(deriveRoutineDayInstance(r, dateIso, prayers, familyMembers));
    }
  }

  // Sort by approximate minutes if scheduled, then by name
  instances.sort((a, b) => {
    if (a.approximateMinutes !== undefined && b.approximateMinutes !== undefined) {
      return a.approximateMinutes - b.approximateMinutes;
    }
    if (a.approximateMinutes !== undefined) return -1;
    if (b.approximateMinutes !== undefined) return 1;
    return a.name.localeCompare(b.name);
  });

  return instances;
}

/**
 * Immutably toggles completion of a specific routine step on a given date.
 */
export function toggleRoutineStepCompletion(
  routine: Routine,
  stepId: string,
  dateIso: string
): Routine {
  const updatedSteps = routine.steps.map((s) => {
    if (s.id !== stepId) return s;
    const comps = s.completions || [];
    const isDone = comps.includes(dateIso);
    const newComps = isDone ? comps.filter((d) => d !== dateIso) : [...comps, dateIso];

    // If completing, ensure skipped flag is cleared for today
    const newSkipped = (s.skipped || []).filter((d) => d !== dateIso);

    return {
      ...s,
      completions: newComps,
      skipped: newSkipped,
    };
  });

  return {
    ...routine,
    steps: updatedSteps,
  };
}

/**
 * Immutably sets completion state of a specific routine step on a given date.
 */
export function setRoutineStepCompletion(
  routine: Routine,
  stepId: string,
  dateIso: string,
  completed: boolean
): Routine {
  const updatedSteps = routine.steps.map((s) => {
    if (s.id !== stepId) return s;
    const comps = s.completions || [];
    const hasDate = comps.includes(dateIso);

    let newComps = comps;
    if (completed && !hasDate) {
      newComps = [...comps, dateIso];
    } else if (!completed && hasDate) {
      newComps = comps.filter((d) => d !== dateIso);
    }

    const newSkipped = (s.skipped || []).filter((d) => d !== dateIso);

    return {
      ...s,
      completions: newComps,
      skipped: newSkipped,
    };
  });

  return {
    ...routine,
    steps: updatedSteps,
  };
}

/**
 * Immutably sets skipped state of a specific routine step on a given date.
 */
export function skipRoutineStep(
  routine: Routine,
  stepId: string,
  dateIso: string,
  skipped: boolean
): Routine {
  const updatedSteps = routine.steps.map((s) => {
    if (s.id !== stepId) return s;
    const currentSkipped = s.skipped || [];
    const hasDate = currentSkipped.includes(dateIso);

    let newSkipped = currentSkipped;
    if (skipped && !hasDate) {
      newSkipped = [...currentSkipped, dateIso];
    } else if (!skipped && hasDate) {
      newSkipped = currentSkipped.filter((d) => d !== dateIso);
    }

    // If skipping, remove from completions
    const newComps = (s.completions || []).filter((d) => d !== dateIso);

    return {
      ...s,
      completions: newComps,
      skipped: newSkipped,
    };
  });

  return {
    ...routine,
    steps: updatedSteps,
  };
}

/**
 * Calculates aggregate summary statistics across all derived routine instances for a day.
 */
export function getRoutineSummaryStats(instances: RoutineDayInstance[]): {
  totalRoutines: number;
  completedRoutines: number;
  inProgressRoutines: number;
  notStartedRoutines: number;
  totalSteps: number;
  completedSteps: number;
  overallPct: number;
} {
  let totalRoutines = instances.length;
  let completedRoutines = 0;
  let inProgressRoutines = 0;
  let notStartedRoutines = 0;
  let totalSteps = 0;
  let completedSteps = 0;

  for (const inst of instances) {
    if (inst.status === "completed") completedRoutines++;
    else if (inst.status === "in_progress") inProgressRoutines++;
    else notStartedRoutines++;

    totalSteps += inst.totalSteps;
    completedSteps += inst.completedSteps;
  }

  const overallPct = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

  return {
    totalRoutines,
    completedRoutines,
    inProgressRoutines,
    notStartedRoutines,
    totalSteps,
    completedSteps,
    overallPct,
  };
}

/**
 * Generates contextual signals from active routines for the Daily Surface
 * and smart reminder notifications.
 */
export function generateRoutineSignals(
  routines: Routine[],
  dateIso: string,
  prayers: PrayerTimeMap | { id: string; time: string }[],
  currentBlockId?: RhythmBlockId | undefined,
  familyMembers: FamilyMember[] = []
): RoutineSignal[] {
  const instances = getTodayRoutineInstances(routines, dateIso, prayers, familyMembers);
  const signals: RoutineSignal[] = [];

  for (const inst of instances) {
    if (inst.totalSteps === 0 || inst.status === "completed" || inst.status === "skipped") {
      continue;
    }

    const isCurrentBlock = currentBlockId ? inst.targetBlock === currentBlockId : false;
    let priority = 7;
    if (inst.status === "in_progress") {
      priority = isCurrentBlock ? 3 : 5;
    } else if (isCurrentBlock) {
      priority = 4;
    }

    let message = `${inst.name} (${inst.completedSteps}/${inst.totalSteps})`;
    if (inst.currentStep) {
      message = `${inst.name} · Next: ${inst.currentStep.title}`;
    }

    signals.push({
      routineId: inst.routineId,
      name: inst.name,
      status: inst.status,
      progressPct: inst.progressPct,
      completedSteps: inst.completedSteps,
      totalSteps: inst.totalSteps,
      currentStepTitle: inst.currentStep?.title,
      targetBlock: inst.targetBlock,
      displaySchedule: inst.displaySchedule,
      message,
      priority,
    });
  }

  // Sort signals by priority
  signals.sort((a, b) => a.priority - b.priority);
  return signals;
}
