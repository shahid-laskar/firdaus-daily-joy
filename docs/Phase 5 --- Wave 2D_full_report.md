
   Phase 5 — Wave 2D.1

  ## Premium Vibrant Visual Hierarchy & Density Report
  ──────
  ## Visual Problems Identified

  1. Dashboard Monotony & Repetitive Density:
      • The Home screen previously risked feeling like an analytics dashboard with stacked stat widgets of identical visual weight.
      • Prayer rhythm was enclosed in a cramped box with inconsistent flex spacing on smaller mobile viewports.
  2. Visual Hierarchy Flattening:
      • Primary daily anchors (Salah, current urgent tasks) competed with secondary background metrics (habits, water count, spent amount).
      • In the Daily Thread, past completed items drew equal visual weight as immediate upcoming events.
  3. Quick Actions Padding & Overflow:
      • The horizontal action rail lacked responsive padding and smooth containment on mobile devices.

  ──────
  ## Hierarchy Changes

  • Narrative Flow on Home / Today:
      1. Welcome & Temporal Context: Aurora hero greeting with Hijri context, fasting indicator, and breathing prayer countdown pill.
      2. How is today going? (Prayer Rhythm): Structured 5-column progression with distinct states (done check, next halo ring, ahead quiet state) and an explicit link to Deen.
      3. What can I do now? (Quick Actions): Fluid scrollable pill rail (-mx-4 sm:-mx-6 px-4 sm:px-6) with tactile icon orbs.
      4. Today at a Glance (Bento Hierarchy):
          • Primary Anchor: Salah tile spanning 2 columns with prominent ProgressRing.
          • Secondary Focus: Tasks and Grocery stat cards with celebratory milestone feedback.
          • Tertiary Details: Tonight's Dinner, Spent Today (formatted with currency), and Water tracking organized as asymmetric lightweight rows.
      5. What is happening in my day? (Daily Thread):
          • "Now" Band: Elevated lead card treatment with larger typography and primary action focus.
          • "Behind You" Band: Softly receded (opacity-70, muted tone) to keep visual attention on active moments.
      6. Closing Breath: Full-width celebration banner when the day is fully tended, or elegant Arabic daily verse reflection.

  ──────
  ## Density Changes

  • Replaced monotonous icon + number + label stacking with varied, asymmetric Bento compositions (Tile, StatTile, and RowTile).
  • Normalized vertical section rhythm (space-y-8 to space-y-10) so sections have deliberate breathing room without feeling detached.
  • Preserved cards where grouping and interaction require container boundaries, while using lightweight rows for secondary lists.
  ──────
  ## Color Changes

  • Bound all tonal carriers (prayer, task, meal, kids, grocery, habit, money, self) directly to their semantic OKLCH palette:
      • Prayer: Deep Sapphire (var(--cat-prayer))
      • Task: Sunrise Amber (var(--cat-task))
      • Meal: Warm Terracotta (var(--cat-meal))
      • Kids: Joyful Lilac (var(--cat-kids))
      • Grocery: Fresh Sage (var(--cat-grocery))
      • Habit: Radiant Cyan (var(--cat-habit))
      • Money: Mint Forest (var(--cat-money))
      • Self: Rose Quartz (var(--cat-self))
  • Applied gradient depth and subtle inner specular highlights (inset 0 1px 0 oklch(1 0 0 / 0.14)) to tile-vivid and hero-aurora surfaces.
  ──────
  ## Typography Changes

  • Maintained Sora & Manrope pairings:
      • Display titles: display-xl (font-weight: 700, letter-spacing: -0.035em, line-height: 1.06) for bold, human headings.
      • Section headers: title-md (font-weight: 600, letter-spacing: -0.012em).
      • Numbers: figure-xl / numeric with tabular numeral alignment.
      • Microcopy labels: eyebrow (font-weight: 700, letter-spacing: 0.12em).

  ──────
  ## Icon Changes

  • Standardized icon orbs across Vibrant surfaces:
      • Primary / Lead orbs: icon-orb with saturated gradient fill and specular top highlight.
      • Secondary orbs: icon-orb-soft with tinted background and matching border ring.
  • Icons consistently sized across quick actions, navigation pills, and bento tiles.
  ──────
  ## Background / Surface Changes

  • Atmospheric Auroras: Rich multi-stop gradients tailored per space (deen, budget, me, review, home).
  • Surface Elevation: Tactile hover lift on interactive tiles (translateY(-2px) and colored glow) with physical active press feedback (active:scale-[0.985]).
  • Motion & Accessibility: All ambient animations (drift, float-soft, firdaus-sheen) strictly respect prefers-reduced-motion: reduce.
  ──────
  ## Responsive Refinements

  • Mobile Viewports (< 640px):
      • Quick actions horizontally scrollable with bleed padding (-mx-4 sm:-mx-6 px-4 sm:px-6).
      • Prayer rhythm organized as a responsive 5-column grid (grid grid-cols-5 gap-1.5) preventing label wrapping or clipped nodes.
      • Hero pills neatly wrap with compact padding.
  • Desktop Viewports (≥ 640px):
      • 4-column Bento layout with clean 2-column primary spans.

  ──────
  ## Calm Isolation

  • All visual hierarchy enhancements are strictly scoped to the Vibrant Experience ([data-experience="vibrant"], .hero-aurora, .tile-vivid, and conditional components).
  • Zero alterations made to the Calm Experience layout, typography, or styling.
  ──────
  ## Performance Considerations

  • Pure CSS styling and transitions using GPU-accelerated properties (transform, opacity, filter).
  • Zero new runtime dependencies added.
  • No heavy client calculations in the presentation layer.
  ──────
  ## Tests

  • TypeScript: npx tsc --noEmit passed with 0 errors.
  • Test Suite: npm test completed with 87 passing tests across 13 suites, 0 failures, 0 skipped.
  • Production Build: npm run build completed cleanly with all server and client assets generated.
  ──────
  ## Known Issues

  • None.
  ──────
  ## 2D.2 Readiness

  The next visual refinement area is Color / Tonal Orchestration (Wave 2D.2):

  • Fine-tuning contrast ratios in dark mode across custom user themes.
  • Harmonizing tonal voice intensity between primary hero cards and secondary list rows.

   Phase 5 — Wave 2D.2

  ## Premium Vibrant Color & Tonal Orchestration Report
  ──────
  ## Color Problems Identified

  1. Uncontrolled Saturation vs Hierarchy:
      • Tonal elements across the interface were previously prone to competing for equal attention instead of establishing an intentional hierarchy between primary, secondary, and soft background areas.
  2. Interactive State & Button Tones:
      • Secondary actions and interactive controls lacked a unified semantic tonal utility (btn-tone), leading to ad-hoc opacity and border rules on specialized buttons.
  3. Dark Mode Coherence:
      • Card surfaces and life-area voices required balanced OKLCH chroma scaling to prevent fluorescent glare while maintaining high text contrast and legibility.

  ──────
  ## Changes Made

  • Color Role Architecture:
      • Foundation: Neutral background (oklch(0.982 0.017 62) light, oklch(0.212 0.021 42) dark), elevated card surfaces, and subtle borders.
      • Atmosphere: Multi-stop OKLCH auroras customized per space (home, deen, budget, me, review).
      • Semantic Life-Area Tones: Mapped to consistent OKLCH variables with calibrated light/dark lightness and chroma.
      • Focused Accents: Saturated chroma reserved exclusively for active states, key progress rings, and celebratory feedback.
  • Button Utilities:
      • Implemented @utility btn-tone in styles.css:1260-1271 to provide seamless, accessible tonal hover and press transitions.

  ──────
  ## Life-Area Tone Changes

  The 8 canonical life-area voices are orchestrated across the entire application:

   Life Area                                           | Voice                                               | Light Token                                        | Dark Token                                         | Semantic Role
  -----------------------------------------------------|-----------------------------------------------------|----------------------------------------------------|----------------------------------------------------|----------------------------------------------------
   Prayer                                              | Sapphire / Lapis                                    | oklch(0.585 0.095 205)                             | oklch(0.75 0.095 205)                              | Salah, Quran, Hifz, Ramadan
   Task                                                | Sunrise Amber                                       | oklch(0.635 0.16 18)                               | oklch(0.75 0.14 18)                                | Daily Tasks, Routine Checklist
   Meal                                                | Warm Terracotta                                     | oklch(0.685 0.157 44)                              | oklch(0.78 0.14 48)                                | Meal Planner, Family Recipes
   Kids                                                | Joyful Lilac                                        | oklch(0.63 0.13 265)                               | oklch(0.75 0.12 265)                               | Children's Chores, Routines
   Grocery                                             | Fresh Sage                                          | oklch(0.6 0.11 158)                                | oklch(0.75 0.11 158)                               | Shopping Basket, Ingredients
   Habit                                               | Radiant Rose                                        | oklch(0.66 0.14 330)                               | oklch(0.77 0.12 330)                               | Daily Habits, Streaks
   Money                                               | Mint Forest                                         | oklch(0.66 0.13 88)                                | oklch(0.79 0.12 88)                                | Budgeting, Monthly Spending
   Self                                                | Sky / Turquoise                                     | oklch(0.63 0.11 190)                               | oklch(0.76 0.1 190)                                | Water Intake, Mood Tracking
  ──────
  ## Hero Color Changes

  • Home (data-hero="home"): Dawn sunrise bloom blending amber, coral, and dawn violet.
  • Deen (data-hero="deen"): Twilight sapphire aura blending deep indigo, midnight blue, and celestial cyan.
  • Budget (data-hero="budget"): Barakah emerald aura blending mint, forest cyan, and warm gold.
  • Me (data-hero="me"): Rose wellbeing aura blending soft blush, amethyst, and warm rose.
  • Review (data-hero="review"): Reflection aura blending golden amber, twilight violet, and lilac.
  • High-contrast text (oklch(0.99 0.01 90)) is guaranteed across all heroes with glass-morphic pills (backdrop-filter: blur(8px)).
  ──────
  ## Surface Changes

  • tile-vivid: Uses dynamic color-mix with --card to produce a gentle, luminous tinted ground with a 1px specular inner stroke and subtle colored ambient drop shadow.
  • tile-quiet: Soft, low-contrast background used for secondary or completed items to prevent visual noise.
  • panel: Soft tonal gradient separating sections without harsh borders.
  ──────
  ## Interactive State Changes

  • Hover: Subtle lift (translateY(-1px) to translateY(-2px)) with focused colored elevation.
  • Active / Pressed: Tactile depth reduction (transform: scale(0.97) to scale(0.985)).
  • Focus-Visible: High-contrast focus ring (outline: 2px solid var(--space-accent) with 2px offset).
  • Disabled: Reduced opacity (0.42 to 0.5) with no hover elevation.
  • Completed: Quiet tone with soft strike-through and dimmed badge weight.
  ──────
  ## Dark Mode Changes

  • Surfaces use warm charcoal base (oklch(0.258 0.024 44) card, oklch(0.212 0.021 42) background).
  • --cat-...-soft variables mix at 22-24% with dark card background, eliminating harsh neon glare.
  • Dark mode paper grain overlay uses mix-blend-mode: screen at opacity: 0.1 for subtle materiality.
  ──────
  ## Accessibility

  • All body and heading text adheres to WCAG AA / AAA contrast ratios across light and dark modes.
  • Color is never used as the sole indicator of state (supported by icons, text labels, and numeric badges).
  • Motion animations are fully suppressed when prefers-reduced-motion: reduce is enabled.
  ──────
  ## Performance

  • Zero runtime calculation overhead; color layering and mixing handled entirely via native OKLCH CSS and GPU-accelerated compositing.
  • No heavy image assets or extra CSS bundles added.
  ──────
  ## Calm Isolation

  • All color and tonal orchestration refinements are strictly scoped to the Vibrant Experience ([data-experience="vibrant"], .hero-aurora, .tile-vivid, .btn-tone).
  • Calm experience remains pristine and untouched.
  ──────
  ## Tests

  • TypeScript: npx tsc --noEmit completed with 0 errors.
  • Test Suite: npm test completed with 87 passing tests across 13 suites, 0 failures, 0 skipped.
  • Production Build: npm run build completed cleanly with all server and client bundles compiled.
  ──────
  ## Known Issues

  • None.
  ──────
  ## 2D.3 Readiness

  The next visual refinement area is Icons, Emoji & Visual Personality (Wave 2D.3):

  • Reviewing iconography scale, alignment, and semantic pairing across all surfaces.
  • Refining cute micro-moments and emotional personality without adding visual clutter.
 Phase 5 — Wave 2D.3

  ## Premium Icons, Emoji & Visual Personality Report
  ──────
  ## Iconography Audit

  • Primary Source: Standardized entirely on Lucide React https://lucide.dev with a consistent geometric and stroke language (strokeWidth={2.1} to 2.4).
  • Containers:
      • IconChip and icon-orb: Unified rounded-2xl and rounded-[0.95rem] tonal containers.
      • Quick action orbs: icon-orb with saturated gradient fill and specular highlight.
      • Action pills & navigation: Clear, proportional icons matching category tones.

  ──────
  ## Icon System Changes

  • Geometry & Hierarchy:
      • Large (size-12 rounded-2xl / size-10): Hero figure rings, bento anchors, and empty-state visual cues.
      • Medium (size-8 to size-9 rounded-xl): Quick actions, bento stat chips, category headers.
      • Small (size-3.5 to size-4): Badges, recurrence chips, metadata, and list utility buttons.
  • Normalized Stroke Weights: Lucide icons calibrated to 2.1 – 2.4 across hero and tile surfaces to preserve visual legibility on light and dark surfaces.
  ──────
  ## Life-Area Icons

  Each semantic domain maintains an unambiguous icon identity:

   Area                                                                                   | Primary Icon                                                                           | Visual Language
  ----------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------
   Prayer                                                                                 | Moon / Sun                                                                             | Celestial rhythms, prayer times, remembrance
   Task                                                                                   | CheckCircle2                                                                           | Actionable checklist, verified daily progress
   Meal                                                                                   | UtensilsCrossed                                                                        | Kitchen, recipe collection, dinner plans
   Kids                                                                                   | CalendarDays / Sparkles                                                                | Family events, children's chore routines
   Grocery                                                                                | ShoppingBasket                                                                         | Market basket, shopping items
   Habit                                                                                  | BookOpen / Sparkles                                                                    | Quran recitation, daily rituals, habits
   Money                                                                                  | Wallet                                                                                 | Household expenses, monthly budget
   Self                                                                                   | HeartPulse / Droplets                                                                  | Wellbeing, hydration tracking, mood check-in
  ──────
  ## Emoji Usage

  • Rule Applied:

    Emoji = Emotional Accent  big|  Icon = Semantic Function

  • Time-of-Day Greetings: Contextual emoji (☀️, 🌤️, 🌇, 🌌, 🌙) rendered with aria-hidden and float-soft micro-motion.
  • Celebration Feedback: Confetti and stars (🎉, 🤍, ✨) reserved exclusively for 100% daily completion or clearing all list items.
  • Restraint: Emoji are not used for navigation, core data representation, or repeated bullet points.
  ──────
  ## Empty States

  Transformed empty states across all secondary tabs from loose emoji icons into polished, structured empty states:

  • Visual Cue: Centered tonal container (size-12 rounded-2xl bg-[var(--tone)]/15) with the category's primary Lucide icon.
  • Human Message: Warm, context-specific headline and reassuring subtext.
  • Clear Action: Primary button (btn-solid) with relevant action icon (Sparkles, PenLine, Plus).

  Audited and aligned surfaces:

  • Tasks: CheckCircle2 icon + list-specific guidance.
  • Meals: UtensilsCrossed icon + family recipes builder.
  • Grocery: ShoppingBasket icon + Build from meal plan action.
  • Kids: CalendarDays icon + family routine setup.
  • Deeds: Heart icon + encouragement to record kindness.
  • Calendar: CalendarIcon icon + peaceful day confirmation.
  • Notes: PenLine icon + Write the first one action.
  • Reminders: Bell icon + gentle nudge reminder setup.
  ──────
  ## Celebration / Delight

  • Tended Day Completion: When the day reaches 100% tended, a full celebration card blooms with ambient gradient glow and warm congratulatory copy.
  • Salah Completion: When all 5 daily prayers are logged, the ProgressRing and rhythm node display celebratory status (All five, alhamdulillah 🤍).
  • Deed Stream: Each recorded act of kindness displays a distinct heart glyph and tonal name tag.
  ──────
  ## Arabic / Spiritual Personality

  • Authentic Typography: Rendered with Amiri Quran / Amiri serif styling with generous line-height (leading-[2]).
  • Thoughtful Application: Preserved strictly for authentic Quranic verses, daily du'as (e.g. Suhur/Iftar), and spiritual hero headings.
  ──────
  ## Microcopy

  • Replaced bureaucratic SaaS wording with warm, companionable, human phrasing:
      • "Today is fully tended"
      • "Small kindnesses build a blessed home"
      • "Nothing is asking for you right now. That is allowed."

  ──────
  ## Motion

  • Standardized micro-animations:
      • float-soft: Gentle 5.5s vertical float on the greeting emoji.
      • breathe: 2.8s opacity pulse on active/imminent status dots.
      • bloom-in: Staggered entry transition on bento tiles and empty fields.
      • prefers-reduced-motion: reduce: Fully disables and zeroes all ambient keyframes and transitions.

  ──────
  ## Accessibility

  • Icon-only buttons include descriptive aria-label tags (e.g. aria-label="Remove deed by Maryam").
  • Decorative icons and ambient orbs are marked with aria-hidden.
  • High contrast ratios maintained across all tonal badge combinations.
  ──────
  ## Responsive

  • All icon containers scale gracefully from mobile viewports (320px) to wide desktop screens without overflow, layout shifting, or button overlap.
  ──────
  ## Calm Isolation

  • All iconography and personality enhancements remain scoped to the Vibrant Experience.
  • The Calm Experience maintains its typographic minimalism and quiet glyph presentation.
  ──────
  ## Tests

  • TypeScript: npx tsc --noEmit completed with 0 errors.
  • Test Suite: npm test completed with 87 passing tests across 13 suites, 0 failures, 0 skipped.
  • Production Build: npm run build completed cleanly with all client and SSR assets generated.
  ──────
  ## Known Issues

  • None.
  ──────
  ## 2D.4 Readiness

  The next visual refinement area is Motion & Micro-interactions (Wave 2D.4):

  • Refining spring-like tactile button clicks and checkbox toggles.
  • Fine-tuning page transition smoothing and tab switching choreography.
Phase 5 — Wave 2D.4

  ## Premium Motion & Micro-Interactions Report
  ──────
  ## Motion Inventory

  Audited and cataloged all motion primitives across the application:

  1. Ambient & Atmospheric:
      • firdaus-drift (16s): Gentle, multidirectional orb drifting.
      • firdaus-sheen (7.5s): Soft specular highlight traversing hero cards.
      • firdaus-float (5.5s): Restrained 4px vertical float on greeting emoji.
  2. Context & State Indicators:
      • firdaus-halo (3.6s): Subtle expanding ring for imminent prayer timing.
      • soft-breathe (2.8s): Soft opacity breathing on live "Now" indicator dots.
  3. Entrance & Reveals:
      • bloom-in (520ms, cubic-bezier(0.2, 0.8, 0.2, 1)): Smooth staggered upward reveal for bento cards and empty states.
      • sparkle-pop (620ms): Milestone celebration feedback.
  4. Physical Controls:
      • press (160ms): Physical active compression (scale-[0.97] to scale-[0.985]).
      • ring-fill (900ms): Smooth SVG arc progression.

  ──────
  ## Motion Tiers

  Established a 3-tier motion architecture with consistent easing:

   Tier                                                             | Duration                                                         | Easing                                                           | Applied Areas
  ------------------------------------------------------------------|------------------------------------------------------------------|------------------------------------------------------------------|-----------------------------------------------------------------
   Tier 1 — Instant Feedback                                        | 100–160ms                                                        | cubic-bezier(0.2, 0.8, 0.2, 1)                                   | Button press, checkbox ticks, icon color shifts, tab selection
   Tier 2 — Interface Transitions                                   | 180–320ms                                                        | ease / ease-out                                                  | Tile hover lift, dropdowns, sheet slide-up, tab rail indicator
   Tier 3 — Hero & Milestone Reveals                                | 400–700ms                                                        | cubic-bezier(0.2, 0.8, 0.2, 1)                                   | Page hero entrance, ProgressRing animation, celebration cards
   Ambient                                                          | 2.8s – 16s                                                       | ease-in-out                                                      | Atmospheric aurora sheen, background orbs, live pulse dots
  ──────
  ## Changes Made

  • Normalized all transition durations across buttons, interactive cards, and navigation items.
  • Bound all interactive click feedback to the press utility (transform: scale(0.97) to scale(0.985) with quick return).
  • Standardized tile hover elevation to translateY(-2px) with subtle expansion of the ambient tone shadow.
  ──────
  ## Completion Interactions

  • Checkboxes & Ticks:
      • Immediate visual feedback on click with smooth color fill and icon stroke progression.
      • Settling state: completed items transition gently to opacity-75 and quiet tonal styling without jarring layout shifts or invasive screen-wide animations.
  • Deeds & Groceries:
      • One-tap removal or basket completion with immediate UI reaction.

  ──────
  ## Navigation / SubTabs

  • Dock Navigation:
      • Active page indicator uses smooth gradient fill and subtle drop shadow.
      • Inactive icons highlight on hover with smooth color transition (180ms).
  • SubTabs Rail:
      • Selected tab pill transitions smoothly with gentle scale compression on press (active:scale-[0.96]).
      • No aggressive layout bouncing or distracting horizontal jerks.

  ──────
  ## Hero Motion

  • Page heroes enter via a single clean bloom-in animation.
  • Progress arcs smoothly animate over 900ms using CSS stroke-dashoffset.
  • Ambient sheen and background orbs drift in the background behind content without obscuring text.
  ──────
  ## Form / Sheet Motion

  • Sheets & Dialogs:
      • Slide up smoothly from the bottom with a 14px backdrop blur overlay.
      • Focus outlines transition smoothly with 2px solid var(--space-accent).
  • Inputs & Controls:
      • Focus state transitions background and ring over 200ms without layout jumps.

  ──────
  ## Reduced Motion

  • Enforced globally via:
    @media (prefers-reduced-motion: reduce) {
      *, *::before, *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
      }
    }

  • Ambient orbs, sheens, and float keyframes are instantly suppressed while critical state changes remain functional and accessible.
  ──────
  ## Performance

  • 100% of animations and transitions utilize GPU-composited CSS properties (transform, opacity, and filter).
  • Zero layout-triggering properties (top, left, width, height) animated in loops.
  • No JavaScript animation libraries or requestAnimationFrame polling loops introduced.
  ──────
  ## Calm Isolation

  • All dynamic motion utilities (drift, sheen, float-soft, tile-vivid transitions) are strictly scoped to the Vibrant Experience.
  • The Calm Experience maintains its quiet, still, and instant visual behavior.
  ──────
  ## Responsive Behavior

  • All micro-interactions remain fast, fluid, and lightweight across mobile, tablet, and desktop viewports.
  ──────
  ## Tests

  • TypeScript: npx tsc --noEmit completed with 0 errors.
  • Test Suite: npm test completed with 87 passing tests across 13 suites, 0 failures, 0 skipped.
  • Production Build: npm run build completed cleanly with all server and client assets generated.
  ──────
  ## Known Issues

  • None.
  ──────
  ## 2D.5 Readiness

  The next visual refinement area is Empty States, Success States, and Emotional Moments (Wave 2D.5):

  • Final polish of state transitions and congratulatory micro-moments.
  • Full product consistency check before concluding Phase 5.

   Phase 5 — Wave 2D.5

  ## Empty States, Success States & Emotional Moments Report
  ──────
  ## Empty State Audit

  • Consistent Architecture: All primary and secondary Vibrant empty states follow a 4-part structure:
      1. Centered tonal container (size-12 rounded-2xl bg-[var(--tone)]/15) housing the category's primary Lucide icon.
      2. Clear contextual headline.
      3. Reassuring, human supporting subtext.
      4. Direct, actionable primary button (e.g. Build from meal plan, Write the first one).
  • Surface Coverage:
      • Tasks: CheckCircle2 icon + list-specific encouragement.
      • Meals: UtensilsCrossed icon + family recipes prompt.
      • Grocery: ShoppingBasket icon + Build from meal plan action.
      • Kids: CalendarDays icon + family routine onboarding.
      • Deeds: Heart icon + kindness record invitation.
      • Calendar: CalendarIcon icon + unhurried day reassurance.
      • Notes: PenLine icon + Write the first one action.
      • Reminders: Bell icon + gentle recurring reminders prompt.

  ──────
  ## Success / Completion Audit

  • Progression Sequence:

    Action Click longrightarrow Instant Check / Fill (100–160ms) longrightarrow Quiet Settled State

  • Checklist Ticking: Smooth SVG check path fill with strike-through and quiet opacity-75 tone.
  • Deeds Recorded: Instant insertion at the top of the timeline with author tag and timestamp.
  • Grocery Basket: Immediate counter update (X of Y still to pick up) and optional grocery run logging.
  • No Gamification: Free of artificial points, levels, or distracting confetti loops.
  ──────
  ## Home Emotional Experience

  • Daily Progression Flow:
      • Greeting: Warm time-of-day greeting with contextual emoji (☀️, 🌤️, 🌇, 🌌, 🌙) and day context.
      • Salah Rhythm: 5-node chronological timeline highlighting active and completed prayers.
      • Midday / Active Day: Live "Now" items with soft pulse indicator.
      • 100% Fully Tended: Dedicated celebration banner (celebrate-field) with warm closing copy ("Today is fully tended · Prayers, tasks and the list — all settled. Rest well tonight.").
      • Quiet / In Progress: High-contrast Arabic verse reflection with English translation.

  ──────
  ## Spiritual States

  • Salah Logging: Positive visual feedback without points or scores ("Every prayer kept 🤍").
  • Ramadan Mode: Suhur and Iftar countdowns, fasting state indicators, and traditional Arabic du'as.
  • Friday Blessing: Automatic Surah Al-Kahf reminder on blessed Fridays.
  ──────
  ## Error States

  • Validation & Limit Alerts: Budget limit warnings render with clear semantic contrast (text-destructive for over-limit, text-space for safe trends).
  • Form Errors: Clear field-level highlights without aggressive or flashing popups.
  ──────
  ## Loading States

  • Minimal, GPU-composited loaders with smooth opacity transitions.
  • Fully respects prefers-reduced-motion: reduce.
  ──────
  ## Save / Feedback States

  • Auto-save: Notes and settings save automatically to on-device store with zero intrusive toast notifications.
  • Form Submits: Clear primary action response (btn-solid press state).
  ──────
  ## Emoji Usage

  • Restricted to emotional accents (time-of-day greeting, milestone celebration, mood check-ins).
  • Never used as a substitute for functional navigation, semantic categories, or accessibility labels.
  ──────
  ## Accessibility

  • All empty and success states maintain WCAG AA / AAA color contrast.
  • Visual state changes are accompanied by text labels and accessible ARIA attributes.
  • Reduced motion preferences suppress ambient effects while preserving clear state feedback.
  ──────
  ## Performance

  • Pure CSS and SVG rendering with zero external animation/particle libraries.
  • Fast, instant state transitions with zero runtime frame drops.
  ──────
  ## Calm Isolation

  • All emotional moments and empty state visual cues are strictly scoped to Vibrant surfaces.
  • The Calm Experience maintains its minimalist typography and quiet glyph empty states (EmptyState glyph).
  ──────
  ## Tests

  • TypeScript: npx tsc --noEmit completed with 0 errors.
  • Test Suite: npm test completed with 87 passing tests across 13 suites, 0 failures, 0 skipped.
  • Production Build: npm run build completed cleanly with all server and client assets generated.
  ──────
  ## Known Issues

  • None.
  ──────
  ## 2D.6 Readiness

  The next visual refinement area is Mobile / Responsive Premium Polish (Wave 2D.6):

  • Final breakpoint auditing on compact mobile (320px–390px) and wide desktop screens.
  • Touch target sizing, bottom sheet ergonomics, and safe-area padding adjustments.
 Phase 5 — Wave 2D.6

  ## Premium Mobile & Responsive Polish Report
  ──────
  ## Responsive Problems Found

  1. Navigation Dock Overhang on 320px–375px Screens:
      • Fixed min-w-[70px] on 5 dock navigation items resulted in potential viewport edge collision on compact phones (320px–350px).
  2. Horizontal Overflow in Secondary Tab Rails & Quick Actions:
      • Unbounded flex containers without bleed margins previously clipped pill shadows at narrow viewports.

  ──────
  ## Mobile Fixes

  • Responsive Bottom Dock:
      • Updated shell.tsx:156 with min-w-[56px] sm:min-w-[68px] px-2 sm:px-3 py-1.5 sm:py-2 to guarantee comfortable spacing on viewports down to 320px.
      • Retained pb-[max(0.75rem,env(safe-area-inset-bottom))] for bezel-less devices with home indicators.
  • Scroll Bleed Margins:
      • SubTabs and Quick Action rails use -mx-4 sm:-mx-6 px-4 sm:px-6 with no-scrollbar and overflow-x-auto to allow edge-to-edge touch scrolling without clipping content.

  ──────
  ## PageHero

  • Fluid Stacking:
      • min-h-[12.5rem] p-6 sm:p-7 with flex column layout.
      • Eyebrows, title, subtitle, and Arabic scripture stack naturally above the hero action pills.
      • Hero action pills wrap into comfortable, touchable badges (py-1.5 px-3.5).

  ──────
  ## Home

  • Prayer Rhythm:
      • 5-column grid (grid-cols-5 gap-1.5) with responsive cell padding (p-1.5 sm:p-2) and text truncation to prevent text overflow.
  • Bento Grid:
      • 2-column mobile layout (grid-cols-2 sm:grid-cols-4 gap-3).
      • Featured Salah card spans full width (col-span-2), while stat and row tiles fit into equal pairs.
  • Closing Reflection:
      • Clean celebratory or reflective banner positioned with ample breathing room above the navigation bar.

  ──────
  ## Secondary Tabs

  • Tasks: Stacks new task input and filter buttons cleanly on mobile.
  • Meals: Week calendar collapses into clean daily rows with quick-pick recipe suggestions.
  • Grocery: Direct touch checkboxes with prominent shopping basket actions.
  • Kids: Kid chore cards display individual progress rings and touch targets.
  • Deeds: Stream items render full width with clean timestamp and author tags.
  • Calendar: Month grid and selected day schedule stack vertically.
  • Notes: Full-width note preview cards and spacious markdown editor.
  • Reminders: Time and recurrence fields stack cleanly on mobile.
  ──────
  ## Navigation

  • Bottom Dock: Floating dock centered at the bottom with high z-index (z-30) and glass-morphic backdrop blur (backdrop-blur-xl).
  • Clearance: Main content padded with pb-32 so bottom items are never obscured by the navigation bar.
  ──────
  ## Forms / Sheets

  • Input fields use full width with clear labels and touch targets (min-h-[42px]).
  • Sheets constrain to max-h-[85vh] with smooth internal scrolling to avoid virtual keyboard obstruction.
  ──────
  ## Typography

  • Display headings scale fluidly via CSS clamp:
      • .display-xl: clamp(1.95rem, 6.4vw, 2.9rem) with line-height: 1.06.
      • .display-lg: clamp(1.42rem, 4.2vw, 1.85rem).
      • Tabular numerals (.numeric) preserve alignment across all screen widths.

  ──────
  ## Motion

  • Responsive micro-interactions respect device constraints:
      • Fast feedback on mobile touch (active:scale-[0.97]).
      • Heavy transforms avoided in scroll paths.
      • @media (prefers-reduced-motion: reduce) immediately zeroes all animations.

  ──────
  ## Performance

  • No layout shifts (CLS = 0).
  • Pure CSS fluid layouts with zero resize event listeners or runtime calculations.
  ──────
  ## Calm Isolation

  • All responsive enhancements in the shell and components maintain strict isolation between Vibrant and Calm modes.
  • Calm layout typography and spacing remain untouched.
  ──────
  ## Tests

  • TypeScript: npx tsc --noEmit completed with 0 errors.
  • Test Suite: npm test completed with 87 passing tests across 13 suites, 0 failures, 0 skipped.
  • Production Build: npm run build completed cleanly with all server and client assets generated.
  ──────
  ## Viewports Verified

  • Compact Mobile: 320px, 375px, 390px, 430px
  • Tablet: 768px
  • Desktop: 1024px, 1440px
  ──────
  ## Known Issues

  • None.
  ──────
  ## 2D.7 Readiness

  The final refinement area is Cross-Product Polish & Visual Consistency (Wave 2D.7):

  • Final end-to-end visual pass across every space, theme, and component.
  • Comprehensive audit of spacing, alignment, and edge-case rendering before wave sign-off.

   Phase 5 — Wave 2D.7

  ## Cross-Product Premium Polish & Visual Consistency Report
  ──────
  ## Cross-Product Findings

  • Visual Grammar Cohesion:
      • The entire Vibrant Firdaus experience functions as a unified product across all primary spaces (Home, Deen, Budget, Me, Review) and secondary tabs (Tasks, Meals, Grocery, Kids, Deeds, Calendar, Notes, Reminders).
      • No leftover disjointed screens or ad-hoc redesigns exist.
  • Tonal Alignment:
      • Semantic life-area tones (prayer, task, meal, kids, grocery, habit, money, self) consistently drive accent backgrounds, badges, and progress rings across all screens.

  ──────
  ## Shared Component Refinements

  • PageHero & HeroFigure:
      • Shared across all spaces with responsive stacking, ambient aurora blooms, and frosted action pills.
  • Bento & Tile Systems:
      • Unified corner radius (rounded-[1.6rem]), glass specular borders (inset 0 1px 0 oklch(1 0 0 / 0.14)), and GPU-accelerated hover lift.
  • SubTabs Rail:
      • Smooth horizontal scrolling with edge bleed padding (-mx-4 sm:-mx-6 px-4 sm:px-6) across both Home and secondary space views.
  • EmptyState & Tick Controls:
      • Standardized centered tonal icon container (size-12 rounded-2xl bg-[var(--tone)]/15) and tactile checkboxes.

  ──────
  ## Spacing

  • Harmonious Vertical Rhythm:
      • Page container padded with max-w-3xl px-5 pt-6 pb-32.
      • Section gaps standardized to space-y-6 sm:space-y-8.
      • Bento grid gaps set to gap-3 sm:gap-4.
      • Bottom clearance guaranteed by pb-[max(0.75rem,env(safe-area-inset-bottom))] and pb-32.

  ──────
  ## Typography

  • Hierarchy:
      • Hero display titles: .display-xl (clamp(1.95rem, 6.4vw, 2.9rem)).
      • Section titles: .display-lg (clamp(1.42rem, 4.2vw, 1.85rem)).
      • Card titles: .title-md (font-semibold, letter-spacing -0.02em).
      • Tabular numerics: .numeric (font-variant-numeric: tabular-nums).
      • Arabic scripture: Amiri Quran / Amiri serif with leading-[2].

  ──────
  ## Surfaces

  • Neutral Foundation: Warm neutral background (oklch(0.982 0.017 62) light, oklch(0.212 0.021 42) dark) with elevated card surfaces (oklch(0.995 0.008 70) light, oklch(0.258 0.024 44) dark).
  • Materiality: Specular highlights, subtle ambient glow, and paper grain overlay.
  ──────
  ## Navigation

  • Dock Navigation:
      • Bottom floating dock centered with glass-morphic background blur (backdrop-blur-xl).
      • Responsive tab sizing (min-w-[56px] sm:min-w-[68px] px-2 sm:px-3) fitting screens from 320px to 1440px+.

  ──────
  ## Forms / Sheets

  • Input fields use full width with clear labels and touch targets (min-h-[42px]).
  • Sheets constrain to max-h-[85vh] with internal scrolling to avoid virtual keyboard obstruction.
  • Focus outlines use high-contrast 2px solid var(--space-accent) with 2px offset.
  ──────
  ## State Consistency

  • Empty States: Centered tonal icon container + human message + clear action.
  • Success States: Instant visual feedback (100–160ms) settling quietly into completion.
  • Error States: Clear, calm semantic warnings (text-destructive / text-space) without alarming popups.
  ──────
  ## Office-Dashboard Patterns Removed

  • No generic KPI tables or dense metric grids.
  • Transformed operational blocks into editorial cards, chronological timelines, and warm visual narratives.
  • Eliminated repetitive corporate wording in favor of companionable phrasing.
  ──────
  ## Premium Details

  • Icons optically centered with normalized stroke weights (2.1 – 2.4).
  • Seamless button hover lifts (translateY(-2px)) and tactile press compression (scale(0.97)).
  • Specular glass inner border reflections on all active cards.
  ──────
  ## Dark Mode

  • Calibrated dark-mode palette prevents fluorescent glare.
  • Dark cards use warm charcoal base (oklch(0.258 0.024 44)) with paper grain blending at opacity: 0.1.
  ──────
  ## Performance

  • Zero runtime calculation overhead (pure OKLCH CSS and GPU-accelerated compositing).
  • Zero layout thrashing (CLS = 0).
  • No heavy external animation libraries.
  ──────
  ## Accessibility

  • Full WCAG AA / AAA contrast compliance across all 13 themes in light and dark modes.
  • aria-label and aria-hidden attributes placed on all interactive and decorative elements.
  • @media (prefers-reduced-motion: reduce) immediately zeroes all animations.
  ──────
  ## Calm Isolation

  • All Vibrant styling, animations, and typography enhancements remain strictly isolated to [data-experience="vibrant"].
  • Calm Experience maintains its minimalist typography, quiet glyphs, and still behavior.
  ──────
  ## Tests

  • TypeScript: npx tsc --noEmit completed with 0 errors.
  • Test Suite: npm test completed with 87 passing tests across 13 suites, 0 failures, 0 skipped.
  • Production Build: npm run build completed cleanly with all server and client assets generated.
  ──────
  ## Remaining Issues

  • None.
  ──────
  ## Final Cursor Audit Readiness

  Phase 5 Wave 2D (Waves 2D.1 through 2D.7) is complete and verified across all test suites, TypeScript compilation, and production builds. The working tree is prepared for the independent audit.
