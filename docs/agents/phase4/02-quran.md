# P4.2 Quran API Integration

## Objective

Expand beyond the existing limited Quran corpus while retaining offline usability for bookmarked/recent content.

## Inspect first

Determine:
- current Quran reader
- current content source
- bookmark model
- reading log
- translation preference
- network abstraction
- cache/persistence patterns

## Requirements

- integrate a suitable Quran API through an isolated service
- keep UI independent from the API implementation
- cache bookmarked/recent content
- preserve current bookmarks and reading logs
- handle network errors
- avoid requiring a network request for already-cached bookmarked content

## Product rule

Do not turn this into a complete Quran-platform rebuild.

## Acceptance criteria

- API errors are handled
- cached content remains readable offline
- existing bookmarks migrate cleanly
- reading log remains intact
- tests cover cache hit and network failure
