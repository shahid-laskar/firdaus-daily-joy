# Universal Agent Rules

These rules apply to Gemini, Lovable, and Claude.

## 1. Repository first

Before modifying code:
- inspect current branch
- inspect recent commits
- inspect changed files
- inspect routes
- inspect components
- inspect state/data model
- inspect localStorage keys
- inspect Supabase integration
- inspect theme system
- inspect package.json/dependencies
- inspect build/test configuration
- inspect the actual implementations of any related Phase 0–2 features

Never trust a previous agent's summary when the repository can answer the question.

## 2. Preserve existing behavior

Do not:
- reset the repository
- replace the existing architecture casually
- recreate existing features
- remove working Phase 0–2 functionality
- change navigation merely for convenience
- replace localStorage-first persistence without a strong reason

## 3. Data safety

If a schema changes:
- support old data
- migrate deterministically
- preserve unknown/legacy fields where practical
- test old → new migration
- do not silently delete user data

## 4. Reuse

Prefer:
- existing components
- existing hooks
- existing state/store patterns
- existing theme tokens
- existing charting libraries
- existing utilities

Do not add a package merely to solve a small problem already solvable in the repository.

## 5. Recurrence consistency

Do not create separate incompatible recurrence engines.

If existing recurrence infrastructure exists, extend it.

Any new recurring capability should reuse the established model where possible.

## 6. Intelligence consistency

Do not calculate the same metric in multiple pages using different formulas.

Centralize analytics and reuse them.

## 7. UX quality

Every feature must consider:
- empty state
- loading state
- error state
- success feedback
- mobile layout
- keyboard accessibility
- edit/delete behavior
- persistence
- refresh behavior
- edge cases
- destructive action confirmation

## 8. Privacy

Do not expose sensitive private areas in shared/public surfaces.

Journal and other private content must remain private unless the existing product explicitly permits otherwise.

## 9. Build validation

Before declaring a task complete:
- run type checks
- run relevant tests
- run production build
- inspect runtime behavior for the target workflow
- inspect responsive behavior

## 10. Scope discipline

Only modify what the task requires.

Avoid:
- broad refactors
- unrelated formatting changes
- speculative redesigns
- dependency churn
- feature creep

## 11. Commit discipline

Prefer one logical commit per feature.

Commit message examples:
- feat: add intelligence foundation
- feat: add budget insights
- feat: add salah consistency analysis
- feat: add smart reminder engine
- feat: add family member model
- feat: add hifz revision scheduler

## 12. Reporting

At the end of each task report:
- files changed
- data-model changes
- migrations
- tests run
- build result
- known limitations
- recommended next task
