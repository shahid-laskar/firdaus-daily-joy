import { useCallback, useEffect, useMemo } from "react";
import { useStore } from "./store";

export type FamilyRole = "admin" | "member" | "child" | "parent" | "other";
export type CanonicalFamilyRole = "admin" | "member" | "child";

export interface Chore {
  id: string;
  title: string;
  done: boolean;
  recur?: any;
  completions?: string[];
}

export interface FamilyMember {
  id: string;
  name: string;
  role: FamilyRole;
  age?: string | undefined;
  color?: string | undefined;
  avatar?: string | undefined;
  chores: Chore[]; // kept for backward compatibility with current routine workflows
}

/** Storage key for active perspective/view filter */
export const SELECTED_MEMBER_KEY = "selected_member_id";

/**
 * Normalizes legacy and product roles to the canonical set: "admin" | "member" | "child".
 * Defaults safely to "member" if unspecified, or maps "parent" -> "admin".
 */
export function getCanonicalFamilyRole(role?: string | null): CanonicalFamilyRole {
  if (!role) return "member";
  const r = role.toLowerCase().trim();
  if (r === "admin" || r === "parent") return "admin";
  if (r === "child") return "child";
  return "member";
}

/**
 * Checks whether a given member ID corresponds to a child in the family list.
 */
export function isChildMember(memberId?: string | null, family?: FamilyMember[] | null): boolean {
  if (!memberId || !family) return false;
  const member = family.find((m) => m && m.id === memberId);
  return Boolean(member && getCanonicalFamilyRole(member.role) === "child");
}

/**
 * Reusable member-selection hook.
 * Returns [effectiveMemberId, setSelectedMemberId, activeFamilyMember].
 * Persists in local storage under `veedu:selected_member_id`.
 * Safely defaults to `undefined` (Household) if no member or an invalid ID is selected.
 */
export function useSelectedMember(): [
  string | undefined,
  (id: string | undefined) => void,
  FamilyMember | undefined
] {
  const [selectedId, setSelectedId] = useStore<string | undefined>(SELECTED_MEMBER_KEY, undefined);
  const [family] = useStore<FamilyMember[]>("family", []);

  const activeMember = useMemo(
    () => (selectedId ? family.find((m) => m.id === selectedId) : undefined),
    [selectedId, family]
  );

  // If the stored ID does not match any current family member, fallback safely to Household (undefined)
  const effectiveId = activeMember ? activeMember.id : undefined;

  const setMember = useCallback(
    (id: string | undefined) => {
      setSelectedId(id);
    },
    [setSelectedId]
  );

  return [effectiveId, setMember, activeMember];
}

/**
 * Extracts the authoritative assignee ID for a task, preferring `assignedTo` over legacy `assigneeId`.
 */
export function getTaskAssignee(task: { assignedTo?: string | undefined; assigneeId?: string | undefined } | null | undefined): string | undefined {
  if (!task) return undefined;
  return task.assignedTo ?? task.assigneeId ?? undefined;
}

/**
 * Extracts the authoritative owner ID for a routine, preferring `assignedTo` over `memberId`.
 */
export function getRoutineOwner(routine: { assignedTo?: string | undefined; memberId?: string | undefined } | null | undefined): string | undefined {
  if (!routine) return undefined;
  return routine.assignedTo ?? routine.memberId ?? undefined;
}

/**
 * Extracts the authoritative assignee ID for a routine step, preferring `assignedTo` over `assigneeId`.
 */
export function getRoutineStepAssignee(step: { assignedTo?: string | undefined; assigneeId?: string | undefined } | null | undefined): string | undefined {
  if (!step) return undefined;
  return step.assignedTo ?? step.assigneeId ?? undefined;
}

/**
 * Checks if a task is unassigned / household-wide.
 */
export function isTaskHousehold(task: { assignedTo?: string | undefined; assigneeId?: string | undefined }): boolean {
  return getTaskAssignee(task) === undefined;
}

/**
 * Checks if a task is assigned to a specific family member.
 */
export function isTaskAssignedTo(
  task: { assignedTo?: string | undefined; assigneeId?: string | undefined },
  memberId?: string | undefined
): boolean {
  const assignee = getTaskAssignee(task);
  if (!memberId) {
    return assignee === undefined;
  }
  return assignee === memberId;
}

export interface MemberFilterOptions {
  includeUnassigned?: boolean | undefined;
}

/**
 * Filters a list of tasks for a given member perspective:
 * - If memberId is undefined: returns all tasks (household aggregate view).
 * - If memberId is provided: returns tasks assigned to that member + unassigned/household tasks (if includeUnassigned is true, default true).
 */
export function filterTasksForMember<T extends { assignedTo?: string | undefined; assigneeId?: string | undefined }>(
  tasks: T[],
  memberId?: string | undefined,
  options?: MemberFilterOptions | undefined
): T[] {
  if (!memberId) return [...tasks];
  const includeUnassigned = options?.includeUnassigned ?? true;

  return tasks.filter((t) => {
    const assignee = getTaskAssignee(t);
    if (assignee === memberId) return true;
    if (includeUnassigned && assignee === undefined) return true;
    return false;
  });
}

/**
 * Filters a list of routines for a given member perspective:
 * - If memberId is undefined: returns all routines (household aggregate view).
 * - If memberId is provided: returns routines owned by that member, or with steps assigned to that member,
 *   or unassigned household routines (if includeUnassigned is true, default true).
 */
export function filterRoutinesForMember<
  T extends {
    assignedTo?: string | undefined;
    memberId?: string | undefined;
    steps?: { assignedTo?: string | undefined; assigneeId?: string | undefined }[] | undefined;
  }
>(
  routines: T[],
  memberId?: string | undefined,
  options?: MemberFilterOptions | undefined
): T[] {
  if (!memberId) return [...routines];
  const includeUnassigned = options?.includeUnassigned ?? true;

  return routines.filter((r) => {
    const owner = getRoutineOwner(r);
    if (owner === memberId) return true;

    const hasStepAssigned = (r.steps ?? []).some((s) => getRoutineStepAssignee(s) === memberId);
    if (hasStepAssigned) return true;

    // Household routine with no owner and no steps explicitly owned by other specific members
    if (includeUnassigned && owner === undefined) {
      const allStepsUnassignedOrSelf = (r.steps ?? []).every((s) => {
        const stepAssignee = getRoutineStepAssignee(s);
        return stepAssignee === undefined || stepAssignee === memberId;
      });
      if (allStepsUnassignedOrSelf) return true;
    }

    return false;
  });
}

/**
 * Filters calendar events for a member perspective.
 */
export function filterEventsForMember<T extends { assignedTo?: string | undefined; assigneeId?: string | undefined }>(
  events: T[],
  memberId?: string | undefined,
  options?: MemberFilterOptions | undefined
): T[] {
  if (!memberId) return [...events];
  const includeUnassigned = options?.includeUnassigned ?? true;

  return events.filter((e) => {
    const assignee = getTaskAssignee(e);
    if (assignee === memberId) return true;
    if (includeUnassigned && assignee === undefined) return true;
    return false;
  });
}

/** Returns only unassigned household tasks */
export function getHouseholdTasks<T extends { assignedTo?: string | undefined; assigneeId?: string | undefined }>(tasks: T[]): T[] {
  return tasks.filter(isTaskHousehold);
}

/** Returns tasks strictly assigned to a specific member */
export function getMemberTasks<T extends { assignedTo?: string | undefined; assigneeId?: string | undefined }>(tasks: T[], memberId: string): T[] {
  return tasks.filter((t) => getTaskAssignee(t) === memberId);
}

/** Returns only unassigned household routines */
export function getHouseholdRoutines<T extends { assignedTo?: string | undefined; memberId?: string | undefined }>(routines: T[]): T[] {
  return routines.filter((r) => getRoutineOwner(r) === undefined);
}

/** Returns routines owned by or with steps assigned to a specific member */
export function getMemberRoutines<
  T extends {
    assignedTo?: string | undefined;
    memberId?: string | undefined;
    steps?: { assignedTo?: string | undefined; assigneeId?: string | undefined }[] | undefined;
  }
>(routines: T[], memberId: string): T[] {
  return routines.filter((r) => {
    if (getRoutineOwner(r) === memberId) return true;
    return (r.steps ?? []).some((s) => getRoutineStepAssignee(s) === memberId);
  });
}

/**
 * Migration hook. If a user has kids data but no family data,
 * we safely migrate them into the family model.
 * Original data is not deleted, ensuring safe rollback.
 */
export function useFamilyMigration() {
  const [kids] = useStore<any[]>("kids", []);
  const [family, setFamily] = useStore<FamilyMember[]>("family", []);

  useEffect(() => {
    if (kids.length > 0 && family.length === 0) {
      const migrated: FamilyMember[] = kids.map((k) => ({
        id: k.id,
        name: k.name,
        role: "child",
        age: k.age || "",
        chores: k.chores || [],
      }));
      setFamily(migrated);
    }
  }, [kids, family.length, setFamily]);
}
