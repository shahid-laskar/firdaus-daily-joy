# FIRDAUS WAVE 1.3 — FAMILY ROUTINES ENGINE

Repository:
~/firdous/veedu-home-soul

W1.1 — Prayer Rhythm Engine ✅
W1.2 — Prayer-Aware Task Scheduling ✅

This is the final engineering task of Wave 1.

DO NOT use Lovable yet.
DO NOT redesign the UI.
Do not create a second recurrence/scheduling architecture.

The objective is to add a reusable Family Routines engine that works with:

- Family Members
- Rhythm Engine
- Prayer-aware scheduling
- Existing recurrence engine
- Existing Task model
- Daily Operating Surface

==================================================
PRODUCT OBJECTIVE
==================================================

A routine is a sequence of related activities that happen together.

Examples:

School Morning
- Get child dressed
- Breakfast
- School bag
- Leave home

After Maghrib
- Salah
- Quran
- Dinner
- Kitchen reset

Bedtime
- Brush teeth
- Prepare clothes
- Read
- Sleep

A routine is NOT simply a recurring task list.

It needs:

- identity
- ordered steps
- schedule/context
- recurrence
- optional family member ownership
- per-step completion
- daily instance state

==================================================
1. AUDIT CURRENT ARCHITECTURE
==================================================

Inspect:

- Family Model
- Task model
- Task recurrence
- completion dates
- Rhythm Engine
- prayer-relative scheduling
- Daily Surface
- existing Kids/chores
- Calendar
- Meals
- existing localStorage conventions
- Supabase synchronization
- backup/import
- experience abstraction

Determine whether any existing routine-like structure already exists.

Do not duplicate it.

==================================================
2. ROUTINE DOMAIN MODEL
==================================================

Design the smallest coherent routine model.

A routine should conceptually support:

- id
- name
- optional description
- enabled/active state
- schedule
- recurrence
- optional rhythm/prayer anchor
- ordered steps
- optional family member assignment

A routine step should support:

- id
- title
- order
- optional duration
- optional assignee/memberId
- optional task metadata
- completion state for today's instance

Do NOT blindly use these exact fields.

Adapt them to existing repository conventions.

==================================================
3. ROUTINE VS TASK
==================================================

This distinction is critical.

A routine should NOT duplicate the entire Task model.

Where appropriate, routine steps can generate or surface task-like actionable items, but the routine itself should remain the canonical sequence.

Avoid:

routines[]
+
duplicate task records[]
+
duplicate completion records[]

unless there is a clear reason.

Prefer deriving today's routine instance from the routine definition.

==================================================
4. PRAYER / RHYTHM SCHEDULING
==================================================

Reuse W1.1/W1.2.

A routine may be scheduled:

- at an exact time
- after Fajr
- before Dhuhr
- after Asr
- after Maghrib
- after Isha
- unscheduled

Do not introduce another vocabulary for prayer-relative anchors.

Reuse the canonical Rhythm Engine anchor types.

The routine must dynamically resolve against the current day's prayer times.

Do not persist synthetic clock times as the authoritative schedule.

==================================================
5. RECURRENCE
==================================================

Reuse the existing recurrence engine.

Support at minimum whatever recurrence rules are already supported by tasks:

- daily
- weekly
- weekdays

Do not create a routine-specific recurrence algorithm.

A recurring routine must generate today's expected instance based on:

routine definition
+
today's date
+
recurrence
+
current prayer times/rhythm

==================================================
6. FAMILY MEMBER INTEGRATION
==================================================

Use the existing Family Member model.

A routine may:

- belong to the household
- be associated with one family member
- contain steps assigned to different family members

Example:

School Morning
  Step 1: Get dressed → Child
  Step 2: Breakfast → Child
  Step 3: Check school bag → Parent

Do not assume every routine needs an owner.

Do not expose private family details on the Daily Surface unless explicitly relevant.

==================================================
7. DAILY INSTANCE / COMPLETION MODEL
==================================================

This is the most important data-model decision.

Do NOT store "done: true" permanently on the routine definition.

Routine completion must be date-aware.

For today's instance, we should be able to determine:

- which steps are complete
- overall routine progress
- completed time
- optional skipped steps

Tomorrow must start from the routine definition again.

Reuse the existing completion-date conventions where practical.

Avoid introducing a second incompatible completion system.

==================================================
8. PARTIAL COMPLETION
==================================================

A routine can be partially completed.

Example:

Morning Routine
3 / 5 complete

The model should distinguish:

- not started
- in progress
- complete
- optionally skipped

Do not require all steps to be completed before showing progress.

==================================================
9. FAMILY / KIDS COMPATIBILITY
==================================================

Existing Kids/Chores behavior must remain intact.

Do NOT immediately replace Kids with routines.

Instead:

Existing chores
       +
Family Model
       +
Routine engine

should coexist cleanly.

If a future migration is appropriate, document it, but do not perform a destructive migration in this task.

==================================================
10. DAILY SURFACE INTEGRATION
==================================================

The Daily Surface should eventually be able to show:

"School Morning — 3/5"

or:

"After Maghrib — Quran next"

But do NOT turn Home into a routine dashboard.

Integrate only a small contextual signal into buildDailyThread().

Use the existing Daily Surface architecture.

Do not create a separate Home routine renderer.

==================================================
11. REMINDER INTEGRATION
==================================================

The existing Reminder Engine may later notify about a routine.

Do NOT create a separate routine notification engine.

For this task, expose routine signals through a reusable API so the existing reminder engine can consume them later.

Do not duplicate reminder scheduling.

==================================================
12. CALENDAR INTEGRATION
==================================================

Do not automatically create permanent calendar events for every routine step.

A routine is a workflow, not necessarily an appointment.

If a routine is exact-time based, expose its temporal context for future integration.

Do not pollute the calendar with routine steps.

==================================================
13. PERSISTENCE
==================================================

Use the existing store architecture.

Follow existing naming conventions, e.g. `veedu:*`.

Ensure the new data survives:

- refresh
- Supabase sync
- export/import

Do not break existing backups.

==================================================
14. MIGRATION / BACKWARD COMPATIBILITY
==================================================

Existing user data must remain untouched.

No destructive migration.

If routines can be derived from existing recurring tasks or child chores, treat that as future migration work unless a non-destructive adapter is clearly justified.

Do not silently convert existing tasks into routines.

==================================================
15. API DESIGN
==================================================

Create a reusable routine library, independent of React UI.

It should provide functions conceptually equivalent to:

- getActiveRoutines()
- getToday'sRoutineInstances()
- resolveRoutineSchedule()
- getRoutineProgress()
- completeRoutineStep()
- skipRoutineStep()
- resetDailyState/deriveDailyState()
- getRoutineSignals()

Adapt the API to the existing repository conventions.

Keep core logic pure where practical.

==================================================
16. RHYTHM ENGINE INTEGRATION
==================================================

Reuse:

- DayRhythm
- RhythmBlock
- canonical relative anchors
- schedule mode resolution

Do not reproduce prayer calculations.

Example:

Routine:
"After Maghrib Family Routine"

should resolve dynamically to today's Maghrib/rhythm block.

If Maghrib shifts, the routine shifts automatically.

==================================================
17. TESTING
==================================================

Add focused tests for:

### Routine model
- creation/normalization
- stable IDs
- ordering

### Scheduling
- exact time
- prayer-relative
- unscheduled

### Recurrence
- daily
- weekly
- weekdays

### Daily state
- no completion
- partial completion
- complete
- next-day reset

### Family
- household routine
- single-member routine
- multi-member steps
- invalid member reference

### Rhythm
- After Fajr
- After Maghrib
- After Isha
- changed prayer times

### Persistence
- localStorage
- export/import
- sync-compatible structure

### Daily Surface
- routine signal present
- no routine signal when nothing actionable exists

### Experience independence
Ensure:
- no Calm imports
- no Vibrant imports
- no theme references
- no presentation dependencies

==================================================
18. UI BOUNDARY
==================================================

Only make minimal wiring required to prove functionality.

Do NOT build the final routine authoring experience.

Do NOT use Lovable.

The future UX should eventually provide:
- create routine
- reorder steps
- assign family members
- choose prayer-relative schedule
- see today's progress

That belongs to the UX layer after Wave 1 engineering is complete.

==================================================
19. BUILD
==================================================

Run:

npx tsx --test src/lib/*.test.ts

npx tsc --noEmit

npm run build

All must pass.

==================================================
20. REGRESSION
==================================================

Verify:

- existing tasks
- recurrence
- prayer-aware tasks
- Family Model
- Kids/chores
- Daily Surface
- reminders
- Calendar
- PWA
- Calm experience
- Vibrant experience

remain intact.

==================================================
21. COMMIT
==================================================

Commit:

feat: add family routines engine

==================================================
FINAL REPORT
==================================================

Return:

### Existing Routine-like Systems
### Routine Data Model
### Step Model
### Scheduling Integration
### Recurrence Integration
### Family Integration
### Daily Instance / Completion Model
### Daily Surface Integration
### Reminder Integration
### Persistence
### Migration / Compatibility
### Tests
### Typecheck
### Build
### Experience Independence
### Known Limitations
### Commit

STOP AFTER W1.3.