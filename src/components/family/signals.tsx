/**
 * Wave 2 — Family Operating System presentation kit.
 *
 * Pure presentation: workload rows, conflict cards, fairness banner and the
 * guided-step chrome for Weekly Family Planning. Nothing computes, nothing
 * fetches — every value arrives already derived from the Wave 2 engines.
 */

import type { ReactNode } from "react";
import { AlertTriangle, Clock3, Info, Users } from "lucide-react";
import type { ConflictSignal } from "@/lib/conflict-detector";
import type {
  FairnessSignal,
  HouseholdWorkloadSummary,
  MemberWorkload,
} from "@/lib/workload-intelligence";

export function StatusPill({
  status,
}: {
  status: "complete" | "needs_attention" | "optimal";
}) {
  const map = {
    optimal: { label: "All clear", tone: "var(--leaf)" },
    complete: { label: "Reviewed", tone: "var(--space-accent)" },
    needs_attention: { label: "Needs a look", tone: "var(--brass)" },
  } as const;
  const s = map[status];
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.68rem] font-bold tracking-wide"
      style={{
        background: `color-mix(in oklab, ${s.tone} 16%, transparent)`,
        color: `color-mix(in oklab, ${s.tone} 78%, var(--foreground))`,
      }}
    >
      <span className="size-[6px] rounded-full" style={{ background: s.tone }} />
      {s.label}
    </span>
  );
}

const LOAD_COPY: Record<MemberWorkload["qualitativeLoad"], { label: string; tone: string }> = {
  light: { label: "Room to breathe", tone: "var(--leaf)" },
  balanced: { label: "Steady", tone: "var(--space-accent)" },
  heavier: { label: "Carrying more", tone: "var(--brass)" },
  unclear: { label: "Not enough yet", tone: "var(--ink-faint)" },
};

/** One member's share of the week — responsibility, never productivity. */
export function WorkloadRow({ member, max }: { member: MemberWorkload; max: number }) {
  const load = LOAD_COPY[member.qualitativeLoad];
  const pct = max > 0 ? Math.round((member.assignedCount / max) * 100) : 0;
  return (
    <div className="border-border/60 rounded-2xl border p-3.5">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="title-md truncate text-[0.95rem]">{member.memberName}</p>
          <p className="text-ink-soft text-[0.76rem] font-medium">
            {member.assignedCount} responsibilit{member.assignedCount === 1 ? "y" : "ies"}
            {member.assignedMinutesKnown > 0 && ` · ${member.assignedMinutesKnown} min planned`}
            {member.hasUnmeasuredDuration && " · some untimed"}
          </p>
        </div>
        <span
          className="shrink-0 rounded-full px-2.5 py-1 text-[0.68rem] font-bold"
          style={{
            background: `color-mix(in oklab, ${load.tone} 15%, transparent)`,
            color: `color-mix(in oklab, ${load.tone} 80%, var(--foreground))`,
          }}
        >
          {load.label}
        </span>
      </div>
      <div className="bg-border/60 mt-3 h-2 overflow-hidden rounded-full">
        <div
          className="h-full rounded-full transition-[width] duration-500"
          style={{ width: `${Math.max(pct, member.assignedCount > 0 ? 8 : 0)}%`, background: load.tone }}
        />
      </div>
      {(member.overdueCount > 0 || member.conflictCount > 0) && (
        <p className="text-ink-soft mt-2 text-[0.72rem] font-medium">
          {member.overdueCount > 0 && `${member.overdueCount} waiting`}
          {member.overdueCount > 0 && member.conflictCount > 0 && " · "}
          {member.conflictCount > 0 && `${member.conflictCount} overlap`}
        </p>
      )}
    </div>
  );
}

export function FairnessBanner({ fairness }: { fairness: FairnessSignal }) {
  return (
    <div className="tile tile-quiet" data-tone="kids">
      <div className="flex items-start gap-3">
        <Users className="mt-0.5 size-[18px] shrink-0" strokeWidth={2.1} />
        <div className="min-w-0">
          <p className="title-md text-[0.95rem]">{fairness.headline}</p>
          <p className="text-ink-soft mt-1 text-[0.82rem] leading-relaxed">
            {fairness.explanation}
          </p>
        </div>
      </div>
    </div>
  );
}

export function WorkloadPanel({
  summary,
  emptyNote = "Assign a few responsibilities and the household picture appears here.",
}: {
  summary: HouseholdWorkloadSummary;
  emptyNote?: string;
}) {
  const max = summary.members.reduce((m, x) => Math.max(m, x.assignedCount), 0);
  if (summary.members.length === 0) {
    return <p className="text-ink-soft text-sm leading-relaxed">{emptyNote}</p>;
  }
  return (
    <div className="space-y-3">
      <FairnessBanner fairness={summary.fairness} />
      <div className="space-y-2.5">
        {summary.members.map((m) => (
          <WorkloadRow key={m.memberId} member={m} max={max} />
        ))}
      </div>
      {summary.householdTotal.unassignedCount > 0 && (
        <p className="text-ink-soft text-[0.78rem] font-medium">
          {summary.householdTotal.unassignedCount} shared household item
          {summary.householdTotal.unassignedCount === 1 ? "" : "s"} nobody owns yet.
        </p>
      )}
      <p className="text-ink-faint text-[0.72rem] leading-relaxed">{summary.methodology}</p>
    </div>
  );
}

const CONFLICT_TONE: Record<ConflictSignal["type"], { tone: string; label: string }> = {
  hard_conflict: { tone: "var(--rose, oklch(0.62 0.17 20))", label: "Overlap" },
  soft_conflict: { tone: "var(--brass)", label: "Close to prayer" },
  overload: { tone: "var(--space-accent)", label: "Full stretch" },
};

export function ConflictCard({
  conflict,
  memberName,
}: {
  conflict: ConflictSignal;
  memberName?: string;
}) {
  const meta = CONFLICT_TONE[conflict.type];
  const Icon = conflict.type === "overload" ? Clock3 : AlertTriangle;
  return (
    <div
      className="border-border/60 rounded-2xl border p-3.5"
      style={{ background: `color-mix(in oklab, ${meta.tone} 7%, transparent)` }}
    >
      <div className="flex items-start gap-3">
        <Icon
          className="mt-0.5 size-[18px] shrink-0"
          strokeWidth={2.1}
          style={{ color: meta.tone }}
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="title-md text-[0.9rem]">{meta.label}</span>
            {memberName && (
              <span className="text-ink-soft text-[0.72rem] font-semibold">{memberName}</span>
            )}
          </div>
          <p className="text-ink-soft mt-1 text-[0.82rem] leading-relaxed">
            {conflict.explanation}
          </p>
          <ul className="mt-2 space-y-1">
            {conflict.affectedItems.map((it) => (
              <li key={it.id} className="text-ink-soft text-[0.76rem] font-medium">
                • {it.title}
                {it.displaySchedule ? ` — ${it.displaySchedule}` : it.time ? ` — ${it.time}` : ""}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export function Note({ children }: { children: ReactNode }) {
  return (
    <p className="text-ink-soft flex items-start gap-2 text-[0.78rem] leading-relaxed">
      <Info className="mt-[1px] size-3.5 shrink-0" strokeWidth={2.2} />
      <span>{children}</span>
    </p>
  );
}
