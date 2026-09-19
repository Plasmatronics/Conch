---
name: server-change-definition-of-done
description: Verify a server code change before declaring it complete, including tests, documentation, configured checks, and architectural quality.
---

# Definition of Done

Read `mastermind.config.json` for project commands and optional conventions. If a value is absent, follow repository instructions, then sane defaults.

- Add adequate tests for changed behavior, including errors, edges, and boundaries.
- If tests already exist for changed behavior (TTD), then go ahead and validate the behavior against these tests.
- If a coverage matrix exists, update the affected feature row. Do not edit generated indexes directly.
- Keep affected documentation current; add documentation for meaningful new concepts, APIs, or architectural patterns.
- If the project enables a component workshop, add or update stories for every rendered component and validate changed stories with its focused checks when available.
- Run `checkCommand` and `testCommand` before declaring the work complete. In this server, these are currently `npm run lint && npm run typecheck` and `npm test`.

Completion requires the architecturally appropriate solution, not a working workaround. Restructure when an established, simpler, more maintainable approach is available.
