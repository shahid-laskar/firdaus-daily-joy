# FIRDAUS WAVE 1.1 — PRAYER-BASED DAY PLANNING / RHYTHM ENGINE

You are the primary engineering agent.

Repository:
~/firdous/veedu-home-soul

This is the beginning of the next product wave after completion of Phase 0–4.

Do NOT use Lovable yet.
Do NOT redesign the UI.
Do NOT start W1.2 or W1.3 automatically.

The purpose of this task is to create the underlying "Rhythm Engine" that organizes the day around Salah without breaking the existing Daily Operating Surface.
IMPORTANT — MULTIPLE EXPERIENCES / THEMES

The application now supports an additional experience called `Vibrant`.

This task MUST remain completely experience-agnostic.

The Rhythm Engine is shared product/domain logic and must NOT contain:
- experience-specific styling
- theme-specific conditions
- Vibrant-specific UI
- Calm-specific UI
- experience-specific labels unless they are domain semantics

DO NOT modify the existing experience/theme system.

DO NOT redesign any UI.

DO NOT hardcode assumptions about the current visual experience.

The Rhythm Engine must produce neutral domain data that can be consumed identically by:
- Calm experience
- Vibrant experience
- future experiences

Examples of neutral output:

- current rhythm block
- next rhythm block
- start/end timestamps
- prayer anchor
- relative position
- semantic label

Presentation of those values belongs to the experience/UI layer.

Before implementation, inspect how the new `Vibrant` experience is currently structured and confirm that the new Rhythm Engine can live beneath that experience abstraction without importing theme-specific dependencies.
==================================================
PRODUCT OBJECTIVE
==================================================

Firdaus currently knows:

- prayer times
- tasks
- calendar
- habits
- meals
- family responsibilities
- reminders
- Hifz
- Ramadan context

The next step is to make Firdaus understand the user's day as a sequence of prayer-centered time blocks.

Conceptually:

Fajr
  ↓
Morning block
  ↓
Dhuhr
  ↓
Afternoon block
  ↓
Asr
  ↓
Late-afternoon block
  ↓
Maghrib
  ↓
Evening block
  ↓
Isha
  ↓
Night block

The exact representation must be designed from the existing architecture.

==================================================
IMPORTANT PRODUCT PRINCIPLES
==================================================

1. Salah is a temporal anchor, not a task category.

2. Do NOT force every task into a prayer block.

3. Users must remain able to use clock times and ordinary dates.

4. A prayer block is contextual guidance, not a rigid schedule.

5. The system must work when prayer times are unavailable or incomplete.

6. The system must work offline using the existing prayer calculation capability.

7. Do not create an AI dependency.

8. Do not turn this into a generic calendar replacement.

==================================================
STEP 1 — AUDIT CURRENT SYSTEM
==================================================

Inspect:

- prayer time calculation
- usePrayers()
- useNextPrayer()
- task model
- calendar model
- Daily Surface engine
- recurrence engine
- Home/Today
- reminders
- existing date/time utilities
- timezone handling
- Ramadan mode
- user profile location/method/madhab settings

Determine how prayer times are represented today.

Determine whether any concept resembling:
- time block
- day part
- morning/afternoon/evening
- prayer-relative timing

already exists.

Do not duplicate existing abstractions.

==================================================
STEP 2 — DEFINE THE RHYTHM MODEL
==================================================

Create a small reusable model for the prayer-centered day.

The implementation should represent the intervals between prayers.

Conceptually:

Prayer anchor
- prayer id
- start time
- end time
- label

Rhythm block
- id
- anchor prayer
- start
- end
- label
- relative position

But adapt the model to the existing architecture.

Do NOT blindly copy this shape.

The model should answer:

"Which prayer-centered block is the current moment in?"

and:

"Which block contains a requested task time?"

==================================================
STEP 3 — DAILY BLOCK CALCULATION
==================================================

Create pure deterministic functions for:

- generating today's rhythm blocks
- identifying the current block
- finding the next block
- determining elapsed/remaining time where useful
- mapping a clock time to a block
- handling midnight / Isha → Fajr transition

The calculations must be:

- deterministic when inputs are fixed
- timezone-aware
- testable
- independent of React
- independent of UI

Reuse the existing date/prayer utilities.

==================================================
STEP 4 — EDGE CASES
==================================================

Explicitly handle:

- missing prayer data
- unavailable coordinates
- extreme latitude if supported by the existing prayer library
- same-day prayer ordering
- midnight crossing
- Isha after midnight in calculation edge cases
- daylight-saving transitions where relevant
- Ramadan
- user changing calculation method
- prayer recalculation after settings change

Do not invent new high-latitude fiqh rules.

Use the existing prayer-time engine and expose a safe "unavailable" result if it cannot produce a reliable block.

==================================================
STEP 5 — USER CONTROL
==================================================

The rhythm engine should be contextual.

Do NOT make prayer blocks mandatory.

A future UI should be able to show:

"After Fajr"
"Before Dhuhr"
"After Asr"
"After Maghrib"

as task placement/context.

But users must still be able to specify:
- exact clock time
- no time
- normal date

Do not change task creation UX in this task.

==================================================
STEP 6 — TASK COMPATIBILITY
==================================================

DO NOT modify the Task model extensively yet.

The goal is to make it possible for W1.2 to add prayer-aware scheduling.

If a minimal optional field is required, document it first and make it backward-compatible.

Prefer building:

task time
   ↓
rhythm resolver
   ↓
derived prayer block

rather than permanently duplicating prayer-block information inside every task.

The source of truth for prayer-block calculation should remain the rhythm engine.

==================================================
STEP 7 — DAILY SURFACE INTEGRATION
==================================================

The existing Daily Surface already understands:
- prayer
- tasks
- calendar
- reminders
- Hifz
- Ramadan
- etc.

Do NOT rewrite buildDailyThread().

Instead, expose rhythm information so the existing Daily Surface can later consume:

- current rhythm block
- next prayer block
- task context

For this task, make only minimal integration if necessary.

Do not redesign Home.

==================================================
STEP 8 — PRAYER BLOCK SEMANTICS
==================================================

Define human-readable labels carefully.

Examples may include:

After Fajr
Morning
Before Dhuhr
After Dhuhr
Afternoon
After Asr
Before Maghrib
After Maghrib
Evening
After Isha
Night

But do not create arbitrary labels if the actual interval model makes them redundant.

The important thing is that the abstraction is understandable to users and useful for scheduling.

==================================================
STEP 9 — TESTING
==================================================

Create focused tests for:

- normal day
- current block
- next block
- clock time → block
- before Fajr
- after Isha
- midnight transition
- missing prayer data
- reordered/invalid prayer data
- changed prayer times
- Ramadan day
- exact boundary times

Test the pure functions directly.

==================================================
STEP 10 — BUILD
==================================================

Run:

npx tsx --test src/lib/*.test.ts
npx tsc --noEmit
npm run build

All must pass.

==================================================
STEP 11 — DO NOT OVERBUILD
==================================================

Do NOT implement yet:

- prayer-aware task suggestions
- automatic task scheduling
- recurring family routines
- AI suggestions
- new calendar UI
- new Home UI
- new Lovable UI

Those belong to W1.2/W1.3.

==================================================
STEP 12 — COMMIT
==================================================

Commit:

feat: add prayer rhythm engine

==================================================
FINAL REPORT
==================================================

Return:

### Existing Architecture Audit
### Rhythm Model
### Core APIs / Functions
### Prayer Block Semantics
### Task Compatibility
### Daily Surface Integration
### Edge Cases
### Tests
### Typecheck
### Production Build
### Data-Model Changes
### Known Limitations
### Commit

STOP AFTER W1.1.