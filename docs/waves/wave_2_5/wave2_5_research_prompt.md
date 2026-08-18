# FIRDAUS — MASTER PRODUCT & ARCHITECTURE RESEARCH
# WAVES 2–5

You are conducting a comprehensive forward-looking research sprint for Firdaus.

CURRENT PRODUCT STATE

Firdaus is a Muslim household / personal operating system.

Completed:

PHASE 0–2
- Core application foundation
- Tasks
- Notes
- Calendar
- Meals
- Grocery
- Kids / Family
- Deen
- Budget
- Me
- Review
- local-first state
- Supabase synchronization

PHASE 3 — INTELLIGENCE
- Intelligence foundation
- Budget Insights
- Salah Analysis
- Mood intelligence
- Meal intelligence
- Smart reminders
- Family model
- Analytics / Trends
- Weekly Review

PHASE 4 — PLATFORM / DEEN
- PWA
- Offline Service Worker
- Quran service + offline cache
- Hifz spaced-repetition scheduler
- Ramadan Mode
- Daily Operating Surface

WAVE 1 — RHYTHM
- Prayer Rhythm Engine
- Prayer-aware task scheduling
- Family Routines
- Unified Rhythm → DayRhythm → Daily Surface architecture
- Routine authoring UX
- Prayer-relative task UX
- Kids and Routines as separate destinations
- Calm experience
- Vibrant experience
- Vibrant UX integration

CURRENT ARCHITECTURAL PRINCIPLE

Firdaus separates:

DOMAIN / BUSINESS LOGIC
        ↓
NEUTRAL DATA / ENGINES
        ↓
EXPERIENCE PRESENTATION

The domain must remain independent of:

- Calm
- Vibrant
- CSS
- UI components

Existing important domain engines include:

- rhythm-engine.ts
- routine-engine.ts
- daily-surface.ts
- reminder-engine.ts
- recurrence.ts
- family-model.ts
- intelligence.ts
- budget-intelligence.ts
- salah-intelligence.ts
- mood-intelligence.ts
- meal-intelligence.ts
- hifz-scheduler.ts
- ramadan.ts
- quran-service.ts

Do not propose unnecessary replacement architectures.

==================================================
OBJECTIVE
==================================================

Research and design the next major product waves:

WAVE 2 — FAMILY OPERATING SYSTEM
WAVE 3 — PERSONAL GROWTH / LIFE MANAGEMENT
WAVE 4 — INTELLIGENT AUTOMATION
WAVE 5 — LONG-TERM DIFFERENTIATION

Do NOT assume the tentative names or feature lists below are correct.

Your job is to determine what Firdaus SHOULD become.

We want product insight, not feature accumulation.

==================================================
KEY PRODUCT QUESTION
==================================================

Firdaus already understands:

- prayer times
- the user's day
- tasks
- routines
- family members
- household activities
- Quran / Hifz
- Ramadan
- budget
- habits
- reminders
- weekly activity

What is the highest-value next layer?

The product should reduce:

- cognitive load
- planning effort
- household coordination effort
- forgotten responsibilities
- fragmented information
- repeated manual organization

without becoming:

- a complicated project-management app
- a generic productivity clone
- an AI chatbot with a calendar
- an overly gamified habit tracker
- a social network
- a bloated family-management suite

==================================================
WAVE 2 — FAMILY OPERATING SYSTEM
==================================================

Investigate:

- weekly family planning
- household planning
- family responsibilities
- delegation
- handoffs
- family calendar intelligence
- routines + events + tasks
- family preparation workflows
- weekly family review
- household workload visibility
- child responsibilities
- parent responsibilities
- household vs individual ownership
- conflict detection
- recurring household operations

Determine:

1. What should actually exist?
2. What should NOT exist?
3. Which existing models can be reused?
4. What new domain models are genuinely necessary?
5. How should this interact with Rhythm Engine?
6. How should it interact with Daily Surface?
7. What should be visible to children vs adults?
8. What is the minimum viable Wave 2?

==================================================
WAVE 3 — PERSONAL GROWTH
==================================================

Investigate how Firdaus can connect:

Intentions
    ↓
Goals
    ↓
Weekly commitments
    ↓
Daily actions
    ↓
Review
    ↓
Adjustment

Research:

- personal goals
- Quran goals
- Hifz goals
- worship goals
- fitness goals
- learning goals
- household goals
- weekly intentions
- habit formation
- reflection
- progress
- weekly review
- goal-to-task linking
- goal-to-routine linking

Avoid creating another generic OKR/productivity system.

Determine how Islamic concepts such as:

- niyyah
- salah
- dhikr
- Quran
- sabr
- shukr
- ihsan

could inform the product experience WITHOUT turning the application into an artificial religious scoring system.

Determine:

- what should be measurable
- what should remain qualitative
- what should remain private
- what should never be gamified

==================================================
WAVE 4 — INTELLIGENT AUTOMATION
==================================================

Research where intelligence can safely reduce user effort.

Investigate:

- contextual recommendations
- smart task placement
- routine suggestions
- schedule conflict detection
- preparation reminders
- missed-task recovery
- weekly planning assistance
- meal planning
- grocery generation
- family coordination
- Quran/Hifz planning
- Ramadan preparation
- proactive Daily Surface
- adaptive reminder timing
- natural-language planning

Critically distinguish:

DETERMINISTIC AUTOMATION
vs
AI ASSISTANCE
vs
USER CONTROL

Do not recommend AI merely because it is fashionable.

Determine what can be handled by deterministic code and what genuinely benefits from AI.

Investigate privacy implications of AI processing.

Prefer local/on-device logic where practical.

==================================================
WAVE 5 — LONG-TERM DIFFERENTIATION
==================================================

Research what could make Firdaus genuinely difficult to replace.

Investigate:

- unique Muslim household workflows
- prayer-centered operating model
- family rhythm
- household knowledge
- long-term personal context
- Islamic seasonal intelligence
- Ramadan
- Hajj / Umrah preparation
- Islamic calendar intelligence
- family traditions
- household memory
- long-term planning
- optional integrations
- ecosystem opportunities
- interoperability

Do NOT propose features simply because competitors have them.

Find potential product moats.

==================================================
COMPETITIVE RESEARCH
==================================================

Research relevant products across categories:

Muslim apps
Family organization
Task management
Calendar/planning
Habit/goal apps
AI assistants
Household management
Quran/Hifz applications

Look for:

- what users love
- what users hate
- common failure modes
- feature bloat
- retention mechanisms
- UX patterns
- unmet needs
- underserved Muslim household scenarios

Use current information where appropriate.

Clearly distinguish:

SOURCE EVIDENCE
MODEL INFERENCE
PRODUCT RECOMMENDATION

==================================================
USER EXPERIENCE
==================================================

Research how Firdaus should evolve across:

Calm
Vibrant

The domain must remain shared.

Determine where visual differences actually provide value.

Do not allow the two experiences to become separate products.

==================================================
ARCHITECTURE
==================================================

For every proposed major capability determine:

- existing model reusable?
- existing engine reusable?
- new domain model required?
- new persistence required?
- localStorage impact?
- Supabase impact?
- migration required?
- offline behavior?
- PWA implications?
- privacy implications?
- experience independence?
- testability?
- deterministic vs AI?

Prefer incremental architecture.

Avoid:

- duplicate engines
- duplicate stores
- duplicate scheduling
- duplicate recurrence
- feature-specific state silos
- UI-driven business logic

==================================================
PRIORITIZATION
==================================================

For every proposed feature score:

VALUE
1–5

USER FREQUENCY
1–5

DIFFERENTIATION
1–5

IMPLEMENTATION COMPLEXITY
1–5

ARCHITECTURAL RISK
1–5

PRIVACY RISK
1–5

DEPENDENCY ON OTHER FEATURES
1–5

Then calculate a recommended priority.

Identify:

MUST HAVE
SHOULD HAVE
COULD HAVE
DO NOT BUILD

==================================================
TOKEN / ENGINEERING EFFICIENCY
==================================================

We have limited Lovable credits.

Therefore distinguish:

ENGINEERING-FIRST
→ Gemini / coding agent

UX-FIRST
→ Lovable

RESEARCH
→ ChatGPT / Claude

ARCHITECTURE REVIEW
→ Claude / ChatGPT

Do not waste Lovable credits on backend/domain engineering.

Identify which future work should require Lovable and which should never require it.

==================================================
DELIVERABLE
==================================================

Produce ONE comprehensive roadmap.

Structure:

# FIRDAUS FUTURE PRODUCT ROADMAP

## 1. Current Product Assessment

## 2. Product Thesis

## 3. Wave 2 — Family Operating System
### Problem
### User jobs
### Proposed capabilities
### Non-goals
### Data model
### Architecture
### UX
### MVP
### Later enhancements
### Risks

## 4. Wave 3 — Personal Growth
Same structure.

## 5. Wave 4 — Intelligent Automation
Same structure.

## 6. Wave 5 — Long-Term Differentiation
Same structure.

## 7. Cross-Wave Architecture

Show how the waves build on one another.

Example:

Rhythm
   ↓
Family
   ↓
Goals
   ↓
Automation
   ↓
Long-term intelligence

Do not create circular dependencies.

## 8. Competitive Landscape

Summarize important findings.

## 9. Feature Priority Matrix

Provide a ranked list.

## 10. Features NOT Worth Building

This section is mandatory.

## 11. Architectural Risks

## 12. Privacy / Trust Risks

## 13. AI Opportunities

Separate:

Deterministic
AI-assisted
Human-controlled

## 14. Lovable Allocation

Identify exactly which future UX tasks deserve Lovable credits.

## 15. Gemini Allocation

Identify which engineering tasks should go to Gemini.

## 16. Claude / ChatGPT Allocation

Identify which tasks should remain research/review tasks.

## 17. Recommended Execution Sequence

Give the exact order in which Firdaus should be developed.

## 18. Definition of a Successful Firdaus

Describe what the product should feel like after Wave 5.

==================================================
IMPORTANT CONSTRAINTS
==================================================

Do not recommend implementation yet.

Do not write code.

Do not modify the repository.

Do not invent existing capabilities.

Do not assume every suggested feature belongs in Firdaus.

Favor:

- simplicity
- Muslim household relevance
- low cognitive load
- privacy
- offline-first behavior
- architectural integrity
- real user value
- differentiation

The final roadmap should be actionable enough that we can later convert each wave into:

Research
→ specification
→ engineering tasks
→ Gemini implementation
→ architecture review
→ Lovable UX
→ final gate

But for this task, ONLY produce the research and roadmap.