# P4.5 Intelligent Daily Operating Surface

## Objective

Evolve Home/Today into the product's defining daily surface.

## Principle

Home should reduce cognitive load by surfacing what needs attention now.

Do not show every metric.

## Inputs

Potential signals:

- next prayer
- overdue/high-priority tasks
- upcoming events
- meals
- grocery state
- habit completion
- health status
- budget warnings
- family responsibilities
- smart reminders
- Hifz revision
- Ramadan context

## Architecture

Consume the reusable intelligence foundation and existing module selectors.

Do not recalculate metrics independently inside the UI.

## Prioritization

Create a transparent priority strategy.

Example conceptual order:

1. time-sensitive immediate item
2. overdue/high-impact item
3. prayer context
4. family responsibility
5. daily habit/health action
6. useful optional context

The exact ranking must be justified from existing product behavior and validated before implementation.

## Privacy

Do not surface:

- private journal text
- cycle data
- detailed Hifz information
  unless the existing product explicitly defines that as appropriate for Home.

## Lovable

This is the flagship Lovable task.

Focus on:

- premium composition
- hierarchy
- calm motion
- contextual transitions
- responsive layout
- quick actions
- clear reason for each surfaced item

## Acceptance criteria

- Home remains understandable at a glance
- only actionable/contextually relevant items are surfaced
- existing Today functionality remains available
- mobile layout is excellent
- no private data leaks into the surface
- prioritization is testable
