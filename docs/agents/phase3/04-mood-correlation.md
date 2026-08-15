# P3.4 Mood + Activity Correlation

## Objective

Cross-reference logged mood with available sleep, water, exercise, prayer, and habit data to expose descriptive patterns.

## Safety/product rule

This is observational analytics, not medical diagnosis and not causal inference.

Use language such as:
"On days with 7+ hours of sleep, your logged mood was more often positive."

Avoid:
"Sleeping 7 hours causes better mood."

## Requirements

Support:

- mood distribution
- activity grouping
- basic conditional averages/distributions
- minimum sample thresholds
- insufficient-data state

If sample sizes are too small, clearly say that there is not enough data.

## Scope

Start with deterministic descriptive analytics.
Do not add an external AI model.

## Lovable

Build a calm insight experience rather than a clinical dashboard.

## Acceptance criteria

- small sample sizes are handled
- missing fields are ignored safely
- privacy-sensitive data is not surfaced in inappropriate Home contexts
- calculations are tested
