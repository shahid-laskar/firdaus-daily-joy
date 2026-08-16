# Phase 5 — Wave 0: Reconnaissance Critique
## Omissions, Flawed Assumptions, and Risks the First Report Missed

---

## How to read this document

The first report was a good structural survey. This document is not a repeat — it is a **corrections and gaps** document. Everything in here is either wrong in the first report, absent from the first report, or underweighted to the point of being dangerous for Wave 1 planning.

---

## SECTION A — Critical Architectural Flaws in the First Report

---

### A1. The Proposed `[data-experience]` Architecture Is Premature Overreach

**What the first report said:** Introduce `data-experience="calm" | "vibrant"` on `<html>`, add `useExperience()`, create `ExperienceProvider`, add `CalmHomePresenter`/`VibrantHomePresenter` split, add experience chooser in settings.

**Why this is wrong:**

This is *describing a second parallel rendering system inside one repository*. Look at what the first report's own blueprint proposes at step C:

```tsx
{experience === "vibrant" ? <VibrantHomePresenter data={data} /> : <CalmHomePresenter data={data} />}
```

That is not one product. That is two products sharing a shell. Every time a Calm route gets updated, the equivalent Vibrant presenter must also be updated — in parallel — forever. This is the definition of how one codebase silently becomes two.

**The real question the report did not ask:** How much of the Vibrant *Today tab* in `routes/index.tsx` actually diverges from the Calm version?

Actual answer (from the diff): **They share the same `buildDailyThread()` call, the same `groupThread()` function, the same `TABS` array, the same store reads, and the same domain hooks.** The only difference is the *rendering*: Calm uses `<TimeBand>` + `<div className="thread">` + `<ThreadItem>`. Vibrant uses `<BentoHeading>` + `<grid>` + `<ThreadCard>`.

This is a **presentational divergence inside a single `Today()` component**, not a reason to fork the entire route. It can be solved without a `CalmHomePresenter` / `VibrantHomePresenter` split.

---

### A2. The Report Calls the Vibrant `styles.css` "Additive" — It Is Not

**What the first report said:** "40+ new CSS utilities... `panel`, `btn-solid`, `btn-quiet`, `control`..."

**What the first report missed:**

The Vibrant `styles.css` does not only *add* new utilities. It **redefines existing ones** in ways that break Calm rendering.

Compare `display-xl` between the two repos:

| | Main (Calm) | Vibrant |
|---|---|---|
| `font-weight` | `400` | `700` |
| `font-size` | `clamp(2.2rem, 7vw, 3.4rem)` | `clamp(1.95rem, 6.4vw, 2.9rem)` |
| `line-height` | `1.02` | `1.06` |
| `letter-spacing` | `-0.03em` | `-0.035em` |
| `font-variation-settings` | `"SOFT" 40, "WONK" 1, "opsz" 100` | **absent** |

The Calm `display-xl` uses **variable font axes** (`SOFT`, `WONK`, `opsz`) that are **specific to Fraunces**. The Vibrant version removes them entirely because Sora is not a variable font and does not support those axes.

If you merge Vibrant's `styles.css` into the main repo *without* understanding this, you silently replace Calm's typographic personality — the optical-size-adjusted, soft, wonky editorial voice of Fraunces — with flat, geometric 700-weight type. The difference is not subtle. It is the entire visual identity of the Calm experience.

The same problem applies to `display-lg`, `title-md`, and `eyebrow`. They are all redefined with different values optimized for Sora/Manrope geometry rather than Fraunces/Inter character.

**This means:** You cannot ship a unified `styles.css` where `display-xl` has one definition. You need experience-scoped definitions.

---

### A3. `tile-vivid` and `tile-quiet` Are Plain CSS Classes, Not `@utility`

**What the first report said:** Listed them as part of the "40+ new CSS utilities".

**Why this matters:**

In Tailwind v4, `@utility` directives are registered in the CSS layer and can be used as class names in JSX *without the HTML needing them present in source*. They are purge-safe. Plain `.tile-vivid { }` declarations are **not** `@utility` — they are regular CSS classes that bypass Tailwind's layer system.

This matters because:
1. If you add a build-time purge/optimization step, `.tile-vivid` and `.tile-quiet` may be removed if no source file references them by the time they are scoped.
2. They set `--tone` and `--tone-soft` CSS custom properties inline on the element via `data-tone` attribute selectors. This is the *core* of the tonal propagation model. If these classes fail to load, the entire Bento surface language collapses — all tiles render with the fallback `--space-accent` tone uniformly.

The first report did not distinguish between `@utility` (framework-registered) and plain class rules (raw CSS). This distinction matters for the integration ordering.

---

### A4. The `status-chip` Class Has a Cascade Collision — Right Now

This is not a future risk. It is a current fact.

The Vibrant `styles.css` declares `.status-chip` **twice** — once at line 291 (the original Calm definition, verbatim) and again at line 1379 (the Vibrant redefinition):

```css
/* Line 291 — inherited from Calm */
.status-chip { color: var(--ink-soft); background: color-mix(in oklab, var(--rule) 45%, transparent); }
.status-chip[data-tone="urgent"] { color: var(--foreground); background: var(--space-accent-soft); }

/* Line 1379 — Vibrant override */
.status-chip { padding: 0.18rem 0.6rem; font-weight: 700; }
.status-chip[data-tone="urgent"] {
  color: oklch(0.995 0.008 70);
  background: linear-gradient(140deg, ...);
}
```

This works in the Vibrant donor repo because only one version of `styles.css` exists. The moment you merge the CSS into the main repo, you get both definitions and the specificity cascade becomes ambiguous and environment-dependent.

The `Status` component in `phase4.tsx` (used heavily in Ramadan Mode, Hifz sessions, and the Calm Thread) reads `status-chip[data-tone]`. **The Vibrant override makes `status-chip[data-tone="urgent"]` render a glowing gradient background regardless of which experience is active.** Calm loses its quiet status chips even if no Vibrant components are on screen.

---

### A5. The `display-xl` `font-variation-settings` Are Applied to Sora — Which Ignores Them Silently

Continuing from A2: in the Vibrant repo, `--font-display` points to Sora. Sora has no `SOFT`, `WONK`, or `opsz` axes. So even if those settings leaked into Vibrant's CSS, the browser silently ignores them.

But here is the risk in the other direction: if Main Firdaus's `display-xl` is used while Vibrant's font definition is active, the `font-variation-settings` fire against Sora and do nothing — the text renders at default Sora weight 700 rather than at the carefully crafted Fraunces optical-size-adjusted weight 400. You get the wrong font *and* wrong weight settings silently applied and silently discarded.

---

## SECTION B — Integration Risks the First Report Completely Missed

---

### B1. The Store Cloud-Sync Will Spread Experience Preference to All Devices Unexpectedly

The `writeStore()` in `src/lib/store.ts` (lines 33–50) does the following on every write:

```typescript
supabase.auth.getSession().then(({ data: { session } }) => {
  if (session?.user) {
    supabase.from("user_data").upsert({ user_id, key, value, updated_at })
  }
});
```

**Any key written with `writeStore()` is synced to Supabase if the user is logged in.**

If Experience preference is stored using `useStore("experience", "calm")` with the `veedu:` prefix, switching to Vibrant on mobile will immediately push `{ key: "experience", value: "vibrant" }` to the cloud and pull it to desktop on next page load.

This is often desirable — but the first report proposed experience as user preference without acknowledging that the sync mechanism exists, is automatic, and has no exclusion list. If experience is instead stored using the separate `veedu.theme` key (like color theme), it will *not* sync to cloud because `ThemeProvider` uses `window.localStorage` directly, not `writeStore`. You now have two preference systems with different persistence models.

**Decision required:** Should experience preference sync across devices or be per-device? This is a product decision, not a technical one, and it is completely missing from the first report.

---

### B2. The `ThemeProvider` Lives Outside the Experience System — Adding Experience Requires Surgery, Not Addition

The first report proposes a `useExperience()` hook alongside the existing `useTheme()` hook. But `ThemeProvider` in `src/lib/theme-provider.tsx` directly writes to `document.documentElement.dataset["theme"]`. Any experience provider also needs to write `document.documentElement.dataset["experience"]` — and needs to do so *on the same element*, coordinated, *before the first paint*, to avoid a flash.

Currently the bootstrap sequence is:
1. `RootShell` renders `<html lang="en">` with no `data-theme` or `.dark`.
2. `ThemeProvider` mounts and reads `localStorage` in a `useEffect` — this runs *after* paint.
3. `applyToDocument()` sets `data-theme` and `.dark`.

This means there is already a flash-of-wrong-theme (FOWT) problem on every cold load for non-default themes. Adding experience to this sequence doubles the problem: you now have flash-of-wrong-experience AND flash-of-wrong-theme, potentially simultaneously, potentially with the wrong font rendering for one frame.

The first report recommends adding experience but does not address the hydration timing problem at all. This is one of the highest-impact UX risks in the integration.

---

### B3. The `@utility` Definitions in `styles.css` Are **Global by Default in Tailwind v4**

Tailwind v4 `@utility` classes are registered globally, not scoped. When you add Vibrant's `@utility panel { }`, `@utility btn-solid { }`, `@utility tab-rail { }` to the main repo's `styles.css`, they are available to every component in the application regardless of experience state.

This is intentional for Vibrant — those classes are designed to work everywhere. But for Calm:
- If a developer uses `className="panel"` in a Calm component by mistake (because it looks useful and IntelliSense shows it), they will get Vibrant aesthetics in a Calm context with no error.
- There is no mechanism to warn that a utility belongs to a specific experience.

The first report called these "highly reusable" without noting that their global availability in a Calm context is a UX correctness risk without governance.

---

### B4. The `hifz-scheduler.ts` Regression Is a Data Integrity Risk, Not Just a Logic Issue

The first report noted this as "Regressed Business Logic" but did not explain *what was actually removed*.

In Main Firdaus (the real repo), `rhythm-engine.ts` calls `generateHifzRevisionQueue()` to compute which Hifz items are due today. This function sorts items, applies spaced-repetition logic, and returns a `dueToday` list.

In the Vibrant donor repo, this import was **removed** from `rhythm-engine.ts`. Instead, the engine reads `h.due` directly from `HifzItem` — a new field that the engine no longer computes itself. `due?: boolean | undefined` is now computed "at runtime" according to the type comment — but by *whom*? The donor repo contains no implementation that sets `.due` on `HifzItem` objects coming from the store.

This means: in the Vibrant donor repo, the Hifz revision queue is **silently broken**. No items will ever surface as due unless something else sets `.due = true` before they reach the engine. If you merge the Vibrant `rhythm-engine.ts` into main, you silently break Hifz scheduling for all users who are logged items to the store.

The first report listed this as "discard" without explaining the severity. It should be listed as **data integrity regression — do not merge under any circumstances**.

---

### B5. The `category voices` CSS Token Block Is Declared in `:root` in Vibrant — It Leaks Everywhere

In Vibrant's `themes.css`, the category voice tokens are declared in a bare `:root` block (line 1828):

```css
:root {
  --cat-prayer: oklch(0.585 0.095 205);
  --cat-task: oklch(0.635 0.16 18);
  ...
}
```

This is theme-agnostic by design — "no named theme declares these, so they apply everywhere." The Vibrant doc comment says this intentionally.

But in Main Firdaus, these tokens do not exist at all. `thread-node[data-active]` uses `--space-accent` for the active dot. The `Calm` Thread does not use `--cat-prayer` or `--cat-task`.

If you add these tokens to the main repo's `:root`, they do nothing harmful to Calm *unless* someone starts using them in shared components. But since the Vibrant CSS utilities (`panel`, `row-item`, etc.) reference `--tone` which defaults to `--space-accent`, and `--space-accent` is still the correct Calm token, the category voice tokens are inert in Calm unless explicitly activated via `data-tone`.

**This is safe to add globally.** The first report was right that these are reusable. It missed the nuance that they are safe in Calm without activation. No scoping required.

---

### B6. `phase4.tsx` Is Shared and Unchanged — But the First Report Implied It Was Vibrant-Exclusive

The first report did not mention `src/components/veedu/phase4.tsx` at all. This is significant because:

- `phase4.tsx` contains `ContextHero`, `TimeBand`, `ProgressLine`, `Disclosure`, `HeroFact`, and `Status` — the Calm presentation primitives used in the Thread, Ramadan Mode, and Hifz.
- The Vibrant donor repo **ships `phase4.tsx` completely unchanged** (diff exits 0).
- The Vibrant `deen/modules.tsx` and `deen/ramadan.tsx` still import from `phase4.tsx` directly.
- `status-chip` (from `phase4.tsx`) is still in active use in the Vibrant donor repo.

This means Vibrant did not replace `phase4.tsx` — it extended around it. `phase4.tsx` is a **shared layer** that already serves both Calm and Vibrant rendering. The first report's architectural model should have named `phase4.tsx` explicitly as the existing shared layer, because any new experience architecture needs to integrate with it — not build a parallel system alongside it.

---

### B7. `DeenHero` Was Removed in Vibrant Routes But Still Exported in Vibrant `deen/modules.tsx`

The Vibrant `routes/deen.tsx` removed the `<DeenHero />` import and replaced it with `<PageHero>`. But `DeenHero` (line 84 in the Vibrant `deen/modules.tsx`) is still exported from the module — it is now a dead export in the donor repo.

This is not a functional problem. But it is an authoring signal: the donor Lovable generation left partial work. The component exists, was used in the old Calm `deen.tsx`, was replaced in Vibrant's `deen.tsx`, but was not cleaned up in `deen/modules.tsx`. Any integration must decide: does `DeenHero` get removed? Repurposed? Or kept as the Calm deen header that `deen.tsx` conditionally renders based on experience?

---

## SECTION C — Missing Omissions in the First Report

---

### C1. No Analysis of What Happens to Tabs (`Today`, `Tasks`, `Meals`, `Grocery`, `Kids`, `Deeds`, `Calendar`, `Notes`, `Reminders`) Under Experience Switch

The first report described the experience switch at the `Today` tab level. It did not address that `HomePage` has **nine tabs** (Tasks, Meals, Grocery, Kids, Deeds, Calendar, Notes, Reminders). None of the Vibrant donor repo changes touch those sub-tabs — they are identical in both repos. Only the `Today` tab differs.

This raises a real question: if a user is in Vibrant experience and switches to the `Tasks` tab, they see the `<Tasks />` module — which uses Calm-era form controls and list styling. Is this acceptable in Vibrant?

The first report implicitly assumes the Bento layout is only the `Today` tab. But this needs to be stated explicitly, because the alternative (applying Vibrant styling to Tasks, Meals, Grocery, etc.) is a much larger scope.

---

### C2. No Analysis of the Onboarding Route

`routes/onboarding.tsx` is identical between both repos (diff exits 0). The first report did not mention this. The onboarding screen is the **first** screen new users see. If a Vibrant experience is introduced, the question of which experience onboarding presents is product-critical and was not even acknowledged.

---

### C3. The `ThemeSwitcher` Shows 13 Themes — None of Them Are "Vibrant"

In `src/components/veedu/theme-switcher.tsx`, the picker maps over `themes` from `themes.ts`. All 13 themes (Veedu, Noir, Editorial, Meridian, etc.) are color palette themes for the **Calm experience**. The swatches shown in the picker are Calm experience swatches.

If Vibrant is introduced as a separate experience axis, the `ThemeSwitcher` UI needs to be redesigned — but the first report proposed adding Vibrant to the picker implicitly. It did not acknowledge that the current picker has no dimension for experience, only for palette. The interaction model (experience selector vs. palette selector, and whether they interact) was not defined.

---

### C4. The `theme-color` Meta Tag Is Hardcoded

`__root.tsx` line 88:
```tsx
{ name: "theme-color", content: "#fbf9f5" }
```

This is the Calm paper color. Vibrant's background is `oklch(0.982 0.017 62)` which converts approximately to `#fff6f0` — and the Vibrant donor repo already changed this. If experience switches dynamically client-side, the `theme-color` meta tag must also update dynamically (via `document.querySelector('meta[name="theme-color"]')` in the experience provider). The first report did not mention this at all.

---

### C5. The `font-cursive: "Great Vibes"` Font Is Calm-Specific, Used in Auth Route

The Calm `__root.tsx` loads *Great Vibes* via Google Fonts. The Vibrant `__root.tsx` dropped it (the font link was replaced entirely). The `auth.tsx` Vibrant diff shows the logo now uses `font-cursive text-3xl` — which means it *expects* Great Vibes to be loaded.

In the Vibrant donor repo, Great Vibes was removed from the font link, but `font-cursive` is still used in the auth route. This is a bug in the donor repo: the auth branding would render in the browser's default cursive font (usually a system fallback like Comic Sans or Brush Script). This was not caught by the first report.

---

## SECTION D — The Two-Codebase Risk: Where It Actually Lives

The first report correctly identified the macro risk ("don't make two codebases") but misidentified where the pressure comes from. It is not from having two CSS files or two theme token blocks. It comes from **three specific patterns**:

### D1. The Presenter Split Pattern

If `routes/index.tsx` becomes:
```tsx
{experience === "vibrant" ? <VibrantHomePresenter /> : <CalmHomePresenter />}
```
...then every future change to the Today tab must be made in two places simultaneously. This is the two-codebase smell. It should be avoided.

**The real architecture:** One `Today()` function that reads experience and conditionally renders its *items* into either a thread container or a bento grid. The data layer (all the `useStore`, `buildDailyThread`, `useMemo`) is not duplicated — only the JSX wrapper that arranges the items.

### D2. The Domain Re-derivation Pattern in Route Files

Vibrant's `routes/deen.tsx`, `routes/budget.tsx`, `routes/me.tsx`, and `routes/review.tsx` each compute domain values inline for `PageHero`. The first report noted this as "functional duplication" — but it is more dangerous than that.

When the main repo's engine logic is updated (say, prayer time computation changes), the inline derivation in the route file may diverge silently. You now have two places computing "how many prayers were logged today" with potentially different filters. The first report underweighted this.

**The real architecture:** The `PageHero` data should come from the same hooks that the rest of the page already uses — not from new inline calculations in the route component.

### D3. The CSS Class Loyalty Problem

Vibrant's new CSS utilities are designed to work with Calm tokens. `panel` uses `var(--space-accent)`. `btn-solid` uses `var(--primary)`. This is good — it means Vibrant utilities can coexist with Calm themes.

But several Vibrant utilities have *hardcoded* OKLCH values that are not token-referenced:

- `hero-aurora` gradient: hardcoded `oklch(0.88 0.14 82)`, `oklch(0.7 0.17 350)`, `oklch(0.6 0.14 190)`, `oklch(0.7 0.17 40)`, etc.
- `tile-hero`: hardcoded `oklch(0.72 0.165 42)`, `oklch(0.62 0.15 26)`, `oklch(0.5 0.11 12)`.
- `hero-aurora[data-hero="deen"]`: hardcoded dark blue/indigo gradient.
- `hero-aurora[data-hero="budget"]`: hardcoded green/teal gradient.

These hero colors are **independent of the color theme system**. If a user selects `Noir` or `Obsidian` as their palette theme in Vibrant experience, the `PageHero` remains apricot-orange (Home), deep blue (Deen), green (Budget), etc. The hero gradients do not respond to theme tokens.

This is fine as a design decision — the hero colors are experience-specific, not theme-specific. But it means Vibrant experience is **partially theme-independent**: page headers ignore the user's palette choice. The first report did not raise this, and it should be an explicit product decision.

---

## Summary: What Should Change in the Integration Plan

| Area | First Report | Correct Position |
|---|---|---|
| **Presenter split** | Proposed `CalmHomePresenter`/`VibrantHomePresenter` | Do not split; parametrize the container inside `Today()` |
| **CSS utilities scope** | Called them "reusable" for both | Most are safe globally; `display-xl`/`display-lg`/`title-md` must be experience-scoped |
| **`status-chip` conflict** | Not mentioned | Active cascade collision — must be resolved before merge |
| **`hifz-scheduler` regression** | Listed as "discard" | Data integrity regression — do not merge under any circumstances; explain severity |
| **`phase4.tsx`** | Not mentioned | Is the existing shared layer; must be named and treated as foundational |
| **Experience persistence** | Not addressed | Requires explicit decision: sync to cloud or per-device? |
| **FOWT on cold load** | Not addressed | Hydration timing for `data-experience` needs inline script, same as color-theme flash |
| **Font `font-variation-settings`** | Not mentioned | Calm display utilities break silently if Vibrant font definitions replace them |
| **`tile-vivid`/`tile-quiet`** | Called `@utility` | Are plain `.class` rules — different purge/layer behavior |
| **Hero gradient hardcoding** | Not mentioned | Hero colors are theme-independent — explicit product decision needed |
| **`theme-color` meta tag** | Not mentioned | Must update dynamically when experience switches |
| **Great Vibes font removal** | Not mentioned | Bug in donor repo — auth uses `font-cursive` but the font was removed |
| **Onboarding route** | Not mentioned | Needs explicit experience assignment decision |
