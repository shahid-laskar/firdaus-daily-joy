# FIRDAUS WAVE 2.0-D — HOUSEHOLD WORKLOAD / FAIRNESS SIGNAL

Repository:
~/firdous/veedu-home-soul

Completed:

W2.0-A — Family Responsibility Model ✅
W2.0-B — Per-Member Daily Surface ✅
W2.0-C — Schedule Conflict Detection ✅

The next task is derived workload visibility.

IMPORTANT:
- Do NOT use Lovable.
- Do NOT build the final workload dashboard UI.
- Do NOT implement weekly family planning yet.
- Do NOT create gamification.
- Do NOT create leaderboards.
- Build the domain/query layer only.

==================================================
PRODUCT OBJECTIVE
==================================================

Help a household understand whether responsibilities are reasonably distributed.

This is NOT:

"Who did the most?"

It is:

"Who is carrying more of the household load?"

The feature should produce a gentle, explainable fairness signal.

==================================================
1. AUDIT EXISTING DATA
==================================================

Inspect:

- family-model.ts
- tasks
- routines
- routine steps
- completions
- assignedTo
- recurrence
- conflict-detector.ts
- Daily Surface
- Weekly Review
- existing task/routine completion semantics

Determine which data can reliably represent:

- assigned responsibility
- completed responsibility
- recurring responsibility
- household-wide responsibility

Do not invent a new work entity if existing data is sufficient.

==================================================
2. RESPONSIBILITY MODEL
==================================================

Workload should primarily measure ASSIGNED RESPONSIBILITY, not simply completed count.

Potential signals:

- number of assigned tasks
- estimated task duration where available
- assigned routine steps
- routine frequency
- assigned calendar commitments where relevant

Be conservative.

Do not imply precision where the source data is incomplete.

==================================================
3. FAIRNESS METRIC
==================================================

Create a deterministic and explainable workload computation.

Possible outputs:

- assigned item count
- estimated assigned minutes
- routine-step count
- completed item count
- overdue assigned item count

Then derive a simple qualitative state:

- light
- balanced
- heavier
- unclear

Do NOT create a numeric "family score."

Do NOT rank people.

Do NOT create a leaderboard.

==================================================
4. PERIOD
==================================================

Support at minimum:

- current week
- previous week if data allows

Use existing week/date utilities.

Do not introduce another date-range implementation.

==================================================
5. MEMBER SCOPING
==================================================

Compute per member.

Exclude:
- unrelated member assignments

Include:
- explicitly assigned work

For household/unassigned work:

Do not automatically attribute it to every family member.

Represent household work separately where appropriate.

==================================================
6. DURATION
==================================================

Duration data is often incomplete.

Use explicit duration when available.

When duration is missing:
- do not fabricate precise minutes
- use item count as a weaker workload signal

Make the methodology explicit in the API.

==================================================
7. ROUTINES
==================================================

Routine steps assigned to members should count as responsibility units.

A shared household routine should NOT be fully attributed to every member.

Only assigned steps count for a member.

Use existing routine instance/recurrence logic.

==================================================
8. COMPLETION
==================================================

Expose completed vs assigned responsibility.

For recurring work:

do not permanently mutate the template to calculate workload.

Derive the actual instances for the period.

==================================================
9. CONFLICT INTEGRATION
==================================================

Conflict signals from W2.0-C should be available as a supplementary signal.

For example:

"Assigned load: heavy"
"2 schedule conflicts"

But do not combine them into one opaque score.

The household should be able to understand:

- workload
- conflicts

separately.

==================================================
10. OUTPUT MODEL
==================================================

Create a reusable pure API.

Conceptually:

calculateHouseholdWorkload({
  startDate,
  endDate,
  members,
  tasks,
  routines,
  events
})

returns:

HouseholdWorkloadSummary

with:

- members[]
- householdTotal
- methodology
- period
- optional comparison

Member workload should include:

- memberId
- assignedCount
- assignedMinutesKnown
- routineStepCount
- completedCount
- overdueCount
- qualitativeLoad

Adapt types to repository conventions.

==================================================
11. PRIVACY / CHILD SAFETY
==================================================

For children:

Do not expose:
- adult financial load
- private parent work
- sensitive household analytics

Keep the domain representation capable of filtering later.

Do not create activity surveillance metrics.

==================================================
12. WEEKLY REVIEW INTEGRATION
==================================================

Prepare the workload summary so Weekly Review can later consume it.

Do NOT redesign Weekly Review in this task.

Potential future output:

"Household workload this week"
"Most responsibilities were shared fairly."

Keep wording neutral.

==================================================
13. TESTS
==================================================

Add tests for:

- one member
- multiple members
- no assignments
- household-wide tasks
- assigned tasks
- recurring tasks
- routine steps
- shared routines
- missing duration
- known duration
- completed vs assigned
- overdue
- current week
- previous week
- member isolation
- child filtering
- deterministic repeatability

Test that no member is ranked above another.

==================================================
14. EXPERIENCE INDEPENDENCE
==================================================

No references to:

- Calm
- Vibrant
- React
- CSS
- UI components

==================================================
15. BUILD
==================================================

Run:

npx tsx --test src/lib/*.test.ts
npx tsc --noEmit
npm run build

==================================================
16. DO NOT IMPLEMENT
==================================================

Do NOT implement:

- workload dashboard UI
- family weekly planning
- handoffs
- AI analysis
- leaderboards
- gamification
- automatic reassignment
- new notification system

==================================================
17. COMMIT
==================================================

Commit:

feat: add household workload insights

==================================================
FINAL REPORT
==================================================

Return:

### Workload Model
### Responsibility Methodology
### Duration Handling
### Routine Handling
### Completion Handling
### Member Aggregation
### Household Aggregation
### Conflict Integration
### Weekly Review Preparation
### Privacy / Child Handling
### Tests
### Typecheck
### Build
### Experience Independence
### Known Limitations
### Commit