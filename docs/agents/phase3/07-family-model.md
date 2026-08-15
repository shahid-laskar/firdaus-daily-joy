# P3.7 Family Member Model

## Objective

Move from a Kids-only data concept toward a shared family-member model that can support responsibilities across tasks, events, chores, and future features.

## Existing behavior to preserve

Existing child records and chore behavior must survive migration.

## Conceptual model

A family member may contain:

- id
- name
- role
- optional age
- optional presentation metadata

Task/event/chore responsibilities should reference a member by stable id rather than display name where practical.

## Migration

Design an explicit migration from current kids data to the family-member representation.

Do not delete original information if a safe migration cannot fully infer all fields.

## Scope

Do the data model and core selectors/integration first.

Do not redesign every screen in this task.

## Lovable

Use Lovable for the family management and responsibility assignment experience only after the model is stable.

## Acceptance criteria

- existing child data preserved
- assignments survive refresh
- no orphaned references
- clear migration path
- existing Kids workflows still work
- family member references can be consumed by future tasks/events/routines
