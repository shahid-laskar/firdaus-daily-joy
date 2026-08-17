# Phase 5 — Wave 2C.3B
## Final Hardening From Cursor Audit

Cursor has completed the independent audit of the current Wave 2C.3B working tree.

Wave 2C.3B is NOT accepted yet.

Make only the targeted corrections below.

Do NOT redesign the secondary tabs.
Do NOT start Wave 2D.
Do NOT add new features.
Do NOT commit or push yet.

---

# P1 — Fix Experience Hydration Correctly

## Problem

The current implementation attempts to avoid the previous flash by seeding React Experience state from `document/localStorage` in `useState`.

However, TanStack Start SSR still renders with:

```ts
DEFAULT_EXPERIENCE = "calm"
```

when `document` is unavailable.

Therefore:

```text
Server React tree
    = Calm

Inline bootstrap DOM
    = Vibrant
```

A persisted Vibrant user can hydrate a different React tree from the server HTML.

The existing solution must be replaced with a hydration-safe design.

## Goal

The following must all agree for the initial render:

```text
server-rendered experience
client React experience
document data-experience
```

There must be exactly one authoritative initial Experience value.

Requirements:

- no hydration mismatch
- no Calm → Vibrant flash
- no Vibrant → Calm overwrite
- Calm remains the default
- persisted valid Experience is respected
- invalid persisted Experience falls back to Calm
- shell and secondary tabs can safely branch on Experience during initial render

Inspect the existing TanStack Start/root rendering architecture before choosing the solution.

Do NOT simply suppress hydration warnings.

Do NOT use client-only rendering as a shortcut.

Do NOT create another parallel Experience state system.

Document the chosen approach.

---

# P2 — Restore Capability Parity: Deeds Delete

Current problem:

Vibrant Deeds exposes deletion while Calm does not.

This violates:

```text
Shared Core
    ↓
Experience
    ↓
Presentation
```

because mutation capability is changing with Experience.

Fix this so both experiences have the same underlying Deeds capabilities.

Requirements:

- shared delete handler
- same persistence
- same validation
- same semantics
- experience may style the control differently
- Calm and Vibrant both have access to the same product capability

Do not duplicate the mutation logic.

If the control was intentionally absent from Calm before this wave, add the shared capability in the smallest safe way.

---

# P2 — Restore Capability Parity: Grocery Filtering

Current problem:

Vibrant renders `needed/got` filtering while Calm does not.

The filter logic must be shared.

Desired architecture:

```text
Shared grocery filter state
        ↓
Shared visible item calculation
        ↓
Calm presentation
OR
Vibrant presentation
```

The Experience may style the filters differently or position them differently.

Do NOT maintain separate filtering logic per Experience.

Ensure current grocery behavior remains correct.

---

# P2 — Fix Vibrant Life-Area Tone Wiring

Perform a systematic audit of all secondary Vibrant tab tone usage.

The intended defined voices are:

```text
prayer
task
meal
kids
grocery
habit
money
self
```

Identify all locations where:

```text
data-tone
```

is applied.

For every occurrence determine whether the element is an actual tone carrier.

Examples of valid carriers include the existing primitives that consume:

```text
--tone
--tone-soft
```

Do not put `data-tone` on arbitrary wrappers if the CSS does not consume it there.

Fix cases such as:

- `data-tone` on wrappers with no tone carrier behavior
- `ProgressRing` using `data-tone` without mapping the tone to its actual visual variables
- invalid `"deen"` tone values

Do NOT invent a new `deen` life-area voice unless there is a product-level reason.

For spiritual Deen content, use an existing semantic tone or the established `space-accent` appropriately.

After the fix, verify that the intended life-area colors actually appear in the Vibrant secondary tabs.

---

# P2 — Complete Vibrant Settings / Field Chrome

The Vibrant settings surface is currently visually mixed.

Ensure that when:

```text
experience === "vibrant"
```

the relevant settings sheet uses a coherent Vibrant presentation:

- sheet/container
- Name
- City
- Madhab
- Method
- labels
- actions

Do NOT change functionality.

Do NOT alter:

- geolocation
- backup/restore
- account state
- persistence
- validation

Reuse the existing Vibrant control/field styling rather than inventing a second system.

When Calm is selected, retain the Calm presentation.

Also audit secondary-tab forms that reuse the same `Field` primitive so they do not accidentally produce a Calm-styled field inside a Vibrant surface.

---

# P3 — Meals Recipe Affordance Parity

If the existing product supports adding a meal suggestion/recipe to the plan:

Ensure the capability is available in both Experiences.

The visual treatment may differ.

Do not duplicate the underlying handler.

---

# P3 — Notes Search Consistency

Investigate the differing thresholds for displaying search.

If the product behavior is intended to be shared, make the threshold/decision shared.

Do not let the Experience arbitrarily change functionality.

If the difference is intentional, document why.

Prefer the shared behavior.

---

# P3 — Experience Contract Test Isolation

The Experience test should not dynamically import Shell merely to inspect `SPACES`.

Refactor the semantic navigation/space contract into the smallest dependency-free module if appropriate.

The Experience tests must remain free of:

- Supabase initialization
- store initialization
- browser-only runtime assumptions

Keep the test focused and deterministic.

---

# P3 — Calm Calendar Fasting Empty State

Cursor identified a pre-existing Calm-only issue where a fasting-only day may display the generic empty state.

Do NOT broaden this into a product redesign.

Since Calendar is already being touched, fix this small semantic consistency issue only if it can be done safely with minimal scope.

Make Calm and Vibrant use the same underlying condition.

---

# Do NOT Do

Do NOT:

- redesign the tabs again
- add new product features
- create new Experience abstractions
- create new Theme IDs
- add `bloom`
- alter domain engines
- change persistence architecture
- modify primary routes
- add new icon libraries
- rewrite the shell
- start Wave 2D

---

# Verification

Run:

```bash
npx tsc --noEmit
npm test
npm run build
```

Also explicitly verify:

## Hydration

Test a persisted Vibrant user on a fresh/cold load.

Verify:

- server markup and client tree agree
- no hydration warning
- no Calm flash
- shell starts Vibrant
- SubTabs start Vibrant
- secondary tabs start Vibrant

Repeat for Calm.

## Capability Parity

Verify both Calm and Vibrant:

- Deeds delete
- Grocery filtering
- Meals recipe → plan action

## Tone Wiring

Verify actual visible tonal colors on:

- Tasks
- Meals
- Grocery
- Kids
- Deeds
- Calendar
- Reminders
- relevant shared components

## Settings

Verify Calm and Vibrant presentation for all relevant fields/controls.

## Tests

Report exact:

- number of tests
- number of suites
- failures
- warnings
- TypeScript result
- build result

---

# Final Report

## P1 Hydration Fix

## P2 Capability Parity

## P2 Tone Wiring

## P2 Settings / Field Consistency

## P3 Fixes

## Tests

## Build

## Remaining Issues

Do not commit yet.