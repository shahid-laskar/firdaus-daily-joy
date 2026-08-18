# FIRDAUS — FRESH VIBRANT THEME UNIFICATION
# AUDIT-FIRST SELECTIVE INTEGRATION

You are the primary integration engineer.

We are starting a CLEAN Vibrant UX integration.

PRIMARY REPOSITORY
~/firdous/veedu-home-soul

DONOR REPOSITORY
~/firdous/vibrant-theme-unification


IMPORTANT:
The primary repository has been reset to a clean/current state before this task.

The donor repository has also been synchronized with its latest remote state.
IMPORTANT DONOR STATE:

The donor repository has just been synchronized to origin/main.

Current donor HEAD:
a4fcccf — Added routines & rhythm UX

The donor therefore includes the latest Vibrant experience and Wave 1/Rhythm UX work.

Do not assume the donor is the older version previously inspected.
Audit the CURRENT donor HEAD against the CURRENT veedu-home-soul repository.
DO NOT assume any previous local Vibrant integration exists.

DO NOT blindly copy the donor repository.

DO NOT modify the primary repository during the audit phase.

==================================================
CORE PRINCIPLE
==================================================

`veedu-home-soul` is the ONLY source of truth.

The donor repository is ONLY a visual/experience donor.

The donor may provide:
- Vibrant theme
- experience styling
- components
- layout
- typography
- animation
- presentation improvements

The donor must NOT replace:
- application architecture
- routing
- state
- localStorage
- Supabase
- authentication
- business logic
- analytics
- reminder engine
- recurrence
- Rhythm Engine
- Daily Surface
- Tasks
- Routines
- Family Model
- Quran
- Hifz
- Ramadan
- PWA/service worker

==================================================
PHASE 1 — AUDIT ONLY
==================================================

DO NOT MODIFY FILES.

First inspect both repositories completely enough to understand the integration boundary.

--------------------------------------------------
A. PRIMARY REPOSITORY
--------------------------------------------------

Inspect:

- git status
- current branch
- recent commits
- package.json
- routes
- components
- src/lib
- experiences.ts
- theme system
- styles.css
- shell
- navigation
- Home / Today
- Tasks
- Routines
- Kids
- Meals
- Grocery
- Deen
- Quran
- Hifz
- Ramadan
- Budget
- Insights
- Calendar
- Notes
- Reminders
- PWA
- store
- Supabase
- Rhythm Engine
- Daily Surface

Confirm the current Calm/Vibrant experience architecture.

--------------------------------------------------
B. DONOR REPOSITORY
--------------------------------------------------

Inspect:

- package.json
- routes
- components
- styles
- theme tokens
- experience system
- typography
- animations
- assets
- layout changes
- navigation
- providers
- state
- mock data
- API calls
- environment variables

DO NOT ASSUME EVERYTHING IN THE DONOR SHOULD BE PORTED.

==================================================
PHASE 2 — BUILD A DIFFERENCE MATRIX
==================================================

Compare donor vs primary.

For every significant donor artifact classify it as:

A. ALREADY PRESENT IN PRIMARY
B. MISSING AND SAFE TO PORT
C. PRESENT BUT NEEDS ADAPTATION
D. INTENTIONALLY DIFFERENT — DO NOT PORT
E. CONFLICTS WITH PRIMARY ARCHITECTURE — DO NOT PORT

Create a file-by-file integration map.

Example:

| Donor Artifact | Primary Equivalent | Status | Action |
|----------------|--------------------|--------|--------|
| X | Y | Missing | Port |
| X | Y | Already present | Skip |
| X | Y | Conflict | Reject |

==================================================
PHASE 3 — EXPERIENCE ARCHITECTURE CHECK
==================================================

Confirm exactly how `veedu-home-soul` currently implements:

Calm
Vibrant

Verify:

- one experience abstraction
- one active experience state
- shared domain layer
- experience-specific presentation only

The intended architecture is:

                    DOMAIN
                      │
          ┌───────────┴───────────┐
          ▼                       ▼
        CALM                   VIBRANT
    presentation            presentation

Both experiences MUST consume the same domain state.

Confirm that Vibrant has no impact on:
- scheduling
- recurrence
- tasks
- routines
- family
- reminders
- analytics
- persistence
- Quran
- Hifz
- Ramadan

==================================================
PHASE 4 — WAVE 1 / PHASE 4 COMPATIBILITY
==================================================

The current production repository already contains:

Phase 3:
- Intelligence
- Budget Insights
- Salah Analysis
- Mood/Activity
- Smart Reminders
- Meal Intelligence
- Family Model

Phase 4:
- PWA
- Quran API/cache
- Hifz scheduler
- Ramadan Mode
- Intelligent Daily Surface

Wave 1:
- Prayer Rhythm Engine
- Prayer-aware Tasks
- Family Routines
- unified Rhythm → DayRhythm → Daily Surface pipeline

The donor MUST NOT overwrite these.

Verify that Vibrant can consume the existing:

- DayRhythm
- DailySurface data
- Tasks
- Routines
- Family Members
- Insights
- Hifz signals
- Ramadan signals
- Reminder signals

without recreating their business logic.

==================================================
PHASE 5 — NAVIGATION AUDIT
==================================================

Explicitly compare Home navigation.

Check whether the donor contains:

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

Determine the exact intended navigation structure.

IMPORTANT:

Do not rename `Kids` to `Routines` automatically.

We expect these concepts to remain distinct:

Kids:
- child profiles
- child-specific information
- child chores

Routines:
- household routines
- recurring workflows
- prayer-relative routines
- multi-member step assignments

Report the differences before changing anything.

==================================================
PHASE 6 — DAILY SURFACE AUDIT
==================================================

The canonical production flow MUST remain:

Prayer/Data
    ↓
Rhythm Engine
    ↓
DayRhythm
    ↓
Daily Surface
    ↓
Calm / Vibrant presentation

Verify that the donor does not:
- recalculate prayer timing
- recalculate task due state
- recalculate routines
- recalculate reminders
- create a second prioritization engine

If the donor has Daily Surface UI improvements, identify which components can be ported as presentation only.

==================================================
PHASE 7 — THEME / CSS AUDIT
==================================================

Compare:

- global CSS
- theme variables
- experience tokens
- typography
- spacing
- radii
- shadows
- animations
- utility classes

Identify:
- collisions
- global overrides
- duplicate design systems
- Calm regressions
- unnecessary global changes

Recommend the smallest safe integration strategy.

==================================================
PHASE 8 — COMPONENT AUDIT
==================================================

Identify donor components that are:

1. Pure presentational
2. Experience-aware
3. Coupled to donor state
4. Coupled to donor routing
5. Coupled to donor APIs
6. Coupled to donor persistence

Only 1 and suitably adapted 2 should normally be ported.

==================================================
PHASE 9 — DEPENDENCY AUDIT
==================================================

Compare package.json files.

For every donor dependency:

- Does primary already have it?
- Is an existing equivalent available?
- Is the dependency actually required?

Prefer ZERO new dependencies.

Do not upgrade unrelated packages.

==================================================
PHASE 10 — MOCK / FOREIGN ARCHITECTURE AUDIT
==================================================

Search donor for:

- mock
- demo
- placeholder
- sample
- hardcoded user data
- fake prayer data
- fake tasks
- fake insights
- donor-only stores
- donor-only APIs
- donor-only providers
- donor-only env variables

These must not enter production.

==================================================
PHASE 11 — DATA SAFETY AUDIT
==================================================

Determine whether donor components assume different:

- task schemas
- family schemas
- routine schemas
- localStorage keys
- user profiles
- API contracts

Anything incompatible must be adapted to the primary repository.

Do not introduce migrations merely to accommodate the donor UI.

==================================================
PHASE 12 — OUTPUT ONLY
==================================================

DO NOT MODIFY FILES.

Return a detailed report containing:

# 1. Primary Repository State

# 2. Donor Repository State

# 3. Difference Matrix

# 4. Already Integrated

# 5. Missing

# 6. Partial / Requires Adaptation

# 7. Must NOT Be Ported

# 8. Navigation Differences
Explicitly address Kids vs Routines.

# 9. Experience Architecture Assessment

# 10. Daily Surface Compatibility

# 11. Wave 1 Compatibility

# 12. CSS / Theme Integration Plan

# 13. Component Integration Plan

# 14. Dependency Changes
Expected: preferably none.

# 15. Mock / Donor Architecture Rejection List

# 16. Data Safety Assessment

# 17. Recommended Integration Order

# 18. Files Expected To Change

# 19. Files That Must Remain Untouched

# 20. Risks

# 21. Final Recommendation

Choose exactly one:

READY FOR SELECTIVE INTEGRATION

NEEDS ARCHITECTURE DECISION

DO NOT INTEGRATE YET

DO NOT MODIFY ANY FILE.

STOP AFTER THE AUDIT.