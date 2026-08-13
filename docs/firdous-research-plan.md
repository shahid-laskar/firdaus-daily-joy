# Firdous — Product, Feature Gap & Optimization Research Report

---

## Executive Summary

Firdous is a **beautifully designed, offline-first family + deen + personal wellbeing companion** built with TanStack Start (React 19, Vite 8), Supabase for cloud sync, and localStorage as the primary data layer. It targets Muslim families who want one quiet, private space for daily life — prayer, household, money, and self-care.

**What Firdous gets right:**
- Exceptional design philosophy: calm, paper-like aesthetic with 13 theme variations
- Intentionally minimal — no gamification bloat, no social features
- Offline-first with simple cloud sync via Supabase `user_data` table
- Smart cross-module connections already exist (meal plan → grocery list generation, prayer times on Home)
- Quran reader with embedded Arabic text, bookmarks, and reading session logging
- Comprehensive deen module (Salah, Quran, Dhikr/Tasbih, Duas, Hifz, Fasting, Qibla)

**Critical gaps:**
1. **No data persistence beyond localStorage** — all data is fragile (browser clear = data loss)
2. **No recurring items** — tasks, habits, routines are all one-shot or manual
3. **Extremely limited data feedback** — users log extensively but get almost no trends, insights, or summaries back
4. **Calendar is trivially simple** — no time support, no recurring events, no connection to other modules
5. **Notes is a single textarea** — no multiple notes, no organization
6. **Kids module is shallow** — chores only, no routines, no progress tracking across time
7. **No notification/reminder system** — critical for a daily-use product
8. **Budget has no spending history** — expenses exist for current month only in the UI

**Product thesis:** Firdous's unique value is the **integration of deen into daily life management** — not as a bolted-on feature, but as the organizing principle. No other product on the market combines prayer tracking, Quran progress, family coordination, household operations, and personal wellness in a single coherent experience. The opportunity is to make these modules **talk to each other** intelligently.

---

## Product Model — What Firdous Currently Is

### Architecture

| Layer | Technology | Notes |
|-------|-----------|-------|
| Framework | TanStack Start + React 19 + Vite 8 | SSR-capable, file-based routing |
| Styling | Tailwind CSS v4 + custom CSS vars | 13 themes via CSS custom properties |
| State | `localStorage` with custom `useStore` hook | Reactive, hydration-safe |
| Backend | Supabase (auth + single `user_data` table) | Simple key-value cloud sync |
| Prayer times | `adhan` npm package | Supports multiple calculation methods + madhabs |
| Routing | 5 routes: `/`, `/deen`, `/budget`, `/me`, `/auth`, `/onboarding` |
| Deployment | Netlify |

### Navigation Structure

**Bottom bar (4 spaces):** Home → Deen → Budget → Me

**Home sub-tabs:** Today, Tasks, Meals, Grocery, Kids, Deeds, Calendar, Notes

**Deen sub-tabs:** Today, Quran, Dhikr, Duas, Hifz, Fasting, Qibla

**Budget sub-tabs:** Overview, Quick entry, Zakat

**Me sub-tabs:** Self care, Habits, Journal, Health, Cycle (female-only)

### Data Model (localStorage keys)

| Key | Type | Module |
|-----|------|--------|
| `profile` | `{ name, city, gender, lat, lng, madhab, method }` | Global |
| `account` | `{ email } | null` | Auth |
| `tasks` | `Task[]` with id, title, list, time, done, date | Home/Tasks |
| `meals` | `Record<"Day-Slot", dishName>` | Home/Meals |
| `recipes` | `{ id, name, items }[]` | Home/Meals |
| `grocery` | `{ id, name, got }[]` | Home/Grocery |
| `kids` | `{ id, name, age, chores[] }[]` | Home/Kids |
| `deeds` | `{ id, who, what, date }[]` | Home/Deeds |
| `events` | `{ id, title, date }[]` | Home/Calendar |
| `notes` | `string` (single textarea) | Home/Notes |
| `salah` | `Record<date, Record<prayerId, "ontime"|"late">>` | Deen |
| `quran-bookmarks` | `string[]` | Deen/Quran |
| `quran-log` | `{ id, surah, range, mins, date }[]` | Deen/Quran |
| `quran-translation` | `boolean` | Deen/Quran |
| `hifz` | `{ id, surah, pct }[]` | Deen/Hifz |
| `fasting` | `Record<date, "obligatory"|"voluntary">` | Deen/Fasting |
| `expenses` | `Expense[]` with amount, category, note, date | Budget |
| `limits` | `Record<category, number>` | Budget |
| `zakat` | `{ cash, gold, business, debts }` | Budget |
| `checkins` | `Record<date, moodId>` | Me/Self care |
| `rituals` | `Record<date, string[]>` | Me/Self care |
| `habits` | `{ id, name, days[] }[]` | Me/Habits |
| `journal` | `Record<date, { mood, text }>` | Me/Journal |
| `health` | `Record<date, { water, weight, sleep }>` | Me/Health |
| `workouts` | `{ id, name, detail, date }[]` | Me/Health |
| `cycle` | `{ last, length }` | Me/Cycle |

---

## Existing Feature Inventory

| Feature | Current State | Completeness | UX Quality |
|---------|--------------|-------------|------------|
| **Salah tracking** | Full — 5 prayers, on-time/late, 7-day heatmap | ✅ Implemented | High — beautiful consistency viz |
| **Prayer times** | Full — adhan library, multiple methods/madhabs | ✅ Implemented | High — accurate, configurable |
| **Next prayer countdown** | Full — on Home + Deen hero | ✅ Implemented | High — signature feature |
| **Quran reader** | 3 surahs only (Fatihah, Ikhlas, Falaq) | ⚠️ Partial | Medium — beautiful but tiny corpus |
| **Quran reading log** | Full — surah, ayah range, minutes | ✅ Implemented | Medium — no trends/summaries |
| **Quran bookmarks** | Full | ✅ Implemented | Good |
| **Dhikr/Tasbih** | Full — 4 phrases, 3 targets, ring UI, haptic | ✅ Implemented | High — beautiful interaction |
| **Duas** | 4 hardcoded duas, read-only | ⚠️ Partial | Medium — no user duas |
| **Hifz** | Surah + percentage tracking | ⚠️ Partial | Low — crude ±10% controls |
| **Fasting** | 28-day grid, voluntary/obligatory toggle | ✅ Implemented | Good — clever two-tap mechanic |
| **Qibla** | SVG compass with device orientation API | ✅ Implemented | Good |
| **Daily verse** | 3 verses rotating by day-of-month | ⚠️ Partial | Medium — very small corpus |
| **Tasks** | Full — lists, filters, time, done/undone | ✅ Implemented | Good |
| **Meal planning** | 7×3 grid, recipe autocomplete | ✅ Implemented | Good — practical |
| **Recipes** | Name + comma-separated ingredients | ✅ Implemented | Low — no quantities, no instructions |
| **Grocery** | Checklist + "From meal plan" generation | ✅ Implemented | High — smart cross-module link |
| **Kids** | Name, age, checklist of chores | ⚠️ Partial | Low — no persistence across days |
| **Deeds** | Who + what log | ✅ Implemented | Medium — logs but no feedback |
| **Calendar** | Event + date, sorted list | ⚠️ Partial | Low — no time, no recurrence |
| **Notes** | Single textarea | ⚠️ Partial | Low — one note for everything |
| **Budget overview** | Monthly total, per-category meters | ✅ Implemented | Good |
| **Quick expense entry** | Amount + category + note | ✅ Implemented | Good — fast workflow |
| **Budget categories** | Custom categories with monthly limits | ✅ Implemented | Good |
| **Zakat calculator** | Cash + gold + business - debts, 2.5% | ✅ Implemented | Good — clear, educational |
| **Self-care check-in** | 5 mood states, 4 daily rituals | ✅ Implemented | High — gentle, thoughtful |
| **Habits** | Name, 7-day toggle grid, streak count | ✅ Implemented | Good |
| **Journal** | Daily text + mood, past entries list | ✅ Implemented | Good |
| **Health** | Water (8 glasses), weight, sleep, workouts | ✅ Implemented | Good |
| **Cycle tracking** | Last period date, cycle length, next prediction | ✅ Implemented | Good — respectful, private |
| **Home/Today** | Thread-style daily summary with progress meters | ✅ Implemented | High — signature UX |
| **Authentication** | Email/password, magic link, password reset | ✅ Implemented | Good |
| **Cloud sync** | Supabase key-value upsert on write | ✅ Implemented | Basic — no conflict resolution |
| **Onboarding** | Name, city, gender | ✅ Implemented | Good |
| **Settings** | Name, city, coordinates, madhab, method, themes | ✅ Implemented | Good |
| **Themes** | 13 themes with light/dark modes | ✅ Implemented | Excellent |
| **Offline support** | localStorage-first, online indicator | ✅ Implemented | Good |
| **Friday reminder** | Surah Al-Kahf mention on Fridays | ✅ Implemented | Nice touch |

---

## UX / Product Gaps

### 1. Excessive Manual Entry, No Recurring Patterns

**Problem:** Nearly everything in Firdous is one-shot. There is no concept of recurring tasks, recurring events, or recurring routines.

- A parent adding "Bath" to a kid's chores has to re-add it every day
- Tasks have no recurrence (daily, weekly, etc.)
- Meal plans don't carry forward week to week
- Calendar events can't repeat
- Health logging (weight, sleep) has no pre-fill from yesterday

**Impact:** High. This is the single biggest friction point. It turns Firdous from a system into a logbook.

### 2. No Trends, Insights, or Feedback Loops

**Problem:** Users log salah, expenses, moods, habits, health metrics, and journal entries but receive almost nothing back. The only feedback mechanisms are:
- 7-day salah heatmap
- Habit streak count
- Budget category meters for current month

Missing:
- Weekly/monthly salah consistency trends
- Spending trends over time (month-over-month comparison)
- Mood patterns correlated with time
- Weight/sleep/water trends
- Quran reading pace
- Hifz progress over time
- Habit completion rates
- Weekly review / summary

### 3. Calendar is Extremely Primitive

**Problem:** The calendar is just an event list with name + date. No times. No visual calendar. No recurring events. No connection to tasks, meals, or deen events. No Islamic calendar overlay.

### 4. Notes is a Single Shared Textarea

**Problem:** `notes` is a single string in localStorage. One "family scratchpad." No multiple notes. No titles. No dates. No search. This is adequate for a pinned note but not for any real note-taking.

### 5. Kids Module is Surface-Level

**Problem:** Kids only have name + age + a flat chore checklist that doesn't reset daily. No routines, no activity history, no chore rotation, no progress tracking.

### 6. No Notifications or Reminders

**Problem:** For a daily-life app, there are zero push notifications, browser notifications, or reminder systems. Prayer times are displayed but never trigger reminders. Tasks have optional times but no alerts.

### 7. Quran Reader Has Only 3 Surahs

**Problem:** The embedded Quran reader contains only Al-Fatihah (1), Al-Ikhlas (112), and Al-Falaq (113). This is insufficient for real Quran reading. The reading log and bookmarks exist but the actual content is a stub.

### 8. No Search Anywhere

**Problem:** No search across any module — not tasks, not notes, not recipes, not journal entries, not expenses.

### 9. No Data Export or Backup

**Problem:** All data lives in localStorage. No export to JSON/CSV. No manual backup. No import from other tools.

### 10. Fragmented Workflows Between Modules

**Problem:** While the meal-plan-to-grocery connection exists, most modules operate in complete isolation:
- Tasks and Calendar don't connect
- Budget doesn't know about grocery spending
- Kids activities don't appear in Calendar
- Habits and Self-care don't cross-reference

---

## Cross-Module Opportunities

### High-Value Connections (Evidence-Based)

| Connection | Description | Current State | Value |
|-----------|-------------|---------------|-------|
| **Meals → Grocery** | Auto-generate grocery list from this week's meal plan | ✅ Already exists | High — working and useful |
| **Prayer → Home** | Next prayer shown on Home Today thread | ✅ Already exists | High |
| **Tasks → Calendar** | Tasks with dates should appear on Calendar; calendar events should surface as tasks | 🔴 Missing | High |
| **Meals → Home** | Today's dinner shown on Home Today thread | ✅ Already exists | Good |
| **Grocery → Budget** | "Mark as bought" on grocery could optionally prompt expense entry | 🔴 Missing | Medium |
| **Kids → Calendar** | Kid activities/appointments should appear on family calendar | 🔴 Missing | Medium |
| **Habits → Home** | Today's habit completion status on Home thread | 🔴 Missing | Medium |
| **Health → Home** | Water/sleep summary on Home thread | 🔴 Missing | Low-Medium |
| **Fasting → Calendar** | Fasting days visible on calendar view | 🔴 Missing | Low |

### Do NOT Build

| Connection | Reason |
|-----------|--------|
| **AI meal suggestions** | Over-engineered for current user base; manual meal planning is preferred |
| **Budget → Deen "sadaqah" prompts** | Feels intrusive; users know when to give |
| **Auto-suggest habits from deen data** | Crosses personal boundary; let users choose |
| **Social/family sharing of journal** | Journal is explicitly private — keep it that way |

---

## Competitive / Category Research

### Islamic Apps
| App | Strength | What Firdous Can Learn |
|-----|---------|----------------------|
| **Muslim Pro** | Prayer times reliability, wide adoption | Firdous's `adhan` library is equally accurate |
| **Tarteel** | AI Quran recitation correction | Too specialized; Firdous should link to external Quran apps rather than rebuild |
| **Everyday Muslim** | Social accountability, group tracking | Family-level accountability (not social) could work for Firdous |

### Household/Family Apps
| App | Strength | What Firdous Can Learn |
|-----|---------|----------------------|
| **Wimely** | Meal plan → auto grocery, drop-off coordination | Firdous already has meal→grocery; coordination features are valuable |
| **AnyList** | Best-in-class grocery + recipe management | Firdous recipes need quantities and instructions |
| **Maple** | Generous free tier, full suite | Validates that integrated family apps have market demand |
| **FamilyWall** | Shared calendar, family messaging | Shared calendar is critical; messaging is out of scope |

### Productivity/Wellness
| App | Strength | What Firdous Can Learn |
|-----|---------|----------------------|
| **Todoist** | Recurring tasks, natural language input | Recurring items are essential for daily-use products |
| **Streaks** | Clean habit tracking with completion rings | Firdous habit UI is already comparable |
| **Apple Health** | Trend charts, weekly summaries | Users need feedback from logged data |

### Key Insight
No competitor combines **deen + family + household + personal wellness** in one app. This is Firdous's structural advantage. The closest would be using Muslim Pro + Cozi + Todoist + Apple Health — four separate apps. Firdous can win by being **the one app a Muslim family opens every morning**.

---

## Differentiation Opportunities

Firdous's potential product thesis:

> **"The daily operating system for a Muslim family — where deen, household, and personal growth live together as naturally as they do in real life."**

This is not a prayer app with a to-do list, or a to-do list with prayer times. It's a **coherent daily companion** where:
- Your morning starts with Fajr time and today's tasks in one view
- Your meal plan automatically generates your grocery list
- Your kids' routines appear alongside your own
- Your spending, health, and spiritual consistency are all tracked in one place
- Your Friday is different from your Monday — the app knows this

No competitor achieves this integration.

---

## Quick Wins (High Impact, Low Complexity)

| # | Feature | Problem Solved | Complexity | Impact |
|---|---------|---------------|------------|--------|
| 1 | **Multiple notes** | Single textarea is too limiting | Low | High |
| 2 | **Daily kid chore reset** | Chores don't reset — parent re-adds daily | Low | High |
| 3 | **Budget spending history view** | Can't see past months' expenses | Low | Medium |
| 4 | **Habit progress bar on Home thread** | No habit visibility on Today view | Low | Medium |
| 5 | **More daily verses** | Only 3 verses rotating | Low | Low-Medium |
| 6 | **Calendar time support** | Events have no time — just date | Low | Medium |
| 7 | **Data export (JSON)** | Risk of data loss, no portability | Low | Medium |
| 8 | **Meal plan "Copy last week"** | Must re-enter meals every week | Low | High |
| 9 | **Task recurrence (daily/weekly)** | Most common manual re-entry | Medium | High |
| 10 | **Browser notification for prayers** | No reminders at all | Medium | High |

---

## Strategic Features (Larger Opportunities)

| # | Feature | Description | Complexity | Strategic Value |
|---|---------|-------------|------------|----------------|
| 1 | **Weekly Review** | Sunday summary: prayers logged, tasks done, spending, mood, habits — one view of how the week went | Medium | Very High — retention |
| 2 | **Recurring Items Engine** | Tasks, events, kid chores, routines — anything can repeat daily/weekly/monthly | Medium | Very High — reduces friction |
| 3 | **Unified Calendar View** | Visual calendar showing tasks, events, meals, fasting, Islamic dates together | Medium | High — information architecture |
| 4 | **Health Trends** | Weight, sleep, water charts over 30/90 days | Medium | Medium-High |
| 5 | **Family Members Model** | Proper entity for family members (not just kids) — shared responsibility | High | High — enables coordination |
| 6 | **Expanded Quran Content** | Either embed a larger corpus or integrate an external Quran API | Medium-High | Medium — Quran apps exist |
| 7 | **Notification System** | Prayer reminders, task due alerts, fasting reminders (Mondays/Thursdays) | Medium | Very High |
| 8 | **Islamic Calendar Integration** | Hijri dates, upcoming Islamic events (Ramadan, Eid, etc.) | Medium | Medium-High |
| 9 | **Smart Home Thread** | Home Today thread shows contextual items: overdue tasks, budget warnings, habit streaks, upcoming events | Medium | High — signature UX improvement |
| 10 | **Search** | Full-text search across tasks, notes, journal, recipes, expenses | Medium | Medium |

---

## Features to Avoid

| Feature | Why Avoid |
|---------|----------|
| **Social features / family sharing** | Adds massive complexity; Firdous is private-first |
| **AI-powered suggestions** | Premature; not enough user base or data |
| **Gamification (points, badges, leaderboards)** | Contradicts the calm, intentional philosophy |
| **Full Quran app** | Tarteel, Quran.com are better — link to them instead |
| **Chat / messaging** | WhatsApp exists; not Firdous's problem to solve |
| **Photo uploads** | Storage complexity; not core to the product |
| **Complex budgeting (accounts, transfers)** | Firdous is for simple expense tracking, not accounting |
| **Fitness/exercise programs** | Apple Health, Strava exist; Firdous tracks basic movement |
| **Multi-language UI** | Important eventually but premature optimization now |
| **Recipe import from URLs** | Nice to have but complex scraping; manual entry works |

---

## Prioritized Feature Matrix

| Feature | User Value | Strategic Value | Frequency | Complexity | Dependencies | Priority |
|---------|-----------|----------------|-----------|------------|-------------|----------|
| Recurring tasks/events | 5 | 5 | Daily | Medium | None | **P0** |
| Multiple notes with titles | 5 | 3 | Daily | Low | None | **P0** |
| Daily kid chore reset | 5 | 3 | Daily | Low | None | **P0** |
| Browser notifications (prayer) | 5 | 5 | 5× daily | Medium | Service worker | **P0** |
| Calendar time + basic visual | 4 | 4 | Weekly | Medium | None | **P0** |
| Meal plan "copy last week" | 4 | 3 | Weekly | Low | None | **P1** |
| Data export (JSON) | 4 | 3 | Monthly | Low | None | **P1** |
| Budget history view | 4 | 3 | Monthly | Low | None | **P1** |
| Habit visibility on Home | 3 | 4 | Daily | Low | None | **P1** |
| More daily verses | 3 | 2 | Daily | Low | None | **P1** |
| Weekly review summary | 4 | 5 | Weekly | Medium | None | **P1** |
| Health trend charts | 4 | 3 | Weekly | Medium | recharts (installed) | **P1** |
| Smart Home thread enhancements | 4 | 5 | Daily | Medium | None | **P1** |
| Islamic calendar / Hijri dates | 3 | 4 | Daily | Medium | External lib | **P2** |
| Unified visual calendar | 4 | 4 | Weekly | Medium | Calendar refactor | **P2** |
| Task ↔ Calendar integration | 4 | 4 | Weekly | Medium | Recurring engine | **P2** |
| Grocery → Budget connection | 3 | 3 | Weekly | Low | None | **P2** |
| Notification system (general) | 4 | 5 | Daily | High | Service worker | **P2** |
| Search | 3 | 3 | As needed | Medium | None | **P2** |
| Family members model | 3 | 5 | N/A | High | Data migration | **P3** |
| Expanded Quran content | 3 | 3 | Daily | High | API integration | **P3** |
| Hifz revision scheduler | 3 | 3 | Daily | Medium | Recurring engine | **P3** |

---

## Recommended Product Roadmap

### Phase 0 — Foundation Fixes (1–2 weeks)

Fix structural gaps that undermine daily usage.

| Feature | Description | Effort |
|---------|-------------|--------|
| **Multiple notes** | Change `notes: string` → `notes: { id, title, body, date }[]` | 1 day |
| **Daily kid chore reset** | Chores carry a `date` field; reset UI marks today's status | 1 day |
| **Calendar time support** | Add optional time field to events; sort by date+time | 0.5 day |
| **Budget history tab** | Show past months' expenses grouped by month | 1 day |
| **More daily verses** | Expand from 3 to 30+ verses | 0.5 day |
| **Data export** | "Export all data" button in Settings → downloads JSON | 0.5 day |
| **Meal plan copy week** | "Copy last week" button on Meals | 0.5 day |

### Phase 1 — Immediate Improvements (2–4 weeks)

High-value features that improve daily workflows.

| Feature | Description | Effort |
|---------|-------------|--------|
| **Recurring tasks** | Tasks can repeat daily/weekday/weekly; generate instances | 3 days |
| **Browser prayer notifications** | Request permission; fire Notification API at prayer times | 2 days |
| **Weekly review** | New "Review" section: salah %, tasks done, spending, mood, habits for past 7 days | 2 days |
| **Health trend charts** | 30-day line charts for weight, sleep, water using recharts | 2 days |
| **Enhanced Home thread** | Add habit streaks, upcoming calendar events, health summary to Today | 1 day |
| **Habit visibility on Home** | Show top 3 habits' today-status on Home thread | 0.5 day |

### Phase 2 — Workflow Integration (4–8 weeks)

Connect existing modules into a coherent system.

| Feature | Description | Effort |
|---------|-------------|--------|
| **Unified visual calendar** | Month/week grid showing tasks, events, meals, fasting, Islamic dates | 5 days |
| **Task ↔ Calendar sync** | Tasks with dates appear on calendar; calendar events surface as tasks | 3 days |
| **Islamic calendar overlay** | Hijri dates, highlight Ramadan, Eid, Ashura, etc. | 3 days |
| **Recurring events** | Calendar events can repeat | 2 days |
| **Recurring kid routines** | Daily chore templates per child | 2 days |
| **Grocery → Budget prompt** | After marking all grocery done, prompt to log total spent | 1 day |
| **Search** | Global search across tasks, notes, journal, recipes, expenses | 3 days |
| **General notification system** | Configurable reminders for tasks, events, habits | 5 days |

### Phase 3 — Intelligence & Automation (8–16 weeks)

Reduce manual effort; make the app work for the user.

| Feature | Description | Effort |
|---------|-------------|--------|
| **Smart weekly meal suggestions** | Suggest meals from recipe repository based on past plans | 3 days |
| **Budget insights** | Month-over-month comparison, category trends, overspend alerts | 3 days |
| **Salah consistency analysis** | Monthly report, on-time vs late ratio, improvement tracking | 2 days |
| **Mood + activity correlation** | Journal mood patterns vs sleep, prayer, exercise | 3 days |
| **Smart reminders** | Context-aware: "You usually fast Mondays", "Maghrib in 10m" | 5 days |
| **Family member model** | Shared family entity; assign tasks/responsibilities to members | 5 days |

### Phase 4 — Differentiation (16+ weeks)

Build capabilities that make Firdous meaningfully unique.

| Feature | Description | Effort |
|---------|-------------|--------|
| **Ramadan mode** | Suhur/Iftar times, daily Quran portion tracker, taraweeh logging, charity tracker | 5 days |
| **Quran API integration** | Full Quran text via external API; offline caching for bookmarked surahs | 5 days |
| **Hifz revision scheduler** | Spaced repetition for memorized surahs; daily revision prompts | 5 days |
| **Daily operating surface** | Home becomes a truly intelligent daily planner — auto-prioritized, context-aware | 10 days |
| **PWA with service worker** | Full offline support, installable, background sync | 5 days |

---

## Implementation Details — Key Features

### 1. Recurring Tasks Engine

**User Problem:** Every daily/weekly task must be manually re-created.

**Current State:** Tasks are flat `{ id, title, list, time, done, date }` entries.

**Proposed Experience:** Add a `recurrence` field to tasks: `"daily" | "weekday" | "weekly" | "monthly" | null`. On page load, auto-generate today's instances from templates. Templates are distinguished from instances via a `templateId` field.

**Data Changes:**
```typescript
type Task = {
  id: string; title: string; list: string;
  time?: string; done: boolean; date: string;
  recurrence?: "daily" | "weekday" | "weekly" | "monthly" | null;
  templateId?: string; // links instance to template
};
```

**Frontend Changes:** Add recurrence selector to task creation form. Filter to show only today's instances. Template management in a separate sub-view.

**Backend Changes:** None — runs entirely in localStorage.

**Complexity:** Medium | **Priority:** P0

---

### 2. Browser Prayer Notifications

**User Problem:** No prayer reminders despite having accurate prayer times.

**Current State:** `usePrayers()` calculates exact times; `useNextPrayer()` provides countdown. No notification system.

**Proposed Experience:** Request `Notification.permission` in settings. Schedule a `setTimeout` for each upcoming prayer. Fire a browser Notification with the prayer name and time.

**Dependencies:** Browser Notification API (no service worker needed for basic implementation).

**Frontend Changes:** Add notification toggle in Settings. New `usePrayerNotifications()` hook that schedules/cancels timeouts.

**Complexity:** Medium | **Priority:** P0

---

### 3. Multiple Notes

**User Problem:** Single textarea for all notes is inadequate.

**Current State:** `notes: string` in localStorage.

**Data Changes:**
```typescript
type Note = { id: string; title: string; body: string; updated: string };
// Migrate: if old `notes` string exists, convert to first note
```

**Frontend Changes:** Notes list with add/delete. Each note opens as a full-page editor. Auto-save on type (current behavior).

**Complexity:** Low | **Priority:** P0

---

### 4. Weekly Review

**User Problem:** Users log data all week but never see a summary.

**Current State:** No review or summary feature.

**Proposed Experience:** New "Review" item on Home tab. Shows past 7 days:
- Salah: X/35 prayers logged, on-time %, consistency heatmap
- Tasks: X completed, Y open
- Budget: ₹X spent this week, top category
- Mood: distribution of check-ins
- Habits: completion rate per habit
- Quran: minutes read, surahs covered

**Dependencies:** All data already exists in localStorage.

**Frontend Changes:** New `WeeklyReview` component, added to Home page as a new tab or section.

**Complexity:** Medium | **Priority:** P1

---

### 5. Health Trend Charts

**User Problem:** Users log weight, sleep, water daily but see no trends.

**Current State:** `health: Record<date, { water, weight, sleep }>` — data exists but only today is shown.

**Proposed Experience:** 30-day line charts for weight and sleep. 7-day bar chart for water.

**Dependencies:** `recharts` is already installed in package.json.

**Frontend Changes:** Add "Trends" section below current Health body section.

**Complexity:** Medium | **Priority:** P1

---

### 6. Unified Visual Calendar

**User Problem:** Calendar is a flat list; can't see the shape of a week or month.

**Current State:** `events: { id, title, date }[]` — no visual representation.

**Proposed Experience:** Month grid (like a physical calendar) showing:
- Events (with time if set)
- Tasks with dates
- Meal plan for the day
- Fasting status
- Islamic date underneath

**Dependencies:** Calendar refactor. `react-day-picker` is already installed.

**Frontend Changes:** Replace current Calendar sub-tab with a proper month view. Each day cell is clickable to show details.

**Complexity:** Medium | **Priority:** P2

---

## Information Architecture Assessment

### What Works

- The 4 bottom-bar spaces (Home, Deen, Budget, Me) map cleanly to user mental models
- Home as the "daily operating surface" with sub-tabs is strong
- Deen's sub-tab structure (Today, Quran, Dhikr, Duas, Hifz, Fasting, Qibla) is logical
- Me's organization (Self care, Habits, Journal, Health, Cycle) is cohesive

### What Needs Attention

1. **Home has too many sub-tabs** (8): Today, Tasks, Meals, Grocery, Kids, Deeds, Calendar, Notes — this will only grow. Consider grouping: "Today" remains, "Household" (Tasks, Meals, Grocery, Calendar), "Family" (Kids, Deeds), "Notes"

2. **"Deeds" is an outlier** — it's a logging feature (who did something kind) that doesn't fit naturally with Tasks, Meals, or Grocery. Consider moving it to the Me space or making it part of Journal.

3. **Calendar should be more prominent** — it's buried as the 7th sub-tab on Home. As Firdous grows, the calendar could become a 5th bottom-bar space or a top-level feature.

### Recommendation: Do not restructure navigation yet

The current structure works for the current feature set. Restructuring before Phase 2 would create churn. When the unified calendar and recurring items are built, reassess.

---

## Home Experience Assessment

The Home/Today view is Firdous's **strongest design asset**. The "thread" paradigm — a vertical line of contextual items — is distinctive and effective. It currently shows:

- Next prayer + countdown
- Open tasks (top 3)
- Today's calendar events
- Tonight's dinner
- Grocery items remaining
- Completed tasks count
- Progress meters (tasks, salah, grocery)

**What should be added (Phase 1):**
- Habit completion status ("3/5 habits done today")
- Self-care check-in status (if not done yet: "How are you?")
- Water intake ("3/8 glasses")
- Budget alert (if >80% of monthly limit used)

**What should NOT be added:**
- Full journal preview (private space)
- Quran content (belongs in Deen)
- Hifz progress (too detailed)
- Cycle information (private)

The principle: **Home should reduce cognitive load by surfacing only what needs attention right now.**

---

## Missing Feedback Loops

| Data Logged | Current Feedback | Recommended Feedback |
|------------|-----------------|---------------------|
| Salah (daily) | 7-day heatmap | Monthly consistency %, on-time ratio, streak |
| Expenses | Current month total + category bars | Month-over-month trend, daily average, category alerts |
| Mood (daily) | None | 30-day mood distribution, patterns (e.g., "Tired on Mondays") |
| Habits (daily) | Streak count per habit | Completion rate, best habit, consistency chart |
| Weight/Sleep | None | 30-day trend line, weekly averages |
| Water | Today's count | 7-day average |
| Journal | Past entries list | Word count trend, mood correlation |
| Quran sessions | Listed chronologically | Total minutes this month, pages/week |
| Fasting | 28-day grid | Annual count, sunnah fast tracking |

---

## Long-Term Product Evolution

### Stage 1 — Strengthen Existing Workflows (Now → 4 weeks)
- Fix structural gaps (notes, kid chores, calendar)
- Add recurring items
- Basic notifications
- Data export

### Stage 2 — Connect Modules (4 → 12 weeks)
- Unified calendar
- Task ↔ Calendar sync
- Grocery → Budget bridge
- Islamic calendar integration
- Weekly review

### Stage 3 — Intelligent Feedback (12 → 24 weeks)
- Trend charts for all tracked metrics
- Smart Home thread
- Budget insights
- Salah consistency analysis
- Contextual reminders

### Stage 4 — Deeper Family/Deen Intelligence (24 → 48 weeks)
- Family member model with shared responsibilities
- Ramadan mode
- Quran API integration
- Hifz revision scheduler
- PWA with full offline support

### Stage 5 — Defensible Differentiation (48+ weeks)
- The "daily operating surface" becomes so integrated and personalized that no combination of separate apps can replicate it
- Family coordination features that respect privacy
- Deen data that informs daily planning (not just tracking)

---

> **Conclusion:** Firdous is already an unusually well-designed product with a genuine product thesis. Its gaps are not in vision but in **depth** — every module needs one or two more layers of functionality to go from "logging tool" to "daily companion." The recurring items engine and notification system are the two highest-leverage investments. The weekly review is the most important retention feature. And the unified calendar is the architectural piece that will make all modules feel like one product rather than twelve separate features.
>
> **The central question — answered:**
> *Given what Firdous already is, what should we do?*
>
> 1. **Improve:** Recurring items, multiple notes, kid chore resets, calendar times, budget history
> 2. **Connect:** Calendar ↔ Tasks, Grocery → Budget, Habits → Home, everything → Weekly Review
> 3. **Add:** Prayer notifications, health trends, Islamic calendar, search
> 4. **Automate:** Meal plan carry-forward, smart Home thread, contextual reminders
> 5. **Deliberately avoid:** Social features, AI suggestions, gamification, full Quran app, complex budgeting
