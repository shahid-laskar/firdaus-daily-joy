# Firdous — Continue From Existing Prototype

You are taking over an existing **Firdous** project that has already been partially prototyped by another agent.

The previous agent exhausted its available usage, so you are continuing the work in a new session/account.

## IMPORTANT

**The current GitHub repository is the source of truth.**

Do NOT assume the project is in its original state.

Do NOT rebuild features that already exist.

Do NOT reset or overwrite the current implementation.

First inspect the repository and determine exactly what the previous agent completed.

---

# 1. AUDIT THE CURRENT CODEBASE FIRST

Before implementing anything:

Inspect:

* current Git branch
* recent commits
* changed files
* existing routes
* components
* state/data model
* localStorage
* Supabase integration
* theme system
* existing prototype features
* current navigation
* current UI
* existing tests/build configuration

Determine the actual state of the project.

Create an internal comparison:

| Research Feature         | Current State                   |
| ------------------------ | ------------------------------- |
| Multiple Notes           | implemented / partial / missing |
| Unified Calendar         | implemented / partial / missing |
| Recurring Tasks          | implemented / partial / missing |
| Notifications            | implemented / partial / missing |
| Budget History           | implemented / partial / missing |
| Health Trends            | implemented / partial / missing |
| Weekly Review            | implemented / partial / missing |
| Kid chore reset          | implemented / partial / missing |
| Copy last week meal plan | implemented / partial / missing |
| Data export              | implemented / partial / missing |
| Habit visibility on Home | implemented / partial / missing |
| Enhanced Home thread     | implemented / partial / missing |
| Task ↔ Calendar          | implemented / partial / missing |
| Recurring events         | implemented / partial / missing |
| Islamic calendar         | implemented / partial / missing |
| Grocery → Budget         | implemented / partial / missing |
| Global search            | implemented / partial / missing |

Do not rely on descriptions from previous agents.

Verify everything from the code.

---

# 2. PRESERVE EXISTING WORK

The previous prototype reportedly added:

* Multi-note Notes
* Unified Calendar
* Recurring Tasks
* Reminders/Notifications tab
* Budget History
* Health Trends
* Weekly Review page at `/review`

Treat these as **potentially completed prototype work** and verify them.

Do not remove or rewrite them unless necessary.

If the implementation is incomplete, improve it rather than replacing it blindly.

---

# 3. USE THE RESEARCH PLAN

The attached research report is the product roadmap.

Use it to determine:

* what should be implemented next
* feature dependencies
* architectural improvements
* UX priorities
* cross-module integrations

The research specifically identifies recurring items, notifications, weekly review and calendar integration as high-leverage investments.

---

# 4. IMPLEMENT IN PRIORITY ORDER

After auditing the repository, continue implementation in this order unless the codebase reveals a better dependency order.

## Phase 0 — Foundation

Complete any missing:

* Multiple Notes
* Daily Kid Chore Reset
* Calendar Time Support
* Budget History
* Data Export
* Meal Plan "Copy Last Week"

## Phase 1 — Daily Workflow

Complete:

* Recurring Tasks
* Real prayer/browser notifications
* Weekly Review
* Health Trends
* Habit visibility on Home
* Enhanced Home thread

## Phase 2 — Integration

Implement:

* Unified Calendar refinement
* Task ↔ Calendar integration
* Recurring Calendar Events
* Islamic/Hijri Calendar
* Recurring Kid Routines
* Grocery → Budget connection
* Global Search
* General reminders

Only proceed to later phases once the earlier foundations are solid.

---

# 5. DO NOT REPLACE THE PRODUCT DIRECTION

Preserve Firdous's existing philosophy:

**Deen + Family + Household + Personal Life**

The product should remain:

* calm
* private
* minimal
* practical
* integrated
* low-cognitive-load

Do NOT turn it into:

* a generic SaaS dashboard
* a gamified habit app
* a social network
* a generic AI assistant

Do not add unnecessary features simply because they are technically possible.

---

# 6. CROSS-MODULE INTEGRATION IS IMPORTANT

Where appropriate, make existing features actually communicate.

Examples:

Tasks
↓
Calendar

Meals
↓
Grocery
↓
Budget

Habits
↓
Home

Prayer
↓
Notifications
↓
Home

All meaningful daily activity
↓
Weekly Review

The goal is to make the application feel like **one coherent system**, not a collection of isolated modules.

---

# 7. PRODUCTION IMPLEMENTATION

Unlike the earlier prototype phase, now focus on actual maintainable implementation.

Before introducing new architecture:

* reuse existing components
* reuse existing data models where sensible
* reuse existing theme tokens
* reuse existing state management
* minimize dependencies
* avoid unnecessary rewrites

When a data migration is necessary, make it backward-compatible with existing localStorage data.

Do not break existing users' stored data.

---

# 8. IMPORTANT FOR NOTIFICATIONS

Verify whether the current "Reminders/notifications" implementation is:

1. UI only
2. local scheduling
3. browser Notification API
4. service-worker based
5. actually persistent when the tab is closed

Do not claim notifications are complete until the implementation actually supports the intended behavior.

Choose an implementation appropriate for the existing application architecture.

---

# 9. IMPORTANT FOR RECURRING ITEMS

Do not implement recurrence independently for every feature.

Create a consistent recurrence model that can eventually support:

* tasks
* calendar events
* kid chores
* routines

Avoid four separate incompatible recurrence systems.

---

# 10. DATA SAFETY

Firdous is currently localStorage-first.

Do not casually replace this architecture.

Before changing persistence:

* understand existing keys
* preserve existing user data
* provide migrations where necessary
* ensure old users do not lose information

If Supabase synchronization needs to be extended, do so carefully.

---

# 11. UX QUALITY

Do not stop at technically working functionality.

For every feature, verify:

* empty state
* loading state
* error state
* success feedback
* mobile layout
* keyboard accessibility
* destructive actions
* editing
* deleting
* persistence
* refresh behavior
* edge cases

The new functionality must feel native to the existing Firdous design.

---

# 12. VALIDATION

After each significant feature:

* run the application
* test the workflow
* verify persistence
* test responsive behavior
* check existing functionality
* run the relevant build/type checks

Do not leave broken prototype code behind.

---

# 13. WORK IN INCREMENTAL COMMITS

Prefer logical commits such as:

* `feat: complete recurring task system`
* `feat: add prayer notification engine`
* `feat: improve unified calendar`
* `feat: add weekly review`
* `feat: add data export`

Avoid one enormous commit containing unrelated changes.

---

# FINAL OBJECTIVE

Do not start from zero.

**Audit → Preserve → Complete → Integrate → Validate**

The existing repository already contains prototype work from another agent.

Your job is to turn that existing prototype into a **coherent, reliable, production-quality Firdous implementation**, while continuing the roadmap in priority order.

Before making major architectural decisions, inspect what already exists and build on it.
