# Phase 5 — Wave 2D.2

## Premium Vibrant Color & Tonal Orchestration

Wave 2D.1 established the visual hierarchy and density direction for the Vibrant experience.

This wave focuses specifically on **color orchestration and tonal hierarchy**.

The goal is NOT:

> Add more colors.

The goal is:

> **Make Firdaus feel richer, more expressive, warmer, and more alive through intentional color relationships.**

Do NOT change the product architecture.

Do NOT change business logic.

Do NOT add product functionality.

---

# 1. Core Design Principle

Vibrant should use:

```text id="7xj5qs"
Neutral foundation
        +
Experience atmosphere
        +
Semantic life-area tones
        +
Focused accents
```

rather than:

```text id="zyfn8h"
Everything is brightly colored
```

Color should communicate hierarchy and meaning.

---

# 2. Audit the Current Vibrant Color System

Inspect the actual integrated application.

Review:

* Home
* Deen
* Budget
* Me
* Review
* Tasks
* Meals
* Grocery
* Kids
* Deeds
* Calendar
* Notes
* Reminders
* Navigation
* Settings
* Sheets
* Empty states
* Success states

Identify:

* overuse of one accent
* colors competing for attention
* tonal collisions
* weak category differentiation
* insufficient contrast
* inconsistent tone usage
* surfaces that are too similar
* surfaces that are too saturated
* overly bright interactive elements
* visual dead zones

Do not change anything until the current color hierarchy is understood.

---

# 3. Establish Color Roles

Every significant color should have a role.

Use the existing system:

### Foundation

* page background
* surface
* elevated surface
* card
* border
* text
* muted text

### Experience

* primary Vibrant accent
* atmospheric colors
* hero colors
* decorative glow
* experience-specific surface tones

### Semantic

* prayer
* task
* meal
* kids
* grocery
* habit
* money
* self

### State

Only where already needed:

* success
* warning
* danger
* information
* active

Do not create unnecessary additional state colors.

---

# 4. Life-Area Tone System

Audit all current use of:

```text id="x2ef4z"
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

* each tone is visually distinct
* each tone is harmonious with the overall palette
* each tone has sufficient contrast
* light/dark behavior is coherent
* the same semantic category looks consistent across screens

For example:

```text id="89pvnl"
Task
→ same visual voice in Today, Tasks, Review

Meal
→ same visual voice in Today, Meals, Grocery relationships

Kids
→ same visual voice in Today and Kids
```

Do not arbitrarily change category meaning.

---

# 5. Tone Intensity

Create a clear intensity hierarchy.

### Strong

Use for:

* primary action
* important progress
* active state
* major celebration
* primary hero emphasis

### Medium

Use for:

* category headers
* selected states
* important metadata
* secondary actions

### Soft

Use for:

* backgrounds
* supporting surfaces
* subtle grouping
* inactive states

Avoid using strong tones everywhere.

---

# 6. Home / Today Color Hierarchy

Home is the most important test.

Review:

```text id="s42mco"
Hero
Prayer Rhythm
Quick Actions
Bento
Daily Thread
Reflection
```

The user should not perceive six unrelated color systems competing.

Create a coherent visual progression.

For example:

```text id="9ewm94"
Hero
  ↓
primary atmosphere

Prayer
  ↓
focused spiritual tone

Quick Actions
  ↓
small semantic accents

Bento
  ↓
controlled category voices

Reflection
  ↓
quiet emotional close
```

The screen should feel orchestrated.

---

# 7. PageHero Color Refinement

Review:

* home
* deen
* budget
* me
* review

Each hero should feel distinctive but clearly part of the same system.

Avoid making each hero:

> a completely different gradient universe.

Maintain shared:

* saturation philosophy
* contrast
* atmospheric depth
* text treatment
* decorative intensity

Space-specific color should communicate context.

---

# 8. Background & Surface Relationships

Refine relationships between:

```text id="6t3dj5"
background
surface
elevated surface
tile
panel
input
sheet
navigation
```

Premium interfaces usually benefit from subtle tonal steps rather than every layer having a visible border.

Explore:

* tonal separation
* subtle gradients
* light surface shifts
* restrained borders
* shadow/elevation relationships

Avoid:

* excessive borders
* excessive glow
* excessive blur
* every surface having its own color

---

# 9. Vibrant Does Not Mean Saturated Everywhere

Reduce saturation where it hurts hierarchy.

Potential examples:

* inactive controls
* metadata
* secondary labels
* large background regions
* utility panels

Reserve stronger chroma for:

* active
* meaningful
* celebratory
* interactive
* semantic

This creates a more premium effect.

---

# 10. Dark Mode

Audit Vibrant dark mode carefully.

Verify:

* hero gradients retain depth
* category tones don't become neon
* text contrast remains appropriate
* surfaces separate cleanly
* glows don't overpower content
* active states remain visible
* borders remain subtle

Do NOT merely invert light-mode colors.

---

# 11. Interactive States

Review:

* hover
* focus
* pressed
* active
* disabled
* selected
* completed

Create a coherent state language.

For example:

```text id="l0o1c8"
Hover
→ slightly stronger surface

Active
→ stronger tone / accent

Pressed
→ subtle depth reduction

Disabled
→ reduced contrast

Completed
→ semantic success + reduced visual weight
```

Avoid adding glow to every interactive state.

---

# 12. Color + Typography

Make color and typography work together.

Avoid:

* bright colored text everywhere
* saturated headings
* too many accent labels
* excessive uppercase color labels

Use strong color to support hierarchy.

Typography should remain the primary readability mechanism.

---

# 13. Color + Iconography

Icons should inherit or harmonize with semantic tones.

Review:

* icon-orbs
* IconChip
* navigation icons
* action pills
* status icons
* empty-state icons

Avoid:

* random icon colors
* icons that don't match their category
* excessive multicolor icon containers

The icon should clarify meaning first.

---

# 14. Color + Motion

Motion should reinforce color state.

Examples:

* subtle pulse for imminent state
* progress animation using the active tone
* celebration using the relevant semantic tone
* selected-state transition

Do NOT create separate animation colors that conflict with the semantic palette.

---

# 15. Empty / Success / Celebration States

Review all existing Vibrant states.

### Empty

Soft, inviting.

### Success

Positive, visible, but not loud.

### Celebration

Allowed to be expressive.

### Error

Clear, restrained, accessible.

The celebration state may use more color than normal UI, but should remain premium.

---

# 16. Avoid Color Debt

Identify repeated hardcoded colors in components.

Where appropriate:

* replace with semantic variables
* consolidate duplicate values
* use existing experience tokens
* use existing semantic tones

Do NOT blindly turn every color into a global token.

Only promote repeated semantic values.

---

# 17. Theme Safety

Do NOT:

* add Theme IDs
* add Bloom
* alter Theme registry
* move Vibrant tokens into Theme definitions

Preserve:

```text id="4iuwj4"
Experience = personality
Theme = palette/materiality
```

If an existing Theme interacts awkwardly with Vibrant, identify it and fix only where the current architecture already supports it.

Do not redesign the Theme system in this wave.

---

# 18. Calm Isolation

All color refinements must remain appropriate to Vibrant.

Do NOT unintentionally alter:

```text id="2r6ze3"
Calm
```

through global CSS changes.

If a shared token must change, verify Calm explicitly.

---

# 19. Responsive Color Behavior

Verify on:

* mobile
* tablet
* desktop
* wide desktop

Watch for:

* gradients becoming too intense on small screens
* overlapping colored surfaces
* insufficient contrast
* excessive visual competition
* decorative effects overpowering content

---

# 20. Accessibility

Verify:

* text contrast
* interactive contrast
* focus contrast
* state visibility
* color-independent meaning
* dark-mode contrast
* reduced motion

Do not rely on a color alone to communicate:

* completed
* overdue
* selected
* active
* important

---

# 21. Performance

Keep color work lightweight.

Avoid introducing:

* huge blurred layers
* many additional gradient layers
* unnecessary filters
* expensive compositing
* duplicated background effects

---

# 22. Scope

Modify only:

* Vibrant colors
* tonal mapping
* semantic color usage
* surface relationships
* interactive color states
* relevant visual tokens

Do NOT:

* change product behavior
* change domain logic
* add features
* change routing
* change persistence
* create themes
* redesign architecture

---

# 23. Verification

Run:

```bash id="11j9qf"
npx tsc --noEmit
npm test
npm run build
```

Inspect representative states:

### Home

* default
* active
* progress
* completion
* celebration

### Deen

* normal
* active prayer
* Ramadan if supported

### Budget

* normal
* warning/limit states
* completed/healthy state

### Tasks / Meals / Grocery / Kids / Deeds

* active
* inactive
* complete
* empty

### Notes / Reminders

* normal
* active
* empty

### Light / Dark

Verify both.

---

# 24. Final Report

Provide:

## Color Problems Identified

## Changes Made

## Life-Area Tone Changes

## Hero Color Changes

## Surface Changes

## Interactive State Changes

## Dark Mode Changes

## Accessibility

## Performance

## Calm Isolation

## Tests

Exact results:

```text id="bxh6fd"
npx tsc --noEmit
npm test
npm run build
```

## Known Issues

## 2D.3 Readiness

Identify the next highest-value refinement area:

**Icons, emoji & visual personality.**

Do not begin 2D.3 automatically.

---

# Final Standard

The goal is not for Firdaus to look:

> **more colorful.**

The goal is for Firdaus to look:

> **more alive because color has meaning.**
