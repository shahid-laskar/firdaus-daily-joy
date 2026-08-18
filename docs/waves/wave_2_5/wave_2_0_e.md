# FIRDAUS WAVE 2.0-E — FAMILY WEEKLY PLANNING

Repository:
~/firdous/veedu-home-soul

WAVE 2 FOUNDATION COMPLETE

Completed:
- W2.0-A Family Responsibility Model
- W2.0-B Per-Member Daily Surface
- W2.0-C Conflict Detection
- W2.0-D Household Workload Intelligence

Gemini foundation review:
WAVE 2 FOUNDATION READY

The weekly planner must be an INTEGRATION SURFACE over the existing domain model.

DO NOT create a parallel planning database.

DO NOT use Lovable yet.
DO NOT start W2.0-F automatically.

==================================================
PRODUCT OBJECTIVE
==================================================

Help a household prepare the coming week with minimal cognitive load.

The planner should answer:

- What is coming?
- Who is responsible?
- Where are the conflicts?
- Is the load reasonably distributed?
- What routines need to happen?
- What meals/grocery commitments exist?
- What needs attention before the week starts?

The planner should feel like:

"Let's prepare our week together."

NOT:

"Let's operate a project-management tool."

==================================================
CORE ARCHITECTURE
==================================================

Weekly Planning

        ↓
existing Tasks / Routines / Events / Meals
        ↓
existing Rhythm Engine
        ↓
existing Conflict Detector
        ↓
existing Workload Intelligence
        ↓
proposed/previewed week
        ↓
user approval
        ↓
existing domain records

There must NOT be a second task/routine/calendar storage system.

==================================================
1. AUDIT BEFORE IMPLEMENTATION
==================================================

Inspect:

- family-model.ts
- daily-surface.ts
- rhythm-engine.ts
- routine-engine.ts
- conflict-detector.ts
- workload-intelligence.ts
- recurrence.ts
- task model
- calendar model
- meals
- grocery
- Weekly Review
- backup/export
- store
- existing member selector
- existing experience abstraction

Determine the smallest architecture needed.

==================================================
2. WEEK DEFINITION
==================================================

Use the project's existing week/date utilities.

A Family Week should have:

- weekStartDate
- weekEndDate
- current/previous/next navigation
- optional review state

Do not create a permanent planning object for every week unless truly needed.

Prefer derived weekly views where possible.

If a persisted planning record is actually necessary, justify it.

==================================================
3. WEEKLY PLANNING SURFACE
==================================================

The planner should organize the week by meaningful structure.

Possible hierarchy:

THIS WEEK

Monday
  Fajr rhythm
  School
  Tasks
  Meals

Tuesday
  ...

But prefer prayer/rhythm context over rigid hourly scheduling where appropriate.

The architecture should allow:

Day
  ↓
Rhythm blocks
  ↓
Tasks / routines / events

==================================================
4. FAMILY MEMBERS
==================================================

Allow planning in:

HOUSEHOLD VIEW
and
MEMBER VIEW

Use the existing member model.

A planner should make it possible to understand:

- who is responsible
- household/shared work
- overloaded days
- unresolved assignments

Do not create duplicate member state.

==================================================
5. RESPONSIBILITY ASSIGNMENT
==================================================

Use the existing:

assignedTo
member IDs
routine step assignees

A planned responsibility should modify the actual task/routine domain record only when the user confirms.

Do not immediately mutate persistent state while the user is still planning.

==================================================
6. PROPOSAL / PREVIEW MODEL
==================================================

This is critical.

Planning should have:

PROPOSED STATE
        ↓
conflict analysis
        ↓
workload analysis
        ↓
USER APPROVAL
        ↓
COMMIT

Do not write every drag/drop or edit immediately to production state.

The exact internal representation can be transient.

Prefer an in-memory proposal/draft model unless persistence is genuinely required.

==================================================
7. CONFLICT PREVIEW
==================================================

Reuse:

detectScheduleConflicts()

During planning, continuously evaluate the proposed week.

Show constructive warnings such as:

"Ahmed has two overlapping commitments on Tuesday."

"After Asr has four responsibilities."

"School pickup conflicts with the 4:30 PM appointment."

Use the existing conflict types and severity.

Do not duplicate conflict calculations.

==================================================
8. WORKLOAD PREVIEW
==================================================

Reuse:

calculateHouseholdWorkload()

For the proposed week, show:

- member workload
- household workload
- unassigned work
- known duration
- conflicts

Use qualitative signals.

Do NOT create:

- points
- rankings
- leaderboards

The purpose is balancing, not competition.

==================================================
9. RHYTHM-BASED PLANNING
==================================================

Use DayRhythm / Rhythm Engine.

Allow planning concepts such as:

After Fajr
Before Dhuhr
After Asr
After Maghrib
After Isha

without requiring exact times.

If the user specifies an exact time, preserve exact time.

Do not convert prayer-relative intentions into permanent synthetic clock times.

==================================================
10. ROUTINES
==================================================

Include recurring family routines in the weekly view.

A routine may appear as:

School Morning
Weekdays
After Fajr

2/4 steps configured

Do not duplicate routine definitions.

The planner should manipulate existing routines or assignments, not create routine copies.

==================================================
11. CALENDAR
==================================================

Show existing calendar events as context.

Do NOT convert tasks/routines into calendar events merely to display them.

Keep the distinction:

Calendar Event
Task
Routine

==================================================
12. MEALS / GROCERY
==================================================

The planner should be able to show existing meal commitments if useful.

Do not build a second meal planner.

If there is a missing meal plan slot, expose it as a planning gap.

Use existing Meals and Grocery models.

==================================================
13. WEEKLY PLANNING WORKFLOW
==================================================

Build a guided workflow.

Suggested structure:

STEP 1
Review previous week

STEP 2
Review upcoming fixed events

STEP 3
Review routines

STEP 4
Assign responsibilities

STEP 5
Check conflicts

STEP 6
Check workload balance

STEP 7
Review meals/grocery

STEP 8
Approve week

Do not force all steps if the user has nothing to plan.

Allow skipping.

==================================================
14. PREVIOUS WEEK REVIEW
==================================================

Reuse existing Weekly Review information where appropriate.

Show factual summaries:

- completed work
- unresolved work
- conflicts
- workload distribution
- routines

Do not introduce judgment.

==================================================
15. APPROVAL / COMMIT
==================================================

When the user approves the weekly plan:

persist the actual changes into existing domain state.

Ensure:

- task assignments persist
- routine assignments persist
- recurrence persists
- calendar remains unchanged
- no duplicate tasks are created
- no duplicate routines are created

The operation should be safe to repeat.

==================================================
16. IDEMPOTENCY
==================================================

A critical requirement.

If the user opens the planner again after approving:

the planner must not create duplicates.

Planning operations must be idempotent where possible.

==================================================
17. MEMBER-SPECIFIC SAFETY
==================================================

Child views must not expose:

- adult financial information
- private adult workload
- parent-only planning details

Use existing family filtering/privacy helpers.

Do not create a new permission hierarchy.

==================================================
18. OFFLINE
==================================================

The weekly planner must work offline.

Core planning and analysis should be local-first.

Do not require network access for:

- viewing
- editing
- conflict detection
- workload calculation
- approval

Supabase sync may occur when online according to existing architecture.

==================================================
19. EXPERIENCE INDEPENDENCE
==================================================

Domain logic must remain independent of:

- Calm
- Vibrant
- React
- CSS

The planning domain should provide neutral structures.

==================================================
20. UX BOUNDARY
==================================================

This task is primarily the planning/domain and minimal functional wiring.

Do NOT spend time making the final premium planner UI.

The future Lovable pass will handle:

- guided flow visual design
- drag/reorder
- member visualizations
- workload presentation
- conflict cards
- polished approval experience

==================================================
21. TESTING
==================================================

Add focused tests for:

### Week
- week boundaries
- navigation
- partial week

### Proposal
- create proposal
- modify proposal
- discard proposal
- approve proposal

### Conflict
- exact overlap
- prayer-relative overlap
- routine conflict
- recurring conflict

### Workload
- proposed assignment changes workload
- member balance changes
- household work

### Family
- household
- member
- child privacy

### Meals
- existing meal slots
- missing meal slots

### Idempotency
- approving same plan twice creates no duplicates

### Persistence
- local state
- export/import
- sync compatibility

### Experience
- Calm/Vibrant use identical planning logic

Run:

npx tsx --test src/lib/*.test.ts
npx tsc --noEmit
npm run build

==================================================
22. SELF-REVIEW REQUIREMENT
==================================================

Before reporting completion:

1. Re-read ALL Wave 2 domain engines.
2. Search for duplicated planning logic.
3. Verify weekly planning does not create a parallel task/routine/calendar system.
4. Verify conflict detector is reused.
5. Verify workload intelligence is reused.
6. Verify Rhythm Engine is reused.
7. Verify existing Weekly Review remains intact.
8. Verify member privacy.
9. Verify idempotency.
10. Run the complete test suite.
11. Run typecheck.
12. Run production build.
13. Perform regression validation across W2.0-A through W2.0-D.
14. Fix any issues discovered before committing.

==================================================
23. DO NOT IMPLEMENT YET
==================================================

Do NOT implement:

- AI weekly planning
- automatic rescheduling
- adaptive reminders
- handoffs
- child-specific UI redesign
- full household dashboard
- Lovable UX
- new authentication model
- Supabase RLS redesign

==================================================
24. COMMIT
==================================================

Commit:

feat: add family weekly planning

==================================================
FINAL REPORT
==================================================

Return:

### Weekly Planning Model
### Week Navigation
### Proposal/Draft Architecture
### Family Integration
### Rhythm Integration
### Conflict Integration
### Workload Integration
### Routine Integration
### Calendar Integration
### Meals/Grocery Integration
### Approval / Commit
### Idempotency
### Privacy
### Offline Behavior
### Tests
### Typecheck
### Build
### Self-Review Findings
### Regression Validation
### Known Limitations
### Commit

STOP AFTER W2.0-E.