# P3.3 Salah Consistency Analysis

## Objective

Create a monthly Salah analysis using existing Salah records.

## Metrics

At minimum:

- logged prayers
- on-time count
- late count
- on-time percentage
- consistency by prayer
- comparison with previous period
- improvement/decline direction

Do not invent a "missed prayer" count unless the data model actually distinguishes missed from unlogged.

## Language

Use reflective, non-judgmental language.

Example:
"Your on-time consistency improved by 8% compared with last month."

Do not imply religious judgment beyond what the recorded data supports.

## UI

Lovable may polish:

- monthly summary
- prayer-by-prayer chart
- trend view
- improvement card
- empty states

## Acceptance criteria

- timezone/date boundaries are correct
- missing data does not create fake misses
- formulas are centralized
- tests cover partial months and empty data
