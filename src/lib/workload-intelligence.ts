/**
 * FIRDAUS HOUSEHOLD WORKLOAD & FAIRNESS INTELLIGENCE (Wave 2.0-D)
 *
 * Provides a gentle, deterministic, explainable inquiry into household responsibility
 * distribution.
 *
 * Core Principles:
 * 1. Responsibility Over Surveillance: Primarily measures assigned commitments rather
 *    than competitive productivity or completion volume.
 * 2. Gentle & Non-Judgemental: Answers "Who is carrying more of the household load?"
 *    without rankings, gamification, scores, or leaderboards.
 * 3. Conservative Precision: Accurately accumulates explicitly known duration minutes,
 *    and uses item counts without fabricating false time estimates.
 * 4. Step-Level Routine Attribution: Shared routines only attribute assigned steps
 *    to individual family members.
 * 5. Privacy & Child Safety: Respects family role boundaries and shields children from
 *    sensitive adult workload analytics.
 * 6. Experience-Independent: Pure domain TypeScript logic without presentation or UI dependencies.
 */

import { isoDate, getWeekRange, isoOffset, type Insight } from "./intelligence";
import { isRepeating, occursOn } from "./recurrence";
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
  type CanonicalFamilyRole,
  getCanonicalFamilyRole,
  getTaskAssignee,
  getRoutineOwner,
  getRoutineStepAssignee,
  isChildMember,
  isTaskHousehold,
} from "./family-model";
import {
  type ConflictSignal,
  detectScheduleConflicts,
} from "./conflict-detector";

// -----------------------------------------------------------------------------
// TYPES & DOMAIN MODELS
// -----------------------------------------------------------------------------

export type QualitativeLoadState = "light" | "balanced" | "heavier" | "unclear";

export type FairnessStatus = "balanced" | "shared" | "skewed" | "light" | "unclear";

export interface MemberWorkload {
  memberId: string;
  memberName: string;
  role: CanonicalFamilyRole;
  isChild: boolean;
  assignedCount: number; // total tasks + routine steps + events assigned
  assignedTasksCount: number;
  assignedMinutesKnown: number; // explicitly measured duration minutes
  hasUnmeasuredDuration: boolean; // true if some assigned items had no explicit duration
  routineStepCount: number;
  eventCount: number;
  completedCount: number;
  overdueCount: number;
  completionRate: number; // 0..100 (%)
  qualitativeLoad: QualitativeLoadState;
  conflictCount: number; // associated schedule conflicts in period
}

export interface HouseholdAggregateWorkload {
  totalAssigned: number;
  totalAssignedMinutesKnown: number;
  totalRoutineSteps: number;
  totalEvents: number;
  totalCompleted: number;
  totalOverdue: number;
  unassignedCount: number;
  unassignedMinutesKnown: number;
}

export interface FairnessSignal {
  status: FairnessStatus;
  headline: string;
  explanation: string;
  heaviestMemberId?: string | undefined;
  heaviestMemberName?: string | undefined;
}

export interface WorkloadPeriodInfo {
  startDate: string; // ISO date YYYY-MM-DD
  endDate: string; // ISO date YYYY-MM-DD
  dates: string[];
  daysCount: number;
}

export interface HouseholdWorkloadSummary {
  period: WorkloadPeriodInfo;
  members: MemberWorkload[];
  householdTotal: HouseholdAggregateWorkload;
  fairness: FairnessSignal;
  methodology: string;
  conflictsCount: number;
}

export interface WorkloadCalculationInput {
  dates?: string[] | undefined; // Array of ISO dates YYYY-MM-DD for the period
  startDate?: string | undefined;
  endDate?: string | undefined;
  members: FamilyMember[];
  tasks?: TaskRecord[] | undefined;
  routines?: Routine[] | undefined;
  events?: CalEventRecord[] | undefined;
  conflicts?: ConflictSignal[] | undefined;
  prayers?: { id: string; name: string; time: string }[] | undefined;
  todayIso?: string | undefined;
}

// -----------------------------------------------------------------------------
// METHODOLOGY CONSTANTS
// -----------------------------------------------------------------------------

export const WORKLOAD_METHODOLOGY_STATEMENT =
  "Workload is measured by assigned responsibilities (tasks, routine steps, and calendar commitments). " +
  "Duration minutes are accumulated only when explicitly recorded; item count serves as the baseline " +
  "responsibility signal for unmeasured items without fabricating false precision.";

// -----------------------------------------------------------------------------
// PURE UTILITIES
// -----------------------------------------------------------------------------

function extractExplicitDuration(item: { duration?: number; durationMinutes?: number }): number | null {
  if (typeof item.durationMinutes === "number" && item.durationMinutes > 0) {
    return item.durationMinutes;
  }
  if (typeof item.duration === "number" && item.duration > 0) {
    return item.duration;
  }
  return null;
}

/**
 * Normalizes input date range to a sorted array of unique ISO dates.
 */
function resolveDateRange(input: WorkloadCalculationInput, today: string): string[] {
  if (input.dates && input.dates.length > 0) {
    return [...new Set(input.dates)].sort();
  }

  if (input.startDate && input.endDate) {
    const start = new Date(input.startDate);
    const end = new Date(input.endDate);
    const result: string[] = [];
    const curr = new Date(start);
    while (curr <= end) {
      result.push(isoDate(curr));
      curr.setDate(curr.getDate() + 1);
    }
    return result;
  }

  if (input.startDate) {
    return getWeekRange(input.startDate);
  }

  return getWeekRange(today);
}

// -----------------------------------------------------------------------------
// WORKLOAD CALCULATION ENGINE
// -----------------------------------------------------------------------------

/**
 * Computes household workload distribution and fairness signals for a given period.
 */
export function calculateHouseholdWorkload(
  input: WorkloadCalculationInput
): HouseholdWorkloadSummary {
  const today = input.todayIso || isoDate();
  const dates = resolveDateRange(input, today);
  const startDate = dates[0] || today;
  const endDate = dates[dates.length - 1] || today;

  const members = input.members || [];
  const tasks = input.tasks || [];
  const routines = input.routines || [];
  const events = input.events || [];

  // Map of memberId -> mutable accumulator
  const memberAccumulators = new Map<
    string,
    {
      member: FamilyMember;
      assignedTasksCount: number;
      assignedMinutesKnown: number;
      hasUnmeasuredDuration: boolean;
      routineStepCount: number;
      eventCount: number;
      completedCount: number;
      overdueCount: number;
      conflictCount: number;
    }
  >();

  for (const m of members) {
    memberAccumulators.set(m.id, {
      member: m,
      assignedTasksCount: 0,
      assignedMinutesKnown: 0,
      hasUnmeasuredDuration: false,
      routineStepCount: 0,
      eventCount: 0,
      completedCount: 0,
      overdueCount: 0,
      conflictCount: 0,
    });
  }

  let unassignedCount = 0;
  let unassignedMinutesKnown = 0;
  let unassignedOverdue = 0;

  // 1. Process Tasks
  for (const t of tasks) {
    const assignee = getTaskAssignee(t);
    const acc = assignee ? memberAccumulators.get(assignee) : undefined;
    const dur = extractExplicitDuration(t as any);

    if (isRepeating(t.recur)) {
      // Evaluate recurring instances across the date range
      for (const d of dates) {
        if (occursOn(t.recur, d)) {
          const isDone = Boolean(t.completions?.includes(d));
          if (acc) {
            acc.assignedTasksCount++;
            if (dur !== null) {
              acc.assignedMinutesKnown += dur;
            } else {
              acc.hasUnmeasuredDuration = true;
            }
            if (isDone) {
              acc.completedCount++;
            } else if (d < today) {
              acc.overdueCount++;
            }
          } else {
            unassignedCount++;
            if (dur !== null) unassignedMinutesKnown += dur;
            if (!isDone && d < today) unassignedOverdue++;
          }
        }
      }
    } else {
      // Non-recurring task
      const isDueInPeriod = t.date ? dates.includes(t.date) : true;
      if (isDueInPeriod) {
        const isDone = Boolean(t.done);
        if (acc) {
          acc.assignedTasksCount++;
          if (dur !== null) {
            acc.assignedMinutesKnown += dur;
          } else {
            acc.hasUnmeasuredDuration = true;
          }
          if (isDone) {
            acc.completedCount++;
          } else if (t.date && t.date < today) {
            acc.overdueCount++;
          }
        } else {
          unassignedCount++;
          if (dur !== null) unassignedMinutesKnown += dur;
          if (!isDone && t.date && t.date < today) unassignedOverdue++;
        }
      }
    }
  }

  // 2. Process Calendar Events
  for (const ev of events) {
    const assignee = getTaskAssignee(ev as any);
    const acc = assignee ? memberAccumulators.get(assignee) : undefined;
    const dur = extractExplicitDuration(ev as any);

    for (const d of dates) {
      if (isEventOnDate(ev, d)) {
        if (acc) {
          acc.eventCount++;
          if (dur !== null) {
            acc.assignedMinutesKnown += dur;
          } else {
            acc.hasUnmeasuredDuration = true;
          }
        } else {
          unassignedCount++;
          if (dur !== null) unassignedMinutesKnown += dur;
        }
      }
    }
  }

  // 3. Process Routines & Step-Level Assignments
  for (const r of routines) {
    if (!r.enabled) continue;
    const routineOwner = getRoutineOwner(r);
    const isSharedRoutine = !routineOwner;

    for (const d of dates) {
      const isRoutineDueOnDay = isRepeating(r.recur) ? occursOn(r.recur, d) : true;
      if (!isRoutineDueOnDay) continue;

      for (const s of r.steps) {
        const stepAssignee = getRoutineStepAssignee(s) || (isSharedRoutine ? undefined : routineOwner);
        const stepDur = extractExplicitDuration(s as any);
        const isStepDone = Boolean(s.completions?.includes(d));

        if (stepAssignee) {
          const acc = memberAccumulators.get(stepAssignee);
          if (acc) {
            acc.routineStepCount++;
            if (stepDur !== null) {
              acc.assignedMinutesKnown += stepDur;
            } else {
              acc.hasUnmeasuredDuration = true;
            }
            if (isStepDone) {
              acc.completedCount++;
            }
          }
        } else {
          unassignedCount++;
          if (stepDur !== null) unassignedMinutesKnown += stepDur;
        }
      }
    }
  }

  // 4. Process Conflicts (if provided or compute if prayers exist)
  let periodConflicts = input.conflicts || [];
  if (periodConflicts.length === 0 && input.prayers && input.prayers.length > 0) {
    for (const d of dates) {
      const daySignals = detectScheduleConflicts({
        date: d,
        tasks,
        routines,
        events,
        prayers: input.prayers,
        familyMembers: members,
      });
      periodConflicts = periodConflicts.concat(daySignals);
    }
  }

  for (const c of periodConflicts) {
    if (c.memberId && memberAccumulators.has(c.memberId)) {
      memberAccumulators.get(c.memberId)!.conflictCount++;
    }
  }

  // 5. Build Member Workload Metrics
  const memberWorkloads: MemberWorkload[] = [];
  let totalAssignedAllMembers = 0;
  let totalAssignedMinutesAllMembers = 0;
  let totalRoutineStepsAllMembers = 0;
  let totalEventsAllMembers = 0;
  let totalCompletedAllMembers = 0;
  let totalOverdueAllMembers = 0;

  for (const m of members) {
    const acc = memberAccumulators.get(m.id)!;
    const totalAssigned = acc.assignedTasksCount + acc.routineStepCount + acc.eventCount;
    const role = getCanonicalFamilyRole(m.role);
    const isChild = role === "child";

    totalAssignedAllMembers += totalAssigned;
    totalAssignedMinutesAllMembers += acc.assignedMinutesKnown;
    totalRoutineStepsAllMembers += acc.routineStepCount;
    totalEventsAllMembers += acc.eventCount;
    totalCompletedAllMembers += acc.completedCount;
    totalOverdueAllMembers += acc.overdueCount;

    const denominator = acc.assignedTasksCount + acc.routineStepCount;
    const completionRate = denominator > 0 ? Math.min(100, Math.round((acc.completedCount / denominator) * 100)) : 100;

    memberWorkloads.push({
      memberId: m.id,
      memberName: m.name,
      role,
      isChild,
      assignedCount: totalAssigned,
      assignedTasksCount: acc.assignedTasksCount,
      assignedMinutesKnown: acc.assignedMinutesKnown,
      hasUnmeasuredDuration: acc.hasUnmeasuredDuration,
      routineStepCount: acc.routineStepCount,
      eventCount: acc.eventCount,
      completedCount: acc.completedCount,
      overdueCount: acc.overdueCount,
      completionRate,
      qualitativeLoad: "unclear", // computed in next step
      conflictCount: acc.conflictCount,
    });
  }

  // 6. Compute Qualitative Load State Per Member
  // Adults baseline vs Children baseline
  const adultMembers = memberWorkloads.filter((m) => !m.isChild);
  const avgAdultAssigned =
    adultMembers.length > 0
      ? adultMembers.reduce((sum, m) => sum + m.assignedCount, 0) / adultMembers.length
      : 0;

  for (const mw of memberWorkloads) {
    if (mw.assignedCount === 0) {
      mw.qualitativeLoad = "light";
    } else if (adultMembers.length <= 1) {
      mw.qualitativeLoad = mw.assignedCount > 10 ? "heavier" : "balanced";
    } else if (!mw.isChild) {
      if (mw.assignedCount > avgAdultAssigned * 1.4 && mw.assignedCount - avgAdultAssigned >= 3) {
        mw.qualitativeLoad = "heavier";
      } else if (mw.assignedCount < avgAdultAssigned * 0.6 && avgAdultAssigned - mw.assignedCount >= 3) {
        mw.qualitativeLoad = "light";
      } else {
        mw.qualitativeLoad = "balanced";
      }
    } else {
      // Child member
      mw.qualitativeLoad = mw.assignedCount > 8 ? "heavier" : "balanced";
    }
  }

  // 7. Derive Household Fairness Signal
  const fairness = deriveFairnessSignal(memberWorkloads, totalAssignedAllMembers, unassignedCount);

  return {
    period: {
      startDate,
      endDate,
      dates,
      daysCount: dates.length,
    },
    members: memberWorkloads,
    householdTotal: {
      totalAssigned: totalAssignedAllMembers + unassignedCount,
      totalAssignedMinutesKnown: totalAssignedMinutesAllMembers + unassignedMinutesKnown,
      totalRoutineSteps: totalRoutineStepsAllMembers,
      totalEvents: totalEventsAllMembers,
      totalCompleted: totalCompletedAllMembers,
      totalOverdue: totalOverdueAllMembers + unassignedOverdue,
      unassignedCount,
      unassignedMinutesKnown,
    },
    fairness,
    methodology: WORKLOAD_METHODOLOGY_STATEMENT,
    conflictsCount: periodConflicts.length,
  };
}

/**
 * Derives a gentle, respectful fairness assessment of the household's workload distribution.
 */
function deriveFairnessSignal(
  members: MemberWorkload[],
  totalAssignedMembers: number,
  unassignedCount: number
): FairnessSignal {
  if (members.length === 0) {
    return {
      status: "unclear",
      headline: "No family members configured",
      explanation: "Add family members to see how responsibilities are distributed across the home.",
    };
  }

  if (totalAssignedMembers + unassignedCount === 0) {
    return {
      status: "light",
      headline: "Quiet household period",
      explanation: "There are few or no scheduled tasks and routines recorded for this period.",
    };
  }

  const adultMembers = members.filter((m) => !m.isChild);

  if (adultMembers.length <= 1) {
    return {
      status: "balanced",
      headline: "Responsibilities in order",
      explanation: "Household tasks and routines are mapped cleanly to the active profile.",
    };
  }

  const heavierAdults = adultMembers.filter((m) => m.qualitativeLoad === "heavier");

  if (heavierAdults.length === 1 && adultMembers.length >= 2) {
    const heaviest = heavierAdults[0]!;
    return {
      status: "skewed",
      headline: `${heaviest.memberName} is carrying more of the load`,
      explanation: `${heaviest.memberName} has ${heaviest.assignedCount} assigned responsibilities this period compared to others.`,
      heaviestMemberId: heaviest.memberId,
      heaviestMemberName: heaviest.memberName,
    };
  }

  return {
    status: "shared",
    headline: "Responsibilities are well distributed",
    explanation: "Household commitments and routines are shared reasonably across family members.",
  };
}

// -----------------------------------------------------------------------------
// INSIGHT GENERATION (Weekly Review Integration)
// -----------------------------------------------------------------------------

/**
 * Generates structured Insights from a HouseholdWorkloadSummary for consumption
 * by the Weekly Review / Insights system.
 */
export function generateWorkloadInsights(summary: HouseholdWorkloadSummary): Insight[] {
  const insights: Insight[] = [];

  if (summary.fairness.status === "skewed" && summary.fairness.heaviestMemberName) {
    insights.push({
      id: "workload-fairness-skewed",
      title: "Workload distribution",
      explanation: `${summary.fairness.heaviestMemberName} is carrying a heavier portion of household responsibilities this week.`,
      severity: "warning",
      value: summary.fairness.headline,
      trend: "none",
      source: "family",
    });
  } else if (summary.fairness.status === "shared" || summary.fairness.status === "balanced") {
    insights.push({
      id: "workload-fairness-balanced",
      title: "Shared household rhythm",
      explanation: summary.fairness.explanation,
      severity: "success",
      value: "Balanced",
      trend: "none",
      source: "family",
    });
  }

  if (summary.conflictsCount > 0) {
    insights.push({
      id: "workload-conflicts-notice",
      title: "Schedule conflicts",
      explanation: `${summary.conflictsCount} scheduling overlap${summary.conflictsCount === 1 ? "" : "s"} were detected during this period.`,
      severity: "info",
      value: `${summary.conflictsCount} conflict${summary.conflictsCount === 1 ? "" : "s"}`,
      trend: "none",
      source: "family",
    });
  }

  if (summary.householdTotal.totalOverdue > 0) {
    insights.push({
      id: "workload-overdue-notice",
      title: "Overdue items",
      explanation: `${summary.householdTotal.totalOverdue} task${summary.householdTotal.totalOverdue === 1 ? "" : "s"} remain waiting past their due date.`,
      severity: "info",
      value: `${summary.householdTotal.totalOverdue} waiting`,
      trend: "none",
      source: "household",
    });
  }

  return insights;
}

// -----------------------------------------------------------------------------
// PRIVACY / CHILD FILTERING
// -----------------------------------------------------------------------------

/**
 * Produces a sanitized workload summary safe for display in a child's profile or perspective.
 * Masks adult-only private details while preserving family encouragement.
 */
export function filterWorkloadForChild(
  summary: HouseholdWorkloadSummary,
  childMemberId: string
): HouseholdWorkloadSummary {
  const childMember = summary.members.find((m) => m.memberId === childMemberId);

  // Return a child-appropriate view with gentle, positive messaging
  return {
    ...summary,
    members: summary.members.map((m) => {
      if (m.memberId === childMemberId) {
        return m;
      }
      return {
        ...m,
        assignedTasksCount: 0,
        assignedMinutesKnown: 0,
        overdueCount: 0,
      };
    }),
    fairness: {
      status: "balanced",
      headline: childMember ? `Great progress, ${childMember.memberName}` : "Family day in rhythm",
      explanation: childMember
        ? `${childMember.memberName} has ${childMember.assignedCount} responsibilities to focus on.`
        : "Family routines are underway.",
    },
    householdTotal: {
      ...summary.householdTotal,
      unassignedMinutesKnown: 0,
      totalAssignedMinutesKnown: 0,
    },
  };
}
