# Firdaus Phase 3 & Phase 4 Agent Execution Pack

This pack is the execution layer for the Firdaus/Sunnah Home roadmap.

## Source of truth

Use the current GitHub repository as the implementation source of truth.

The supplied roadmap identifies:
- Phase 3 — Intelligence & Automation
  - Smart weekly meal suggestions
  - Budget insights
  - Salah consistency analysis
  - Mood + activity correlation
  - Smart reminders
  - Family member model
- Phase 4 — Differentiation
  - Ramadan mode
  - Quran API integration
  - Hifz revision scheduler
  - Intelligent daily operating surface
  - PWA with service worker

The current task tracker marks Phase 0–2 work as completed and Phase 3–4 as pending. Before implementing anything, agents must verify the actual repository state.

## Agent roles

### ChatGPT
Use for:
- product decomposition
- research
- prompt creation
- acceptance criteria
- integration strategy
- final product QA

### Claude Sonnet
Use for:
- architecture review
- code review
- migration/risk analysis
- algorithm critique
- identifying hidden regressions

### Gemini Pro
Primary implementation agent:
- repository inspection
- core engineering
- data models
- analytics engines
- business logic
- migrations
- tests
- type/build fixes
- integration

### Lovable
Scarce UI/UX accelerator:
- premium interaction design
- visual polish
- dashboards
- mobile UX
- complex visual flows
- flagship surfaces

Lovable should not be the default agent for data-model refactors, algorithms, persistence migrations, service workers, testing, or backend/infrastructure work.

## Lovable credit strategy

Reserve the five Lovable passes for:
1. Insights / analytics experience
2. Family experience
3. Ramadan mode
4. Hifz revision experience
5. Intelligent Daily Operating Surface

Each Lovable task must have a narrow scope and explicit "do not modify" boundaries.

## Git strategy

Never let unrelated agents work directly on main.

Recommended branches:
- phase3/intelligence-foundation
- phase3/budget-insights
- phase3/salah-analysis
- phase3/mood-correlation
- phase3/smart-reminders
- phase3/meal-intelligence
- phase3/family-model
- phase4/pwa
- phase4/quran
- phase4/hifz
- phase4/ramadan
- phase4/daily-operating-surface

Merge only after validation.

## Operating rule

Audit → Design → Implement → Polish → Validate → Review → Merge

Do not rebuild features that already exist.
Preserve existing localStorage data.
Use backward-compatible migrations.
Reuse existing components, state management, theme tokens, and dependencies wherever sensible.
