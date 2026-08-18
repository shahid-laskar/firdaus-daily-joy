# FIRDAUS WAVE 1.2 — PRAYER-AWARE TASK SCHEDULING

Repository:
~/firdous/veedu-home-soul

W1.1 Prayer Rhythm Engine is COMPLETE.

Reference:
- src/lib/rhythm-engine.ts
- src/lib/rhythm-engine.test.ts
- existing task model
- existing recurrence engine
- existing Daily Surface
- existing Calm/Vibrant experience abstraction

W1.1 established a shared, experience-neutral rhythm model:

Prayer times
   ↓
Rhythm Engine
   ↓
DayRhythm / RhythmBlock
   ↓
future task/routine placement
   ↓
Daily Surface / UI

DO NOT redesign the UI in this task.
DO NOT use Lovable.
DO NOT start W1.3.

==================================================
OBJECTIVE
==================================================

Allow tasks to be associated with a prayer-centered part of the day without forcing users to abandon conventional clock-based scheduling.

A task should be able to be:

1. Exact clock-time based
2. Prayer-relative / rhythm-based
3. Date-only / unscheduled

The new capability must remain backward-compatible.

==================================================
1. AUDIT CURRENT TASK MODEL
==================================================

Inspect:

- TaskRecord / Task type
- creation form
- editing form
- recurrence
- task completion logic
- Daily Surface
- calendar integration
- task persistence
- export/import
- Supabase sync

Determine the safest place for optional prayer-relative scheduling.

DO NOT redesign the existing Task model unnecessarily.

==================================================
2. PRAYER-RELATIVE TASK MODEL
==================================================

Use the existing Rhythm Engine concepts.

Support a small, explicit set of relative anchors.

For example:

- afterFajr
- beforeDhuhr
- afterDhuhr
- beforeAsr
- afterAsr
- beforeMaghrib
- afterMaghrib
- beforeIsha
- afterIsha

BUT:

First inspect the existing `relativeAnchor` implementation from W1.1.

Reuse the existing canonical vocabulary rather than introducing a second vocabulary.

Do not support arbitrary strings.

Use a typed union or equivalent.

==================================================
3. BACKWARD COMPATIBILITY
==================================================

Existing tasks must continue to work unchanged.

Examples:

Existing:
{
  title: "Call school",
  time: "14:00"
}

must remain valid.

Existing:
{
  title: "Buy groceries",
  date: "2026-08-17"
}

must remain valid.

New:
{
  title: "Quran revision",
  relativeAnchor: "afterFajr"
}

must also work.

Do not force migration of existing tasks.

==================================================
4. RESOLUTION RULE
==================================================

Prayer-relative scheduling should be RESOLVED dynamically through the Rhythm Engine.

Do not store calculated clock times as the primary source of truth.

For example:

relativeAnchor = "afterFajr"

        ↓
Rhythm Engine

        ↓

current day's Fajr time / Morning block

This ensures that if:
- prayer times change
- location changes
- calculation method changes
- daylight changes
- the date changes

the task remains correct.

==================================================
5. EXACT TIME VS RELATIVE TIME
==================================================

Define clear precedence.

A task should not ambiguously contain conflicting:

time = "14:00"
relativeAnchor = "afterAsr"

unless the product model explicitly supports that combination.

Prefer one canonical scheduling mode.

For example:

scheduleMode:
- exactTime
- relativePrayer
- unscheduled

If introducing a schedule mode, make the migration/backward compatibility clean and minimal.

Do not invent unnecessary schema complexity.

==================================================
6. DAILY SURFACE
==================================================

The existing Daily Surface already consumes:

- DailySurfaceData
- buildDailyThread()
- Rhythm Engine

Integrate prayer-aware tasks into the Daily Surface without duplicating logic.

A task such as:

"Quran revision"
relativeAnchor: afterFajr

should be resolvable into:

- the appropriate rhythm block
- the appropriate temporal position
- an actionable Daily Surface item

Do NOT rewrite buildDailyThread().

Extend it only where necessary.

==================================================
7. CALENDAR
==================================================

Do not force prayer-relative tasks into conventional calendar timestamps unless there is an explicit reason.

The conceptual distinction should remain:

Calendar:
"14:00"

Rhythm:
"After Asr"

If the existing Calendar requires a timestamp, use a derived value only at presentation/integration boundaries.

Do not persist the derived timestamp as authoritative task state.

==================================================
8. RECURRENCE
==================================================

Prayer-relative scheduling must work with:

- daily recurrence
- weekly recurrence
- weekday recurrence
- existing recurrence rules

Example:

"Read Quran"
daily
afterFajr

must resolve correctly on each day based on that day's prayer times.

Do not create a second recurrence system.

==================================================
9. TASK COMPLETION
==================================================

Preserve existing recurring-task completion behavior.

A prayer-relative task completed today should not automatically become completed tomorrow.

Use the existing recurring completion model.

Do not modify completion semantics unless required.

==================================================
10. USER EXPERIENCE PREPARATION
==================================================

This task is primarily engineering/data-layer work.

You may make minimal internal form/state changes needed to support the new model.

DO NOT perform a visual redesign.

The future UI should be able to offer something like:

WHEN
○ No time
○ Exact time
○ Around prayer

If "Around prayer" is selected:

After Fajr
Before Dhuhr
After Asr
After Maghrib
After Isha

But this UI belongs to the later UX pass.

==================================================
11. RHYTHM ENGINE INTEGRATION
==================================================

Reuse these W1.1 capabilities:

- resolving clock times to rhythm blocks
- resolving relative prayer anchors
- smart placement
- DayRhythm generation

Do not reimplement those functions.

If W1.2 discovers a flaw in W1.1, fix it at the W1.1 engine level rather than writing a workaround here.

==================================================
12. DATA SAFETY
==================================================

Preserve:

- localStorage
- Supabase sync
- JSON export/import

Ensure new optional fields survive:

writeStore()
syncFromCloud()
exportData()
importFromFile()

No new data should be lost during export/import.

==================================================
13. TESTING
==================================================

Add tests for:

### Exact-time tasks
- unchanged behavior

### Relative tasks
- after Fajr
- before Dhuhr
- after Asr
- after Maghrib
- after Isha

### Recurrence
- daily
- weekly
- weekday

### Dates
- normal day
- changed prayer times
- timezone/date boundary
- Ramadan

### Conflicting scheduling
- invalid combinations
- missing anchor
- missing prayer data

### Completion
- completion today
- repeating task next day

### Persistence
- localStorage
- export/import where practical

### Experience independence
Confirm no reference to:
- Calm
- Vibrant
- UI theme
- presentation components

inside the scheduling logic.

==================================================
14. TYPECHECK / BUILD
==================================================

Run:

npx tsx --test src/lib/*.test.ts

npx tsc --noEmit

npm run build

All must pass.

==================================================
15. SCOPE
==================================================

DO NOT implement:

- Family Routines
- automatic AI task placement
- weekly planning
- new Calendar UI
- Lovable UI
- new experience-specific styling

Those belong to later work.

==================================================
16. COMMIT
==================================================

Commit:

feat: add prayer-aware task scheduling

==================================================
FINAL REPORT
==================================================

Return:

### Existing Task Model
### New Scheduling Model
### Backward Compatibility
### Canonical Relative Anchors
### Rhythm Engine Integration
### Recurrence Integration
### Daily Surface Integration
### Calendar Interaction
### Persistence / Export
### Tests
### Typecheck
### Build
### Experience Independence
### Known Limitations
### Commit

STOP AFTER W1.2.