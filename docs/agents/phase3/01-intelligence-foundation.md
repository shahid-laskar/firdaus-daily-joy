# P3.1 Intelligence Foundation

## Objective

Create reusable analytics, insight, and daily-signal infrastructure that Phase 3 and Phase 4 features can share.

## Why this comes first

Budget, Salah, mood, reminders, and the future Intelligent Daily Surface should not each calculate their own metrics independently.

## Inspect first

Find the current:
- state/store utilities
- localStorage schema
- date utilities
- recurrence utilities
- data selectors
- chart helpers
- Home/Today thread composition
- existing weekly review calculations

## Deliverables

Create or extend a reusable analytics layer supporting:
- date ranges
- week/month comparisons
- aggregate counts
- averages
- distributions
- trends
- previous-period deltas
- threshold signals

Create an insight representation suitable for:
- title
- explanation
- severity
- value
- trend
- source

Create a daily-signal representation suitable for:
- category
- priority
- reason
- optional action
- source

## Constraints

- Do not redesign the Home UI in this task.
- Do not add AI APIs.
- Do not duplicate weekly review calculations.
- Reuse existing helpers.
- Make calculations deterministic and testable.

## Acceptance criteria

- Existing features still work.
- Analytics functions have focused tests.
- Date boundaries are explicitly tested.
- Month/week comparisons handle missing data.
- Production build succeeds.
