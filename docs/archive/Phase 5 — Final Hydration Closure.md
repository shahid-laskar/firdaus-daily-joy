# Phase 5 — Final Hydration Closure

This is the final technical fix before closing Phase 5.

Cursor's final targeted verification found that all prior Phase 5 issues are resolved except one:

> localStorage-only Experience hydration can still render Calm on the server/initial React tree while the blocking script paints Vibrant before the mount effect switches React to Vibrant.

Do NOT make any other Phase 5 changes.

Do NOT redesign UI.

Do NOT change the Theme architecture.

Do NOT add features.

Do NOT commit or push.

---

# Objective

Make Experience initialization fully aligned across:

```text
SSR
React initial render
document[data-experience]
```

for both:

- cookie-backed users
- localStorage-only users

The current cookie-backed path should remain intact.

---

# Required Final Behavior

## Case 1 — Cookie = Calm

SSR:
Calm

React:
Calm

DOM:
Calm

No flash.

## Case 2 — Cookie = Vibrant

SSR:
Vibrant

React:
Vibrant

DOM:
Vibrant

No flash.

## Case 3 — No cookie, localStorage = Calm

The initial rendered React tree must remain consistent with the DOM/bootstrap result.

No Calm/Vibrant disagreement.

## Case 4 — No cookie, localStorage = Vibrant

The initial rendered React tree must NOT be Calm while the DOM is already Vibrant.

No hydration mismatch.

No Calm → Vibrant visual transition caused solely by Experience initialization.

---

# Important Constraint

Do NOT solve this by:

- suppressing hydration warnings
- rendering the whole application client-only
- hiding content until mount
- adding another parallel Experience state
- adding arbitrary timeout logic

Find the correct TanStack Start SSR/bootstrap mechanism.

---

# Investigation

Inspect:

- `src/routes/__root.tsx`
- `src/lib/theme-provider.tsx`
- initial preferences loader
- cookie handling
- blocking head script
- existing theme initialization

Determine the actual authoritative source for Experience.

Prefer one explicit source of truth.

Document the decision.

---

# Persistence Rule

The existing behavior should remain:

### Authenticated / cookie-backed

Use the cookie/request preference for SSR.

### Local-only

If localStorage is the only available source, determine the safest SSR-compatible strategy that avoids rendering one Experience on the server and another on the client.

Do not break existing persistence.

---

# Verification

Run:

```bash
npx tsc --noEmit
npm test
npm run build
```

Then perform actual browser cold-load testing.

Test:

1. Cookie Calm
2. Cookie Vibrant
3. localStorage-only Calm
4. localStorage-only Vibrant

For each:

- clear previous state appropriately
- cold-load the application
- inspect first rendered shell
- inspect SubTabs
- inspect typography
- inspect `data-experience`
- watch for visual flash
- inspect browser console for hydration warnings/errors

If SSR preview tooling is currently broken, fix only the minimum tooling required to perform this verification, or explicitly document why runtime verification remains impossible.

Do NOT claim a cold-load pass without runtime evidence.

---

# Final Report

## Root Cause

## Architecture Chosen

## Files Changed

## Cookie Path

## LocalStorage-Only Path

## Cold-Load Evidence

## Hydration Evidence

## TypeScript

## Tests

## Build

## Remaining Issues

Do not commit.