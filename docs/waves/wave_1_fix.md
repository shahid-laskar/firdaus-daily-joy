# FIRDAUS WAVE 1 — CRITICAL INTEGRATION FIX

Repository:
~/firdous/veedu-home-soul

The independent Wave 1 architecture audit has identified a real integration problem.

Read:
- wave_1_audit_report.md
- src/lib/rhythm-engine.ts
- src/lib/daily-surface.ts
- src/lib/routine-engine.ts
- src/lib/recurrence.ts
- relevant tests

IMPORTANT:
Do NOT add new features.
Do NOT use Lovable.
Do NOT start Wave 2.
This is a targeted architectural stabilization task.

==================================================
PROBLEM 1 — FUTURE TASKS BLEED INTO TODAY
==================================================

`buildDailyThread()` currently filters tasks using incomplete state without enforcing the task date.

This can cause a future one-off task to appear on today's Daily Surface.

Required behavior:

For non-recurring tasks with a date:
    include only when task.date === today

For recurring tasks:
    use the existing recurrence engine/completion semantics

For undated tasks:
    preserve current intended behavior

Do NOT break existing recurring-task behavior.

Do not duplicate recurrence logic.

Add regression tests proving:

- future dated task does NOT appear today
- today's dated task DOES appear
- yesterday's completed task does NOT appear
- recurring task behavior remains correct
- undated task behavior remains correct

==================================================
PROBLEM 2 — DAILY SURFACE BYPASSES RHYTHM ENGINE
==================================================

Current architecture:

buildDayRhythm()
+
buildDailyThread()

both independently reason about tasks/routines.

This violates the intended canonical temporal model.

The target architecture is:

prayer times
    ↓
Rhythm Engine
    ↓
DayRhythm
    ↓
Daily Surface

The Daily Surface should consume normalized outputs from the Rhythm Engine rather than independently reconstructing task/routine placement.

==================================================
IMPORTANT ARCHITECTURAL REQUIREMENT
==================================================

Refactor toward:

buildDayRhythm(...)
        ↓
RhythmItem / RhythmBlock
        ↓
buildDailyThread(...)

Do NOT create a new parallel abstraction.

Do NOT duplicate:
- task date filtering
- relative prayer anchor resolution
- routine schedule resolution
- block assignment
- time ordering

Reuse existing Rhythm Engine functions.

==================================================
IMPLEMENTATION STRATEGY
==================================================

First inspect the current:

- buildDayRhythm()
- buildDailyThread()
- DayRhythm
- RhythmItem
- RhythmBlock
- DailyThreadItem
- routine integration

Determine the smallest safe refactor.

Prefer adapting the existing interfaces over creating another large model.

If a full DayRhythm object is too large for buildDailyThread(), create a clean adapter rather than copying logic.

The Daily Surface should become a presentation synthesizer, not a scheduling engine.

==================================================
PROBLEM 3 — DUPLICATED RELATIVE ANCHOR PARSING
==================================================

Remove manual parsing such as:

relativeAnchor.replace(...)
regex/string normalization

from daily-surface.ts.

Use the canonical Rhythm Engine utilities:

normalizeRelativeAnchor()
formatRelativeAnchorLabel()

OR, preferably, use the already-resolved placement/displayLabel from Rhythm Engine output.

There must be one canonical relative-anchor vocabulary.

==================================================
DAILY SURFACE RESPONSIBILITY
==================================================

After the refactor, buildDailyThread() should primarily:

- receive normalized daily/rhythm inputs
- apply product priority rules
- select which items deserve visibility
- format presentation data

It should NOT decide independently:

- whether a future task is due
- which prayer block a task belongs to
- how a relative prayer anchor resolves
- how a routine is scheduled

Those decisions belong upstream.

==================================================
DO NOT CHANGE
==================================================

Do not change:

- Rhythm Engine semantics
- canonical prayer anchors
- Task schema unnecessarily
- Routine schema
- recurrence engine
- reminder engine
- Calm/Vibrant experience architecture
- visual UI
- PWA
- Quran
- Hifz
- Ramadan

Unless an existing type must be minimally adapted to support the canonical data flow.

==================================================
TESTS
==================================================

Add integration-level tests covering:

1. Future one-off task is excluded from Today.

2. Today's one-off task appears.

3. Recurring task appears according to existing recurrence semantics.

4. Prayer-relative task appears in the same rhythm block produced by Rhythm Engine.

5. Routine appears in the same rhythm block produced by Rhythm Engine.

6. Daily Surface and DayRhythm agree on task placement.

7. Daily Surface and DayRhythm agree on routine placement.

8. Relative anchor display comes from canonical Rhythm Engine logic.

9. No duplicate scheduling interpretation exists.

10. Quiet day behavior remains correct.

IMPORTANT:
The tests should verify the integration between Rhythm Engine and Daily Surface, not merely test the two modules independently.

==================================================
VALIDATION
==================================================

Run:

npx tsx --test src/lib/*.test.ts

npx tsc --noEmit

npm run build

All must pass.

Also inspect:

git diff

Look for:
- duplicated logic
- broad refactors
- unnecessary new abstractions
- accidental UI changes

==================================================
COMMIT
==================================================

Commit:

fix: unify rhythm and daily surface scheduling

==================================================
FINAL REPORT
==================================================

Return:

### Root Cause
### Architecture Before
### Architecture After
### Task Date Fix
### Rhythm Engine Integration
### Relative Anchor Duplication Removed
### Tests Added
### Test Results
### Typecheck
### Build
### Regression Validation
### Known Limitations
### Commit

STOP.