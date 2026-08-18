# FIRDAUS WAVE 2.0-C — FAMILY SCHEDULE CONFLICT DETECTION

Repository:
~/firdous/veedu-home-soul

W2.0-A ✅ Family Responsibility Model
W2.0-B ✅ Per-Member Daily Surface

Current capabilities:
- FamilyMember roles
- assignedTo normalization
- member filtering
- member-specific Daily Surface
- prayer-relative tasks
- family routines
- calendar events
- Rhythm Engine
- Calm/Vibrant experiences

DO NOT use Lovable.
DO NOT redesign the UI.
DO NOT implement workload analytics yet.
DO NOT implement weekly family planning yet.

This task is deterministic conflict detection only.

==================================================
OBJECTIVE
==================================================

Detect scheduling conflicts and overload conditions for a specific family member.

The system should answer:

"Is there something about this member's schedule that needs attention?"

It must never automatically change user data.

==================================================
1. AUDIT CURRENT TEMPORAL MODELS
==================================================

Inspect:

- rhythm-engine.ts
- daily-surface.ts
- task scheduling
- routine scheduling
- calendar events
- family-model.ts
- recurrence.ts
- member filtering

Determine how each item expresses:

- exact time
- duration
- prayer-relative block
- recurrence
- member assignment

Do not create a second scheduling model.

==================================================
2. DEFINE CONFLICT TYPES
==================================================

Create a small typed model.

At minimum distinguish:

HARD_CONFLICT
- two fixed-time commitments overlap

SOFT_CONFLICT
- fixed-time event intersects a prayer/rhythm-relative commitment

OVERLOAD
- excessive number/duration of responsibilities in one period

Adapt naming to repository conventions.

==================================================
3. EXACT-TIME CONFLICTS
==================================================

Detect overlap between exact-time items.

Examples:

14:00–15:00 event
14:30–15:00 task

Conflict.

Use actual duration where available.

Do not assume every task has a duration.

If duration is unavailable, use the smallest safe conflict semantics and document the assumption.

==================================================
4. PRAYER-RELATIVE CONFLICTS
==================================================

A task such as:

After Asr

does not represent one exact timestamp.

Do NOT fabricate a precise conflict time.

Instead determine whether:

- an exact-time item lies inside the same rhythm block
- multiple prayer-relative commitments occupy the same block
- the block is overloaded

This should produce a SOFT_CONFLICT or OVERLOAD signal rather than falsely claiming an exact collision.

==================================================
5. ROUTINE CONFLICTS
==================================================

Consider:

- routine schedule
- routine duration where available
- step durations where available
- member ownership
- step assignee

A shared routine should only create a member conflict when that member has an assigned responsibility inside it.

Do not count the entire shared routine against every family member.

==================================================
6. CALENDAR EVENTS
==================================================

Use canonical calendar/event data.

Do not duplicate event filtering.

The member context should determine which events are relevant.

==================================================
7. RECURRENCE
==================================================

Evaluate conflicts against actual instances for the requested date.

Do not compare recurrence definitions abstractly.

Example:

Weekly task:
Every Monday 14:00

Only creates a conflict on Monday.

==================================================
8. PRAYER / RHYTHM INTEGRATION
==================================================

Reuse the existing Rhythm Engine.

Do not duplicate:

- prayer calculations
- block boundaries
- relative-anchor resolution

The architecture remains:

Prayer Times
    ↓
Rhythm Engine
    ↓
normalized temporal items
    ↓
Conflict Detector

==================================================
9. MEMBER SCOPING
==================================================

Conflict detection must operate per member.

Input:

memberId
+
date

Output:

conflicts for that member.

Household/unassigned items should only participate when they create a meaningful member-level conflict.

Do not assume every household task conflicts with every member.

==================================================
10. OVERLOAD HEURISTICS
==================================================

Keep overload detection simple and explainable.

Examples:

- too many exact commitments in one rhythm block
- excessive accumulated scheduled duration
- too many routine steps assigned to one member in a single block

Do NOT introduce machine learning.

Do NOT create personalized scoring yet.

All thresholds must be explicit constants.

==================================================
11. OUTPUT MODEL
==================================================

Create a reusable pure API.

Conceptually:

detectScheduleConflicts({
  date,
  memberId,
  tasks,
  routines,
  events,
  dayRhythm
})

returns:

ConflictSignal[]

Each signal should contain enough information for future UI:

- type
- severity
- memberId
- date
- affected items
- rhythm block if relevant
- explanation
- suggested action type

Do not prescribe an automatic action.

==================================================
12. EXPLAINABILITY
==================================================

Every conflict should be explainable.

Good:

"School pickup overlaps with your 3:00 PM appointment."

Good:

"After Asr has 4 scheduled responsibilities."

Bad:

"Your schedule is inefficient."

Do not judge the user.

==================================================
13. USER AGENCY
==================================================

Conflict detection only surfaces a signal.

Do NOT:
- move tasks
- change recurrence
- change prayer anchors
- delete events
- reassign family members

Future UX may provide:

Review
Reschedule
Dismiss

but this task should not implement automatic resolution.

==================================================
14. DAILY SURFACE PREPARATION
==================================================

Expose conflict signals so the existing Daily Surface can later consume them.

Do NOT redesign Daily Surface.

Do not create a second warning system.

Potential future output:

"2 schedule conflicts today"

But leave presentation to the UX layer.

==================================================
15. TESTS
==================================================

Add tests for:

- exact-time overlap
- non-overlapping exact times
- zero/missing duration
- prayer-relative soft conflict
- multiple commitments in one block
- routine step assignment
- shared routine
- calendar event conflict
- recurring item on matching date
- recurring item on non-matching date
- member isolation
- household item behavior
- midnight boundaries
- changed prayer times
- empty schedule

Also test that detection is deterministic.

==================================================
16. EXPERIENCE INDEPENDENCE
==================================================

No references to:

- Calm
- Vibrant
- CSS
- React UI

in the conflict engine.

==================================================
17. BUILD
==================================================

Run:

npx tsx --test src/lib/*.test.ts
npx tsc --noEmit
npm run build

==================================================
18. DO NOT IMPLEMENT
==================================================

Do NOT implement:

- workload dashboard
- family weekly planner
- AI scheduling
- automatic rescheduling
- adaptive reminders
- Lovable UI

Those come later.

==================================================
19. COMMIT
==================================================

Commit:

feat: add family schedule conflict detection

==================================================
FINAL REPORT
==================================================

Return:

### Conflict Model
### Exact-Time Detection
### Rhythm/Prayer Detection
### Routine Detection
### Calendar Detection
### Member Scoping
### Overload Heuristics
### Daily Surface Integration
### Tests
### Typecheck
### Build
### Experience Independence
### Known Limitations
### Commit