# Phase 5 — Wave 2D.7
## Cross-Product Premium Polish & Visual Consistency

Wave 2D.1 refined hierarchy and density.

Wave 2D.2 refined color and tonal orchestration.

Wave 2D.3 refined icons, emoji, and visual personality.

Wave 2D.4 refined motion and micro-interactions.

Wave 2D.5 refined emotional states and delight.

Wave 2D.6 refined mobile and responsive behavior.

This is the FINAL implementation wave before the comprehensive Cursor audit.

The goal is to ensure that the entire Vibrant Firdaus experience feels like **one coherent, premium product** rather than a collection of individually polished screens.

Do NOT begin a new design direction.

Do NOT change architecture.

Do NOT add product functionality.

---

# 1. Final Product-Level Objective

Review the complete Vibrant experience as a single product:

```text
Home / Today
      ↓
Deen
      ↓
Budget
      ↓
Me
      ↓
Review
      ↓
Tasks
Meals
Grocery
Kids
Deeds
Calendar
Notes
Reminders
```

The target feeling is:

> **"This is one beautiful product."**

Not:

> "Some screens look beautiful and others were redesigned independently."

---

# 2. Establish a Visual Grammar

Review the entire Vibrant application and make sure these characteristics are consistently recognizable:

### Typography

- Sora
- Manrope
- consistent hierarchy
- consistent numeric treatment
- consistent metadata treatment

### Color

- neutral foundation
- experience atmosphere
- semantic life-area tones
- consistent state colors

### Geometry

- consistent radii
- consistent control heights
- consistent tile shapes
- consistent spacing rhythm

### Surfaces

- panels
- elevated panels
- tiles
- controls
- sheets
- navigation

### Icons

- one primary icon language
- consistent stroke weight
- consistent icon sizing
- semantic life-area mapping

### Motion

- consistent timing
- consistent easing
- reduced-motion support

---

# 3. Audit Shared Components

Review the shared presentation primitives introduced or touched during Phase 5.

At minimum inspect:

- Shell
- SubTabs
- PageHero
- Bento
- Tile
- IconChip
- StatTile
- RowTile
- ProgressRing
- Action controls
- Buttons
- Fields
- Sheets
- Empty states
- Status indicators
- Progress indicators

For each component ask:

> Does this look like the same component wherever it appears?

If not:

- consolidate styling
- consolidate tokens
- consolidate interaction behavior
- preserve semantic differences

Do not merge components that are conceptually different just because they look similar.

---

# 4. Cross-Screen Spacing Rhythm

Audit recurring spacing patterns:

- page edge padding
- section spacing
- hero-to-content spacing
- section header spacing
- tile gaps
- list row spacing
- form spacing
- sheet padding
- bottom navigation clearance

Use a coherent spacing rhythm.

Avoid:

```text id="o11p6c"
Home = spacious
Deen = cramped
Budget = oversized
Me = dense
Review = inconsistent
```

The exact composition can differ, but the underlying rhythm should feel related.

---

# 5. Cross-Screen Typography

Compare:

- Home hero
- PageHero titles
- section headings
- tile titles
- metrics
- labels
- body text
- metadata
- empty-state copy

Ensure:

- similar semantic levels look similar
- data uses consistent numeric styling
- metadata doesn't become louder than primary information
- uppercase labels are restrained
- long text wraps gracefully

Avoid introducing new ad-hoc font sizes.

---

# 6. Surface & Radius Consistency

Review all major surfaces.

Look for:

- different radii for equivalent components
- arbitrary shadow strengths
- inconsistent border treatment
- different control heights
- inconsistent elevation language

Normalize equivalent semantic surfaces.

Do not flatten purposeful hierarchy.

---

# 7. Header / Hero / Content Relationship

Review:

```text id="73no3l"
Shell
  ↓
PageHero / Home Hero
  ↓
SubTabs
  ↓
Content
```

Ensure the transitions feel intentional.

Potential issues to correct:

- too much whitespace between header and hero
- hero overlapping SubTabs awkwardly
- SubTabs visually competing with PageHero
- content starting too abruptly
- repeated decorative elements
- excessive top padding

The shell should frame the experience.

The hero should establish context.

The content should remain the focus.

---

# 8. Navigation Consistency

Review:

- bottom navigation
- SubTabs
- inline tabs
- segmented controls
- filters
- secondary navigation

They should feel related.

Do not make every navigation element look identical.

Establish hierarchy:

### Global navigation

Strongest identity.

### Space navigation

Moderate identity.

### Local controls

Functional and restrained.

---

# 9. Forms & Sheets

Audit every major form/sheet across:

- Settings
- Tasks
- Meals
- Grocery
- Kids
- Deeds
- Calendar
- Notes
- Reminders

Make sure:

- fields look related
- labels are consistent
- action buttons are consistent
- sheet headers are consistent
- validation states are consistent
- focus states are consistent
- close controls are consistent

Do NOT change form semantics.

If a shared `Field` primitive is still causing a Calm/Vibrant visual mismatch, solve that at the presentation boundary rather than creating feature-specific field implementations.

---

# 10. Empty / Success / Error State Family

Review every major state.

They should have a common visual vocabulary while remaining context-specific.

Check:

- icon treatment
- message hierarchy
- action
- spacing
- tonal treatment
- motion

Do not make all states identical.

---

# 11. Emotional Consistency

The Vibrant experience should have a consistent emotional curve:

```text id="ccy4z5"
Welcome
   ↓
Explore
   ↓
Act
   ↓
Complete
   ↓
Reflect
```

Review whether:

- Home welcomes
- feature screens help the user act
- completion feels satisfying
- Review encourages reflection
- empty states invite rather than criticize

Avoid constant excitement.

Premium products need quiet moments too.

---

# 12. Remove Leftover "Office Dashboard" Patterns

Perform a deliberate sweep for:

- excessive KPI cards
- unnecessary tables
- repetitive numeric blocks
- generic "Overview" headers
- overly corporate labels
- dense metric grids
- card-after-card layouts
- excessive borders

Where appropriate, transform them into:

- editorial sections
- meaningful summaries
- visual narratives
- lightweight rows
- contextual surfaces

Do not remove useful information.

Change its presentation.

---

# 13. Premium Detail Pass

Look for small defects:

- misaligned icons
- inconsistent baselines
- 1px spacing errors
- awkward text wrapping
- strange hover states
- inconsistent border opacity
- icon/text vertical alignment
- uneven button widths
- inconsistent shadow softness
- abrupt transitions
- decorative elements colliding with content

Fix these carefully.

The goal here is **craftsmanship**.

---

# 14. Vibrant Personality Without Noise

Perform one final restraint pass.

Identify places where the design has:

- too much color
- too many gradients
- too many glows
- too many icons
- too many emoji
- too much motion
- too many cards

Remove or soften where necessary.

Remember:

> **Premium vibrancy is controlled vibrancy.**

---

# 15. Dark Mode

Perform a complete Vibrant dark-mode pass.

Verify:

- hero colors
- surface hierarchy
- text contrast
- category tones
- icon contrast
- controls
- sheets
- navigation
- empty states
- success states

Do not simply invert light mode.

Dark mode should feel intentionally designed.

---

# 16. Calm Protection

This final polish must remain strictly within the Vibrant experience.

Do NOT modify Calm visual language.

If a shared primitive must change:

- preserve Calm behavior
- verify Calm appearance
- avoid introducing Vibrant-only defaults into shared components

---

# 17. Performance

Before finalizing, inspect the cumulative cost of the Vibrant design:

- blur
- backdrop-filter
- gradients
- shadows
- SVG effects
- animations
- decorative orbs
- large assets

Look for opportunities to:

- simplify
- contain
- defer
- reduce
- reuse

Do not sacrifice the visual direction unnecessarily.

---

# 18. Accessibility

Final cross-product check:

- contrast
- focus states
- keyboard access
- screen reader semantics
- labels
- color-independent meaning
- reduced motion
- touch targets
- responsive text

Do not introduce accessibility regressions for visual polish.

---

# 19. Scope Control

This is the final visual polish pass.

Do NOT:

- add features
- modify domain logic
- change persistence
- change routing semantics
- create new Themes
- create new Experience abstractions
- introduce new external dependencies
- redesign the product architecture

Only refine presentation.

---

# 20. Verification

Run:

```bash id="s8gn7z"
npx tsc --noEmit
npm test
npm run build
```

Perform a final walkthrough of:

### Primary

- Home
- Deen
- Budget
- Me
- Review

### Secondary

- Tasks
- Meals
- Grocery
- Kids
- Deeds
- Calendar
- Notes
- Reminders

### Shared

- navigation
- SubTabs
- settings
- forms
- sheets
- empty states
- success states
- error states

Inspect:

```text id="d1k6y8"
Calm
Vibrant
Light
Dark
Mobile
Desktop
```

where practical.

---

# 21. Final Report

Provide:

## Cross-Product Findings

## Shared Component Refinements

## Spacing

## Typography

## Surfaces

## Navigation

## Forms / Sheets

## State Consistency

## Office-Dashboard Patterns Removed

## Premium Details

## Dark Mode

## Performance

## Accessibility

## Calm Isolation

## Tests

Exact results:

```text id="f8svid"
npx tsc --noEmit
npm test
npm run build
```

## Remaining Issues

## Final Cursor Audit Readiness

Do NOT begin another implementation wave after this task.

---

# Final Standard

When this wave is complete, someone should be able to move through the entire Vibrant Firdaus product and feel:

> **"This is one thoughtfully designed, premium, joyful application."**

The visual system should feel coherent enough that the user does not have to think about the design system at all.