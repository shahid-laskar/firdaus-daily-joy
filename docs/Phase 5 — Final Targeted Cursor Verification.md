# Phase 5 — Final Targeted Cursor Verification

The final Phase 5 hardening pass has been implemented.

This is NOT another broad audit.

Your task is to verify only the specific findings from the previous Cursor audit and determine whether Phase 5 is ready to close.

## Important

- Do NOT modify any files.
- Do NOT fix anything.
- Do NOT commit or push.
- Inspect the actual current repository and working tree.
- Do not rely on Gemini's completion report as evidence.
- Verify the actual implementation and runtime behavior where requested.

---

# 1. Git State

Run:

```bash
git status --short
git diff --stat
git diff
git log --oneline -10
```

Confirm that the expected final hardening changes are present.

Identify:

- modified source files
- unexpected files
- unrelated changes
- untracked artifacts

Do not require the tree to be clean; this is a verification pass before the final commit.

---

# 2. P1 — Home Tonight Dinner Data

Previous finding:

The Vibrant Home "Tonight" tile used:

```ts
meals[today]
```

while the actual meal-plan dinner key follows:

```text
${dayName}-Dinner
```

Verify the current implementation.

Requirements:

- Vibrant Home resolves today's dinner using the same canonical key/data convention as the existing daily thread.
- If dinner is planned, the Tonight tile displays it.
- If dinner is not planned, it correctly shows the empty/not-planned state.
- No duplicate meal-domain logic was introduced.

Inspect the actual source.

If practical, verify with a representative planned-dinner case.

---

# 3. P1/Potentially Release-Blocking — Experience Cold Load

Previous finding:

Experience hydration / first-paint alignment needed verification.

Verify these four scenarios:

## A. Persisted Vibrant + cookie

- Experience = Vibrant
- cookie contains Vibrant
- cold load

Verify:

- SSR output corresponds to Vibrant
- React initial tree corresponds to Vibrant
- `data-experience` corresponds to Vibrant
- shell is Vibrant immediately
- SubTabs are Vibrant immediately
- typography is Vibrant immediately
- no Calm → Vibrant flash
- no hydration warning

## B. Persisted Calm + cookie

Perform the same verification for Calm.

## C. LocalStorage-only Vibrant

Simulate:

- no Experience cookie
- valid localStorage = Vibrant

Verify what actually happens.

Specifically report:

- SSR Experience
- initial DOM Experience
- React Experience
- whether a flash occurs
- whether hydration remains safe

Do not call this a pass merely because the final state becomes Vibrant.

## D. LocalStorage-only Calm

Repeat for Calm.

### Evidence

Prefer an actual browser/dev-server cold load.

If a real browser test is unavailable, inspect the SSR/bootstrap implementation and explicitly mark the runtime portion as unverified.

Do NOT claim "no flash" without evidence.

---

# 4. P2 — Deeds Delete Capability Parity

Verify that both:

```text
Calm
Vibrant
```

have the same underlying delete capability.

Check:

- shared delete handler
- same persistence behavior
- same semantics
- same validation/confirmation
- only presentation differs

Verify that a deed created/visible in one Experience can be deleted after switching to the other Experience.

The Experience must not determine whether the capability exists.

---

# 5. P2 — Grocery Filter Capability Parity

Verify:

```text
needed
got
```

or the equivalent existing filter functionality is available in both experiences.

Check that:

- filter state is shared
- visible item calculation is shared
- only visual presentation differs
- switching Experience does not reset or corrupt filtering

Verify actual behavior, not just source structure.

---

# 6. P2 — Tone Mapping

Verify the previous tone issues were corrected.

Inspect all relevant secondary tabs and confirm:

### Valid defined semantic voices

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

### Specifically recheck

- Notes
- Deeds
- Calendar
- Reminders

Confirm they are no longer incorrectly mapped to unrelated life-area tones unless there is an explicit semantic reason.

Also verify:

- `data-tone` is placed on elements that actually consume the tone
- tone-bearing components resolve the correct visual variables
- there is no silent fallback to `--space-accent` due to invalid/non-carrier placement

Where possible, inspect rendered/source behavior rather than only declarations.

---

# 7. P2 — Settings / Field Consistency

Verify the Vibrant Settings sheet end-to-end.

When:

```text
experience = vibrant
```

check:

- sheet chrome
- Name field
- City field
- Madhab
- Method
- labels
- actions

All should belong to the same Vibrant visual system.

When:

```text
experience = calm
```

the existing Calm presentation should remain intact.

Also verify that the shared `Field` primitive does not create a visibly Calm-styled field inside Vibrant secondary surfaces.

This is a presentation consistency check only.

Do not require architectural refactoring beyond what was already implemented.

---

# 8. P3 — Meals Recipe → Plan Affordance

Verify that the existing recipe/suggestion-to-plan capability is available in BOTH experiences.

Confirm:

- shared handler
- shared underlying behavior
- presentation may differ

No Experience should lose the capability.

---

# 9. P3 — Notes Search Consistency

Verify that the decision for displaying Notes search is now shared between Calm and Vibrant.

The goal is:

```text
same product behavior
+
different presentation if desired
```

Do not accept an Experience-specific functional threshold unless it is explicitly justified.

---

# 10. P3 — Experience Test Isolation

Verify:

```text
src/lib/experiences.test.ts
```

does NOT initialize unrelated application infrastructure such as:

- Supabase
- store
- Shell
- browser runtime

The test should remain focused and deterministic.

Run:

```bash
npm test
```

and note whether the previous Supabase/Node warning caused by Shell import is gone.

---

# 11. P3 — Deen Deep Link

Verify the previously identified route problem:

```text
/deen?tab=salah
```

The Review page uses this destination.

Confirm that:

- the query parameter is actually read
- the Salah tab opens
- normal `/deen` behavior remains unchanged
- existing tab navigation remains intact
- both Calm and Vibrant use the same underlying navigation semantics

This is a product correctness verification, not a styling check.

---

# 12. P3 — Kids Empty-State Icon

Verify the final empty-state icon is semantically appropriate for Kids/family context.

It should not be an unrelated Calendar icon unless explicitly justified.

Check that it remains:

- accessible
- visually consistent with Vibrant
- not over-decorated

---

# 13. Unused `btn-tone`

Verify whether:

```text
btn-tone
```

is now used.

If still unused:

- report it as remaining dead CSS
- do NOT modify it

This is a cleanup observation, not a blocker.

---

# 14. Final Verification Commands

Run independently:

```bash
npx tsc --noEmit
npm test
npm run build
```

Report exact output:

- test count
- suite count
- failures
- warnings
- TypeScript result
- build result

---

# 15. Final Classification

Use exactly one:

## GREEN — PHASE 5 READY TO CLOSE

All required hardening findings are resolved and no release-blocking issue remains.

## AMBER — TARGETED FOLLOW-UP STILL REQUIRED

One or more specific findings remain, but the architecture is otherwise sound.

## RED — PHASE 5 CANNOT CLOSE

A release-blocking correctness, hydration, capability, or architectural problem remains.

---

# 16. Final Report Format

## Verdict

## Git State

## Dinner Fix

## Experience Cold-Load Verification

### Cookie + Vibrant
### Cookie + Calm
### LocalStorage-only Vibrant
### LocalStorage-only Calm

## Capability Parity

### Deeds
### Grocery
### Meals → Plan

## Tone Mapping

## Settings / Field Consistency

## Notes Search

## Test Isolation

## Deen Deep Link

## Kids Empty State

## Remaining Dead Code

## TypeScript

## Tests

## Build

## Final Recommendation

Do not modify any files.
Do not commit or push.