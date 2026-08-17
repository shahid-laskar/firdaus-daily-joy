# Phase 5 — Wave 2D.6
## Premium Mobile & Responsive Polish

Wave 2D.1 refined hierarchy and density.

Wave 2D.2 refined color and tonal orchestration.

Wave 2D.3 refined icons, emoji, and visual personality.

Wave 2D.4 refined motion and micro-interactions.

Wave 2D.5 refined empty, success, and emotional states.

This wave focuses on **mobile and responsive quality across the complete Vibrant experience**.

The goal is:

> **Make Vibrant feel intentionally designed on every screen size, not like a desktop interface squeezed onto a phone.**

Do NOT create a separate mobile application.

Do NOT change product logic.

Do NOT alter the Experience architecture.

---

# 1. Responsive Design Principle

Use one shared product and one shared design system.

Responsive behavior may change:

- layout
- density
- hierarchy
- navigation presentation
- component sizing
- information priority
- interaction patterns

But it must not change:

- product semantics
- business logic
- persistence
- routing
- domain calculations

---

# 2. Audit the Complete Vibrant Experience

Inspect at minimum:

### Primary spaces

- Home / Today
- Deen
- Budget
- Me
- Review

### Home secondary tabs

- Tasks
- Meals
- Grocery
- Kids
- Deeds
- Calendar
- Notes
- Reminders

### Shared UI

- Shell
- Bottom navigation
- SubTabs
- PageHero
- Bento
- sheets
- dialogs
- forms
- buttons
- controls
- empty states
- success states

Do not assume previous desktop validation means mobile is correct.

---

# 3. Mobile-First Audit

Inspect approximately:

```text id="q45zx1"
320px
375px
390px
430px
```

and typical tablet/desktop widths.

Look for:

- horizontal overflow
- clipped content
- tiny text
- cramped controls
- oversized hero sections
- excessive padding
- cards too narrow
- cards too wide
- pills overflowing
- navigation overlap
- sheets exceeding viewport
- dialogs exceeding viewport
- keyboard obstruction
- fixed elements covering content

Fix actual problems rather than blindly changing every breakpoint.

---

# 4. Home / Today

This is the highest-priority mobile screen.

Review:

### Hero

Ensure:

- greeting remains visible
- main metric is clear
- hero does not consume excessive vertical space
- decorative orbs do not overwhelm content
- HeroRing remains readable

### Prayer Rhythm

Ensure:

- all prayer states remain understandable
- horizontal scrolling, if used, feels deliberate
- touch targets are large enough
- active/next prayer remains obvious

### Quick Actions

Ensure:

- horizontal scrolling is smooth
- buttons don't become tiny
- labels don't collide
- important actions remain discoverable

### Bento

On mobile, avoid forcing a desktop grid.

Allow:

- stacking
- priority ordering
- compact variants
- full-width feature tiles where appropriate

Do not simply shrink every tile.

### Reflection

Ensure the closing state doesn't become an oversized marketing banner.

---

# 5. PageHero Mobile Behavior

Review:

- Deen
- Budget
- Me
- Review

Check:

- title wrapping
- figure placement
- pill wrapping
- hero height
- decorative motifs
- orbs
- contrast
- bottom spacing

The hero should feel premium without consuming the entire viewport.

Use sensible stacking rather than shrinking text until it becomes unreadable.

---

# 6. Bottom Navigation

Review:

- safe-area behavior
- touch target sizes
- icon/text balance
- active state
- selected indicator
- content padding beneath fixed navigation

Verify:

```css id="b7j3k5"
env(safe-area-inset-bottom)
```

where appropriate.

Ensure the last content item in each screen is not hidden behind navigation.

---

# 7. SubTabs

Review the Vibrant floating/pill SubTabs.

On mobile:

- allow intentional horizontal scrolling where needed
- preserve active visibility
- avoid wrapping into awkward multi-row controls
- ensure touch targets are comfortable
- prevent pills from becoming excessively wide

Do not force all tabs into a single cramped row if scrolling is the better design.

---

# 8. Secondary Tabs

Audit each:

### Tasks

Prioritize rapid task scanning and completion.

### Meals

Ensure weekly/meal layouts collapse gracefully.

### Grocery

Prioritize fast scanning and purchase interactions.

### Kids

Ensure family/child cards remain usable.

### Deeds

Preserve spiritual and emotional hierarchy.

### Calendar

Ensure date controls and schedules remain usable.

### Notes

Ensure editor/list transitions work well with the mobile keyboard.

### Reminders

Ensure time/date and action controls remain accessible.

Do not make each tab responsive in a completely different way.

Reuse shared responsive primitives.

---

# 9. Forms & Sheets

This is a high-risk area.

Review all Vibrant forms and sheets.

Check:

- viewport height
- scrolling
- keyboard behavior
- focus
- field spacing
- button placement
- sticky footer actions
- date/time controls
- recurrence controls
- select/dropdown positioning

Ensure forms remain usable when the virtual keyboard is visible.

Avoid dialogs that exceed the visible screen.

---

# 10. Typography

Review Vibrant Sora / Manrope at small widths.

Check:

- heading wrapping
- numeric metrics
- pills
- button labels
- metadata
- Arabic content
- long feature names

Avoid:

- awkward line breaks
- oversized headlines
- text clipping
- extremely small metadata

Do not solve wrapping by arbitrarily reducing font size everywhere.

---

# 11. Icons

Check:

- minimum touch-area considerations
- optical size
- alignment
- icon + text spacing
- icon-only controls

Decorative icons may shrink.

Interactive icons should remain comfortably tappable.

---

# 12. Color & Visual Effects

On mobile, review:

- aurora backgrounds
- blurred orbs
- shadows
- frosted surfaces
- glows

Reduce visual intensity where necessary.

Small screens do not need the same amount of atmospheric decoration as desktop.

---

# 13. Motion on Mobile

Review:

- infinite orb movement
- page transitions
- tile entrances
- completion animations
- navigation transitions
- SubTabs movement

Mobile motion should feel responsive, not heavy.

Reduce or eliminate expensive decorative animation on constrained devices where appropriate.

Respect reduced motion.

---

# 14. Content Priority

Responsive design should preserve product priority.

At smaller widths, prioritize:

### Home

1. Greeting
2. Today status
3. Next meaningful action
4. Core daily information
5. Supporting details

### Secondary tabs

1. Main content
2. Primary action
3. Key state
4. Secondary metadata

Do not simply scale desktop content down.

---

# 15. Accessibility

Verify:

- touch targets
- focus behavior
- keyboard access
- screen-reader labels
- contrast
- reduced motion
- text zoom
- dynamic type where relevant

Test at increased browser text size where practical.

---

# 16. Calm Isolation

All responsive changes should be explicitly evaluated for Calm.

Do not introduce global breakpoint rules that accidentally modify:

```text id="7k6m3v"
Calm
```

If shared responsive infrastructure changes, verify both experiences.

---

# 17. Performance

Review mobile performance implications of:

- backdrop-filter
- blur
- gradients
- SVG effects
- large shadows
- animations
- image/illustration sizes

Avoid introducing new heavy assets.

Prefer progressive visual degradation where appropriate.

---

# 18. Scope

This is a responsive refinement wave.

Do NOT:

- add features
- change business logic
- alter persistence
- create mobile-specific routes
- duplicate components unnecessarily
- create separate mobile stores
- change Experience/Theme architecture

---

# 19. Verification

Run:

```bash
npx tsc --noEmit
npm test
npm run build
```

Manually inspect at minimum:

```text id="jhtw7m"
320px
375px
390px
430px
768px
1024px
1440px
```

Check:

- Home
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

Test both:

```text id="y0a4cz"
Calm
Vibrant
```

for representative shared components.

---

# 20. Final Report

Provide:

## Responsive Problems Found

## Mobile Fixes

## PageHero

## Home

## Secondary Tabs

## Navigation

## Forms / Sheets

## Typography

## Motion

## Performance

## Accessibility

## Calm Isolation

## Tests

Exact results:

```text id="z5m8on"
npx tsc --noEmit
npm test
npm run build
```

## Viewports Verified

## Known Issues

## 2D.7 Readiness

Identify the final refinement area:

**Cross-product polish & visual consistency.**

Do not begin 2D.7 automatically.

# Final Standard

A user should open Firdaus on a phone and feel:

> **"This was designed for my phone."**

not:

> **"This is the desktop app made smaller."**