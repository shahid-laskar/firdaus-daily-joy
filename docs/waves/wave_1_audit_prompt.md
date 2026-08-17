# FIRDAUS WAVE 1 — ARCHITECTURE & INTEGRATION REVIEW

You are conducting the senior architecture review for Firdaus Wave 1.

Repository:
~/firdous/veedu-home-soul

Wave 1 engineering is complete:

W1.1 — Prayer Rhythm Engine
W1.2 — Prayer-Aware Task Scheduling
W1.3 — Family Routines

Do NOT modify the repository.

The objective is to determine whether Wave 1 forms one coherent scheduling/rhythm architecture and is safe for the next UX/productization stage.

==================================================
SOURCE OF TRUTH
==================================================

Review the actual repository.

Inspect:

- src/lib/rhythm-engine.ts
- src/lib/rhythm-engine.test.ts
- src/lib/routine-engine.ts
- src/lib/routine-engine.test.ts
- task model
- recurrence.ts
- family-model.ts
- daily-surface.ts
- reminder-engine.ts
- Home/Today
- Calendar
- Kids/Family UI
- experience abstraction
- backup/export/import
- store.ts
- Supabase sync
- all relevant Wave 1 tests

==================================================
1. EXECUTIVE QUESTION
==================================================

Is Wave 1 architecturally ready for UX implementation?

Choose:

WAVE 1 READY

WAVE 1 READY AFTER FIXES

WAVE 1 NOT READY

Do not base the verdict only on:
- passing tests
- typecheck
- build

Inspect architectural interaction.

==================================================
2. RHYTHM ENGINE REVIEW
==================================================

Verify:

- prayer anchors
- rhythm blocks
- time mapping
- relative anchors
- schedule mode
- day boundaries
- midnight transition
- changed prayer times
- Ramadan behavior
- missing prayer data

Check that Rhythm Engine remains:

- pure
- deterministic
- timezone-safe
- offline-capable
- experience-agnostic

Look for duplicated time/block logic elsewhere.

==================================================
3. TASK SCHEDULING REVIEW
==================================================

Inspect W1.2.

Verify:

- exact-time tasks
- relative-prayer tasks
- unscheduled tasks
- precedence rules
- backward compatibility
- recurrence
- completion semantics
- Daily Surface integration

CRITICAL:

Determine whether the same task can accidentally contain conflicting scheduling modes.

Determine whether the `relativeAnchor` vocabulary is centralized and typed.

Check whether derived presentation times are ever incorrectly persisted as authoritative task data.

==================================================
4. ROUTINE ENGINE REVIEW
==================================================

Inspect W1.3.

Verify the distinction between:

Routine Template
       ↓
Today's Derived Instance
       ↓
Step Completion

Confirm that routine definitions do NOT carry permanent daily completion state.

Check:

- stable IDs
- step ordering
- partial completion
- skipped steps
- daily reset
- recurrence
- exact time
- prayer-relative scheduling
- family ownership
- multi-member steps

==================================================
5. THREE-LAYER SCHEDULING CONSISTENCY
==================================================

This is the highest-priority review.

Determine whether:

               RHYTHM ENGINE
                    ↓
        ┌───────────┴───────────┐
        ↓                       ↓
      TASKS                  ROUTINES
        ↓                       ↓
        └───────────┬───────────┘
                    ↓
             DAILY SURFACE

is actually how the code works.

Look for:

- duplicated scheduling logic
- duplicated prayer-anchor logic
- duplicated recurrence logic
- separate definitions of "today"
- separate definitions of "current block"
- conflicting completion semantics

There must be one canonical temporal model.

==================================================
6. RECURRENCE REVIEW
==================================================

Verify that:

- tasks
- routines
- family chores

do not create separate recurrence engines.

Check:

- daily
- weekly
- weekdays
- date filtering
- completion dates
- next-day behavior

Pay particular attention to repeating tasks and whether their "done today" state is correctly derived.

The prior Phase 4 review identified a potential weakness in recurring-task completion in the Daily Surface.

Determine whether Wave 1 has:
- resolved it
- preserved it
- or introduced a parallel workaround

==================================================
7. FAMILY MODEL REVIEW
==================================================

Inspect:

FamilyMember
    ↓
Task assignment
    ↓
Routine owner
    ↓
Routine step assignee

Verify:

- stable IDs
- no name-based identity references
- no duplicate canonical family stores
- orphan handling
- member deletion behavior
- children compatibility
- chores compatibility

Ensure household routines can remain unassigned while individual routines can be member-owned.

==================================================
8. DAILY SURFACE REVIEW
==================================================

The Daily Surface now potentially consumes:

- prayer context
- prayer-aware tasks
- routines
- reminders
- Hifz
- Ramadan
- meals
- grocery
- habits
- health
- budget
- family

Check whether this has become too crowded.

Architecturally:

Does `buildDailyThread()` receive normalized signals/items?

Or is it accumulating feature-specific calculations?

Look for:
- duplicate logic
- giant conditional branches
- excessive coupling
- category-specific hacks

Check prioritization.

The surface should answer:

"What matters now?"

not:

"Show every piece of data."

==================================================
9. REMINDER INTEGRATION
==================================================

Inspect whether routine signals and task signals interact correctly with the existing reminder engine.

Verify:

- no second reminder engine
- no duplicate evaluation
- dedupe behavior
- preference handling
- reminder priority
- routine signal generation

Do not allow every routine step to become a notification.

==================================================
10. CALENDAR REVIEW
==================================================

Verify prayer-relative tasks/routines do not pollute the Calendar with synthetic events.

There should remain a clear distinction between:

Calendar Event
vs.
Task
vs.
Routine

A derived schedule timestamp should not become permanent calendar state unless explicitly intended.

==================================================
11. PERSISTENCE / EXPORT / SYNC
==================================================

Verify new Wave 1 fields survive:

- localStorage
- refresh
- export
- import
- Supabase sync

Check that routine completion logs remain date-specific and do not overwrite routine definitions.

==================================================
12. EXPERIENCE INDEPENDENCE
==================================================

Verify:

- no Calm dependencies in domain logic
- no Vibrant dependencies in domain logic
- no theme-specific conditionals
- no styling imports from `src/lib/*`

Both experiences must consume the same Wave 1 domain model.

==================================================
13. TEST QUALITY
==================================================

The implementation reports 118 tests passing.

Verify they actually execute.

Check for missing integration coverage for:

- task → rhythm → Daily Surface
- routine → rhythm → Daily Surface
- routine → family member
- recurring task next-day completion
- reminder → Daily Surface
- prayer time changes
- Ramadan + routines
- multiple concurrent routines

==================================================
14. PRODUCT QUALITY
==================================================

Evaluate whether Wave 1 creates a meaningful new product capability.

The intended concept is:

"Firdaus understands the day as a Muslim household rhythm."

Does the architecture support that?

Or has it merely added:
- another scheduling field
- another task type
- another routine list?

This distinction matters.

==================================================
15. FINDINGS
==================================================

Classify:

CRITICAL
IMPORTANT
MINOR
POSITIVE

For every problem include:

- file
- exact issue
- why it matters
- recommended fix

==================================================
16. FINAL REPORT
==================================================

Return:

# Executive Verdict

# Rhythm Engine Review

# Task Scheduling Review

# Routine Engine Review

# Scheduling Consistency Review

# Recurrence Review

# Family Model Review

# Daily Surface Review

# Reminder Review

# Calendar Review

# Persistence / Sync Review

# Experience Independence Review

# Test Quality Review

# Critical Findings

# Important Findings

# Minor Findings

# What Is Strong

# Required Fixes Before UX

# Final Verdict

Choose exactly:

WAVE 1 READY

WAVE 1 READY AFTER FIXES

WAVE 1 NOT READY

Do NOT modify code.
Do NOT start Wave 2.