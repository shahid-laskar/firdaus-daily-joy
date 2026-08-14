# Phase 3 Master Plan — Intelligence & Automation

## Goal

Turn Firdaus from a strong logging/productivity application into a system that learns from the data already being recorded and reduces manual effort without becoming a generic AI assistant.

## Product principle

Phase 3 intelligence should initially be:
- deterministic
- explainable
- privacy-conscious
- local-first where possible
- inexpensive to run
- testable
- useful without external AI APIs

Avoid "AI for the sake of AI."

## Dependency order

1. Intelligence foundation
2. Budget insights
3. Salah consistency analysis
4. Mood + activity correlation
5. Smart reminder engine
6. Smart weekly meal suggestions
7. Family member model

The ordering intentionally differs from simple roadmap numbering because reusable infrastructure should be built before feature-specific intelligence.

## Shared intelligence foundation

Create reusable primitives for:
- date ranges
- week/month aggregation
- trend calculations
- averages and distributions
- change vs previous period
- thresholds
- recurring signals
- insight construction
- daily priority signals

Example conceptual layers:

src/lib/analytics/
- dateRange
- aggregates
- budget
- salah
- mood
- habits
- health
- quran

src/lib/intelligence/
- signals
- insights
- reminders
- priorities

Do not assume these exact paths or APIs; inspect the repository first and adapt to existing architecture.

## Phase 3 acceptance criteria

Phase 3 is complete only when:
- existing Phase 0–2 features still work
- user data survives refresh and migration
- analytics are deterministic and explainable
- calculations are covered by tests
- mobile UX is usable
- no feature creates duplicate recurrence/analytics systems
- reminders are actually backed by working scheduling behavior
- family model changes are backward-compatible
- production build/type checks pass

## Features

### P3.1 Intelligence Foundation
Build the reusable analytics/signal layer.

### P3.2 Budget Insights
Provide month-over-month comparison, category trends, overspend detection, and useful explanations.

### P3.3 Salah Analysis
Provide monthly consistency, on-time/late ratios, trend/improvement tracking.

### P3.4 Mood + Activity Correlation
Cross-reference logged mood with sleep, prayer, exercise, and related activity. Phrase results as observations, not causation.

### P3.5 Smart Reminders
Build a rule engine that can evaluate prayer, tasks, habits, fasting patterns, upcoming events, budget thresholds, and other contextual signals.

### P3.6 Smart Meal Suggestions
Recommend recipes from the user's own repository using history/recency/variety. Do not introduce an LLM dependency unless explicitly justified.

### P3.7 Family Member Model
Transition from a Kids-only list toward a shared family entity model while preserving existing child/chores data.
