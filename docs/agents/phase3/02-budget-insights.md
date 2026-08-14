# P3.2 Budget Insights

## Objective

Turn existing expense data into useful month-over-month and category-level feedback.

## Functional requirements

Support:
- current-month total
- previous-month comparison
- percentage and absolute change
- category totals
- category trend
- daily average
- configurable overspend warning using existing category limits where available
- concise explainable insights

## Product language

Prefer:
"Dining is 18% higher than last month."

Avoid:
"You are financially irresponsible."

Do not generate moral judgments.

## Integration

Expose the results through reusable selectors/services so UI layers can consume them.

The existing Budget UI should remain functional.

## Lovable surface

Lovable should handle only the premium presentation:
- comparison summary
- category trends
- top insights
- warning states
- mobile interaction

## Acceptance criteria

- calculations are deterministic
- zero/empty months are handled
- category names are stable
- no data is lost
- tests cover previous-month and category comparisons
- build passes
