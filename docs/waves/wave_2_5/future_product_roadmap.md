# FIRDAUS FUTURE PRODUCT ROADMAP
## Waves 2–5 Research & Design

---

## 1. Current Product Assessment

Firdaus has completed an unusually deep foundation for a personal/household operating system:

**Strengths:**
- Prayer-centered temporal model (Rhythm Engine) — no competitor has this
- Local-first architecture with Supabase sync — privacy-respecting by design
- Unified domain layer independent of presentation (Calm/Vibrant)
- Quran/Hifz with spaced-repetition — beyond typical Muslim app offerings
- Household primitives (tasks, routines, meals, grocery, budget, kids) already exist
- Intelligence layer already started (insights, mood, salah, meal, budget)
- PWA + offline — works without network

**Gaps:**
- Family coordination is individual-centric — the household operates as one person's tool, not a shared OS
- Goals/intentions exist only implicitly through tasks — no lifecycle from intention → action → review
- Automation is reactive (reminders) rather than proactive (suggestions, conflict detection)
- No Islamic seasonal intelligence beyond Ramadan
- No long-term memory or pattern recognition across months/years

**Product identity:** Firdaus is the only product that combines prayer-centered scheduling, household management, and Islamic life management in a single local-first application. This is its moat seed.

---

## 2. Product Thesis

> **Firdaus should become the operating system a Muslim household thinks with — not just tracks with.**

The next layers should progressively reduce the cognitive load of running a household and growing as a Muslim family, by moving from:

```
Individual tracker → Family coordinator → Intentional growth system → Proactive assistant → Irreplaceable household memory
```

Each wave should make the previous wave *better*, not merely *bigger*.

**Core design principles for Waves 2–5:**

1. **Household-first, not user-first** — the unit of operation shifts from "me" to "us"
2. **Intention over metrics** — niyyah (intention) frames everything; numbers serve reflection, not gamification
3. **Quiet intelligence** — the system should reduce noise, not add dashboards
4. **Prayer rhythm is the skeleton** — every new capability must fit into the existing temporal model
5. **Earned complexity** — features appear when the user's data makes them useful, not at onboarding

---

## 3. Wave 2 — Family Operating System

### Problem

Muslim households coordinate across prayer schedules, school schedules, work, Islamic education, household chores, and meals — yet the "coordinator" (usually one parent) carries an enormous invisible mental load. Existing tools either ignore Islamic rhythms entirely (Cozi, FamilyWall) or gamify religion into XP points (SunnahHome).

Firdaus currently treats the household as one person's perspective. Wave 2 must make the household a first-class collaborative entity while preserving the prayer-centered model.

### User Jobs

| Job | Frequency | Current Solution |
|-----|-----------|-----------------|
| Know what everyone needs to do today | Daily | Mental tracking / WhatsApp |
| Delegate a household task to a family member | Several times/week | Verbal request |
| Track whether delegated tasks were done | Daily | Follow-up conversation |
| Plan the family's week | Weekly | Informal discussion |
| Ensure kids complete Islamic responsibilities | Daily | Manual reminders |
| Prepare for upcoming family events | Occasional | Scattered notes |
| See household workload balance | Never (invisible) | N/A |
| Handle handoffs ("I started, you finish") | Occasional | Verbal |

### Proposed Capabilities

**2a. Multi-member household model**
- Extend existing `family-model.ts` with member roles: `admin`, `member`, `child`
- Each member gets their own Daily Surface view (filtered by their assignments)
- Shared household view shows aggregate day
- No separate accounts required — single device, switchable profiles; multi-device via Supabase sync

**2b. Task/routine delegation**
- Any task or routine step can be `assignedTo: memberId`
- Assignment appears on the assignee's Daily Surface
- Completion is visible to all household members
- Reuse existing task model — add `assignedTo` field, not a new entity

**2c. Household workload visibility**
- Weekly summary showing distribution of completed tasks/routines per member
- Not a leaderboard — a fairness signal
- Surfaces in Weekly Review (reuse existing review infrastructure)

**2d. Family weekly planning session**
- Guided flow: review last week → assign coming week's responsibilities → set meal plan → note upcoming events
- Anchored to a specific time (e.g., after Maghrib on Friday — configurable)
- Produces a "family plan" that populates individual Daily Surfaces

**2e. Conflict detection**
- When two tasks for the same member overlap temporally, or a member is over-assigned, surface a quiet warning
- Deterministic — compare time blocks, no AI needed
- Reuse Rhythm Engine block boundaries

**2f. Child-appropriate view**
- Children see: their tasks, their routines, Quran progress, encouragement
- Children do NOT see: budget, full household workload, parent-only tasks
- Controlled by member role, not a separate app

### Non-Goals

- ❌ Real-time chat or messaging between family members
- ❌ Location tracking
- ❌ Social features or family feed
- ❌ Gamification with XP, coins, virtual pets, or levels
- ❌ Separate child app/account system
- ❌ Complex permission hierarchies

### Data Model

```
FamilyMember (existing, extended)
  + role: 'admin' | 'member' | 'child'
  + viewPreferences: { ... }

Task (existing, extended)
  + assignedTo?: memberId
  + householdVisible: boolean

Routine (existing, extended)
  + assignedTo?: memberId (per step already exists)

FamilyWeekPlan (NEW)
  + weekStartDate: string
  + reviewed: boolean
  + notes: string
  + createdBy: memberId

HouseholdWorkloadSnapshot (DERIVED, not persisted)
  Computed from completed tasks/routines per member per week
```

### Architecture

- Extend `family-model.ts` with roles and view filtering
- Extend `daily-surface.ts` to accept `memberId` filter
- New `family-planning.ts` engine for weekly planning session logic
- Conflict detection lives in `rhythm-engine.ts` (it already owns temporal blocks)
- No new stores — extend existing task/routine stores with `assignedTo`
- Supabase: add `assigned_to` column to tasks/routines; row-level security per household
- localStorage: unchanged structure, just new fields
- Offline: fully functional — sync resolves on reconnect

### UX

- **Calm:** Family view as a quiet list grouped by member, showing today's assignments
- **Vibrant:** Family view with member avatars, subtle color coding per member
- **Shared:** Weekly planning flow is the same in both experiences — it's a guided conversation, not decoration
- Domain layer: zero experience coupling

### MVP (Wave 2.0)

1. Member roles on existing family model
2. `assignedTo` on tasks and routines
3. Per-member Daily Surface filter
4. Basic workload summary in Weekly Review
5. Simple conflict detection (time overlap warning)

### Later Enhancements (Wave 2.x)

- Family weekly planning session
- Child-appropriate view filtering
- Handoff capability (partial completion → reassign)
- Household calendar aggregation

### Risks

| Risk | Severity | Mitigation |
|------|----------|------------|
| Multi-device sync conflicts on assignment | Medium | Supabase conflict resolution; last-write-wins with timestamp |
| Over-engineering permissions | High | Keep to 3 roles only; no custom permissions |
| Children's privacy | Medium | Role-based view filtering at domain level |
| Scope creep into social features | High | Strict non-goals; no messaging |

---

## 4. Wave 3 — Personal Growth

### Problem

Muslims set intentions (niyyah) constantly — for worship, for self-improvement, for family — but have no system to connect intention → committed action → daily practice → reflection → adjustment. Generic OKR tools miss the Islamic dimension entirely. Islamic apps that attempt this fall into artificial "spiritual scoring" (tracking salah like a game score).

Firdaus already has the daily building blocks (tasks, routines, Quran, Hifz, salah tracking). What's missing is the connective tissue: **why** am I doing this, **how** is it going, and **what** should I adjust?

### User Jobs

| Job | Frequency | Current Solution |
|-----|-----------|-----------------|
| Set an intention for personal growth | Monthly/quarterly | Mental note or journal |
| Break an intention into weekly commitments | Weekly | Ad-hoc tasks |
| Track whether I'm living my intention | Daily/weekly | No system |
| Reflect on spiritual progress without numbers | Weekly | Personal reflection (unstructured) |
| Connect Quran/worship goals to daily actions | Daily | Manual discipline |
| Adjust goals based on what's realistic | Monthly | Abandonment |

### Proposed Capabilities

**3a. Intentions (Niyyat)**
- A lightweight model: what do I intend to grow in? (e.g., "Improve my relationship with Quran", "Be more patient with my children", "Establish Tahajjud")
- NOT measurable by design — this is a direction, not a KPI
- Visible in Weekly Review as a reflective prompt: "You intended X. How did this week feel?"

**3b. Goals linked to intentions**
- Goals are concrete, time-bound commitments connected to an intention
- Examples: "Read 2 pages of Quran daily", "Complete Surah Al-Baqarah memorization by Ramadan"
- Goals can generate recurring tasks or link to existing routines
- Goals have a simple status: `active`, `paused`, `completed`, `released` (deliberately let go — not "failed")

**3c. Weekly commitments**
- Each week, the user selects 1–3 focus areas from active goals
- These surface as priority items in the Daily Surface
- Integrates with Family Weekly Planning (Wave 2)

**3d. Reflection (Muhasabah)**
- Weekly Review (existing) gains a reflection section
- Prompts are qualitative: "What went well?", "What was difficult?", "What am I grateful for?"
- Optional: brief daily reflection at Isha (configurable — not mandatory)
- Text-based, private, never shared, never scored

**3e. Goal-to-action linking**
- A goal can be linked to: tasks, routines, Hifz schedule, salah tracking
- Progress is inferred from linked activity, NOT manually entered
- Display: "This week you completed 5/7 of your linked Quran sessions" — factual, not judgmental

### Non-Goals

- ❌ Spiritual scoring or ranking
- ❌ Streaks with punishment for breaking
- ❌ AI-generated spiritual advice
- ❌ Comparison between family members
- ❌ Public sharing of goals or reflections
- ❌ Complex OKR hierarchies (objectives → key results → initiatives)
- ❌ Habit gamification

### Data Model

```
Intention (NEW)
  + id: string
  + text: string
  + createdAt: string
  + status: 'active' | 'completed' | 'released'
  + memberId: string

Goal (NEW)
  + id: string
  + intentionId?: string
  + text: string
  + targetDate?: string
  + status: 'active' | 'paused' | 'completed' | 'released'
  + linkedTaskIds: string[]
  + linkedRoutineIds: string[]
  + memberId: string

WeeklyCommitment (NEW)
  + weekStartDate: string
  + goalIds: string[]
  + memberId: string

Reflection (NEW)
  + id: string
  + date: string
  + type: 'weekly' | 'daily'
  + text: string
  + memberId: string
  + private: true (always)
```

### Architecture

- New `growth-engine.ts` — manages intention/goal/commitment lifecycle
- Goal-to-action linking reads from existing task/routine stores (no duplication)
- Progress computation is derived (query completed linked items for date range)
- Reflection stored in existing localStorage pattern; synced via Supabase with encryption flag
- Integrates with Weekly Review (existing `review` infrastructure)
- No new scheduling — goals generate tasks via existing task creation
- Offline: fully functional
- Privacy: reflections are encrypted at rest in Supabase; never included in any analytics

### UX

- **Calm:** Intentions and reflections as quiet, text-focused cards; progress shown as simple fractions
- **Vibrant:** Intentions as subtle calligraphy-styled headers; progress with gentle circular indicators
- **Both:** Reflection is always a full-screen, distraction-free writing space
- Domain layer: zero experience coupling

### MVP (Wave 3.0)

1. Intention creation and management
2. Goal creation with link to intention
3. Goal-to-task/routine linking
4. Weekly commitment selection
5. Reflection section in Weekly Review

### Later Enhancements (Wave 3.x)

- Daily reflection (optional, at Isha)
- Goal progress inference from linked activities
- Seasonal goal suggestions (e.g., pre-Ramadan)
- Family-level shared intentions (household goals)

### Risks

| Risk | Severity | Mitigation |
|------|----------|------------|
| Becoming another OKR tool | High | Intentions are never measurable; goals are simple |
| Reflection fatigue | Medium | Always optional; never nag |
| Over-linking goals to tasks | Medium | Limit to simple ID references; no complex dependency graphs |
| Privacy of reflections | Critical | Encrypt at rest; never surface in analytics or family views |

---

## 5. Wave 4 — Intelligent Automation

### Problem

As Firdaus accumulates data (tasks completed, routines followed, meals prepared, prayers tracked, goals set), the user still does all the planning work manually. The system knows enough to help — but must do so carefully, respecting user autonomy and privacy.

### User Jobs

| Job | Frequency | Current Solution |
|-----|-----------|-----------------|
| Decide what to do next | Many times/day | Look at task list |
| Notice a scheduling conflict before it happens | Occasional | Mental check |
| Remember to prepare for upcoming events | Occasional | Manual reminders |
| Get meal suggestions based on what we have/like | Weekly | Manual planning |
| Adjust plan when something falls through | Occasional | Manual replanning |
| Know when I'm overcommitting | Occasional | Burnout |

### Proposed Capabilities

**Classification: Deterministic vs AI vs User Control**

| Capability | Type | Rationale |
|-----------|------|-----------|
| Schedule conflict detection | **Deterministic** | Compare time blocks — no ambiguity |
| Overload warning | **Deterministic** | Count assignments per member per day — threshold-based |
| Preparation reminders | **Deterministic** | Event date minus lead time — simple arithmetic |
| Missed-task recovery suggestions | **Deterministic** | If task missed yesterday and recurring, offer reschedule |
| Smart task ordering on Daily Surface | **Deterministic** | Priority + time block + energy heuristic |
| Meal suggestion from history | **Deterministic** | Rotate from past meals; avoid recent repeats |
| Grocery list from meal plan | **Deterministic** | Ingredient lookup from selected meals |
| Adaptive reminder timing | **Deterministic** | Track dismiss patterns; shift reminder earlier/later |
| Weekly planning draft | **AI-assisted** | Suggest week structure based on patterns — user approves |
| Natural-language task entry | **AI-assisted** | Parse "remind me to buy milk after Dhuhr" into structured task |
| Hifz review scheduling | **Deterministic** | Spaced-repetition algorithm (already exists) |
| Quran reading plan generation | **Deterministic** | Page count / days remaining — arithmetic |
| Ramadan preparation timeline | **Deterministic** | Islamic calendar countdown + checklist template |
| Proactive Daily Surface | **Deterministic** | Surface highest-value items based on time block + urgency + goal priority |

### Non-Goals

- ❌ AI chatbot
- ❌ AI-generated Islamic advice or fatwas
- ❌ Cloud-dependent AI processing for core features
- ❌ AI that modifies user data without explicit approval
- ❌ Voice assistant integration
- ❌ Predictive analytics dashboards

### Architecture

- Most automation lives in existing engines with enhanced heuristics:
  - `daily-surface.ts` — smarter ordering
  - `rhythm-engine.ts` — conflict detection
  - `reminder-engine.ts` — adaptive timing
  - `meal-intelligence.ts` — rotation suggestions
- New `automation-engine.ts` — orchestrates suggestions, surfaces them as "nudges" on Daily Surface
- AI-assisted features (natural language, weekly draft) are **optional modules** that require explicit opt-in
- AI processing: prefer on-device/local-first; if cloud needed, user must consent per-feature
- Suggestions are always presented as proposals — never auto-applied
- No new persistence for automation logic itself — it reads existing data and produces ephemeral suggestions

### Privacy Implications

- All deterministic automation: **zero privacy risk** (local computation on local data)
- AI-assisted features: must disclose what data leaves device (if any)
- Natural-language parsing: can be done locally with small models or with explicit cloud consent
- Weekly planning draft: can use local pattern matching without AI; AI optional for "smarter" suggestions

### UX

- Suggestions appear as subtle, dismissible nudges on Daily Surface — not pop-ups
- "Suggested" items are visually distinct from "confirmed" items
- One-tap accept or dismiss
- Domain layer: zero experience coupling

### MVP (Wave 4.0)

1. Schedule conflict detection (deterministic)
2. Overload warning per member (deterministic)
3. Preparation reminders for upcoming events (deterministic)
4. Proactive Daily Surface ordering (deterministic)

### Later Enhancements (Wave 4.x)

- Meal rotation suggestions
- Adaptive reminder timing
- Natural-language task entry (AI-assisted, opt-in)
- Weekly planning draft (AI-assisted, opt-in)
- Missed-task recovery suggestions

### Risks

| Risk | Severity | Mitigation |
|------|----------|------------|
| Suggestions feel intrusive | High | Always dismissible; learn from dismissals |
| AI dependency creep | Medium | Core features must work without AI; AI is enhancement only |
| Privacy erosion | Critical | No data leaves device without explicit consent; deterministic-first |
| Over-automation reducing user agency | Medium | Never auto-apply; always propose |

---

## 6. Wave 5 — Long-Term Differentiation

### Problem

Most productivity and family apps are interchangeable because they store tasks and events — commoditized data. Firdaus must become irreplaceable by accumulating value that no other app possesses: the household's long-term memory, seasonal rhythms, and Islamic life patterns.

### User Jobs

| Job | Frequency | Current Solution |
|-----|-----------|-----------------|
| Remember what worked last Ramadan | Yearly | Memory / scattered notes |
| Prepare for Hajj/Umrah systematically | Once/few times in life | Scattered checklists |
| Know our family's recurring annual rhythms | Seasonal | Mental model |
| See how our household has grown over time | Rare | No system |
| Maintain Islamic calendar awareness | Ongoing | Separate hijri calendar app |
| Preserve family knowledge and traditions | Ongoing | Oral tradition |

### Proposed Capabilities

**5a. Islamic seasonal intelligence**
- Islamic calendar engine aware of:
  - Ramadan (existing), Dhul Hijjah, Muharram, Rabi ul-Awal, Shaban, Rajab
  - Recommended voluntary fasts (Mondays/Thursdays, Ayyam al-Beedh, Ashura, Arafah)
  - Seasonal worship intensification periods
- Contextual nudges: "Dhul Hijjah begins in 2 weeks — good time to plan extra worship"
- Reuse existing Ramadan Mode architecture; generalize to other seasons

**5b. Hajj/Umrah preparation**
- Template-based preparation timeline (6 months → 3 months → 1 month → 1 week → day-of)
- Checklist categories: documents, health, spiritual preparation, packing, logistics
- Generates tasks linked to the preparation timeline
- Family-aware: who is going, what roles remain at home
- Post-journey: reflection + debrief

**5c. Household memory**
- Year-over-year pattern: "Last Ramadan you made [these meals], [these were favorites]"
- "This time last year you were working on [goal X]"
- Not a diary — derived automatically from existing data
- Surfaces during Weekly Review and seasonal transitions
- Computed, not stored separately — queries historical data

**5d. Family traditions**
- Lightweight model for recurring family events: "Eid breakfast at grandparents'", "Friday evening family Quran"
- Linked to Islamic or Gregorian calendar
- Generates reminders and preparation tasks automatically

**5e. Long-term growth visibility**
- Simple longitudinal view: Quran pages read over months, salah consistency over quarters, family routine adherence over time
- NOT gamified charts — thoughtful, reflective visualizations
- Available in Calm and Vibrant with appropriate presentation
- Data already exists; this is a presentation/query layer

**5f. Integration readiness**
- iCal export for external calendar consumption
- Structured data export (JSON) for portability
- Webhook/API surface for future integrations (e.g., smart home Adhan, school calendar import)
- No marketplace or plugin system — just clean interfaces

### Non-Goals

- ❌ Social networking or community features
- ❌ E-commerce or marketplace
- ❌ Content creation or publishing
- ❌ Competing with dedicated Quran apps (Tarteel, Quran.com)
- ❌ Islamic education curriculum
- ❌ Family tree / genealogy

### Data Model

```
IslamicSeason (NEW — lightweight config, not heavy entity)
  + id: string
  + name: string
  + hijriMonthStart: number
  + hijriDayStart: number
  + durationDays: number
  + templates: string[] (linked checklist/routine template IDs)

FamilyTradition (NEW)
  + id: string
  + name: string
  + description: string
  + recurrence: RecurrenceRule (reuse existing)
  + calendarType: 'hijri' | 'gregorian'
  + linkedTaskTemplateIds: string[]

HajjUmrahPlan (NEW)
  + id: string
  + type: 'hajj' | 'umrah'
  + targetDate: string
  + members: memberId[]
  + phases: PlanPhase[]
  + status: 'planning' | 'active' | 'completed'

PlanPhase
  + name: string
  + startOffset: number (days before journey)
  + taskTemplateIds: string[]
```

### Architecture

- New `islamic-calendar.ts` — hijri date calculations, season detection, voluntary fast days
- Extend `ramadan.ts` into generalized `seasonal-engine.ts`
- Household memory: query layer over existing stores (no new persistence)
- Hajj/Umrah: template-based task generation using existing task infrastructure
- Family traditions: thin model + recurrence (reuse `recurrence.ts`)
- Integration: export endpoints via service worker (no server needed for iCal generation)
- All offline-capable
- Privacy: long-term data stays local; Supabase sync is opt-in per data category

### UX

- **Calm:** Seasonal awareness as a quiet header note ("12 days until Ramadan"); traditions as a simple list
- **Vibrant:** Seasonal themes (subtle background shifts for Ramadan, Dhul Hijjah); traditions with visual warmth
- **Both:** Household memory surfaces as gentle "this time last year" cards — never intrusive
- Domain layer: zero experience coupling

### MVP (Wave 5.0)

1. Islamic calendar engine with major season awareness
2. Voluntary fast day awareness
3. Family traditions with recurrence
4. Basic household memory ("last Ramadan" queries)

### Later Enhancements (Wave 5.x)

- Hajj/Umrah preparation timeline
- Year-over-year growth visibility
- iCal export
- JSON data export
- Webhook surface

### Risks

| Risk | Severity | Mitigation |
|------|----------|------------|
| Islamic calendar calculation accuracy | High | Use established hijri libraries; allow manual correction |
| Household memory feels surveillance-like | Medium | Derived from user-created data only; user can delete any historical data |
| Hajj/Umrah scope creep | Medium | Template-based only; no travel booking or logistics |
| Feature bloat from "one more season" | Medium | Start with Ramadan + Dhul Hijjah only; add seasons based on user request |

---

## 7. Cross-Wave Architecture

```
Wave 1: Rhythm
   ↓ prayer-centered temporal model
Wave 2: Family
   ↓ multi-member coordination on shared rhythm
Wave 3: Goals
   ↓ intentional growth using family + rhythm infrastructure
Wave 4: Automation
   ↓ proactive intelligence over all accumulated data
Wave 5: Memory
   ↓ long-term household knowledge + Islamic seasonal awareness
```

**Dependency chain:**

| Wave | Depends On | Extends |
|------|-----------|---------|
| Wave 2 | Wave 1 (Rhythm Engine, Daily Surface) | family-model, task store, routine store |
| Wave 3 | Wave 2 (member model, weekly review) | task store, routine store, review |
| Wave 4 | Wave 1–3 (all data available) | daily-surface, rhythm-engine, reminder-engine |
| Wave 5 | Wave 1 (rhythm), Wave 2 (family), Wave 3 (goals) | ramadan, recurrence, all stores |

**No circular dependencies.** Each wave reads from previous waves' data but never requires backward modification.

**Shared infrastructure reused across all waves:**
- `recurrence.ts` — task/routine/tradition recurrence
- `rhythm-engine.ts` — temporal model
- `daily-surface.ts` — presentation pipeline
- `family-model.ts` — member identity
- Weekly Review — reflection touchpoint

---

## 8. Competitive Landscape

### Direct Competitors (Muslim-specific)

| Product | Strength | Weakness | Firdaus Advantage |
|---------|----------|----------|-------------------|
| **SunnahHome** | Family dashboard, gamified chores, kiosk mode | Gamification reduces spiritual authenticity; no prayer-centered scheduling | Prayer-rhythm integration; no gamification |
| **Muslim Pro** | Massive user base, Qalbox content, AiDeen chatbot | Bloated; ad-supported; no household management | Focused utility; privacy-first; no ads |
| **Tarteel** | Best-in-class Quran AI, family plan | Quran-only; no household management | Quran + household + rhythms unified |
| **Pillars** | Clean, privacy-focused prayer tracking | Prayer-only; no family features | Full household OS, not just prayer |
| **Solah** | Salah-anchored planner | Limited to task scheduling; no family | Full domain coverage beyond tasks |
| **Niyyah AI** | AI muhasabah, reflection | AI-dependent; no household management | Offline-first; reflection without AI dependency |

### Adjacent Competitors (General family/productivity)

| Product | Strength | Weakness | Firdaus Advantage |
|---------|----------|----------|-------------------|
| **Cozi** | Simple, proven | Dated; no Islamic awareness; manual | Prayer-aware; intelligent |
| **FamilyWall** | All-in-one with location | Cluttered; privacy concerns | Focused; private; Islamic |
| **OurHome** | Gamified chores | Gamification; no cultural sensitivity | Respectful; prayer-centered |
| **Notion** | Infinitely flexible | Requires setup; no Islamic primitives | Opinionated for Muslim households |

### Key Insight

**No product unifies:** prayer-centered scheduling + household coordination + intentional growth + Islamic seasonal awareness + offline-first privacy.

This is Firdaus's moat. Competitors are either Muslim-prayer-only or family-management-only. None occupy the intersection.

---

## 9. Feature Priority Matrix

| # | Feature | Value | Freq | Diff | Complexity | Arch Risk | Privacy Risk | Dependency | **Priority Score** | **Category** |
|---|---------|-------|------|------|------------|-----------|-------------|------------|-------------------|-------------|
| 1 | Member roles + assignedTo | 5 | 5 | 4 | 2 | 1 | 1 | 1 | **96** | MUST HAVE |
| 2 | Per-member Daily Surface | 5 | 5 | 4 | 2 | 1 | 1 | 2 | **94** | MUST HAVE |
| 3 | Conflict detection | 4 | 4 | 4 | 2 | 1 | 1 | 2 | **86** | MUST HAVE |
| 4 | Intention model | 4 | 3 | 5 | 1 | 1 | 2 | 1 | **88** | MUST HAVE |
| 5 | Goal-to-task linking | 4 | 4 | 4 | 2 | 1 | 1 | 3 | **83** | MUST HAVE |
| 6 | Reflection in Weekly Review | 4 | 4 | 4 | 1 | 1 | 3 | 2 | **83** | MUST HAVE |
| 7 | Workload visibility | 4 | 4 | 3 | 2 | 1 | 1 | 2 | **83** | SHOULD HAVE |
| 8 | Family weekly planning | 4 | 4 | 4 | 3 | 2 | 1 | 3 | **75** | SHOULD HAVE |
| 9 | Islamic calendar engine | 4 | 4 | 5 | 3 | 2 | 1 | 1 | **82** | SHOULD HAVE |
| 10 | Proactive Daily Surface ordering | 4 | 5 | 3 | 2 | 2 | 1 | 3 | **78** | SHOULD HAVE |
| 11 | Weekly commitments | 3 | 4 | 3 | 1 | 1 | 1 | 4 | **73** | SHOULD HAVE |
| 12 | Family traditions | 3 | 2 | 5 | 2 | 1 | 1 | 2 | **74** | SHOULD HAVE |
| 13 | Preparation reminders | 3 | 3 | 2 | 1 | 1 | 1 | 2 | **75** | SHOULD HAVE |
| 14 | Overload warning | 3 | 3 | 3 | 1 | 1 | 1 | 2 | **76** | SHOULD HAVE |
| 15 | Child-appropriate view | 3 | 4 | 3 | 2 | 2 | 2 | 2 | **68** | COULD HAVE |
| 16 | Meal rotation suggestions | 3 | 4 | 2 | 2 | 1 | 1 | 2 | **71** | COULD HAVE |
| 17 | Household memory | 3 | 2 | 5 | 3 | 2 | 2 | 4 | **59** | COULD HAVE |
| 18 | Adaptive reminder timing | 3 | 4 | 3 | 3 | 2 | 1 | 3 | **63** | COULD HAVE |
| 19 | Hajj/Umrah preparation | 3 | 1 | 5 | 3 | 2 | 1 | 3 | **60** | COULD HAVE |
| 20 | Natural-language task entry | 3 | 3 | 2 | 4 | 3 | 3 | 3 | **45** | COULD HAVE |
| 21 | Year-over-year growth view | 2 | 1 | 4 | 3 | 2 | 2 | 5 | **43** | COULD HAVE |
| 22 | iCal export | 2 | 2 | 1 | 2 | 1 | 1 | 1 | **56** | COULD HAVE |
| 23 | Weekly planning AI draft | 2 | 4 | 2 | 4 | 3 | 4 | 4 | **33** | COULD HAVE |

*Priority Score = (Value×4 + Freq×3 + Diff×3) - (Complexity×2 + ArchRisk×2 + PrivacyRisk×2 + Dependency×1)*

---

## 10. Features NOT Worth Building

| Feature | Why Not |
|---------|---------|
| **AI chatbot / Islamic Q&A** | Liability risk; not our domain; better served by scholars; turns app into something it isn't |
| **Gamified worship tracking** (XP, levels, coins) | Undermines sincerity of ibadah; cheapens Islamic practice; SunnahHome already proved this is controversial |
| **Family social feed** | Turns household OS into social network; adds noise not signal |
| **Location tracking** | Privacy violation; not needed for household coordination; better apps exist |
| **Complex permission system** | 3 roles (admin/member/child) are sufficient; more creates configuration burden |
| **Competing Quran app** | Tarteel does AI tajweed better; our Quran integration should be a bridge, not a replacement |
| **Islamic education curriculum** | Scope creep; schools and parents handle this; we can link to external resources |
| **Multi-household support** | Enormous complexity for edge-case use; single household is our design center |
| **Marketplace / plugins** | Premature; adds maintenance burden; focus on core product |
| **Voice assistant** | Complex, privacy-invasive, low reliability for multilingual Muslim households |
| **Calendar import/sync** (Google/Apple) | Tempting but dangerous — creates sync complexity and data ownership confusion; better to export-only |
| **Budgeting AI** | Existing budget is manual and simple — that's a feature, not a bug |

---

## 11. Architectural Risks

| Risk | Wave | Severity | Mitigation |
|------|------|----------|------------|
| **Multi-member sync conflicts** | 2 | High | Last-write-wins with timestamps; conflict resolution UI for critical items |
| **localStorage size limits** | 2–5 | Medium | Monitor storage usage; archive old data; use IndexedDB if needed |
| **Goal model becoming an OKR system** | 3 | High | Strict simplicity constraints; no hierarchies beyond intention→goal |
| **Automation suggestions overwhelming users** | 4 | High | Rate-limit suggestions; learn from dismissals; always optional |
| **Islamic calendar edge cases** | 5 | Medium | Allow manual override; regional moonsighting differences |
| **Experience coupling during rapid feature addition** | 2–5 | High | Continuous domain-independence review at each wave gate |
| **Supabase schema migrations** | 2–3 | Medium | Additive-only migrations (new columns, not restructuring); backward-compatible |
| **Test coverage gaps during multi-wave development** | 2–5 | Medium | Each wave must pass integration tests before UX work begins |

---

## 12. Privacy / Trust Risks

| Risk | Wave | Severity | Mitigation |
|------|------|----------|------------|
| **Reflection data sensitivity** | 3 | Critical | Encrypted at rest; never in analytics; never shared; user-deletable |
| **Family member surveillance perception** | 2 | High | Workload visibility is aggregate, not surveillance; no location; no screen time |
| **AI processing data leakage** | 4 | Critical | Deterministic-first; AI opt-in only; disclose data flows; prefer local models |
| **Children's data** | 2 | High | Minimal data collection for children; no analytics on child activity |
| **Long-term data accumulation** | 5 | Medium | User controls data retention; export + delete available; no data held hostage |
| **Supabase as trust boundary** | All | Medium | End-to-end encryption for sensitive data; user owns encryption keys ideally |

---

## 13. AI Opportunities

### Deterministic (No AI needed — build first)

| Capability | Data Source | Logic |
|-----------|------------|-------|
| Schedule conflict detection | Tasks, routines, rhythm blocks | Time overlap comparison |
| Overload warning | Assigned tasks per member per day | Threshold count |
| Preparation reminders | Event dates | Date arithmetic |
| Meal rotation | Meal history | Recency-based rotation |
| Grocery from meal plan | Meal ingredients | Lookup + aggregation |
| Proactive Daily Surface | All day's items + time blocks | Priority sorting |
| Hifz review scheduling | Memorization dates | Spaced-repetition algorithm |
| Islamic season detection | Hijri calendar | Date range matching |
| Voluntary fast days | Hijri calendar | Known day patterns |
| Adaptive reminder timing | Dismiss patterns | Moving average adjustment |

### AI-Assisted (Optional enhancement — build second)

| Capability | What AI adds | Privacy Model |
|-----------|-------------|---------------|
| Natural-language task entry | Intent parsing from free text | Can be local (small model) |
| Weekly planning draft | Pattern recognition across weeks | Local data only; no cloud |
| Smart goal suggestions | "Based on your patterns, you might consider..." | Local inference only |
| Meal suggestions beyond rotation | Nutritional/seasonal/preference matching | Local; no dietary data to cloud |

### Human-Controlled (Never automate)

| Capability | Why human |
|-----------|-----------|
| Setting intentions | Spiritual act requiring personal reflection |
| Choosing weekly commitments | Autonomy and ownership |
| Writing reflections | Private, sacred practice |
| Deleting or modifying goals | User agency |
| Accepting/rejecting suggestions | Final authority always with user |
| Quran/worship goal setting | Between the user and Allah |

---

## 14. Lovable Allocation

**Deserves Lovable credits (UX-first work):**

| Task | Wave | Rationale |
|------|------|-----------|
| Family member switcher/selector UX | 2 | Visual interaction design |
| Per-member Daily Surface visual treatment | 2 | Calm/Vibrant presentation |
| Family weekly planning flow UI | 2 | Multi-step guided interaction |
| Child-appropriate view design | 2 | Specialized visual constraints |
| Intention/goal creation flow | 3 | Calm, reflective UX — critical to get right |
| Reflection writing space | 3 | Full-screen, distraction-free — needs design care |
| Weekly commitment picker UX | 3 | Selection interaction |
| Suggestion nudge design | 4 | Subtle, non-intrusive — needs visual refinement |
| Islamic season visual treatment | 5 | Seasonal theming for Calm/Vibrant |
| Hajj/Umrah preparation timeline UX | 5 | Multi-phase visual flow |

**Never use Lovable credits for:**
- Domain engine logic
- Data model changes
- Store modifications
- Algorithm implementation
- Test writing
- Migration scripts
- Conflict detection logic
- Recurrence logic

---

## 15. Gemini Allocation

**Engineering-first tasks for Gemini / coding agents:**

| Task | Wave | Rationale |
|------|------|-----------|
| Extend `family-model.ts` with roles | 2 | Pure domain logic |
| Add `assignedTo` to task/routine models | 2 | Data model extension |
| Per-member filtering in `daily-surface.ts` | 2 | Engine logic |
| Conflict detection in `rhythm-engine.ts` | 2 | Deterministic algorithm |
| `family-planning.ts` engine | 2 | New domain engine |
| Workload computation in review | 2 | Query/aggregation logic |
| `growth-engine.ts` | 3 | New domain engine |
| Goal-to-task/routine linking | 3 | Data model + query |
| Reflection model + persistence | 3 | Store + encryption |
| `automation-engine.ts` | 4 | Suggestion orchestration |
| Adaptive reminder timing | 4 | Algorithm |
| `islamic-calendar.ts` | 5 | Date calculation engine |
| `seasonal-engine.ts` | 5 | Generalized seasonal logic |
| Household memory queries | 5 | Query layer |
| Hajj/Umrah template generation | 5 | Template + task creation |
| Supabase migrations | 2–3 | Schema changes |
| Integration tests for each wave | 2–5 | Test coverage |

---

## 16. Claude / ChatGPT Allocation

**Research and review tasks:**

| Task | Wave | Rationale |
|------|------|-----------|
| Wave 2 specification review | 2 | Validate data model + architecture before engineering |
| Wave 3 "spiritual scoring" audit | 3 | Ensure goals/intentions don't create harmful gamification |
| Privacy architecture review | 3–4 | Review encryption, data flow, AI boundaries |
| Islamic calendar accuracy review | 5 | Validate hijri calculation approach + regional variations |
| Cross-wave dependency audit | 2–5 | Ensure no circular dependencies introduced |
| Feature priority re-evaluation | After each wave | Reassess based on what was learned |
| Competitive landscape update | Before each wave | Check for new entrants/shifts |
| UX copy/microcopy review | 2–5 | Tone, Islamic sensitivity, clarity |

---

## 17. Recommended Execution Sequence

```
Wave 2.0 MVP ──────────────────────────────────────────
  │  ├─ Gemini: member roles + assignedTo + filtering
  │  ├─ Gemini: conflict detection
  │  ├─ Gemini: workload computation
  │  ├─ Gemini: Supabase migration
  │  ├─ Gemini: integration tests
  │  └─ Lovable: member switcher UX + per-member Daily Surface
  │
Wave 2.1 ──────────────────────────────────────────────
  │  ├─ Gemini: family-planning engine
  │  ├─ Lovable: weekly planning flow UX
  │  └─ Lovable: child-appropriate view
  │
  │  ← Architecture gate (Claude/ChatGPT review) →
  │
Wave 3.0 MVP ──────────────────────────────────────────
  │  ├─ Gemini: growth-engine (intentions, goals, linking)
  │  ├─ Gemini: reflection model + encrypted persistence
  │  ├─ Gemini: weekly commitment selection logic
  │  ├─ Gemini: integration tests
  │  └─ Lovable: intention/goal creation UX + reflection space
  │
Wave 3.1 ──────────────────────────────────────────────
  │  ├─ Gemini: goal progress inference
  │  └─ Gemini: seasonal goal suggestions
  │
  │  ← Architecture gate →
  │
Wave 4.0 MVP ──────────────────────────────────────────
  │  ├─ Gemini: automation-engine (deterministic only)
  │  ├─ Gemini: proactive Daily Surface ordering
  │  ├─ Gemini: preparation reminders
  │  ├─ Gemini: integration tests
  │  └─ Lovable: suggestion nudge design
  │
Wave 4.1 ──────────────────────────────────────────────
  │  ├─ Gemini: adaptive reminder timing
  │  ├─ Gemini: meal rotation + grocery generation
  │  └─ Gemini: natural-language task entry (AI, opt-in)
  │
  │  ← Architecture gate →
  │
Wave 5.0 MVP ──────────────────────────────────────────
  │  ├─ Gemini: islamic-calendar engine
  │  ├─ Gemini: seasonal-engine (generalized)
  │  ├─ Gemini: family traditions model
  │  ├─ Gemini: integration tests
  │  └─ Lovable: seasonal visual treatment
  │
Wave 5.1 ──────────────────────────────────────────────
     ├─ Gemini: household memory queries
     ├─ Gemini: Hajj/Umrah templates
     ├─ Gemini: iCal + JSON export
     ├─ Lovable: Hajj/Umrah timeline UX
     └─ Lovable: year-over-year growth view

     ← Final architecture gate →
```

**Estimated timeline per wave MVP:** 2–3 weeks engineering + 1 week UX + 1 week review/fix = ~4–5 weeks per wave.

**Total estimated:** ~5–6 months for all four waves (2–5) at sustainable pace.

---

## 18. Definition of a Successful Firdaus

After Wave 5, Firdaus should feel like:

> **"The quiet, trusted companion that knows our household's rhythm."**

Specifically:

1. **A parent opens Firdaus in the morning** and sees — without tapping anything — what their family needs to do today, organized around prayer times, with no conflicts and no forgotten responsibilities.

2. **A child opens Firdaus** and sees their tasks, their Quran progress, and encouragement — nothing overwhelming, nothing surveillance-like.

3. **On Friday evening**, the family sits together and reviews the week in 5 minutes — what got done, who carried the load, what to focus on next week.

4. **A user sets an intention** — "I want to be closer to the Quran this quarter" — and over weeks, Firdaus quietly links this to their daily reading, reminds them gently, and asks during review: "How do you feel about your Quran journey this week?"

5. **When Ramadan approaches**, Firdaus already knows: last year's meal favorites, the Hifz goals, the adjusted routines. It suggests — doesn't impose — a preparation plan.

6. **When the phone has no internet**, everything works. The user forgets Firdaus needs connectivity at all.

7. **When a user considers switching to another app**, they realize: no other product understands their prayer schedule, their family's rhythm, their Islamic seasonal patterns, their household's accumulated knowledge. **Firdaus is genuinely difficult to replace.**

The product should feel **calm, capable, and Islamic** — not in a performative way, but in the way a well-organized Muslim household actually operates: with intention, rhythm, shared responsibility, and quiet trust in Allah's plan.

---

*Research completed: August 2026*
*Status: Ready for specification phase*
*Next step: Convert Wave 2.0 MVP into detailed engineering specification*
