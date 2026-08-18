# FIRDAUS WAVE 2.0-A — FAMILY ROLES & RESPONSIBILITY ASSIGNMENT

Repository:
~/firdous/veedu-home-soul

Wave 1 is COMPLETE and production-validated.

Wave 1 provides:
- Prayer Rhythm Engine
- Prayer-aware task scheduling
- Family Routines
- Daily Surface
- Family Member model
- Calm/Vibrant experiences

We are now beginning Wave 2: FAMILY OPERATING SYSTEM.

IMPORTANT:
- Do NOT use Lovable.
- Do NOT redesign UI.
- Do NOT start conflict detection, workload analytics, or weekly planning yet.
- Build only the domain/data foundation required for multi-member household coordination.
- Preserve all existing behavior and backward compatibility.
- Domain logic must remain experience-agnostic.

Read the approved future roadmap:
docs/waves/future_product_roadmap.md

==================================================
OBJECTIVE
==================================================

Move Firdaus from a primarily single-user perspective toward a
multi-member household model.

The first capability is explicit responsibility assignment.

Existing FamilyMember becomes the identity source.

Tasks and routine ownership/steps should be able to reference a
family member using stable IDs.

==================================================
1. AUDIT CURRENT MODELS
==================================================

Inspect:

- family-model.ts
- Task model
- Routine model
- RoutineStep
- Kids/chores
- store.ts
- backup.ts
- Supabase sync
- Daily Surface
- existing assignment behavior

Determine exactly what fields already exist.

DO NOT duplicate existing fields.

==================================================
2. FAMILY MEMBER ROLES
==================================================

Extend the existing FamilyMember model minimally.

Target conceptual roles:

admin
member
child

Use a typed representation.

Requirements:

- backward-compatible
- sensible default for existing members
- no destructive migration
- no complex custom permission hierarchy

Do NOT implement authentication/authorization in this task.

These are PRODUCT roles for household filtering and ownership, not backend security roles.

==================================================
3. TASK ASSIGNMENT
==================================================

Add optional:

assignedTo?: memberId

to the existing Task model.

Existing tasks without assignedTo remain valid.

Do not create a separate Assignment entity unless absolutely necessary.

The stable family member ID is authoritative.

Never use member name as identity.

==================================================
4. ROUTINE ASSIGNMENT
==================================================

Inspect the existing Routine model.

It already supports:
- routine ownership
- step assignees

Ensure the model is consistent with the new task assignment convention.

Do not duplicate:
- owner
- memberId
- assigneeId
- assignedTo

without a clear semantic distinction.

If multiple fields already exist, document exactly what each means and normalize terminology where safely possible.

==================================================
5. FAMILY VISIBILITY
==================================================

Introduce the minimum domain representation needed to support:

Household view
vs.
member-specific view

Do not implement UI yet.

Create pure filtering/selecting functions if needed.

The functions should answer:

"Which tasks/routines belong to member X?"

and:

"Which items are household-wide?"

==================================================
6. DAILY SURFACE PREPARATION
==================================================

Do not redesign buildDailyThread().

Add only the minimum support needed so a future W2.0-B task can pass:

memberId

and obtain a filtered Daily Surface.

Prefer:

buildDailyThread({
  ...existingData,
  memberId
})

or an equivalent clean API.

Do not hardcode member filtering into every feature.

==================================================
7. HOUSEHOLD VISIBILITY
==================================================

Introduce an explicit concept for whether a task is household-visible only if the current architecture actually requires it.

Avoid unnecessary fields.

A task should not accidentally disappear merely because it has no assignedTo.

Define safe semantics:

assignedTo = undefined
→ household/unassigned

assignedTo = memberId
→ member-specific assignment

Do not assume that assigned means private.

==================================================
8. CHILD SAFETY
==================================================

The existing child model must remain intact.

Do not introduce:
- location tracking
- screen-time tracking
- surveillance
- analytics on children
- gamification

Child role is primarily for:
- visibility
- assignment
- appropriate presentation later

==================================================
9. PERSISTENCE
==================================================

Verify new fields survive:

- localStorage
- refresh
- backup/export
- import
- Supabase sync

Use additive changes only.

No destructive migration.

Existing data must continue to load.

==================================================
10. DOMAIN / EXPERIENCE INDEPENDENCE
==================================================

The following must remain untouched by presentation concerns:

- family-model.ts
- daily-surface.ts
- task logic
- routine-engine.ts

No imports from:
- Calm
- Vibrant
- theme
- CSS
- React UI

==================================================
11. TESTS
==================================================

Add focused tests for:

FamilyMember roles:
- existing member defaults safely
- admin
- member
- child

Task assignment:
- unassigned task
- assigned task
- valid member
- invalid member
- assignment persistence

Routine:
- household routine
- member-owned routine
- step assignee

Filtering:
- household view
- member view
- correct exclusion/inclusion

Backward compatibility:
- old task data
- old family data
- existing chores
- existing routines

Serialization:
- localStorage
- JSON backup roundtrip

Run:

npx tsx --test src/lib/*.test.ts
npx tsc --noEmit
npm run build

==================================================
12. DO NOT IMPLEMENT YET
==================================================

Do NOT implement:

- per-member UI
- member switcher
- conflict detection
- workload analytics
- weekly family planning
- child-specific screen
- Supabase RLS changes
- new family UX

Those are later W2 tasks.

==================================================
13. COMMIT
==================================================

Commit:

feat: add family responsibility model

==================================================
FINAL REPORT
==================================================

Return:

### Existing Model Audit
### Family Roles
### Task Assignment
### Routine Assignment
### Filtering API
### Daily Surface Preparation
### Persistence
### Migration
### Tests
### Typecheck
### Build
### Experience Independence
### Known Limitations
### Commit