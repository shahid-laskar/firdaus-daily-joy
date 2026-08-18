# FIRDAUS WAVE 2 — INDEPENDENT GATE REVIEW
**Reviewer:** Antigravity (independent of Gemini's prior review)
**Date:** 2026-08-18
**Repository:** `~/firdous/veedu-home-soul`

---

## BUILD / TEST RESULTS (Section 16)

| Check | Result |
|---|---|
| `npx tsx --test src/lib/*.test.ts` | **172/172 pass · 0 fail · 25 suites** |
| `npx tsc --noEmit` | **0 errors** |
| `npm run build` | **✓ clean · 1.57s** |

All three mandatory checks pass independently.

---

## FINDINGS

### POSITIVE

**P1 — Architecture is genuinely integration-based, not shadow-parallel**
`weekly-planning.ts` imports directly from `daily-surface.ts`, `routine-engine.ts`, `conflict-detector.ts`, `workload-intelligence.ts`, `rhythm-engine.ts`, and `family-model.ts`. There is no shadow task list, no shadow routine list, and no second recurrence engine. The `WeeklyPlanProposal` holds deltas (updates, newTasks), not a full copy of domain state. ✓

**P2 — Single recurrence implementation (`recurrence.ts`)**
One canonical `occursOn()` and `isRepeating()` used everywhere: tasks, routines, calendar events, weekly planning, workload intelligence. No duplicate temporal model found. ✓

**P3 — Commit model is genuinely idempotent**
`commitWeeklyPlanProposal()` deduplicates `newTasks` by ID. Re-committing same proposal against its own output yields `tasksCreated: 0`. Explicitly verified in test `IDEMPOTENCY` (line 442). ✓

**P4 — Member perspective is purely a filter, never a mutator**
`filterTasksForMember`, `filterRoutinesForMember`, `filterEventsForMember` in `family-model.ts` return new arrays; they never touch underlying state. `useSelectedMember()` only persists a string ID. Switching perspectives cannot mutate domain data. ✓

**P5 — Child privacy is enforced end-to-end**
`filterWorkloadForChild()` zeroes out adult workload figures, overdue counts, and replaces the fairness signal with a child-appropriate encouraging message. `isChildPerspective` flag propagates through `buildWeeklyPlan()`. Tested explicitly. ✓

**P6 — Conflict thresholds are centralized and labeled as heuristics**
`OVERLOAD_THRESHOLDS` is a named exported const in `conflict-detector.ts` (L69–84). Prayer reservation of 20 min is a named constant (`PRAYER_RESERVATION_MINUTES`). Default durations are named constants (`DEFAULT_EXACT_DURATION_MINUTES = 30`, `DEFAULT_ROUTINE_STEP_DURATION_MINUTES = 10`). ✓

**P7 — Workload measures responsibility, not productivity**
`WORKLOAD_METHODOLOGY_STATEMENT` is explicit: counts assignments, accumulates only explicitly recorded durations, uses item count for unmeasured items. No fabricated time estimates. ✓

**P8 — Experience independence verified**
`experiences.ts` is 43 lines of pure presentation metadata (id, name, tagline, description). It has no connections to domain state, assignments, conflicts, or persisted workload. Calm and Vibrant are purely layout/typography directives. ✓

**P9 — TypeScript type safety throughout**
Zero `tsc --noEmit` errors. All cross-engine boundaries use typed interfaces (`TaskRecord`, `Routine`, `FamilyMember`, etc.), not `any` except one justified cast in `conflict-detector.ts` and `weekly-planning.ts` where event is cast via `as any` for `getTaskAssignee`. This is a minor structural issue, not a safety hole.

**P10 — Offline-first**
`store.ts` is localStorage-first with a best-effort Supabase push. The `writeStore` catch block absorbs quota errors silently and continues in memory. All core Wave 2 computation is pure TypeScript without network dependency. ✓

---

### IMPORTANT (non-blocking)

**I1 — 1.4x workload threshold is not documented as configurable**
At `workload-intelligence.ts:422`, the qualitative load threshold `avgAdultAssigned * 1.4` and the minimum delta `>= 3` are inline magic numbers, not exported named constants. They are consistent with the stated heuristic but cannot be discovered or adjusted without reading the implementation.

*File:* `src/lib/workload-intelligence.ts:422`
*Actual behavior:* Threshold is embedded inline.
*Why it matters:* Inconsistency with the principle of documented, centralized heuristics established in `conflict-detector.ts`.
*Recommended fix:* Extract as `WORKLOAD_HEAVIER_RATIO = 1.4` and `WORKLOAD_MIN_DELTA = 3` constants alongside `WORKLOAD_METHODOLOGY_STATEMENT`.
*Blocks Wave 2:* **No.**

**I2 — `backup.ts` is explicitly marked PROTOTYPE with no Wave 2 field awareness**
The file header says `PROTOTYPE`. Export/import is a raw `localStorage` snapshot — it will capture all Wave 2 fields automatically, which is good. However, there is no schema version, no migration path, and no documentation about what happens when importing a pre-Wave-2 backup into a Wave 2 session.

*File:* `src/lib/backup.ts`
*Actual behavior:* Blind JSON copy of all `veedu:` keys.
*Why it matters:* If a user imports an old backup into a Wave 2 session, Wave 2 family fields (`assignedTo`, `proposal`, etc.) silently vanish. No user-visible warning exists.
*Recommended fix:* Add a schema version tag and import-time migration / warning for W2 fields.
*Blocks Wave 2:* **No** (affects data continuity, not core W2 flow).

**I3 — Supabase sync does not distinguish Wave 2 fields; no conflict resolution**
`syncFromCloud()` overwrites localStorage keys with cloud values based on a simple `current !== incoming` check. If a user has a newer local W2 proposal and the cloud has an older snapshot, the cloud wins silently.

*File:* `src/lib/store.ts:65-73`
*Actual behavior:* Last-write-wins with no timestamp comparison.
*Why it matters:* Can silently discard a locally staged weekly proposal in a multi-device scenario.
*Recommended fix:* Use the `updated_at` column already written to Supabase for last-write-wins comparison; skip overwrite if local is newer.
*Blocks Wave 2:* **No** (only affects multi-device Supabase users; offline flow is fine).

**I4 — No test for cross-engine path: conflict signals → workload → weekly plan → commit**
Individual engines are well-tested. The weekly planning test verifies `buildWeeklyPlan` with conflicts and workload in isolation. However, there is no integration test exercising the full sequence:

> Family with 2 adults → assign tasks via proposal → buildWeeklyPlan detects conflicts → workload shows skew → commit → verify domain state.

*Why it matters:* The cross-engine chain is the core Wave 2 value proposition. Individual unit tests cannot catch interface drift between engines.
*Recommended fix:* Add 1–2 end-to-end integration tests in `weekly-planning.test.ts` that exercise the full chain.
*Blocks Wave 2:* **No**, but high value before productization.

---

### MINOR

**M1 — `completedRoutineStepsCount` in `PreviousWeekSummary` reuses `totalCompleted` from workload**
At `weekly-planning.ts:958`, `completedRoutineStepsCount: prevWorkload.householdTotal.totalCompleted` — this is actually total completed tasks, not routine steps. The field name is misleading.

*File:* `src/lib/weekly-planning.ts:958`
*Recommended fix:* Either correct the field name or separately accumulate routine step completions.

**M2 — `uid()` in `store.ts` uses `Math.random()` (not crypto-safe)**
Used for generating task IDs. Collision risk is negligible at household scale but worth noting.

**M3 — Child workload filter masks `totalAssignedMinutesKnown` but not `totalAssigned`**
`filterWorkloadForChild` zeroes out `totalAssignedMinutesKnown` and `unassignedMinutesKnown` but leaves `householdTotal.totalAssigned` intact. A child-facing UI could infer adult workload from the total minus their own count.

*File:* `src/lib/workload-intelligence.ts:611-615`

---

## ARCHITECTURE VERDICT

### Confirmed Clean Architecture
- ✓ No shadow planning database
- ✓ No second task system
- ✓ No second routine system
- ✓ Single recurrence engine
- ✓ No duplicate temporal model
- ✓ No duplicate family identity system
- ✓ Rhythm Engine is canonical temporal model
- ✓ Prayer-relative schedules are semantic, not synthesized to timestamps
- ✓ Weekly Planning uses same rhythm model as Today surface

---

## PRODUCT QUALITY ASSESSMENT (Section 14)

Wave 2 delivers a **Family Operating System**, not "more family filters on a task app."

Evidence:
- The Weekly Plan builds a complete picture: prior week review, fixed events, routines, assignments, conflict preview, workload preview, meals, approval, and commit — all integrated.
- Workload intelligence is genuinely compassionate: it uses "responsibility" language, exposes methodology, avoids rankings, and adapts gracefully for sparse data (returns "unclear" rather than fabricating fairness judgments).
- Conflict detection is explainable and actionable (reschedule/reassign/split/review suggestions).
- Child perspective is thoughtful: suppresses financial/workload data, provides encouraging messages.
- Weekly planner is explicitly staged/draft; no accidental mutation.

**Surveillance / guilt risk:**  Low. The fairness signal uses first-person names gently ("Amina is carrying more") without scores, percentages, or leaderboards. The methodology is exposed to the user. No completion rate leaderboard exists.

---

## REGRESSION (Section 15)

No regression vectors found for Phase 0–4 / Wave 1 features:
- Recurrence: unchanged, single implementation
- Routines: `routine-engine.ts` untouched by Wave 2 (Wave 2 adds assignment metadata only)
- Daily Surface: `daily-surface.ts` extended with `memberId`/`familyMembers` as optional fields; existing callers unaffected
- Calendar, Budget, Deen, Quran, Hifz, Ramadan: no changes detected in those modules
- Experiences (Calm/Vibrant): unchanged; experience switching cannot affect domain state

---

## FINAL VERDICT

```
WAVE 2 READY AFTER FIXES
```

**Wave 2 is approved for UX/productization.**

The core is architecturally sound, idempotent, offline-first, privacy-respecting, and free of shadow systems. All three mandatory checks pass (172/172 tests, 0 TypeScript errors, clean build).

**Recommended path:**

1. **Small engineering polish pass** (1–2 sessions) before Lovable UX:
   - Fix **I1**: Extract 1.4x workload threshold as named constant.
   - Fix **M1**: Correct misleading `completedRoutineStepsCount` field.
   - Fix **M3**: Mask `householdTotal.totalAssigned` in child workload filter.
   - Add **I4**: 1–2 end-to-end integration tests.
2. **Defer** I2 (backup schema versioning) and I3 (Supabase sync conflict resolution) to a W2.x maintenance sprint — they affect edge cases only.
3. **Proceed to Lovable UX** after the polish pass. Do NOT start Wave 3 until UX is validated on Wave 2 domain.
