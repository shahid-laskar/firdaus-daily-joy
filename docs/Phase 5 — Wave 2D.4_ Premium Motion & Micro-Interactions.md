# Phase 5 — Wave 2D.4
## Premium Motion & Micro-Interactions

Wave 2D.1 refined visual hierarchy and density.

Wave 2D.2 refined color and tonal orchestration.

Wave 2D.3 refined icons, emoji, and visual personality.

This wave focuses on:

- motion
- transitions
- micro-interactions
- feedback
- delight
- perceived responsiveness

The goal is:

> **Make Firdaus feel alive, responsive, and polished.**

Do NOT make the application constantly animated.

Premium motion should be felt more than noticed.

---

# 1. Motion Philosophy

Use motion for:

```text id="sp6d7f"
Meaning
Feedback
Orientation
Continuity
Delight
```

Avoid motion for:

```text id="d9g31u"
Decoration without purpose
Constant attention
Every list row
Every card
Every hover
```

A user should never feel:

> "This app is moving too much."

---

# 2. Audit Existing Motion

Inventory the current Vibrant motion system.

Review:

- `firdaus-drift`
- `firdaus-sheen`
- `firdaus-float`
- `firdaus-halo`
- `soft-breathe`
- `bloom-in`
- `sparkle-pop`
- HeroRing transitions
- progress animations
- hover states
- press states
- page transitions
- sheet/modal transitions
- navigation state transitions
- completion transitions

Identify:

- duplicated animations
- animations with different timing for the same semantic event
- unnecessary infinite animations
- overly strong motion
- animations not respecting reduced motion
- expensive visual effects

Do not add new animations until this inventory is understood.

---

# 3. Establish Motion Tiers

Create a small motion hierarchy.

## Tier 1 — Instant feedback

Approx. 100–160ms.

Use for:

- button press
- toggle state
- checkbox
- selected state
- icon change

## Tier 2 — Interface transitions

Approx. 180–320ms.

Use for:

- panel appearance
- tabs
- dropdowns
- sheets
- tile transitions
- page-level content transitions

## Tier 3 — Hero / expressive transitions

Approx. 400–700ms.

Use sparingly for:

- Home hero entrance
- major progress changes
- celebration
- meaningful visual reveals

## Ambient

Long-duration motion may be used for:

- aurora
- orb drift
- subtle atmospheric effects

Ambient motion must never interfere with interaction.

Do not rigidly force these durations if an existing animation feels better; use the tiers as guidelines.

---

# 4. Easing

Create a coherent motion language.

Prefer:

- smooth ease-out for entrance
- gentle ease-in-out for state changes
- responsive ease-out for interaction
- soft spring-like curves only where they improve the experience

Avoid:

- bouncy default UI
- exaggerated elastic motion
- inconsistent timing
- abrupt visual jumps

Reuse existing transition definitions where practical.

---

# 5. Home Motion

Home is the primary place where Vibrant should feel alive.

Review:

```text id="4iwhq5"
Hero
Prayer Rhythm
Quick Actions
Bento
Daily Thread
Reflection
```

Potential motion:

### Hero

- subtle entrance
- controlled orb movement
- gentle figure/progress reveal

### Prayer Rhythm

- state transition when prayer status changes
- subtle emphasis for current/next prayer

### Quick Actions

- responsive press feedback
- subtle icon response

### Bento

- restrained entrance
- state feedback where useful

### Reflection

- gentle entrance after daily completion
- subtle celebration where appropriate

Do NOT stagger every element aggressively.

---

# 6. Completion Motion

Completion is one of the highest-value micro-interactions.

Review:

- task completion
- deed completion
- grocery purchase
- meal completion
- habit completion
- prayer state
- reminder completion

The semantic rule should be:

```text id="8i7j4g"
Completion
→ brief feedback
→ visual settling
```

not:

```text id="0n5t6c"
Completion
→ huge animation
→ confetti
→ multiple glow effects
```

Make successful actions feel satisfying but mature.

---

# 7. Icon Motion

Use motion with the icons introduced in Wave 2D.3.

Good examples:

- checkbox/check transformation
- icon scale on press
- subtle icon color transition
- tiny sparkle for important milestones

Avoid:

- spinning icons
- bouncing navigation icons
- constant floating icons
- decorative rotation

Icons should remain primarily semantic.

---

# 8. Buttons & Controls

Review:

- press state
- hover state
- focus state
- loading state
- disabled state
- active state

Aim for a consistent physical feeling.

For example:

```text id="0f5m66"
hover
→ subtle surface shift

press
→ slight compression

release
→ quick return

focus
→ clear visible ring
```

Do not remove accessibility focus behavior in favor of visual polish.

---

# 9. Navigation Motion

Review Vibrant navigation.

Use subtle transitions for:

- active state
- icon treatment
- indicator movement
- selection changes

Navigation should remain calm enough that frequent route switching does not become visually tiring.

---

# 10. SubTabs Motion

Review the Vibrant Home secondary-tab bar.

The active tab may have:

- smooth indicator movement
- tonal transition
- subtle opacity change

Avoid:

- large movement
- bouncing pills
- excessive scroll animation

---

# 11. PageHero Motion

Review:

- entry
- HeroFigure
- HeroRing
- HeroPills
- atmospheric orbs
- sheen

Ensure the hero does not feel like a marketing landing page.

It should feel like application UI.

Use motion to establish atmosphere, then get out of the way.

---

# 12. Sheets / Dialogs

Review:

- settings sheet
- forms
- edit dialogs
- confirmation dialogs

Use:

- subtle slide/fade
- appropriate backdrop transition
- smooth entry/exit

Keep focus behavior intact.

Do not introduce motion that makes dialogs feel slow.

---

# 13. Lists

Do not animate every row on every render.

Use motion selectively for:

- insertion
- removal
- status change
- reorder if already supported

Avoid replaying entrance animations on every navigation or state update.

---

# 14. Empty / Success / Celebration

Use different motion intensity:

### Empty

Almost none.

### Normal success

Small feedback.

### Significant milestone

More expressive, but brief.

### Major celebration

Allow tasteful sparkle/ambient effects where product semantics support it.

Do not fabricate achievements.

---

# 15. Reduced Motion — Mandatory

Every non-essential animation must respect:

```css id="k5g1vb"
@media (prefers-reduced-motion: reduce)
```

Verify:

- infinite ambient motion stops/reduces
- entrance transitions are minimized
- completion animations become subtle
- decorative effects are suppressed
- functionality remains clear without animation

Do not merely set everything to `none` if doing so removes meaningful state transitions.

---

# 16. Performance

Inspect for:

- `filter: blur`
- `backdrop-filter`
- large box shadows
- transform-heavy infinite loops
- multiple simultaneous composited elements
- unnecessary layout-triggering properties
- animation of width/height/top/left where transform/opacity would suffice

Prefer:

- transform
- opacity
- bounded effects
- CSS rather than JavaScript animation when appropriate

Do not introduce a new animation library.

---

# 17. Motion Consistency Across Tabs

Review:

- Tasks
- Meals
- Grocery
- Kids
- Deeds
- Calendar
- Notes
- Reminders
- Deen
- Budget
- Me
- Review

Ensure similar semantic events have similar motion language.

For example:

```text id="p1mqqd"
completion
→ similar timing

sheet opening
→ similar timing

button press
→ similar feel
```

Individual features can still have unique moments.

---

# 18. Calm Isolation

Vibrant motion must not unintentionally animate Calm.

Check:

```text id="b0l4aj"
experience = calm
```

for:

- global keyframes
- selectors
- transitions
- hover behaviors
- component changes

Do not introduce Vibrant motion through shared styles unless the Calm presentation explicitly supports it.

---

# 19. Mobile Motion

Review motion on small screens.

Avoid:

- excessive blur
- large composited surfaces
- continuous animated backgrounds
- long transitions
- competing simultaneous motion

Mobile should feel just as responsive as desktop.

---

# 20. Scope

This is a motion refinement wave.

DO NOT:

- add product features
- change domain logic
- change persistence
- change routing
- introduce animation libraries
- redesign architecture
- alter Theme semantics
- change Calm visual language

Modify only motion and interaction presentation.

---

# 21. Verification

Run:

```bash id="z1llyv"
npx tsc --noEmit
npm test
npm run build
```

Test manually:

### Vibrant

- Home
- Deen
- Budget
- Me
- Review
- all secondary tabs

### Calm

Verify no unwanted Vibrant motion leaks.

### Interaction

Test:

- hover
- press
- completion
- navigation
- tabs
- sheets
- dialogs
- form states

### Reduced Motion

Enable reduced motion and verify all essential interactions remain clear.

---

# 22. Final Report

Provide:

## Motion Inventory

## Motion Tiers

## Changes Made

## Completion Interactions

## Navigation/SubTabs

## Hero Motion

## Form/Sheet Motion

## Reduced Motion

## Performance

## Calm Isolation

## Responsive Behavior

## Tests

Exact results:

```text id="k5s7fk"
npx tsc --noEmit
npm test
npm run build
```

## Known Issues

## 2D.5 Readiness

Identify the next highest-value refinement area:

**Empty states, success states, and emotional moments.**

Do not begin 2D.5 automatically.

# Final Standard

The user should feel:

> **"Firdaus responds beautifully to me."**

not:

> **"Everything on this screen is animated."**