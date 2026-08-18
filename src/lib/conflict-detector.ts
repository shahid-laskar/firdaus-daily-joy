/**
 * FIRDAUS FAMILY SCHEDULE CONFLICT DETECTION ENGINE (Wave 2.0-C)
 *
 * Provides deterministic, explainable schedule conflict and overload detection
 * for family members across exact-time commitments, prayer-relative rhythms,
 * routines, and calendar events.
 *
 * Core Principles:
 * 1. Deterministic & Pure: Same inputs strictly yield identical signals.
 * 2. Non-Mutating: Never alters user tasks, routines, events, or completions.
 * 3. Member-Scoped: Isolates commitments per family member without false leakage.
 * 4. Respects Prayer Rhythms: Does not fabricate exact times for prayer-relative tasks.
 * 5. Explainable & Empathetic: Factual, respectful explanations without judgment.
 * 6. Experience-Independent: Zero dependencies on React, UI archetypes, or presentation styles.
 */

import { isoDate } from "./intelligence";
import { isRepeating, occursOn } from "./recurrence";
import {
  type PrayerId,
  type RhythmBlockId,
  type RelativePrayerAnchorObj,
  type DayRhythm,
  type ScheduleMode,
  PRAYER_IDS,
  RHYTHM_BLOCK_IDS,
  RHYTHM_BLOCK_DEFINITIONS,
  timeToMinutes,
  minutesToTime,
  getTaskScheduleMode,
  resolveTaskPlacement,
  buildDayRhythmFromSurfaceData,
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
} from "./routine-engine";
import {
  type FamilyMember,
  getTaskAssignee,
  getRoutineOwner,
  getRoutineStepAssignee,
  filterTasksForMember,
  filterEventsForMember,
  filterRoutinesForMember,
} from "./family-model";

// -----------------------------------------------------------------------------
// CONSTANTS & THRESHOLDS
// -----------------------------------------------------------------------------

/** Default assumed duration in minutes for an exact-time item when none is provided */
export const DEFAULT_EXACT_DURATION_MINUTES = 30;

/** Default assumed duration in minutes for a single routine step */
export const DEFAULT_ROUTINE_STEP_DURATION_MINUTES = 10;

/** Default window in minutes reserved for Salah prayer anchor */
export const PRAYER_RESERVATION_MINUTES = 20;

/** Explicit, explainable overload thresholds */
export const OVERLOAD_THRESHOLDS = {
  /** Maximum number of exact-time commitments in a single rhythm block before triggering overload */
  MAX_EXACT_ITEMS_PER_BLOCK: 3,

  /** Maximum total responsibilities (tasks + routine steps + events) in a single rhythm block */
  MAX_TOTAL_ITEMS_PER_BLOCK: 5,

  /** Maximum ratio of scheduled commitment duration to block duration (0.85 = 85%) */
  MAX_BLOCK_OCCUPANCY_RATIO: 0.85,

  /** Maximum total scheduled commitment minutes across the entire day (480 mins = 8 hours) */
  MAX_DAILY_SCHEDULED_MINUTES: 480,

  /** Threshold for prayer-relative task density in a short block (e.g. late afternoon) */
  MAX_RELATIVE_TASKS_PER_BLOCK: 4,
} as const;

// -----------------------------------------------------------------------------
// TYPES & DOMAIN MODELS
// -----------------------------------------------------------------------------

export type ConflictType = "hard_conflict" | "soft_conflict" | "overload";

export type ConflictSeverity = "high" | "medium" | "low";

export type ConflictActionType = "reschedule" | "reassign" | "split" | "review";

export interface ConflictAffectedItem {
  id: string;
  title: string;
  category: "task" | "event" | "routine" | "prayer";
  time?: string | undefined; // "HH:mm"
  endTime?: string | undefined; // "HH:mm"
  displaySchedule?: string | undefined;
  durationMinutes?: number | undefined;
  blockId?: RhythmBlockId | undefined;
  assignedTo?: string | undefined;
}

export interface ConflictSignal {
  id: string;
  type: ConflictType;
  severity: ConflictSeverity;
  memberId?: string | undefined;
  date: string; // ISO "YYYY-MM-DD"
  blockId?: RhythmBlockId | undefined;
  affectedItems: ConflictAffectedItem[];
  explanation: string;
  suggestedAction: ConflictActionType;
}

export interface ScheduleConflictSummary {
  hasConflicts: boolean;
  totalConflicts: number;
  hardConflicts: number;
  softConflicts: number;
  overloads: number;
  conflicts: ConflictSignal[];
}

export interface ConflictDetectorInput {
  date: string; // ISO date "YYYY-MM-DD"
  memberId?: string | undefined; // Target family member or undefined for household
  tasks?: TaskRecord[] | undefined;
  routines?: Routine[] | undefined;
  events?: CalEventRecord[] | undefined;
  prayers: { id: string; name: string; time: string }[];
  dayRhythm?: DayRhythm | undefined;
  familyMembers?: FamilyMember[] | undefined;
}

// -----------------------------------------------------------------------------
// INTERNAL TEMPORAL COMMITMENT ITEM
// -----------------------------------------------------------------------------

interface NormalizedCommitment {
  id: string;
  sourceId: string;
  title: string;
  category: "task" | "event" | "routine" | "prayer";
  scheduleMode: ScheduleMode;
  time?: string | undefined; // "HH:mm"
  startMinutes?: number | undefined; // 0..1439
  endMinutes?: number | undefined; // 0..2879 (can span past midnight)
  durationMinutes: number;
  blockId: RhythmBlockId;
  assignedTo?: string | undefined;
  isPrayerRelative: boolean;
  displaySchedule: string;
}

// -----------------------------------------------------------------------------
// HELPER FUNCTIONS
// -----------------------------------------------------------------------------

/**
 * Extracts item duration or returns default.
 */
function getItemDuration(
  item: { duration?: number; durationMinutes?: number },
  defaultDuration = DEFAULT_EXACT_DURATION_MINUTES
): number {
  if (typeof item.durationMinutes === "number" && item.durationMinutes > 0) {
    return item.durationMinutes;
  }
  if (typeof item.duration === "number" && item.duration > 0) {
    return item.duration;
  }
  return defaultDuration;
}

/**
 * Determines whether two linear minute intervals [s1, e1) and [s2, e2) overlap.
 */
function intervalsOverlap(s1: number, e1: number, s2: number, e2: number): boolean {
  return Math.max(s1, s2) < Math.min(e1, e2);
}

/**
 * Resolves which rhythm block an exact time falls into based on prayer times.
 */
function resolveBlockForTime(
  timeStr: string,
  prayerMap: Record<PrayerId, number>
): RhythmBlockId {
  const mins = timeToMinutes(timeStr);
  const fajr = prayerMap.fajr;
  const dhuhr = prayerMap.dhuhr;
  const asr = prayerMap.asr;
  const maghrib = prayerMap.maghrib;
  const isha = prayerMap.isha;

  if (mins >= fajr && mins < dhuhr) return "morning";
  if (mins >= dhuhr && mins < asr) return "afternoon";
  if (mins >= asr && mins < maghrib) return "lateAfternoon";
  if (mins >= maghrib && mins < isha) return "evening";
  return "night";
}

// -----------------------------------------------------------------------------
// MAIN CONFLICT DETECTION ENGINE
// -----------------------------------------------------------------------------

/**
 * Detects scheduling conflicts, prayer intersections, and workload overloads for a
 * family member (or the household) on a given date.
 */
export function detectScheduleConflicts(input: ConflictDetectorInput): ConflictSignal[] {
  const {
    date,
    memberId,
    tasks = [],
    routines = [],
    events = [],
    prayers = [],
    familyMembers = [],
  } = input;

  if (!date || prayers.length === 0) {
    return [];
  }

  // 1. Build prayer time lookup
  const prayerMap: Record<PrayerId, number> = {
    fajr: 300,
    dhuhr: 750,
    asr: 945,
    maghrib: 1110,
    isha: 1185,
  };
  const prayerNames: Record<PrayerId, string> = {
    fajr: "Fajr",
    dhuhr: "Dhuhr",
    asr: "Asr",
    maghrib: "Maghrib",
    isha: "Isha",
  };

  for (const p of prayers) {
    if (p && p.id && (PRAYER_IDS as readonly string[]).includes(p.id)) {
      prayerMap[p.id as PrayerId] = timeToMinutes(p.time);
      if (p.name) {
        prayerNames[p.id as PrayerId] = p.name;
      }
    }
  }

  // 2. Filter domain items strictly for this member scope
  const scopedTasks = filterTasksForMember(tasks, memberId).filter((t) => {
    // Check if task is active on this date and not completed
    return isTaskDueOnDate(t, date) && !isTaskRecordDone(t, date);
  });

  const scopedEvents = filterEventsForMember(events, memberId).filter((e) =>
    isEventOnDate(e, date)
  );

  const scopedRoutines = filterRoutinesForMember(routines, memberId).filter((r) => {
    if (!r.enabled) return false;
    if (isRepeating(r.recur)) {
      return occursOn(r.recur, date);
    }
    return true;
  });

  // 3. Normalize all active responsibilities into standardized temporal commitments
  const commitments: NormalizedCommitment[] = [];

  // A. Normalize Events
  for (const ev of scopedEvents) {
    const duration = getItemDuration(ev as any, DEFAULT_EXACT_DURATION_MINUTES);
    const hasTime = Boolean(ev.time && ev.time.trim());
    const startMins = hasTime ? timeToMinutes(ev.time!) : undefined;
    const endMins = startMins !== undefined ? startMins + duration : undefined;
    const blockId = hasTime ? resolveBlockForTime(ev.time!, prayerMap) : "morning";

    commitments.push({
      id: `event-${ev.id}`,
      sourceId: ev.id,
      title: ev.title,
      category: "event",
      scheduleMode: hasTime ? "exactTime" : "unscheduled",
      time: ev.time,
      startMinutes: startMins,
      endMinutes: endMins,
      durationMinutes: duration,
      blockId,
      assignedTo: getTaskAssignee(ev as any),
      isPrayerRelative: false,
      displaySchedule: ev.time ? ev.time : "All-day",
    });
  }

  // B. Normalize Tasks
  for (const t of scopedTasks) {
    const scheduleMode = getTaskScheduleMode(t);
    const duration = getItemDuration(t as any, DEFAULT_EXACT_DURATION_MINUTES);
    const assignee = getTaskAssignee(t);

    if (scheduleMode === "exactTime" && t.time) {
      const startMins = timeToMinutes(t.time);
      const endMins = startMins + duration;
      const blockId = resolveBlockForTime(t.time, prayerMap);

      commitments.push({
        id: `task-${t.id}`,
        sourceId: t.id,
        title: t.title,
        category: "task",
        scheduleMode: "exactTime",
        time: t.time,
        startMinutes: startMins,
        endMinutes: endMins,
        durationMinutes: duration,
        blockId,
        assignedTo: assignee,
        isPrayerRelative: false,
        displaySchedule: t.time,
      });
    } else if (scheduleMode === "relativePrayer" && t.relativeAnchor) {
      const placement = resolveTaskPlacement(t, prayers);
      commitments.push({
        id: `task-${t.id}`,
        sourceId: t.id,
        title: t.title,
        category: "task",
        scheduleMode: "relativePrayer",
        durationMinutes: duration,
        blockId: placement.blockId,
        assignedTo: assignee,
        isPrayerRelative: true,
        displaySchedule: placement.displayLabel || "Prayer-relative",
      });
    } else {
      // Unscheduled task
      commitments.push({
        id: `task-${t.id}`,
        sourceId: t.id,
        title: t.title,
        category: "task",
        scheduleMode: "unscheduled",
        durationMinutes: duration,
        blockId: "morning",
        assignedTo: assignee,
        isPrayerRelative: false,
        displaySchedule: "Anytime",
      });
    }
  }

  // C. Normalize Routines
  for (const r of scopedRoutines) {
    const routineOwner = getRoutineOwner(r);
    const isSharedRoutine = !routineOwner;

    // Filter routine steps that belong to this member
    const relevantSteps = r.steps.filter((s) => {
      const stepAssignee = getRoutineStepAssignee(s);
      if (memberId) {
        if (stepAssignee) return stepAssignee === memberId;
        return routineOwner === memberId || isSharedRoutine;
      }
      return true;
    });

    if (relevantSteps.length === 0) {
      continue;
    }

    const routineDuration = relevantSteps.reduce(
      (sum, s) => sum + (s.durationMinutes || DEFAULT_ROUTINE_STEP_DURATION_MINUTES),
      0
    );

    const scheduleMode = r.scheduleMode || (r.time ? "exactTime" : r.relativeAnchor ? "relativePrayer" : "unscheduled");

    if (scheduleMode === "exactTime" && r.time) {
      const startMins = timeToMinutes(r.time);
      const endMins = startMins + Math.max(routineDuration, DEFAULT_EXACT_DURATION_MINUTES);
      const blockId = resolveBlockForTime(r.time, prayerMap);

      commitments.push({
        id: `routine-${r.id}`,
        sourceId: r.id,
        title: r.name,
        category: "routine",
        scheduleMode: "exactTime",
        time: r.time,
        startMinutes: startMins,
        endMinutes: endMins,
        durationMinutes: Math.max(routineDuration, DEFAULT_EXACT_DURATION_MINUTES),
        blockId,
        assignedTo: routineOwner,
        isPrayerRelative: false,
        displaySchedule: r.time,
      });
    } else if (scheduleMode === "relativePrayer" && r.relativeAnchor) {
      const placement = resolveTaskPlacement(
        { relativeAnchor: r.relativeAnchor, scheduleMode: "relativePrayer" },
        prayers
      );
      commitments.push({
        id: `routine-${r.id}`,
        sourceId: r.id,
        title: r.name,
        category: "routine",
        scheduleMode: "relativePrayer",
        durationMinutes: routineDuration,
        blockId: placement.blockId,
        assignedTo: routineOwner,
        isPrayerRelative: true,
        displaySchedule: placement.displayLabel || "Prayer-relative",
      });
    }
  }

  const signals: ConflictSignal[] = [];

  // ---------------------------------------------------------------------------
  // 4. HARD CONFLICT DETECTION — Exact-Time Overlaps
  // ---------------------------------------------------------------------------
  const exactCommitments = commitments.filter(
    (c) => c.scheduleMode === "exactTime" && c.startMinutes !== undefined && c.endMinutes !== undefined
  );

  // Compare every pair of exact-time commitments
  for (let i = 0; i < exactCommitments.length; i++) {
    for (let j = i + 1; j < exactCommitments.length; j++) {
      const a = exactCommitments[i]!;
      const b = exactCommitments[j]!;

      // Check for overlap
      if (intervalsOverlap(a.startMinutes!, a.endMinutes!, b.startMinutes!, b.endMinutes!)) {
        const timeAStr = `${a.time}–${minutesToTime(a.endMinutes!)}`;
        const timeBStr = `${b.time}–${minutesToTime(b.endMinutes!)}`;

        signals.push({
          id: `conflict-hard-${a.sourceId}-${b.sourceId}`,
          type: "hard_conflict",
          severity: "high",
          memberId,
          date,
          blockId: a.blockId,
          affectedItems: [
            {
              id: a.id,
              title: a.title,
              category: a.category,
              time: a.time,
              endTime: minutesToTime(a.endMinutes!),
              displaySchedule: timeAStr,
              durationMinutes: a.durationMinutes,
              blockId: a.blockId,
              assignedTo: a.assignedTo,
            },
            {
              id: b.id,
              title: b.title,
              category: b.category,
              time: b.time,
              endTime: minutesToTime(b.endMinutes!),
              displaySchedule: timeBStr,
              durationMinutes: b.durationMinutes,
              blockId: b.blockId,
              assignedTo: b.assignedTo,
            },
          ],
          explanation: `"${a.title}" (${timeAStr}) overlaps with "${b.title}" (${timeBStr}).`,
          suggestedAction: "reschedule",
        });
      }
    }
  }

  // ---------------------------------------------------------------------------
  // 5. SOFT CONFLICT DETECTION — Salah Prayer Time Intersections
  // ---------------------------------------------------------------------------
  for (const item of exactCommitments) {
    for (const prayerId of PRAYER_IDS) {
      const pMin = prayerMap[prayerId];
      const pEndMin = pMin + PRAYER_RESERVATION_MINUTES;
      const pName = prayerNames[prayerId];
      const pTimeStr = minutesToTime(pMin);

      // Check if exact commitment intersects the prayer window
      if (intervalsOverlap(item.startMinutes!, item.endMinutes!, pMin, pEndMin)) {
        signals.push({
          id: `conflict-prayer-${prayerId}-${item.sourceId}`,
          type: "soft_conflict",
          severity: "medium",
          memberId,
          date,
          blockId: item.blockId,
          affectedItems: [
            {
              id: item.id,
              title: item.title,
              category: item.category,
              time: item.time,
              endTime: minutesToTime(item.endMinutes!),
              displaySchedule: item.displaySchedule,
              durationMinutes: item.durationMinutes,
              blockId: item.blockId,
              assignedTo: item.assignedTo,
            },
            {
              id: `prayer-${prayerId}`,
              title: `${pName} Prayer Window`,
              category: "prayer",
              time: pTimeStr,
              displaySchedule: `${pTimeStr} (${pName})`,
              durationMinutes: PRAYER_RESERVATION_MINUTES,
              blockId: item.blockId,
            },
          ],
          explanation: `"${item.title}" (${item.time}) coincides directly with ${pName} prayer time (${pTimeStr}).`,
          suggestedAction: "reschedule",
        });
      }
    }
  }

  // ---------------------------------------------------------------------------
  // 6. OVERLOAD DETECTION — Block-Level Density & Total Scheduled Burden
  // ---------------------------------------------------------------------------
  const blockMap = new Map<RhythmBlockId, NormalizedCommitment[]>();
  for (const blockId of RHYTHM_BLOCK_IDS) {
    blockMap.set(blockId, []);
  }

  for (const c of commitments) {
    const list = blockMap.get(c.blockId) || [];
    list.push(c);
    blockMap.set(c.blockId, list);
  }

  let totalDailyScheduledMinutes = 0;

  for (const blockId of RHYTHM_BLOCK_IDS) {
    const itemsInBlock = blockMap.get(blockId) || [];
    const blockDef = RHYTHM_BLOCK_DEFINITIONS[blockId];
    const exactInBlock = itemsInBlock.filter((i) => i.scheduleMode === "exactTime");
    const relativeInBlock = itemsInBlock.filter((i) => i.isPrayerRelative);

    const blockDurationMinutes =
      blockId === "night"
        ? (1440 - prayerMap.isha) + prayerMap.fajr
        : (prayerMap[blockDef.endAnchor] - prayerMap[blockDef.startAnchor] + 1440) % 1440;

    const blockScheduledMinutes = itemsInBlock.reduce(
      (sum, i) => sum + i.durationMinutes,
      0
    );
    totalDailyScheduledMinutes += blockScheduledMinutes;

    // A. Too many exact commitments in one block
    if (exactInBlock.length > OVERLOAD_THRESHOLDS.MAX_EXACT_ITEMS_PER_BLOCK) {
      signals.push({
        id: `overload-exact-${blockId}-${date}`,
        type: "overload",
        severity: "medium",
        memberId,
        date,
        blockId,
        affectedItems: exactInBlock.map((i) => ({
          id: i.id,
          title: i.title,
          category: i.category,
          time: i.time,
          displaySchedule: i.displaySchedule,
          durationMinutes: i.durationMinutes,
          blockId: i.blockId,
          assignedTo: i.assignedTo,
        })),
        explanation: `${blockDef.name} has ${exactInBlock.length} fixed-time commitments.`,
        suggestedAction: "split",
      });
    }

    // B. High prayer-relative task density in a single block
    if (relativeInBlock.length >= OVERLOAD_THRESHOLDS.MAX_RELATIVE_TASKS_PER_BLOCK) {
      signals.push({
        id: `overload-relative-${blockId}-${date}`,
        type: "soft_conflict",
        severity: "low",
        memberId,
        date,
        blockId,
        affectedItems: relativeInBlock.map((i) => ({
          id: i.id,
          title: i.title,
          category: i.category,
          displaySchedule: i.displaySchedule,
          durationMinutes: i.durationMinutes,
          blockId: i.blockId,
          assignedTo: i.assignedTo,
        })),
        explanation: `${blockDef.name} has ${relativeInBlock.length} prayer-relative commitments scheduled.`,
        suggestedAction: "split",
      });
    }

    // C. Total block burden exceeds capacity ratio
    if (
      blockDurationMinutes > 0 &&
      blockScheduledMinutes / blockDurationMinutes > OVERLOAD_THRESHOLDS.MAX_BLOCK_OCCUPANCY_RATIO &&
      itemsInBlock.length >= 3
    ) {
      signals.push({
        id: `overload-density-${blockId}-${date}`,
        type: "overload",
        severity: "medium",
        memberId,
        date,
        blockId,
        affectedItems: itemsInBlock.map((i) => ({
          id: i.id,
          title: i.title,
          category: i.category,
          time: i.time,
          displaySchedule: i.displaySchedule,
          durationMinutes: i.durationMinutes,
          blockId: i.blockId,
          assignedTo: i.assignedTo,
        })),
        explanation: `${blockDef.name} is heavily packed with ${itemsInBlock.length} responsibilities (~${Math.round(blockScheduledMinutes)} mins).`,
        suggestedAction: "review",
      });
    }
  }

  // D. Daily Aggregate Overload (> 8 hours scheduled)
  if (totalDailyScheduledMinutes > OVERLOAD_THRESHOLDS.MAX_DAILY_SCHEDULED_MINUTES) {
    const hours = (totalDailyScheduledMinutes / 60).toFixed(1);
    signals.push({
      id: `overload-daily-${date}`,
      type: "overload",
      severity: "high",
      memberId,
      date,
      affectedItems: commitments.map((i) => ({
        id: i.id,
        title: i.title,
        category: i.category,
        time: i.time,
        displaySchedule: i.displaySchedule,
        durationMinutes: i.durationMinutes,
        blockId: i.blockId,
        assignedTo: i.assignedTo,
      })),
      explanation: `Total scheduled responsibilities for today exceed ${hours} hours.`,
      suggestedAction: "review",
    });
  }

  // ---------------------------------------------------------------------------
  // 7. DETERMINISTIC SORTING
  // ---------------------------------------------------------------------------
  const severityRank: Record<ConflictSeverity, number> = {
    high: 1,
    medium: 2,
    low: 3,
  };

  return signals.sort((a, b) => {
    const sDiff = severityRank[a.severity] - severityRank[b.severity];
    if (sDiff !== 0) return sDiff;
    return a.id.localeCompare(b.id);
  });
}

/**
 * Summarizes an array of conflict signals into aggregated operational metrics.
 */
export function summarizeScheduleConflicts(
  conflicts: ConflictSignal[]
): ScheduleConflictSummary {
  let hard = 0;
  let soft = 0;
  let overloads = 0;

  for (const c of conflicts) {
    if (c.type === "hard_conflict") hard++;
    else if (c.type === "soft_conflict") soft++;
    else if (c.type === "overload") overloads++;
  }

  return {
    hasConflicts: conflicts.length > 0,
    totalConflicts: conflicts.length,
    hardConflicts: hard,
    softConflicts: soft,
    overloads,
    conflicts,
  };
}
