You are implementing the FIRST premium Lovable UX pass for Firdaus Phase 3.

The engineering/data layer for Phase 3 is ALREADY COMPLETE and verified.

DO NOT rebuild the intelligence logic.

DO NOT change:
- analytics formulas
- reminder engine
- recurrence engine
- localStorage architecture
- Supabase synchronization
- family migration
- data models
- business logic
- notification scheduling
- existing Phase 0–3 functionality

The repository is the source of truth.

==================================================
CONTEXT
==================================================

Phase 3 now has working, tested intelligence APIs for:

1. Budget
   - month-over-month analysis
   - category trends
   - daily averages
   - overspend signals
   - generated insights

2. Salah
   - consistency analysis
   - on-time/late analysis
   - per-prayer breakdown
   - period comparison
   - generated insights

3. Mood + Activity
   - mood distribution
   - sleep/activity relationships
   - descriptive correlations
   - generated insights

4. Meals
   - ranked meal suggestions

5. Smart Reminders
   - contextual reminder signals
   - priorities
   - deduplication
   - active runtime

6. Family
   - family-member model
   - child migration
   - responsibility relationships

The existing UI is already wired to these libraries.

Your task is to create the PREMIUM PRESENTATION LAYER for the intelligence capabilities.

==================================================
PRIMARY GOAL
==================================================

Create a unified Firdaus "Insights" / "Reflection" experience.

It should NOT feel like:
- a corporate analytics dashboard
- a financial reporting application
- a generic AI dashboard
- a collection of charts

It should feel like:
- quiet reflection
- useful understanding
- gentle awareness
- personal progress
- practical guidance
- one coherent view of life

The product philosophy remains:

Deen + Family + Household + Personal Life

with a calm, private, low-cognitive-load experience.

==================================================
USE REAL DATA
==================================================

Consume the existing Phase 3 analytics APIs.

Do NOT create mock analytics.

Do NOT hardcode fake numbers.

Do NOT reimplement calculations inside React components.

Prefer the existing:
- Insight[]
- DailySignal[]
- Budget analytics
- Salah analytics
- Mood analytics
- existing selectors/hooks

If an existing API does not expose something required for presentation, STOP and identify the missing contract rather than inventing a second calculation system.

==================================================
INFORMATION ARCHITECTURE
==================================================

Design a unified Insights experience containing a small number of meaningful sections.

Possible structure:

INSIGHTS

A calm opening summary
"What your week is telling you"

Then:

Spiritual
- Salah consistency
- improvement
- prayer pattern

Money
- spending trend
- category movement
- useful budget signal

Wellbeing
- mood
- sleep/activity pattern
- sufficient-data messaging

Daily life
- useful reminders
- meal suggestions
- relevant family context where appropriate

Do NOT display everything.

Prioritize the most meaningful 3–6 insights.

==================================================
VERY IMPORTANT: COGNITIVE LOAD
==================================================

Do NOT produce:
- 15 cards
- giant dashboards
- excessive KPI tiles
- dozens of charts
- dense tables

The user should understand the page in seconds.

Use progressive disclosure.

For example:

Main insight
   ↓
short explanation
   ↓
optional detail
   ↓
optional deeper chart

==================================================
VISUAL DIRECTION
==================================================

Preserve Firdaus's existing design language and theme system.

Make it feel:
- premium
- restrained
- elegant
- warm
- intentional
- calm
- personal

Avoid:
- SaaS dashboard aesthetics
- excessive gradients
- neon colors
- gratuitous glassmorphism
- giant icons
- gamification
- points/badges
- competitive language

Use motion sparingly and purposefully.

Transitions should communicate hierarchy, not decoration.

==================================================
MOBILE FIRST
==================================================

This is critical.

The page must work exceptionally well on mobile.

Prioritize:
- thumb-friendly actions
- readable charts
- compact summaries
- vertical information flow
- minimal horizontal scrolling

Then adapt upward for tablet/desktop.

==================================================
EMPTY / INSUFFICIENT DATA
==================================================

Intelligence features will not always have enough data.

Create excellent empty/insufficient-data states.

Examples:

"Keep logging for a little longer.
We'll show your first meaningful pattern here."

Do not invent a pattern.

Do not display misleading percentages from tiny datasets.

==================================================
PRIVACY
==================================================

Do not surface private information merely because it exists.

Especially do not expose:
- journal text
- cycle information
- detailed private content

unless it is already explicitly intended for the existing Insights context.

Keep the Insights experience respectful.

==================================================
INTERACTION
==================================================

Where appropriate, allow the user to:

- tap a Budget insight → go to Budget
- tap Salah insight → go to Deen
- tap health/mood insight → go to Trends
- act on a reminder
- accept/dismiss a meal suggestion

Reuse existing navigation and routes.

Do not create unnecessary new routing architecture.

==================================================
ANIMATION
==================================================

Use subtle motion only where it improves comprehension.

Examples:
- insight cards gently entering
- chart transitions
- expanding detail
- progress movement

Avoid:
- looping animations
- distracting particles
- excessive sparkle
- gamified celebration

==================================================
ACCESSIBILITY
==================================================

Verify:
- keyboard navigation
- visible focus
- semantic headings
- sufficient contrast
- screen-reader-friendly controls
- touch target sizes
- reduced-motion compatibility if the project supports it

==================================================
SCOPE
==================================================

This is ONE focused Lovable pass.

Prioritize the unified Insights experience.

Do NOT redesign:
- entire Home
- entire Budget
- entire Deen
- entire Me
- navigation
- global theme
- unrelated screens

Do not "improve" unrelated parts of the product.

==================================================
FINAL VALIDATION
==================================================

After implementation:

- verify the existing analytics APIs are still being consumed
- verify no business logic was duplicated
- verify mobile behavior
- verify existing themes
- verify empty states
- verify existing navigation
- verify no Phase 0–3 functionality was removed
- run the available build/type checks if supported by the environment

Final report must state:

1. UI/components changed
2. Existing analytics APIs consumed
3. Any non-UI changes made
4. Any assumptions
5. Any remaining limitations

DO NOT claim the intelligence engine itself was implemented.
It already exists.

Your responsibility is to make the existing Phase 3 intelligence feel like a polished Firdaus product experience.