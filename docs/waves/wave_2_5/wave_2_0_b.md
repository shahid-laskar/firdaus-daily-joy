# FIRDAUS WAVE 2.0-B — PER-MEMBER DAILY SURFACE

Repository:
~/firdous/veedu-home-soul

W2.0-A is complete.

Completed:
- Family roles
- assignedTo normalization
- legacy assignee compatibility
- task/routine/event filtering
- memberId support in Daily Surface
- experience-independent domain model
- 126/126 tests passing
- typecheck/build passing

DO NOT use Lovable yet.
DO NOT implement conflict detection yet.
DO NOT implement workload analytics yet.
DO NOT implement weekly family planning yet.

This task is ONLY the per-member Daily Surface capability.

==================================================
OBJECTIVE
==================================================

Allow Firdaus to show the household's day in three modes:

1. Household
2. Specific family member
3. Current user's/member profile where applicable

The same Daily Surface engine should produce the data.

Do NOT create a second Daily Surface implementation.

==================================================
1. AUDIT CURRENT HOME / TODAY
==================================================

Inspect:

- existing Home / Today
- daily-surface.ts
- rhythm-engine.ts
- family-model.ts
- task model
- routine model
- calendar
- useStore
- existing experience abstraction
- current navigation

Determine the cleanest way to introduce a selected member context.

==================================================
2. MEMBER CONTEXT
==================================================

Create a reusable member-selection context/state abstraction.

Conceptually:

selectedMemberId:
  undefined → household
  memberId   → that member

Adapt to the existing state architecture.

Do NOT create a second global store.

If the app already has a suitable view-selection state, reuse it.

The selected member must NOT modify domain data.

It only changes the perspective/filter.

==================================================
3. DAILY SURFACE
==================================================

Pass selected member identity into the existing:

buildDailyThread(...)
buildDayRhythm(...)

The existing W2.0-A member filtering must be used.

Do NOT filter tasks/routines manually inside React components.

Correct flow:

selectedMemberId
      ↓
Daily Surface
      ↓
family-model filtering
      ↓
Rhythm Engine
      ↓
DayRhythm
      ↓
DailyThread
      ↓
UI

==================================================
4. HOUSEHOLD VIEW
==================================================

When no member is selected:

Show household-wide context.

Include:
- household/unassigned tasks
- shared routines
- relevant family events
- shared meals/calendar items
- relevant reminders

Do NOT show every individual's private assignment in a noisy way.

Define household semantics based on the W2.0-A model.

==================================================
5. MEMBER VIEW
==================================================

When member X is selected:

Show:

- tasks assigned to X
- routine ownership/steps assigned to X
- relevant calendar items
- household-visible unassigned items

Preserve the W2.0-A rule:

Member view includes:
assignedTo === memberId
+
unassigned household items where appropriate.

Do NOT expose unrelated member-specific content.

==================================================
6. MEMBER SELECTOR UX
==================================================

This task may include a minimal selector UI.

Do NOT perform a Lovable-level redesign.

The selector should support:

Household
[Member 1]
[Member 2]
[Child]

Use existing FamilyMember data.

Respect roles.

Do not introduce:
- complex permissions
- authentication switching
- separate accounts
- location tracking

This is a perspective selector, not authentication.

==================================================
7. CHILD VIEW
==================================================

Child view should be limited to appropriate information.

For this task, implement only the data filtering necessary for the role model.

Do NOT expose:
- budget
- parent-only tasks
- private adult information

Keep policy simple and deterministic.

If the current architecture cannot safely distinguish a piece of content, do not expose it by default.

==================================================
8. DAILY SURFACE PRIORITY
==================================================

The Daily Surface priority algorithm must remain the same.

Changing member context should change the DATA SET, not the prioritization philosophy.

Do NOT create separate priority weights for children/adults yet.

==================================================
9. RHYTHM
==================================================

Member-filtered items must still use:

Prayer Times
   ↓
Rhythm Engine
   ↓
DayRhythm

Prayer-relative tasks/routines must resolve correctly for every member view.

==================================================
10. ROUTINES
==================================================

Verify member filtering for:

- household routine
- member-owned routine
- routine with a step assigned to member
- routine with steps assigned to multiple members

A member should see the relevant portion of a shared routine.

Do NOT mutate the routine definition to achieve filtering.

==================================================
11. CALENDAR
==================================================

Use:

filterEventsForMember()

from the domain model.

Do not duplicate event filtering in UI.

==================================================
12. EXPERIENCE COMPATIBILITY
==================================================

Member view must work identically in:

Calm
Vibrant

Only presentation changes.

Do not add experience-specific filtering logic.

==================================================
13. EMPTY STATES
==================================================

Provide useful states for:

- household with no actionable items
- member with nothing assigned
- child with quiet day
- no family members configured

Do not fabricate work.

==================================================
14. PERSISTENCE
==================================================

Selected member/view context may persist if appropriate.

But do NOT persist domain changes.

Switching views must never alter:
- tasks
- routines
- completions
- family
- calendar
- reminders

==================================================
15. TESTS
==================================================

Add integration tests for:

- household view
- member view
- member with assigned tasks
- member with no assignments
- household unassigned tasks
- shared routines
- member-specific routine steps
- calendar filtering
- prayer-relative task placement
- member switch does not mutate data
- Calm/Vibrant state consistency

Run:

npx tsx --test src/lib/*.test.ts
npx tsc --noEmit
npm run build

==================================================
16. DO NOT IMPLEMENT
==================================================

Do NOT implement yet:

- conflict detection
- overload warnings
- workload analytics
- family weekly planning
- family planner
- handoffs
- child-specific UX redesign
- multi-device authorization
- Supabase RLS changes

==================================================
17. COMMIT
==================================================

Commit:

feat: add per-member daily surface

==================================================
FINAL REPORT
==================================================

Return:

### Member Context Design
### Household View
### Member View
### Child View
### Daily Surface Integration
### Rhythm Integration
### Routine Filtering
### Calendar Filtering
### Selector UX
### Persistence
### Tests
### Typecheck
### Build
### Experience Independence
### Known Limitations
### Commit