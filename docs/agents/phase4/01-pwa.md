# P4.1 PWA + Service Worker

## Objective

Make Firdaus installable and provide robust offline application-shell behavior using the existing architecture.

## Inspect first

Determine:
- framework/runtime
- current deployment
- current offline/localStorage behavior
- service worker support
- asset pipeline
- manifest configuration

## Requirements

- installable PWA
- correct manifest metadata
- application shell caching
- predictable update behavior
- graceful offline state
- no data loss on cache refresh

## Critical boundary

Service worker caching must not accidentally serve stale application code indefinitely.

## Acceptance criteria

- installation works
- offline app shell loads
- local data remains available
- update strategy is documented/tested
- production build succeeds
