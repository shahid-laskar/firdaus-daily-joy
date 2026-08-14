# P3.6 Smart Weekly Meal Suggestions

## Objective

Suggest meals from the user's own recipe repository using historical usage and variety.

## Approach

Use deterministic ranking, not an LLM.

Possible ranking signals:
- recipes used less recently
- recipes repeatedly selected in historical plans
- variety
- day/slot context if available

The algorithm must remain understandable and testable.

## Requirements

- suggest only known recipes
- never create fake recipes
- support sparse history
- handle an empty recipe repository gracefully
- allow user choice
- do not silently overwrite the meal plan

## UI

Can reuse the existing Meals experience. Lovable is optional and should only be used if a distinctive suggestion interaction materially improves the workflow.

## Acceptance criteria

- deterministic ranking for identical input
- empty/small dataset handling
- no accidental meal-plan overwrite
- tests for ranking behavior
