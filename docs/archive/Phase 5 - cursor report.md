  Phase 5 — Final Independent Audit

  Executive Verdict

  AMBER — COMPLETE WITH TARGETED FIXES

  The architecture is sound: one product core, Experience above Theme, Calm as default, Vibrant as an alternate presentation. Previously blocking capability splits (Deeds delete, grocery filters, meals → plan, notes search) are restored. TypeScript, 87 tests, and the
  production build pass.

  Phase 5 is not ready to close yet. Wave 2D exists only in the working tree, Gemini’s “no remaining issues” claim is false, and Vibrant Home still misreads tonight’s dinner. Those are targeted fixes, not a redesign.

  ────────────────────────────────────────

  Git / Delivery

  Working tree (not Gemini’s history):

  • Branch: main @ fde9954 (origin/main)
  • Last commit: feat(experience): complete wave 2C final hardening and capability parity (Wave 2C.3B)
  • Wave 2D is uncommitted. 7 source files modified, 9 audit/report docs untracked.

  Uncommitted source (77 insertions, 37 deletions):

  • src/routes/index.tsx — Home density, prayer grid, ₹ spent prefix, “View all”
  • src/styles.css — unused btn-tone utility
  • src/components/veedu/shell.tsx — dock min-w for 320px
  • Empty-state Lucide swaps in Tasks, Meals, Grocery, Kids, Deeds, Calendar, Notes, Reminders

  Committed Phase 5: Waves 2C.1 → 2C.3B only. origin/main does not contain Wave 2D.

  No secrets, no extra app architecture, no unexpected runtime artifacts. The untracked files are docs only.

  ────────────────────────────────────────

  TypeScript / Tests / Build

  Exact independent results:

  npx tsc --noEmit
  (exit 0, no output, 0 errors)
  npm test
  # tests 87
  # suites 13
  # pass 87
  # fail 0
  # cancelled 0
  # skipped 0
  # todo 0
  Warnings (stderr, repeated):
  ⚠️  Node.js 20 and below are deprecated ... @supabase/supabase-js ... upgrade to Node.js 22
  npm run build
  exit 0
  client: ✓ built in 4.12s
  ssr:    ✓ built in 1.83s
  nitro:  ✓ built in 1.67s (preset: cloudflare-module)

  There are no component, hydration, or visual tests. Coverage is domain engines plus a thin Experience registry contract. That does not prove first-paint or Calm/Vibrant UI isolation.

  ────────────────────────────────────────

  Experience Architecture

  Confirmed:

  Shared Core → Experience → Theme

  • ExperienceId = "calm" | "vibrant"; DEFAULT_EXPERIENCE = "calm"
  • No bloom ThemeId; 13 palettes unchanged; Vibrant is not a theme
  • One store (veedu: + optional Supabase), one router, one shell, one set of domain engines
  • Branching is presentation-only: Home, Deen/Budget/Me/Review heroes, secondary tabs, SubTabs, Field/Action/Sheet, nav dock

  Maintenance risk: large duplicated Calm/Vibrant JSX trees in modules.tsx (~1887 lines), calendar.tsx, notes.tsx, reminders.tsx, index.tsx. Logic is shared above the fork; markup will drift. That is not a second product, but it is the main structural debt.

  ────────────────────────────────────────

  Hydration / First Paint

  Release-blocking item from Wave 2C.3B. Source-level verdict: the cookie-authoritative path is in place; it was not empirically cold-loaded in a browser here.

  Intended path:

  1. Server loader reads veedu.experience cookie
  2. Blocking head script sets html[data-experience] from cookie, else localStorage
  3. ThemeProvider initializes from loader data (not from document)
  4. applyToDocument is a no-op when attributes already match

  For a persisted Vibrant user with cookies, SSR tree, client tree, and data-experience should agree. Calm default still holds when neither cookie nor storage is set.

  Residual risks (not proven in-browser):

  • Cookie missing, localStorage = vibrant: SSR/React first paint is Calm; script paints Vibrant tokens; a later useEffect swaps the tree. Flash, not a React hydration mismatch.
  • That same useEffect can overwrite cookie-backed SSR if storage disagrees.
  • <html> itself is not server-rendered with data-experience; the head script supplies it before body paint.

  There is still no automated hydration test.

  ────────────────────────────────────────

  Capability Parity

  Previously identified splits — fixed as presentation, not product forks:

  ┌────────────────────────┬────────────────┬───────────────────────────────────────────────┐
  │ Area                   │ Classification │ Evidence                                      │
  ├────────────────────────┼────────────────┼───────────────────────────────────────────────┤
  │ Deeds delete           │ Presentation   │ Shared handleDeleteDeed; both trees expose it │
  ├────────────────────────┼────────────────┼───────────────────────────────────────────────┤
  │ Grocery needed/got     │ Presentation   │ Shared filter / visible; both UIs             │
  ├────────────────────────┼────────────────┼───────────────────────────────────────────────┤
  │ Meals recipe → plan    │ Presentation   │ Shared addSuggestion; both UIs                │
  ├────────────────────────┼────────────────┼───────────────────────────────────────────────┤
  │ Notes search           │ Presentation   │ Shared notes.length > 2 threshold             │
  ├────────────────────────┼────────────────┼───────────────────────────────────────────────┤
  │ Calendar fasting empty │ Presentation   │ Same !fasting[selected] condition             │
  └────────────────────────┴────────────────┴───────────────────────────────────────────────┘

  No extra mutations, filters, or workflows exist only in Vibrant. Extra Home tiles (spent, water, dinner, prayer rhythm) are presentation of existing store data.

  Real correctness bug (Vibrant Home, not a capability split):

   src/routes/index.tsx lines 228-228

    const mealToday = meals[today];

  Meal plan keys are Mon-Dinner. The daily thread already uses  ${dayName}-Dinner . The Vibrant “Tonight” tile will almost always show “Not planned yet” even when dinner is planned. That is domain-data wrongness on Home, not a new feature.

  Tone mapping on secondary tabs is presentation, and several assignments are wrong (Notes → task; Deeds/Calendar/Reminders → prayer).

  Hardcoded ₹ on the spent tile matches existing Budget INR convention — presentation, not new capability.

  ────────────────────────────────────────

  Home / Today

  Shared Today() computes one data set, then CalmToday vs VibrantToday.

  Hero — Warm greeting, Hijri/Ramadan, next-prayer pill, HeroRing. Feels like a companion opening, not a KPI header.

  Prayer rhythm — Clear 5-column states (done / next / ahead). “View all →” is navigation, not new capability. Unlogged next prayer is highlighted correctly.

  Quick actions — Discoverable pill rail. Destinations are coarse (/deen not Quran tab, /me not Health, /budget not Quick entry).

  Bento — Salah is the primary tile; tasks/grocery secondary; dinner/spent/water as rows. Hierarchy is better than equal widgets. Dinner is still wrong (see above). Six tiles plus thread still reads partly as a glance dashboard.

  Daily thread — Same buildDailyThread as Calm. “Now” is heavier; completed recedes. Band tones are decorative, not semantic.

  Closing — Celebration vs Arabic verse is spiritually appropriate and restrained.

  Does Home feel like a daily companion rather than a dashboard? Mostly yes, with a leftover dashboard band (bento + dinner bug). It is no longer an office KPI stack.

  ────────────────────────────────────────

  Primary Spaces

  ┌────────┬────────────────────────────────────────────────────┬───────────────────────────┐
  │ Space  │ Personality                                        │ Shared grammar            │
  ├────────┼────────────────────────────────────────────────────┼───────────────────────────┤
  │ Deen   │ Twilight sapphire, countdown title, Arabic         │ PageHero + pills + figure │
  ├────────┼────────────────────────────────────────────────────┼───────────────────────────┤
  │ Budget │ Emerald, ₹ total as title                          │ Same                      │
  ├────────┼────────────────────────────────────────────────────┼───────────────────────────┤
  │ Me     │ Rose wellbeing                                     │ Same                      │
  ├────────┼────────────────────────────────────────────────────┼───────────────────────────┤
  │ Review │ Reflection aurora; body still shared insight cards │ Hero only                 │
  └────────┴────────────────────────────────────────────────────┴───────────────────────────┘

  They feel related, not identical. Review still has the most leftover “insight dashboard” body — acceptable for that space.

  Routing issue (both experiences): Review links to /deen?tab=salah, but Deen uses useState("today") and has no salah tab. Query-string navigation is broken there.

  ────────────────────────────────────────

  Secondary Tabs

  ┌───────────┬──────────────────────────┬────────────────────────────────────────────────┬──────────┬───────────────────┐
  │ Tab       │ Product correctness      │ Vibrant presentation                           │ Identity │ Scope             │
  ├───────────┼──────────────────────────┼────────────────────────────────────────────────┼──────────┼───────────────────┤
  │ Tasks     │ Same store/filters       │ Tonal lists, progress ring                     │ Clear    │ No extra features │
  ├───────────┼──────────────────────────┼────────────────────────────────────────────────┼──────────┼───────────────────┤
  │ Meals     │ Same plan/recipes        │ Board + Lucide empty                           │ Clear    │ No extra features │
  ├───────────┼──────────────────────────┼────────────────────────────────────────────────┼──────────┼───────────────────┤
  │ Grocery   │ Same generate/filter/log │ Tonal filters                                  │ Clear    │ No extra features │
  ├───────────┼──────────────────────────┼────────────────────────────────────────────────┼──────────┼───────────────────┤
  │ Kids      │ Same chores              │ Tonal cards; empty icon is CalendarDays (weak) │ Mostly   │ No extra features │
  ├───────────┼──────────────────────────┼────────────────────────────────────────────────┼──────────┼───────────────────┤
  │ Deeds     │ Same add/delete          │ Heart stream; tone wrongly prayer              │ Clear    │ No extra features │
  ├───────────┼──────────────────────────┼────────────────────────────────────────────────┼──────────┼───────────────────┤
  │ Calendar  │ Same events/fasting      │ Month board                                    │ Clear    │ No extra features │
  ├───────────┼──────────────────────────┼────────────────────────────────────────────────┼──────────┼───────────────────┤
  │ Notes     │ Same search/pin          │ Cards; tone wrongly task                       │ Clear    │ No extra features │
  ├───────────┼──────────────────────────┼────────────────────────────────────────────────┼──────────┼───────────────────┤
  │ Reminders │ Same prefs/engine        │ Tone wrongly prayer                            │ Clear    │ No extra features │
  └───────────┴──────────────────────────┴────────────────────────────────────────────────┴──────────┴───────────────────┘

  Empty states now use Lucide in a tonal well. That is Wave 2D presentation, not product expansion.

  ────────────────────────────────────────

  Shell / Navigation

  • One SPACES contract: Home / Deen / Budget / Me
  • Vibrant: Lucide dock, aria-current="page", min-w-[56px] on small screens, safe-area padding, pb-32 content clearance
  • Calm: glyph pills, unchanged routing
  • SubTabs: shared tab ids; Vibrant is a scrolling pill rail
  • ⌘K search, settings sheet, theme/experience switcher are shared
  • SubTabs are role="tab" without arrow-key roving tabindex
  • Settings Field/select chrome follows Experience

  Routing semantics are shared. Deep-link ?tab= works on Home, Budget, Me; not on Deen.

  ────────────────────────────────────────

  Visual Design System

  Coherent across Vibrant screens:

  • Type: Sora / Manrope under [data-experience="vibrant"]; Calm keeps Fraunces / Inter Tight
  • Color: 8 life-area OKLCH voices; space auroras; veedu+vibrant token override is scoped
  • Geometry: Large radii, pill controls, 42px-ish fields
  • Surfaces: tile-vivid, hero-aurora, nav-dock, empty-field
  • Icons: Lucide, stroke ~2.1–2.4
  • Motion: drift / sheen / bloom-in / press; global prefers-reduced-motion kill switch
  • States: empty / done / next / celebrate

  btn-tone is defined and never used.

  Category tokens live on :root (both experiences). Calm does not consume them unless data-tone="prayer|task|..." appears. Those attributes are Vibrant-only in current JSX.

  ────────────────────────────────────────

  Premium Quality

  Against the original feedback:

  ┌──────────────────┬───────────────────────────────────────────────────────────────────────────────────┐
  │ Feedback         │ Verdict                                                                           │
  ├──────────────────┼───────────────────────────────────────────────────────────────────────────────────┤
  │ Boring           │ No. Auroras, tonal tiles, and rhythm give a distinct personality.                 │
  ├──────────────────┼───────────────────────────────────────────────────────────────────────────────────┤
  │ Happy            │ Home opening is warmer (greeting, emoji, verse/celebration).                      │
  ├──────────────────┼───────────────────────────────────────────────────────────────────────────────────┤
  │ Color            │ Meaningful by life-area, not random. Some secondary screens over-use prayer/task. │
  ├──────────────────┼───────────────────────────────────────────────────────────────────────────────────┤
  │ Cute icons       │ Lucide orbs are personable, not childish. Empty-state emoji removal helped.       │
  ├──────────────────┼───────────────────────────────────────────────────────────────────────────────────┤
  │ Alive            │ Ambient sheen/float/halo; reduced-motion is respected.                            │
  ├──────────────────┼───────────────────────────────────────────────────────────────────────────────────┤
  │ Office dashboard │ Mostly gone. Home bento and Review cards are the remainder.                       │
  └──────────────────┴───────────────────────────────────────────────────────────────────────────────────┘

  ────────────────────────────────────────

  Restraint / Overdesign

  Premium-but-busy in places:

  • Home stacks hero + rhythm + actions + 6 tiles + thread + closer
  • Orbs, sheen, bloom-in, and specular strokes on many surfaces
  • backdrop-filter on app bar, dock, hero pills, sheets
  • Hover-only trash (opacity-0 group-hover) hides actions on touch
  • Emoji is mostly restrained (greeting, 100% tended, salah complete)

  Reduction that would help: fewer Home tiles, less sheen, always-visible destructive controls, correct dinner data.

  ────────────────────────────────────────

  Responsive

  Source-level, not device-lab:

  • Dock sizing for 320px is in the uncommitted shell change
  • Prayer grid grid-cols-5, bento grid-cols-2 sm:grid-cols-4
  • SubTabs / quick actions use bleed scroll
  • Meal table min-w-[560px] still requires horizontal scroll
  • Calendar month cells are tight at 320px (aspect-square + Hijri)
  • Sheets max-h-[86vh]; inputs min-h-9 / h-[42px]
  • HeroRing hidden below sm; % tended pill substitutes

  Gemini’s “CLS = 0, all viewports verified” is not independently verified.

  ────────────────────────────────────────

  Accessibility

  Strengths: aria-hidden on decorative orbs/emoji, aria-current on dock, aria-label on many icon buttons, focus-visible, reduced-motion kill switch, ProgressRing role="img".

  Gaps:

  • Tick is size-6 (24px) in both experiences — AA 2.5.8, not 44px
  • icon-btn size-7 / size-8 (28–32px)
  • Hover-only delete fails on touch and for keyboard users who don’t focus the control (focus-visible restore exists, hover does not)
  • SubTabs: no arrow-key pattern
  • Gemini’s “WCAG AAA on all 13 themes” is not evidenced. Hero text on aurora is likely AA for large type; AAA across every palette is not proven.
  • Color is not the sole state signal on rhythm (dot + label + time)

  ────────────────────────────────────────

  Performance

  Not a ship blocker; not as cheap as claimed.

  • CSS 202.57 kB (33.49 kB gzip)
  • Home client chunk 411.54 kB (128 kB gzip); Me 396.91 kB (recharts)
  • Infinite GPU animations (drift 16s, sheen 7.5s, float, halo, breathe) plus backdrop-filter + blur orbs + SVG grain
  • No new JS animation libraries
  • Logo animate-butterfly runs in both experiences (pre-existing)

  Mobile mid-range cost is real; reduced-motion users are protected.

  ────────────────────────────────────────

  Calm Regression

  Source-level: Calm layout, type, thread, and glyphs are preserved.

  • Fonts bound on :root, [data-experience="calm"]
  • Vibrant token override only for veedu + vibrant
  • Calm trees do not use hero-aurora / tile-vivid / nav-dock
  • Shared primitives (Field, Action, Sheet, SubTabs) branch on Experience

  Not proven by screenshot or browser. No Calm visual tests. Category tokens on :root are unused by Calm JSX today.

  ────────────────────────────────────────

  Scope Creep

  Wave 2D did not add engines, stores, routes, or workflows.

  Acceptable presentation: Lucide empties, dock min-width, prayer grid, ₹ prefix, “View all”.

  Not a new product: unused btn-tone. Dead CSS.

  ────────────────────────────────────────

  Maintainability

  Highest real risk: duplicated JSX (Tasks/Meals/Grocery/Kids/Deeds/Calendar/Notes/Reminders/Today). Shared handlers above the fork; two UIs below.

  Also: setFilter(f.id as any), unused btn-tone, VibrantGroceryRun vs GroceryRun twins, no UI tests, Experience tests that do not render.

  ────────────────────────────────────────

  Critical Findings

  1. Vibrant Home “Tonight” uses the wrong meal key — almost always empty. Product correctness on the flagship screen.
  2. Wave 2D is uncommitted — origin/main is still 2C.3B. Gemini’s “Wave 2D complete / no issues” is wrong.
  3. Hover-only destructive controls on touch lists.
  4. Deen ignores ?tab= — Review “Salah” deep links do nothing.
  5. Hydration was not cold-load tested in a browser in this audit; cookie path looks correct in source.

  ────────────────────────────────────────

  Required Fixes

  Before closing Phase 5:

  1. Resolve tonight’s dinner with the same  ${dayName}-Dinner  key as the daily thread.
  2. Commit Wave 2D (or drop it) so git matches the intended close state. Do not treat uncommitted polish as done.
  3. Make list delete/clear controls visible on touch (not hover-only).
  4. Wire Deen to useTab (or stop linking ?tab=salah).
  5. Empirically cold-load persisted Calm and Vibrant (cookie present and localStorage-only) and confirm no flash / no hydration warning.

  Should-fix, not blockers:

  • Stop mapping Notes/Reminders/Calendar/Deeds onto the wrong life-area tone
  • Remove or actually use btn-tone
  • Kids empty state: a family/child icon, not CalendarDays
  • Do not claim WCAG AAA

  ────────────────────────────────────────

  Phase 5 Recommendation

  Do not close Phase 5 as GREEN.

  Architecture, capability parity, Calm isolation (source), tests, and build are in good shape. Vibrant is a real second interpretation of one Firdaus, not a second app.

  Close after the dinner-key fix, an honest git state for Wave 2D, and a real first-paint check. Then it can move to GREEN without another full wave.

  Classification: AMBER — COMPLETE WITH TARGETED FIXES

  No files were modified. No commits or pushes were made.
