# EXECUTE — SELECTIVE VIBRANT WAVE 1 UX INTEGRATION

Repository:
~/firdous/veedu-home-soul

Donor:
~/firdous/vibrant-theme-unification

The audit is complete.

Audit result:
READY FOR SELECTIVE INTEGRATION

DO NOT redo the full repository integration.

Only implement the specific donor changes identified below.

==================================================
AUTHORITATIVE AUDIT FINDINGS
==================================================

The primary repository already contains:

- Calm/Vibrant experience system
- complete styles.css tokens/utilities
- Prayer Rhythm Engine
- Prayer-aware task scheduling
- Family Routines engine
- Daily Surface
- Family Model
- Phase 3 intelligence
- Phase 4 functionality
- PWA
- Quran
- Hifz
- Ramadan

DO NOT modify those domain systems.

The donor adds only these required UX pieces:

1. src/components/veedu/schedule-field.tsx
2. src/components/home/routines.tsx

and selective changes to:

3. src/components/home/modules.tsx
4. src/routes/index.tsx

==================================================
STEP 1 — PORT ScheduleField
==================================================

Create:

src/components/veedu/schedule-field.tsx

Port the donor implementation.

It must consume the existing canonical scheduling model:

- ScheduleMode
- CANONICAL_RELATIVE_ANCHOR_KEYS
- RELATIVE_ANCHOR_DEFINITIONS

DO NOT recreate:
- prayer calculations
- anchor normalization
- scheduling logic

The component must support:

- No time
- Exact time
- Around prayer

The prayer options must come from the canonical Rhythm Engine vocabulary.

Ensure `idPrefix` is unique when multiple ScheduleField instances can exist on the same page.

Preserve accessibility.

==================================================
STEP 2 — PORT Routines UI
==================================================

Create:

src/components/home/routines.tsx

Port the donor Routines presentation.

It must consume:

- Routine[]
- FamilyMember[]
- routine-engine.ts APIs
- existing store/useStore
- existing recurrence/scheduling model

The UI should support the functionality already provided by the domain engine:

- list routines
- routine progress
- step completion
- step skipping
- routine creation
- routine scheduling
- recurrence
- family member assignment
- step assignment
- prayer-relative timing

DO NOT create new routine business logic.

DO NOT duplicate:
- completion calculation
- recurrence
- prayer scheduling
- family resolution

==================================================
STEP 3 — TASK FORM INTEGRATION
==================================================

Modify:

src/components/home/modules.tsx

Replace the legacy static clock-time scheduling control with:

<ScheduleField />

The task creation/editing logic must map the selected UI values into the existing task fields:

- scheduleMode
- relativeAnchor
- time

Use the existing task model.

Preserve all existing task behavior.

Existing tasks with:

- time
- date
- recurrence
- completions

must continue to work.

Do NOT redesign the entire Tasks module.

Only integrate the new schedule selector.

==================================================
STEP 4 — HOME ROUTING / TABS
==================================================

Modify:

src/routes/index.tsx

Add:

{
  id: "routines",
  label: "Routines"
}

to the existing Home tab structure.

The intended navigation is:

Today
Tasks
Meals
Grocery
Kids
Routines
Deeds
Calendar
Notes
Reminders

IMPORTANT:

Do NOT rename Kids.

Kids and Routines are intentionally separate.

Kids:
- child profiles
- child-specific chores
- family member management

Routines:
- household routines
- recurring workflows
- prayer-relative routines
- multi-member steps

==================================================
STEP 5 — ROUTINES DATA
==================================================

Inside Today/Home, use the existing store:

const [routines] = useStore<Routine[]>("routines", [])

Pass the routines into the existing:

buildDailyThread(...)

Do not modify the Daily Surface domain engine.

The Daily Surface must continue to use:

Rhythm Engine
→ DayRhythm
→ Daily Surface

Routines should be presented using the existing canonical data.

==================================================
STEP 6 — RENDER ROUTINES TAB
==================================================

Add the minimal routing/rendering integration:

{tab === "routines" && <Routines />}

Use the existing Home tab architecture.

Do not introduce a new router.

==================================================
STEP 7 — CALM + VIBRANT
==================================================

The new ScheduleField and Routines UI must work correctly in:

Calm
Vibrant

Use the existing experience abstraction.

DO NOT add new theme logic.

The same data must render in both experiences.

Only presentation should differ.

==================================================
STEP 8 — DO NOT MODIFY THESE
==================================================

Do NOT touch:

- src/lib/rhythm-engine.ts
- src/lib/routine-engine.ts
- src/lib/daily-surface.ts
- src/lib/family-model.ts
- src/lib/recurrence.ts
- src/lib/store.ts
- src/lib/reminder-engine.ts
- src/lib/hifz-scheduler.ts
- src/lib/ramadan.ts
- src/lib/quran-service.ts
- src/lib/intelligence.ts
- src/lib/budget-intelligence.ts
- src/lib/salah-intelligence.ts
- src/lib/mood-intelligence.ts
- src/lib/meal-intelligence.ts
- src/styles.css
- src/components/veedu/shell.tsx
- src/routes/__root.tsx

unless a compilation-only import/type adjustment is absolutely required.

No domain logic changes.

==================================================
STEP 9 — NO DEPENDENCY CHANGES
==================================================

The audit identified no required dependency changes.

Do NOT change package.json.

Do NOT change lockfiles.

Do NOT upgrade @lovable.dev packages.

==================================================
STEP 10 — TESTING
==================================================

Run:

npx tsx --test src/lib/*.test.ts
npx tsc --noEmit
npm run build

Additionally verify manually:

### Tasks
- create exact-time task
- create prayer-relative task
- create unscheduled task
- edit each
- save and refresh

### Routines
- create routine
- add steps
- assign member
- schedule after prayer
- complete step
- skip step
- verify progress
- refresh

### Navigation
- Kids opens correctly
- Routines opens correctly
- both remain separate

### Daily Surface
- routine signal appears when relevant
- prayer-relative routine appears in correct rhythm context
- no duplicate scheduling
- future tasks remain excluded

### Experiences
- Calm works
- Vibrant works
- switching experience preserves all data

==================================================
STEP 11 — GIT
==================================================

Create/use:

feat/integrate-vibrant-routines-ux

Commit:

feat: integrate vibrant routines and scheduling ux

Do not modify main directly.

==================================================
FINAL REPORT
==================================================

Return:

### Files Added
### Files Modified
### ScheduleField Integration
### Routines Integration
### Task Form Integration
### Navigation Changes
### Kids vs Routines
### Daily Surface Integration
### Calm Validation
### Vibrant Validation
### Tests
### Typecheck
### Build
### Manual Validation
### Dependencies
### Domain Files Confirmed Untouched
### Commit
### Remaining Issues

STOP.