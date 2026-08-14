# Phase 4 Master Plan — Differentiation

## Goal

Make Firdaus meaningfully differentiated through deeper deen/family integration and a context-aware daily operating surface.

## Recommended dependency order

1. PWA/service-worker foundation
2. Quran API + offline cache
3. Hifz revision scheduler
4. Ramadan mode
5. Intelligent Daily Operating Surface

The Daily Operating Surface is intentionally last because it should consume the intelligence and integrations created by earlier work.

## Phase 4 principles

- Preserve the calm, private, minimal product philosophy.
- Do not turn Firdaus into a generic SaaS dashboard.
- Do not make the Home surface a dumping ground.
- Show only contextually relevant information.
- Never expose private modules merely because data exists.
- Keep Quran reading useful offline.
- Keep Hifz scheduling explainable and editable.
- Ramadan mode should feel like a focused seasonal mode, not another permanent dashboard.

## Features

### P4.1 PWA + service worker
Implement installability, application shell caching, appropriate offline behavior, and background capabilities supported by the existing architecture.

### P4.2 Quran API
Integrate full Quran content through an appropriate API and cache bookmarked/recent content offline. Do not make network availability a prerequisite for bookmarked reading.

### P4.3 Hifz revision scheduler
Create a revision queue driven by memorization history and a spaced-repetition-style scheduling algorithm. Keep the algorithm transparent and adjustable.

### P4.4 Ramadan mode
Provide:
- Suhur/Iftar context
- Quran tracking
- Taraweeh logging
- charity tracking
- Ramadan-aware daily surface

### P4.5 Intelligent Daily Operating Surface
Use:
- prayer context
- tasks
- calendar
- habits
- health
- budget signals
- family responsibilities
- meal context
- reminders
- Hifz/revision
- seasonal context

The surface should prioritize what needs attention now, rather than displaying every metric.
