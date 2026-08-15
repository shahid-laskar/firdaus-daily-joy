# Claude Sonnet — Review Prompt

Review the implementation as a senior engineer/product architect.

Do not rewrite the feature. Review it against the supplied task specification and repository architecture.

## Review areas

### Architecture

- Is the implementation consistent with the existing architecture?
- Is responsibility placed in the right layer?
- Is logic duplicated?
- Are dependencies unnecessarily increased?

### Data integrity

- Are migrations backward-compatible?
- Can old users lose data?
- Are localStorage keys/data shapes handled safely?
- Does refresh preserve state?

### Algorithms

- Are metrics calculated consistently?
- Are thresholds arbitrary?
- Is correlation described as correlation rather than causation?
- Are dates/time zones handled correctly?
- Are recurrence calculations consistent with existing behavior?

### UX

- Is the feature understandable without explanation?
- Does it preserve the calm product philosophy?
- Are empty/loading/error states handled?
- Does it work well on mobile?

### Regression risk

- What existing features could have been affected?
- Are navigation, theme, state, persistence, and build behavior intact?

### Testing

- Are the critical branches tested?
- What edge cases are missing?

## Response format

Return:

1. Critical issues
2. Important issues
3. Minor issues
4. What is well implemented
5. Required fixes before merge
6. Optional improvements

Do not invent requirements outside the task specification unless a security, correctness, or data-integrity problem makes them necessary.
