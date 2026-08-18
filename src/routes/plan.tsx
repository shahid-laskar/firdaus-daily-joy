import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  CheckCheck,
  ChevronLeft,
  ChevronRight,
  Repeat2,
  Sparkles,
  UtensilsCrossed,
} from "lucide-react";
import { Shell } from "@/components/veedu/shell";
import { PageHero } from "@/components/veedu/page-hero";
import { Section, Action, EmptyState } from "@/components/veedu/primitives";
import { MemberSelector } from "@/components/home/member-selector";
import { ConflictCard, Note, StatusPill, WorkloadPanel } from "@/components/family/signals";
import { useStore } from "@/lib/store";
import { usePrayers } from "@/components/deen/modules";
import { type FamilyMember, useSelectedMember } from "@/lib/family-model";
import type { Routine } from "@/lib/routine-engine";
import type { CalEventRecord, TaskRecord } from "@/lib/daily-surface";
import {
  buildWeeklyPlan,
  commitWeeklyPlanProposal,
  countStagedChanges,
  createWeeklyProposal,
  formatWeekRangeTitle,
  getPlanningWeekRange,
  getWeeklyPlanningStepSummary,
  hasStagedChanges,
  navigatePlanningWeek,
  stageMeal,
  stageRoutineOwner,
  stageTaskAssignment,
  type WeeklyPlan,
  type WeeklyPlanProposal,
  type WeeklyPlanningStepId,
} from "@/lib/weekly-planning";

export const Route = createFileRoute("/plan")({
  head: () => ({
    meta: [
      { title: "Weekly family planning — one calm pass | Sunnah Home" },
      {
        name: "description",
        content:
          "Plan the family week in eight gentle steps: last week, fixed events, routines, responsibilities, conflicts, workload, meals, and approval.",
      },
      { property: "og:title", content: "Weekly family planning — one calm pass" },
      {
        property: "og:description",
        content:
          "See the whole household week at once, share responsibilities fairly, and approve a plan everyone can carry.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: WeeklyPlanningPage,
});

const STEPS: WeeklyPlanningStepId[] = [
  "review_previous",
  "fixed_events",
  "routines",
  "assignments",
  "conflicts",
  "workload",
  "meals",
  "approval",
];

const MEAL_SLOTS = ["Breakfast", "Lunch", "Dinner"] as const;

function WeeklyPlanningPage() {
  const [tasks, setTasks] = useStore<TaskRecord[]>("tasks", []);
  const [routines, setRoutines] = useStore<Routine[]>("routines", []);
  const [events] = useStore<CalEventRecord[]>("events", []);
  const [meals, setMeals] = useStore<Record<string, string>>("meals", {});
  const [grocery] = useStore<{ id: string; got: boolean; name?: string }[]>("grocery", []);
  const [family] = useStore<FamilyMember[]>("family", []);
  const [proposal, setProposal] = useStore<WeeklyPlanProposal | null>("weeklyProposal", null);
  const [selectedMemberId] = useSelectedMember();

  const prayers = usePrayers();
  const [weekStart, setWeekStart] = useState(
    () => getPlanningWeekRange(new Date(), "monday")[0]!,
  );
  const [stepIndex, setStepIndex] = useState(0);
  const [committed, setCommitted] = useState<string | null>(null);

  const activeProposal =
    proposal && proposal.weekStartDate === weekStart ? proposal : undefined;

  const plan: WeeklyPlan = useMemo(
    () =>
      buildWeeklyPlan({
        referenceDate: weekStart,
        startDay: "monday",
        ...(selectedMemberId ? { memberId: selectedMemberId } : {}),
        familyMembers: family,
        tasks,
        routines,
        events,
        meals,
        grocery,
        prayers,
        ...(activeProposal ? { proposal: activeProposal } : {}),
      }),
    [weekStart, selectedMemberId, family, tasks, routines, events, meals, grocery, prayers, activeProposal],
  );

  const stepId = STEPS[stepIndex]!;
  const step = getWeeklyPlanningStepSummary(stepId, plan);
  const stagedCount = countStagedChanges(activeProposal);

  const nameOf = (id?: string) => family.find((m) => m.id === id)?.name;

  const edit = (fn: (p: WeeklyPlanProposal) => WeeklyPlanProposal) => {
    setCommitted(null);
    setProposal(fn(activeProposal ?? createWeeklyProposal(weekStart)));
  };

  const shiftWeek = (dir: 1 | -1) => {
    setWeekStart(navigatePlanningWeek(weekStart, dir, "monday")[0]!);
    setStepIndex(0);
    setCommitted(null);
  };

  const approve = () => {
    const result = commitWeeklyPlanProposal(activeProposal, { tasks, routines, meals });
    setTasks(result.tasks);
    setRoutines(result.routines);
    setMeals(result.meals);
    setProposal(null);
    const s = result.summary;
    setCommitted(
      `${s.tasksUpdated + s.tasksCreated} task change${
        s.tasksUpdated + s.tasksCreated === 1 ? "" : "s"
      }, ${s.routinesUpdated} routine and ${s.mealsUpdated} meal update${
        s.mealsUpdated === 1 ? "" : "s"
      } are now part of your week.`,
    );
  };

  return (
    <Shell space="home">
      <PageHero
        variant="review"
        eyebrow="Weekly family planning"
        title={formatWeekRangeTitle(plan.weekStartDate, plan.weekEndDate)}
        subtitle="One calm pass through the week ahead — what happened, what repeats, who carries what, and where the day is too full."
        pills={[
          { id: "step", icon: Sparkles, label: `Step ${step.stepNumber} of ${STEPS.length}` },
          {
            id: "conflicts",
            icon: CalendarDays,
            label: plan.conflicts.hasConflicts
              ? `${plan.conflicts.totalConflicts} to look at`
              : "Week flows clear",
          },
          ...(stagedCount > 0
            ? [{ id: "staged", icon: CheckCheck, label: `${stagedCount} staged` }]
            : []),
        ]}
        aside={
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              aria-label="Previous week"
              onClick={() => shiftWeek(-1)}
              className="press grid size-9 place-items-center rounded-full bg-[color-mix(in_oklab,var(--card)_45%,transparent)]"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              type="button"
              aria-label="Next week"
              onClick={() => shiftWeek(1)}
              className="press grid size-9 place-items-center rounded-full bg-[color-mix(in_oklab,var(--card)_45%,transparent)]"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        }
      />

      <div className="space-y-7">
        <MemberSelector />

        {/* Step rail */}
        <div className="no-scrollbar -mx-5 overflow-x-auto px-5">
          <ol className="flex w-max items-center gap-1.5">
            {STEPS.map((id, i) => {
              const s = getWeeklyPlanningStepSummary(id, plan);
              const active = i === stepIndex;
              return (
                <li key={id}>
                  <button
                    type="button"
                    onClick={() => setStepIndex(i)}
                    aria-current={active ? "step" : undefined}
                    className={`press rounded-full px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap transition-all ${
                      active
                        ? "bg-[var(--space-accent)] text-[oklch(0.995_0.008_70)]"
                        : "text-ink-soft hover:text-foreground bg-[color-mix(in_oklab,var(--card)_75%,transparent)]"
                    }`}
                  >
                    {s.stepNumber}. {s.title}
                  </button>
                </li>
              );
            })}
          </ol>
        </div>

        <Section eyebrow={`Step ${step.stepNumber}`} title={step.title} aside={<StatusPill status={step.status} />}>
          <p className="text-ink-soft -mt-2 mb-4 text-[0.9rem] leading-relaxed">{step.subtitle}</p>

          <div className="mb-5 flex flex-wrap gap-2">
            {step.highlights.map((h) => (
              <span
                key={h}
                className="border-border/60 text-ink-soft rounded-full border px-3 py-1.5 text-[0.76rem] font-semibold"
              >
                {h}
              </span>
            ))}
          </div>

          <StepBody
            stepId={stepId}
            plan={plan}
            family={family}
            nameOf={nameOf}
            committed={committed}
            stagedCount={stagedCount}
            onAssign={(taskId, memberId) =>
              edit((p) => stageTaskAssignment(p, taskId, memberId))
            }
            onRoutineOwner={(routineId, memberId) =>
              edit((p) => stageRoutineOwner(p, routineId, memberId))
            }
            onMeal={(slotKey, value) => edit((p) => stageMeal(p, slotKey, value))}
            onApprove={approve}
            onDiscard={() => {
              setProposal(null);
              setCommitted(null);
            }}
          />

          <div className="border-border/60 mt-7 flex items-center justify-between gap-3 border-t pt-5">
            <Action
              variant="quiet"
              onClick={() => setStepIndex((i) => Math.max(0, i - 1))}
              disabled={stepIndex === 0}
            >
              <ArrowLeft className="size-3.5" /> Back
            </Action>
            <Action
              variant="solid"
              onClick={() => setStepIndex((i) => Math.min(STEPS.length - 1, i + 1))}
              disabled={stepIndex === STEPS.length - 1}
            >
              Continue <ArrowRight className="size-3.5" />
            </Action>
          </div>
        </Section>
      </div>
    </Shell>
  );
}

function StepBody({
  stepId,
  plan,
  family,
  nameOf,
  committed,
  stagedCount,
  onAssign,
  onRoutineOwner,
  onMeal,
  onApprove,
  onDiscard,
}: {
  stepId: WeeklyPlanningStepId;
  plan: WeeklyPlan;
  family: FamilyMember[];
  nameOf: (id?: string) => string | undefined;
  committed: string | null;
  stagedCount: number;
  onAssign: (taskId: string, memberId?: string) => void;
  onRoutineOwner: (routineId: string, memberId?: string) => void;
  onMeal: (slotKey: string, value: string) => void;
  onApprove: () => void;
  onDiscard: () => void;
}) {
  switch (stepId) {
    case "review_previous": {
      const prev = plan.previousWeekSummary;
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Figure figure={String(prev.completedTasksCount)} label="Completed" />
            <Figure figure={String(prev.unresolvedTasksCount)} label="Still waiting" />
            <Figure figure={String(prev.completedRoutineStepsCount)} label="Routine steps kept" />
            <Figure figure={String(prev.conflictsCount)} label="Tight moments" />
          </div>
          <Note>{prev.reflectionNotice}</Note>
        </div>
      );
    }

    case "fixed_events":
      return (
        <div className="space-y-3">
          {plan.days.map((d) => (
            <div key={d.date} className="border-border/60 rounded-2xl border p-3.5">
              <div className="flex items-center justify-between">
                <p className="title-md text-[0.9rem]">
                  {d.dayName}
                  {d.isToday && <span className="text-ink-soft ml-2 text-[0.7rem]">today</span>}
                </p>
                <span className="text-ink-faint text-[0.72rem] font-semibold">
                  {d.events.length === 0 ? "open" : `${d.events.length} fixed`}
                </span>
              </div>
              {d.events.length > 0 && (
                <ul className="mt-2 space-y-1">
                  {d.events.map((e) => (
                    <li key={e.id} className="text-ink-soft text-[0.8rem] font-medium">
                      • {e.title}
                      {e.time ? ` — ${e.time}` : ""}
                      {nameOf(e.assignedTo ?? e.assigneeId)
                        ? ` · ${nameOf(e.assignedTo ?? e.assigneeId)}`
                        : ""}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      );

    case "routines":
      return plan.routinesOverview.length === 0 ? (
        <EmptyState
          glyph="↻"
          headline="No routines yet"
          body="Routines are the quiet rhythm of the home — add one from Home and it will appear in every week."
        />
      ) : (
        <div className="space-y-3">
          {plan.routinesOverview.map((r) => (
            <div key={r.routineId} className="border-border/60 rounded-2xl border p-3.5">
              <div className="flex items-start gap-3">
                <Repeat2 className="text-ink-soft mt-0.5 size-[18px] shrink-0" strokeWidth={2.1} />
                <div className="min-w-0 flex-1">
                  <p className="title-md truncate text-[0.93rem]">{r.name}</p>
                  <p className="text-ink-soft text-[0.76rem] font-medium">
                    {r.scheduleLabel} · {r.activeDaysCount} day
                    {r.activeDaysCount === 1 ? "" : "s"} · {r.stepsCount} step
                    {r.stepsCount === 1 ? "" : "s"}
                  </p>
                </div>
              </div>
              <MemberPicker
                family={family}
                value={r.assignedTo}
                householdLabel="Shared"
                onPick={(id) => onRoutineOwner(r.routineId, id)}
              />
            </div>
          ))}
        </div>
      );

    case "assignments":
      return plan.unassignedTasks.length === 0 ? (
        <EmptyState
          glyph="✓"
          headline="Everything has a carrier"
          body="Every planned task this week belongs to someone. Switch perspective above to see one person's share."
        />
      ) : (
        <div className="space-y-3">
          {plan.unassignedTasks.map((t) => (
            <div key={t.id} className="border-border/60 rounded-2xl border p-3.5">
              <p className="title-md text-[0.93rem]">{t.title}</p>
              {t.date && (
                <p className="text-ink-soft text-[0.76rem] font-medium">{t.date}</p>
              )}
              <MemberPicker
                family={family}
                value={t.assignedTo ?? t.assigneeId}
                householdLabel="Household"
                onPick={(id) => onAssign(t.id, id)}
              />
            </div>
          ))}
        </div>
      );

    case "conflicts":
      return plan.conflicts.conflicts.length === 0 ? (
        <EmptyState
          glyph="◦"
          headline="The week breathes"
          body="No overlaps, no prayer collisions, no overloaded days. Nothing needs moving."
        />
      ) : (
        <div className="space-y-3">
          {plan.conflicts.conflicts.map((c) => (
            <ConflictCard
              key={c.id}
              conflict={c}
              {...(nameOf(c.memberId) ? { memberName: nameOf(c.memberId)! } : {})}
            />
          ))}
          <Note>
            These are gentle signals, not rules — timings use recorded durations and a short
            reservation around each prayer.
          </Note>
        </div>
      );

    case "workload":
      return plan.isChildPerspective ? (
        <EmptyState
          glyph="❋"
          headline="Just your own week"
          body="Household workload stays with the grown-ups. Here you only see what is yours to carry."
        />
      ) : (
        <WorkloadPanel summary={plan.workload} />
      );

    case "meals":
      return (
        <div className="space-y-3">
          {plan.days.map((d) => (
            <div key={d.date} className="border-border/60 rounded-2xl border p-3.5">
              <div className="flex items-center gap-2">
                <UtensilsCrossed className="text-ink-soft size-4" strokeWidth={2.1} />
                <p className="title-md text-[0.9rem]">{d.dayName}</p>
              </div>
              <div className="mt-2.5 grid gap-2 sm:grid-cols-3">
                {MEAL_SLOTS.map((slot) => {
                  const current =
                    slot === "Breakfast"
                      ? d.meals.breakfast
                      : slot === "Lunch"
                        ? d.meals.lunch
                        : d.meals.dinner;
                  return (
                    <label key={slot} className="block">
                      <span className="text-ink-faint block text-[0.66rem] font-bold tracking-wide uppercase">
                        {slot}
                      </span>
                      <input
                        defaultValue={current ?? ""}
                        placeholder="—"
                        onBlur={(e) => {
                          const v = e.target.value.trim();
                          if (v && v !== (current ?? "")) onMeal(`${d.dayName}-${slot}`, v);
                        }}
                        className="border-border/70 bg-card/60 mt-1 w-full rounded-xl border px-3 py-2 text-[0.85rem]"
                      />
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
          {plan.missingMealDays.length > 0 && (
            <Note>
              {plan.missingMealDays.length} day
              {plan.missingMealDays.length === 1 ? "" : "s"} still without a full plan — a name is
              enough, it does not have to be a recipe.
            </Note>
          )}
        </div>
      );

    case "approval":
      return (
        <div className="space-y-4">
          {committed && (
            <div className="tile tile-quiet" data-tone="habit">
              <p className="title-md text-[0.95rem]">Week approved</p>
              <p className="text-ink-soft mt-1 text-[0.85rem] leading-relaxed">{committed}</p>
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <Figure figure={String(stagedCount)} label="Staged changes" />
            <Figure figure={String(plan.conflicts.totalConflicts)} label="Open conflicts" />
          </div>
          <Note>
            Nothing has changed yet. Approving writes these edits into your real tasks, routines and
            meals — approving twice never duplicates anything.
          </Note>
          <div className="flex flex-wrap gap-2.5">
            <Action variant="solid" onClick={onApprove} disabled={stagedCount === 0}>
              <CheckCheck className="size-3.5" /> Approve the week
            </Action>
            <Action variant="ghost" onClick={onDiscard} disabled={stagedCount === 0}>
              Discard draft
            </Action>
          </div>
        </div>
      );

    default:
      return null;
  }
}

function Figure({ figure, label }: { figure: string; label: string }) {
  return (
    <div className="tile tile-quiet" data-tone="task">
      <p className="figure-xl">{figure}</p>
      <p className="text-ink-soft mt-1 text-[0.78rem] font-semibold">{label}</p>
    </div>
  );
}

function MemberPicker({
  family,
  value,
  householdLabel,
  onPick,
}: {
  family: FamilyMember[];
  value?: string | undefined;
  householdLabel: string;
  onPick: (memberId?: string) => void;
}) {
  return (
    <div className="mt-3 flex flex-wrap gap-1.5">
      <Chip active={!value} label={householdLabel} onClick={() => onPick(undefined)} />
      {family.map((m) => (
        <Chip key={m.id} active={value === m.id} label={m.name} onClick={() => onPick(m.id)} />
      ))}
    </div>
  );
}

function Chip({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`press rounded-full px-3 py-1.5 text-[0.75rem] font-semibold transition-all ${
        active
          ? "bg-[var(--space-accent)] text-[oklch(0.995_0.008_70)]"
          : "text-ink-soft hover:text-foreground border-border/70 border"
      }`}
    >
      {label}
    </button>
  );
}
