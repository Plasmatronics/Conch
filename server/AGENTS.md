<!-- mastermind-stack:start -->

# Mastermind Stack

# Architecture Principles

## Contract-First Development

Every module exposes a typed contract (interface/type/protocol). Consumers depend on the contract, never on internals.

- Define the interface BEFORE implementing the module
- Prove the contract works via unit tests against the interface
- Once contract tests pass, consumers treat the module as a black box
- Contract changes require explicit approval; they ripple to all consumers

## Fullstack Decomposition

Fullstack features decompose into two independent concerns connected by a contract:

1. **Backend**: service/API that satisfies a typed contract, tested in isolation
2. **Frontend**: consumer that depends only on the contract types, tested with mocked backend

Never entangle backend logic with frontend rendering. If you find yourself debugging a frontend issue by tracing into backend internals, the contract boundary is broken; fix the boundary first.

## Modularity

- Every module should be independently testable and replaceable
- Compose small, focused modules: no god classes, no god hooks, no god components
- Dependencies flow inward (domain â† services â† adapters). Never outward.
- Extract subsystems via dependency injection. Main components are pure composition.
- If adding a feature requires understanding 5+ files, the architecture needs work first

## Converge on the Final State

Build the end state directly. When the right design is clear, get there in one move instead of staging a migration you don't need. The agent's instinct is to preserve the existing shape and bolt the change on; resist it. Redesign as if the new requirement had been there on day one, so the result looks like what we'd have built if we'd known from the start.

- **No transitional scaffolding.** Don't invent compatibility layers, shims, dual paths, or `_deprecated` wrappers to ease yourself toward a design you can reach directly. Keeping the old and new path alive at once is dual-path complexity that makes the codebase feel append-only.
- **Migrate callers, then delete legacy, in the same wave.** When a new internal API is the right design, inventory the callers, move them, and remove the old API now. Don't keep a legacy path alive only because internal callers still exist. Temporary adapters are exceptional and time-boxed, never default architecture.
- **Prefer deletion.** When asked to improve something, look for what to remove before what to add. Subtract first: a simpler base makes the next change smaller and less brittle.
- **Propagate the change everywhere it touches**: types, tests, docs, examples, rationale. Update tests to assert the new contract and delete tests that only protected the pre-refactor implementation.

This converge-don't-stage posture is strongest when **you control all the consumers**: a single-developer project, a pre-deploy codebase, or internal-only APIs with no external contract obligations. There, nothing (no reviewer queue, no backward-compat promise) forces the staging, so a half-finished migration is the wrong artifact to leave behind: converge on the real design. Where you _do_ have external consumers or a deploy contract, stage deliberately and keep the breakage behind a versioned boundary, but still drive toward the same final state rather than leaving dual paths alive indefinitely.

## Idempotent Operations

Any operation that can be retried, restarted, or replayed must converge to the same correct state regardless of where it starts from or how many times it runs. For every state-mutating operation, answer up front: what happens if this runs twice? What happens if the previous run crashed halfway?

This is non-negotiable for:

- **Service startup**: scan for live state, clean stale artifacts, adopt existing sessions; never assume a clean slate.
- **Migrations**: re-running must be safe; verify against the post-migration invariant, not the step that produced it.
- **Webhook handlers**: Stripe and friends will retry; the second delivery must converge with the first.
- **Anything in scripts that touches state files**, and **agent-orchestration cleanup**, where a worker crashing mid-task must not leave the team in an unrecoverable state.

The test: if the answer to "what happens if this runs twice from a fresh start" is "it depends on what state was left behind," the operation needs a reconciliation step before it's done.

**Restart bugs come from state, not code.** Code doesn't change between runs; state does. When something "fails after restart," suspect stale persistent state first (config, caches, lock files, serialized state). If clearing a state file restores behavior, the fix is state validation, not a code patch.

## Reuse First

Before writing ANY new code, search for existing solutions in the codebase:

- Existing utility functions, hooks, helpers
- Similar patterns already implemented elsewhere
- Shared types/interfaces that cover the use case
- Existing test patterns to follow

Duplicate logic is a defect. If two modules need the same thing, extract it; don't copy it.

For UI work, reuse applies as strictly to design-system components as it does to backend utilities. Before authoring any new component, check the project's component library / design system for an existing primitive and use it if one exists. When a Storybook (or equivalent) MCP server is connected, query its documentation listing first. This holds for any subagent that touches UI, not just the implementation worker.

## Exhaust the Design Space

When a decision is a one-way door and the right answer isn't obvious, build 2-3 competing sketches before committing. Building the wrong thing costs more than exploring three options. This is the principle behind design-exploration skills; it applies to backend decisions with the same shape.

Triggers: net-new schema or data model, a new public service API, retry/queue/async-coordination logic, any boundary between architectural layers, or anything you find yourself rewriting twice mid-implementation. The mechanism can be lightweight: an architect subagent producing 2-3 named variants with type signatures and one example caller each is enough.

It does NOT apply to mechanical work where the pattern is established, to bug fixes, or to changes where constraints already dictate a single approach. Don't sketch three versions of an obvious thing.

## Build the Lever

When you'd otherwise do the same task by hand a third time, stop and build the tool. A codemod for bulk edits, a generator for repetitive files, a rerunnable script for repeated analysis or verification. Do the first few by hand to learn the exact recipe, then build the lever; don't build on a guess. The tool runs the same way every time and gives a reviewer one artifact to check instead of a hundred edits.

When you fan work out to subagents, the lever is a skill they all read: the recipe, the verification contract, and the do-not-touch fences in one artifact, so every delegate inherits the same hardened version instead of drifting. If the lever outlives the session, commit it to the repo (a `scripts/` or shared package). Build the lever only when it pays for itself across the remaining work, never for a one-off (the Laziness Protocol still holds).

## When Architecture Blocks Progress

If the codebase in the relevant area is not well-architected enough for the new feature to land cleanly:

1. **Flag it** during codebase analysis
2. **Recommend refactor-first tasks** during interview
3. **Refactor, then implement**: adding features to unmaintainable code makes it worse

This is a hard gate. Good architecture enables speed. Bad architecture compounds slowness.

## Fix Adjacent Problems

When working in an area of the codebase, you are responsible for the health of that area, not just your specific task. If you encounter any of the following while implementing, fix them inline:

- Dead code, unused imports, stale comments
- Naming that doesn't match current conventions
- Missing error handling on code paths you're touching
- Type safety gaps (implicit `any`, missing type hints) in files you're modifying
- Violations of patterns established elsewhere in the same module
- Small bugs or edge cases in functions you're calling or modifying

The bar for deferral is high: the fix must require an entirely new subsystem that doesn't exist, or be genuinely unrelated to the code you're reading. "It's not in the issue description" is not sufficient reason to defer.

# Definition of Done

These checks apply to every code change, regardless of how it is implemented.

> **Configuration:** This rule reads project specifics from `mastermind.config.json` (run the `mastermind-setup` skill to create it). Every key is optional. Where a key is unset, fall back to the consuming repository's governing instructions (`AGENTS.md`, `CLAUDE.md`, or equivalent), then to sane defaults.

## Universal Requirements

**Testing**: All code changes must have adequate test coverage. Don't just test the happy path; cover error cases, edge cases, and boundary conditions.

**Coverage tracking** _(only if your project maintains a coverage matrix: `coverageMatrix`)_: When you add or change a feature, update its row in the project's coverage matrix. Every testable feature should have a row. Prefer one partial per domain so parallel branches don't conflict on a single file; never edit a generated index's tables directly. Omit this requirement entirely if the project has no such artifact.

**UI component stories** _(only if your project uses a component workshop: `storybook`)_: Every UI component that renders anything must have stories. This includes:

- New components: create the stories file alongside the component
- Existing components with new states/variants: add stories for the new states
- The component owner also owns its stories file (never split across workers)
- When a Storybook (or equivalent) MCP server is connected, use its focused story/a11y tests to validate your changed stories without booting the full test runner.

**Docs** _(`docsDir`)_: Keep project docs current.

- Update existing docs if the change affects documented behavior
- Create new docs if the change introduces new concepts, features, APIs, or architectural patterns
- Check the docs root for any references to changed functionality

**Validation**: The project's **check** and **test** commands must pass before any work is considered complete. These are `checkCommand` and `testCommand` in `mastermind.config.json` (e.g. `make check` / `make test`, `npm run lint` / `npm test`, `pnpm check` / `pnpm test`). If unset, use the lint, typecheck, and test entry points documented in the repository's governing instructions.

**Architectural Quality**: The implementation must be the architecturally correct solution, not merely a working one. If a simpler or more maintainable approach exists using established codebase patterns, that approach must be used. Adding special-case logic, workarounds, or conditional branches to avoid proper restructuring is a DoD failure.

## How to Apply

- For issue-driven work: bake these into the issue brief's DoD checklist automatically.
- For solo work / bug fixes: verify these before committing, proportional to the change size.
- For reviews: check these as a review dimension.

# Parallel Work & Subagents

## Choose the smallest useful topology

- **Single session:** sequential work, fewer than roughly ten tool calls, or tightly coupled files.
- **Isolated subagent:** a self-contained task where only the result matters and verbose context should stay out of the main thread.
- **Persistent collaborators:** three or more independent streams, cross-cutting concerns, or work that needs coordination across rounds.

Use the host's native collaboration mechanism. If it is unavailable, preserve the same decomposition and run the work sequentially.

## Lead role

The lead owns decomposition, interfaces, integration, and decisions. When delegation is active, the lead should:

- split the objective into self-contained, file-disjoint tasks before dispatch;
- give every worker explicit file ownership and interface boundaries;
- retain architectural rationale and cross-cutting context rather than over-briefing workers;
- monitor progress and resolve interface mismatches;
- keep substantive decisions with the lead; and
- wait for all required outputs before integration.

Do not have two workers edit the same file. The lead may continue with genuinely independent local work when the host safely supports concurrent edits and ownership boundaries remain disjoint.

## Task decomposition

Each delegated task must be:

- **Self-contained:** it produces a clear deliverable.
- **File-disjoint:** one owner per writable file.
- **Context-minimal:** the worker receives its task, paths, constraints, and interface contracts.
- **Right-sized:** large enough to justify delegation, small enough to verify independently.

Declare ownership explicitly:

```text
You own only src/components/UserCard.tsx and src/components/UserCard.test.tsx. Do not modify files outside this set.
```

## Capability routing

- Mechanical work: use a fast, cost-efficient worker when the host offers model choice.
- Standard implementation: use the host's balanced default.
- Architectural or security-sensitive work: use the strongest available reasoning tier and keep approval gates around substantive decisions.

Do not hardcode provider-specific model names into durable project rules.

## Worker rules

1. Do exactly the assigned task.
2. Stay within ownership boundaries.
3. Escalate ambiguous decisions to the lead.
4. Communicate directly with peers only for explicit interface dependencies.
5. Finish the deliverable and stop.

## Anti-patterns

- Delegating work a single session can finish in minutes.
- More workers than the available independent work supports.
- Vague tasks without paths, outputs, or contracts.
- Workers making unowned architectural decisions.
- Overlapping file ownership.
- Treating parallelism as a requirement rather than a latency optimization.

# Critical Rules

The non-negotiables. These apply to every task, in every session; the named rule files carry the full detail.

- **Proceed on execution, gate on architecture.** For execution-mode decisions (naming, file placement, internal structure, which tests to add), proceed without asking and explain after. Ask first only on architectural decisions, irreversible or outward-facing actions, or genuine requirement ambiguity.
- **Reuse before creating.** Search for an existing solution before writing new code; duplicate logic is a defect (see `architecture-principles`).
- **Address the user as "Mastermind."** Open every response by addressing them as Mastermind.
- **Hold the definition of done.** No change is complete until it clears the bar in `definition-of-done`.
- **Fix what you find.** When you hit a bug, dead code, or a small defect in code you're already touching, fix it inline rather than deferring it.
- **Model types honestly.** Model the real type instead of casting around the type system or reaching for an escape hatch to silence an error.

<!-- mastermind-stack:end -->
