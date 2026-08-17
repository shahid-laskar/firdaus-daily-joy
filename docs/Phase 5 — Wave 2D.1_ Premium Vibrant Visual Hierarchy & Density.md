# Phase 5 — Wave 2D.1
## Premium Vibrant Visual Hierarchy & Density

Wave 2C has established the Vibrant Experience across the core Firdaus product.

The objective of Wave 2D is now to elevate Vibrant from:

> "Functionally integrated and colorful"

to:

> **"Premium, joyful, alive, polished, and emotionally engaging."**

This is a refinement wave.

Do NOT redesign the architecture.

Do NOT change the Experience/Theme model.

Do NOT modify business logic.

Do NOT add new product functionality.

---

# 1. Design Goal

The original user feedback was:

> "It feels boring."

> "I want to feel happy when I open it."

> "There should be more color."

> "Some things should have cute icons."

> "The home screen should feel alive."

> "It shouldn't feel like an office dashboard."

Use these statements as the design benchmark.

The target is:

```text
Premium
+
Vibrant
+
Warm
+
Joyful
+
Personal
+
Polished
```

NOT:

```text
More cards
+
More colors
+
More gradients
+
More decoration
```

---

# 2. Audit the Vibrant Experience Holistically

Review the actual integrated Vibrant application, not just isolated screens.

Inspect:

- Home / Today
- Deen
- Budget
- Me
- Review
- Tasks
- Meals
- Grocery
- Kids
- Deeds
- Calendar
- Notes
- Reminders
- navigation
- settings
- common sheets/forms

Identify where the interface currently feels:

- too dense
- too flat
- too repetitive
- too card-heavy
- too dashboard-like
- visually noisy
- visually empty
- overly colorful
- insufficiently expressive
- inconsistent
- generic

Do not change anything until the hierarchy problems are understood.

---

# 3. Establish Visual Hierarchy

For every major screen, identify:

### Primary

The one thing the user should notice first.

### Secondary

Important supporting information.

### Tertiary

Utility/details that should recede visually.

Vibrant should NOT make every section equally prominent.

Use:

- typography scale
- whitespace
- tonal surfaces
- visual weight
- icon scale
- color intensity
- position
- grouping

to create hierarchy.

---

# 4. Reduce "Dashboard Density"

Look especially for repeated patterns like:

```text
card
card
card
card
card
```

and:

```text
icon + number + label
icon + number + label
icon + number + label
```

Where appropriate, replace some with:

- open sections
- editorial layouts
- lightweight rows
- tonal bands
- large hero information
- inline summaries
- asymmetric composition

Do not eliminate cards indiscriminately.

Cards should be used when they communicate grouping or importance.

---

# 5. Home / Today Priority

Home is the most important screen.

Review the current hierarchy:

```text
Hero
Prayer Rhythm
Quick Actions
Bento
Daily Thread
Reflection / Celebration
```

Determine whether the screen has a clear visual narrative.

The desired reading flow is approximately:

```text
Welcome
   ↓
How is today going?
   ↓
What matters next?
   ↓
What can I do now?
   ↓
What is happening in my day?
   ↓
How did I do?
```

Make the Home screen feel like a **daily companion**, not an analytics dashboard.

---

# 6. PageHero Refinement

Review all PageHero variants:

- home
- deen
- budget
- me
- review

Ensure they share a family resemblance.

Improve where necessary:

- heading hierarchy
- figure placement
- pill density
- background intensity
- decorative orbs
- motif placement
- whitespace
- contrast
- content alignment

Do NOT make every hero identical.

Each space should retain its personality while belonging to the same Vibrant system.

---

# 7. Bento Refinement

Review all Bento usage.

Ask:

> Does this tile deserve to be a tile?

For each major tile:

- identify its semantic importance
- ensure appropriate size
- ensure correct hierarchy
- avoid excessive nested cards
- remove unnecessary decoration
- preserve useful tonal voice

Prefer a few memorable tiles over many mediocre ones.

---

# 8. Color Orchestration

Increase vibrancy through **orchestration**, not simply increased saturation.

Use the established semantic voices:

```text
prayer
task
meal
kids
grocery
habit
money
self
```

Verify:

- each has a recognizable visual voice
- tones remain harmonious together
- no category overwhelms the screen
- text contrast remains safe
- dark mode remains coherent

Use stronger colors for moments that deserve attention.

Use quieter tones for supporting information.

---

# 9. Backgrounds & Atmospheric Effects

Review:

- aurora gradients
- orbs
- motifs
- shadows
- frosted surfaces
- glows

Avoid visual noise.

Atmospheric effects should establish mood, not compete with content.

Especially review:

- mobile
- low-height screens
- dark mode

---

# 10. Typography Refinement

Vibrant typography uses:

```text
Sora
Manrope
```

Refine:

- display scale
- title hierarchy
- body density
- numeric emphasis
- metadata
- eyebrow labels
- line length
- wrapping

Do not overuse uppercase labels.

Do not make every number huge.

Create hierarchy between:

- emotional copy
- functional copy
- data
- metadata

---

# 11. Whitespace

Premium design needs deliberate whitespace.

Look for:

- cramped sections
- unnecessary gaps
- inconsistent vertical rhythm
- sections that merge visually
- excessive edge-to-edge content

Normalize spacing where necessary.

Do not simply increase all padding.

---

# 12. Icon Scale & Placement

Review icons globally.

Look for:

- icons that are too small
- icons competing with text
- inconsistent containers
- inconsistent alignment
- inconsistent stroke weight

Icons should feel intentional.

Use them to communicate meaning rather than decorate every item.

---

# 13. Emotional Microcopy

Where the existing product already has user-facing copy, refine presentation and tone where appropriate.

The Vibrant experience should feel:

- encouraging
- warm
- human
- concise

Avoid:

- corporate language
- generic SaaS phrases
- excessive exclamation marks
- childish language
- unnecessary emoji

Do not invent religious claims or factual content.

---

# 14. Calm Isolation

All changes in this wave must remain limited to Vibrant presentation.

Do NOT modify Calm visuals.

Do not make global CSS changes that accidentally alter Calm.

If a shared primitive needs modification, ensure its Calm presentation remains visually unchanged.

---

# 15. Theme Safety

Do not:

- add new Theme IDs
- add Bloom
- change existing theme architecture
- remove any existing theme

Vibrant remains an Experience.

Theme continues to provide palette/materiality.

---

# 16. Responsive Refinement

Inspect:

- mobile
- tablet
- desktop
- wide desktop

Look for:

- excessive hero height
- cramped tiles
- awkward Bento collapse
- horizontal overflow
- floating controls covering content
- excessive blank space
- poor text wrapping

Fix visual hierarchy without altering product semantics.

---

# 17. Accessibility

Ensure refinement does not damage:

- contrast
- focus visibility
- keyboard access
- semantic headings
- accessible labels
- reduced motion

Do not use color as the only information channel.

---

# 18. Performance

Keep refinement lightweight.

Avoid:

- additional heavy dependencies
- excessive filters
- unnecessary animation
- huge assets
- repeated expensive computations
- large new bundles

Do not move domain calculations into presentation code.

---

# 19. Scope

This wave is a visual refinement.

DO NOT:

- add product features
- change business logic
- modify domain engines
- alter persistence
- change routing semantics
- create new stores
- create new Theme IDs
- rewrite the Experience architecture

Modify visual composition and styling only.

---

# 20. Verification

Run:

```bash
npx tsc --noEmit
npm test
npm run build
```

Also verify representative screens in both:

```text
Calm
Vibrant
```

Pay particular attention to:

- Home
- Deen
- Budget
- Tasks
- Meals
- Grocery
- Notes

Do not claim visual verification without actually checking the UI.

---

# 21. Final Report

Provide:

## Visual Problems Identified

## Hierarchy Changes

## Density Changes

## Color Changes

## Typography Changes

## Icon Changes

## Background / Surface Changes

## Responsive Refinements

## Calm Isolation

## Performance Considerations

## Tests

Exact results for:

```text
npx tsc --noEmit
npm test
npm run build
```

## Known Issues

## 2D.2 Readiness

Identify the next highest-value visual refinement area:

**Color / tonal orchestration.**

Do not begin 2D.2 automatically.

---

# Final Standard

When someone opens Vibrant Firdaus, the interface should feel:

> **"This was designed, not assembled."**

The objective is premium visual hierarchy and emotional quality—not simply more UI decoration.