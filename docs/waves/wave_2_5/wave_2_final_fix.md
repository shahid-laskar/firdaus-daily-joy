# FIRDAUS WAVE 2 — FINAL POLISH BEFORE UX

Repository:
~/firdous/veedu-home-soul

Independent Wave 2 gate result:

WAVE 2 READY AFTER FIXES

Do ONLY the four fixes below.

DO NOT add new features.
DO NOT redesign UI.
DO NOT use Lovable yet.
DO NOT start Wave 3.
DO NOT modify unrelated Wave 2 architecture.

==================================================
FIX 1 — WORKLOAD HEAVIER THRESHOLD
==================================================

In:

src/lib/workload-intelligence.ts

The current qualitative "heavier" logic uses inline values:

- ratio = 1.4
- minimum delta = 3

Extract these into named exported constants alongside the existing workload methodology constants.

Example conceptually:

WORKLOAD_HEAVIER_RATIO = 1.4
WORKLOAD_HEAVIER_MIN_DELTA = 3

Use the constants in the calculation.

Do not change the actual behavior.

Add/update a focused test proving the threshold behavior remains unchanged.

==================================================
FIX 2 — MISLEADING PREVIOUS-WEEK FIELD
==================================================

In:

src/lib/weekly-planning.ts

The field:

completedRoutineStepsCount

currently derives from:

prevWorkload.householdTotal.totalCompleted

which actually represents total completed items rather than routine-step completions.

Fix this correctly.

Preferred solution:

derive actual completed routine-step counts from routine instances/completion state for the previous week.

Do NOT merely rename the field unless the existing product/API contract clearly makes that the safer choice.

Preserve backward compatibility where applicable.

Add a focused test proving the value represents routine-step completions.

==================================================
FIX 3 — CHILD WORKLOAD PRIVACY
==================================================

In:

src/lib/workload-intelligence.ts

The child sanitization currently masks:

- totalAssignedMinutesKnown
- unassignedMinutesKnown

but leaves:

householdTotal.totalAssigned

visible.

A child-facing view could potentially infer adult workload from this.

Fix the child sanitization so adult household workload totals are not inferable.

Preserve child-appropriate information.

Do not expose:
- adult workload
- adult overdue counts
- adult financial data
- fairness disparities

The resulting child view should remain encouraging and useful.

Add/update a regression test proving the sensitive totals are fully masked.

==================================================
FIX 4 — TRUE END-TO-END WAVE 2 TEST
==================================================

Add 1–2 integration tests in:

src/lib/weekly-planning.test.ts

The test MUST exercise the actual cross-engine sequence:

1. Create a household with at least two adult members.
2. Create assigned tasks/routine responsibilities.
3. Create a weekly proposal.
4. Stage an assignment or scheduling change.
5. Build the proposed week.
6. Run conflict detection against the proposed state.
7. Run workload intelligence against the proposed state.
8. Verify the resulting workload/conflict signals reflect the staged change.
9. Commit the proposal.
10. Verify the resulting task/routine domain state.
11. Verify a second commit does not duplicate data.

This must exercise real production functions.

Do NOT mock away the engines being tested.

Also include at least one case where:
- assignment changes the workload distribution
OR
- a staged scheduling change introduces/removes a conflict.

==================================================
REGRESSION
==================================================

Run:

npx tsx --test src/lib/*.test.ts
npx tsc --noEmit
npm run build

All tests must pass.

Do not reduce the test suite.

==================================================
SELF-REVIEW
==================================================

Before committing:

1. Inspect workload-intelligence.ts
2. Inspect weekly-planning.ts
3. Inspect conflict-detector.ts
4. Verify no duplicated constants or calculations
5. Verify child privacy
6. Verify previous-week metrics
7. Verify the new integration test actually exercises all engines
8. Verify no Wave 0–1 regressions
9. Verify Calm/Vibrant independence

==================================================
COMMIT
==================================================

Commit:

fix: finalize wave 2 before ux

==================================================
FINAL REPORT
==================================================

Return:

### Fix 1
### Fix 2
### Fix 3
### Fix 4
### Tests Before/After
### Typecheck
### Build
### Regression
### Self-Review
### Commit

STOP.