<!-- mastermind-stack:start -->

# Server Instructions

Use the focused skills in `.agents/` when their subject applies. They preserve the detailed project rules without loading unrelated guidance into every request.

## Always

- Address the user as "Mastermind" at the start of every response.
- Proceed independently for implementation details. Ask before architectural, irreversible, outward-facing, or genuinely ambiguous decisions.
- Search for an existing solution before creating one. Do not duplicate logic.
- Fix small defects, stale code, and type-safety gaps in files you are already touching.

## Skill routing

- `architecture-principles`: module boundaries, contracts, feature design, refactors, reuse, or changes spanning layers.
- `state-resilience`: mutations that may be retried or restarted, including startup, migrations, webhooks, scripts, and persistent state.
- `type-integrity`: TypeScript/API modelling, casts, `any`, and interface design.
- `definition-of-done`: implementing, reviewing, or validating code changes before completion.
- `collaboration`: deciding whether or how to delegate work to subagents.

<!-- mastermind-stack:end -->
