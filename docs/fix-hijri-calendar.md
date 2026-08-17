Firdaus Hijri Calendar Bug — Diagnose Only

The deployed Firdaus application is showing the Hijri date incorrectly.

Current UI appears to show something equivalent to:

"4 March 1448 AH"

Today is August 17, 2026.

Current external calendar references indicate August 17, 2026 corresponds to approximately:
4 Rabi al-Awwal 1448 AH under Umm al-Qura-style calculation,
while some tabular methods may give 3 Rabi al-Awwal 1448.

The immediate concern is whether Firdaus is confusing the Hijri month number with the Gregorian month name.

DO NOT MODIFY CODE YET.

Inspect:

1. All Hijri date utilities:
   - src/lib/hijri.ts
   - any Hijri calendar helpers
   - any date formatting utilities

2. Calendar UI:
   - src/components/home/calendar.tsx
   - Deen/Home displays
   - Review displays
   - any Hijri labels

3. Search for:
   - Intl.DateTimeFormat
   - islamic / islamic-umalqura
   - month indexes
   - arrays of Hijri month names
   - hardcoded month mappings
   - Gregorian month formatting
   - "March"
   - "Rab"
   - "Rabi"
   - "1448"

4. Determine:
   - what exact Hijri date calculation method Firdaus uses
   - what exact date object/data structure is produced
   - whether the month field is 0-based or 1-based
   - whether formatting is mixing Gregorian and Hijri fields
   - whether timezone/local-date conversion is causing an offset

5. Compare the same date through the existing application logic:
   - August 17, 2026
   - August 16, 2026
   - August 18, 2026

6. Produce the exact expected Firdaus output for:
   - day
   - Hijri month name
   - Hijri month number
   - year

7. Check whether the issue affects:
   - Calendar
   - Home Today
   - Deen
   - Review
   - any Hijri event display

8. Do NOT change the calculation method yet.
   First determine whether this is:
   A. formatting bug
   B. month-index bug
   C. timezone bug
   D. calculation-method difference
   E. multiple bugs

Final report:

## Root Cause
## Current Calculation Method
## Current Data Produced
## Current UI Formatting
## Exact Incorrect Field
## Expected Output
## Affected Screens
## Recommended Minimal Fix

Do not modify files.