# P4.3 Hifz Revision Scheduler

## Objective

Turn the existing Hifz percentage tracking into a revision workflow with a transparent spaced-repetition-style scheduler.

## Requirements

Support:
- memorized item/surah
- revision history
- next revision date
- confidence/difficulty signal where appropriate
- daily revision queue
- manual override
- overdue handling

## Algorithm rule

Use a simple explainable algorithm first.

Do not hide the scheduling logic behind an LLM.

## UX

The revision experience should answer:
- What should I revise today?
- Why is it due?
- What happens if I mark it easy/hard?
- What is next?

## Lovable

Use one focused premium UX pass for the revision queue/session.

## Acceptance criteria

- deterministic scheduling
- dates are correct
- overdue items are handled
- user can correct mistakes
- existing Hifz data remains intact
- tests cover interval progression and overdue cases
