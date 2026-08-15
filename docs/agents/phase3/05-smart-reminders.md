# P3.5 Smart Reminder Engine

## Objective

Create one context-aware reminder rule engine instead of independent reminder logic per module.

## Potential signals

- upcoming prayer
- overdue task
- upcoming event
- incomplete habit
- usual fasting day
- budget threshold
- missing daily health entry
- due weekly review
- other already-supported reminder contexts

## Architecture

Reuse existing notification/nudge infrastructure if present.

A rule should conceptually produce:

- whether it applies
- priority
- message
- category
- source
- optional action target

## Critical requirement

Do not make reminders noisy.

Introduce:

- priority
- deduplication
- cooldown/once-per-window behavior where appropriate
- user enable/disable preferences

## Browser behavior

Verify whether existing notifications are:

- UI only
- local scheduling
- Notification API
- service-worker based
- persistent while the tab is closed

Do not claim persistent background behavior unless implemented.

## Lovable

Only polish reminder controls and the reminder presentation. Core scheduling remains Gemini's responsibility.

## Acceptance criteria

- no duplicate reminders
- disabled categories remain disabled
- reminders survive refresh according to the architecture's supported behavior
- time-zone behavior is correct
- tests cover rule evaluation
