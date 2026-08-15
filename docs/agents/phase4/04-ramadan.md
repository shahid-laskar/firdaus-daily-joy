# P4.4 Ramadan Mode

## Objective

Create a focused Ramadan experience built from existing prayer, Quran, fasting, family, and charity-related capabilities.

## Functional surface

Include:

- Suhur context
- Iftar context
- prayer context
- Quran daily target/progress
- Taraweeh logging
- charity tracking
- Ramadan-aware daily priorities

## Design intent

Ramadan mode should feel peaceful and purposeful, not like a gamified challenge.

Avoid:

- streak obsession
- leaderboards
- points
- excessive celebration effects

## Division of work

Gemini:

- calculations
- dates
- state
- persistence
- integration

Lovable:

- premium Ramadan surface
- responsive composition
- progress visualization
- focused interaction

## Acceptance criteria

- non-Ramadan behavior remains unchanged
- Ramadan dates are handled correctly for the supported locale/calendar strategy
- existing data is preserved
- daily Quran/Taraweeh/charity state persists
