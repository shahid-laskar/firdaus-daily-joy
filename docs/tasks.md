# Firdous Task Tracker

This document tracks the progress of the Firdous application against the product roadmap defined in `docs/firdous-research-plan.md` and `docs/plan-01.md`.

## ✅ Completed Tasks

### Prototype Integration
- [x] Audit the current codebase and Lovable prototype files
- [x] Merge Lovable prototype components into the main repository securely

### Phase 0 — Foundation Fixes
- [x] **Multiple notes:** Replaced the single scratchpad with a robust multi-note system (`notes.tsx`).
- [x] **Daily kid chore reset:** Updated the core logic to ensure kid chores reset automatically based on their assigned recurrence rule.
- [x] **Calendar time support:** Event system now supports time scheduling, not just dates.
- [x] **Budget history tab:** Created the historical ledger view for tracking expenses across previous months.
- [x] **Data export:** Hooked up a JSON export function to allow users to back up their local data from the Settings panel.
- [x] **Meal plan "copy last week":** Added a one-click button to carry forward previous meal structures.

### Phase 1 — Immediate Improvements
- [x] **Recurring tasks:** Tasks can now repeat daily, weekly, or on specific days, auto-generating instances.
- [x] **Browser prayer notifications:** Engineered a `useNudges` hook utilizing the native `Notification` API to send alerts for prayer times (with lead times).
- [x] **Custom Reminders:** Integrated custom recurring push notifications alongside prayer times.
- [x] **Weekly review:** Added a dedicated `/review` page that aggregates the past 7 days of salah, tasks, budget, mood, and habits.
- [x] **Health trend charts:** Implemented 30-day visual charts for weight, sleep, and water tracking.
- [x] **Enhanced Home thread:** The main thread on the "Today" page now smartly displays health summaries (like water and sleep tracking).
- [x] **Habit visibility on Home:** The "Today" thread now surfaces completion stats for your top 3 habits.


---


## ⏳ Pending Tasks

### Phase 0 — Leftovers
- [ ] **More daily verses:** Expand the hardcoded list of verses in the Deen module from 3 to 30+ verses to ensure a rotating variety.

### Phase 2 — Workflow Integration (4–8 weeks)
- [ ] **Unified visual calendar:** Upgrade the current calendar view to a month/week grid showing tasks, events, meals, fasting, and Islamic dates all in one place.
- [ ] **Task ↔ Calendar sync:** Tasks with dates should appear on the calendar; calendar events should surface as tasks.
- [ ] **Islamic calendar overlay:** Integrate Hijri dates into the calendar and highlight key Islamic events (Ramadan, Eid, Ashura).
- [ ] **Recurring calendar events:** Allow calendar events (like appointments) to repeat on a schedule.
- [ ] **Recurring kid routines:** Build daily chore templates specifically for children's routines.
- [ ] **Grocery → Budget prompt:** Upon checking off all grocery items, trigger an optional prompt asking the user to log the total spent in the Budget module.
- [ ] **Search:** Implement full-text global search across tasks, notes, journals, recipes, and expenses.

### Phase 3 — Intelligence & Automation (8–16 weeks)
- [ ] **Smart weekly meal suggestions:** Auto-suggest meals from the recipe repository based on historical meal plans.
- [ ] **Budget insights:** Month-over-month comparison, category trends, and overspend alerts.
- [ ] **Salah consistency analysis:** Generate a monthly report showing on-time vs. late ratio and improvement tracking.
- [ ] **Mood + activity correlation:** Cross-reference journal mood patterns against sleep, prayer, and exercise data.
- [ ] **Smart reminders:** Context-aware prompts (e.g., "You usually fast Mondays", "Maghrib in 10m").
- [ ] **Family member model:** Transition from a "Kids" list to a shared family entity model, assigning tasks and responsibilities to distinct members.

### Phase 4 — Differentiation (16+ weeks)
- [ ] **Ramadan mode:** Specialized dashboard showing Suhur/Iftar times, daily Quran tracking, Taraweeh logging, and charity tracking.
- [ ] **Quran API integration:** Pull in full Quran text via an external API and cache bookmarked Surahs offline.
- [ ] **Hifz revision scheduler:** Spaced repetition algorithm for memorized Surahs with daily revision prompts.
- [ ] **Intelligent daily operating surface:** Context-aware automatic prioritization of the Home thread.
- [ ] **PWA with service worker:** Full offline installation, service-worker background sync, and offline persistence beyond standard `localStorage`.
