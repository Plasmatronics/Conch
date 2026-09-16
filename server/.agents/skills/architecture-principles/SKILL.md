---
name: architecture-principles
description: Design or restructure server code when module boundaries, contracts, reuse, or cross-layer feature design matter.
---

# Architecture Principles

## Contract-first development

Each module exposes a typed contract. Consumers depend on that contract, not implementation details. Define and test the contract before implementation; contract changes require explicit approval because they affect all consumers.

For full-stack work, keep the backend service/API and frontend consumer independent. Connect them only through typed contracts, and test each in isolation. A frontend that must trace backend internals signals a broken boundary.

## Modularity and direction

- Make modules independently testable and replaceable.
- Compose focused modules; avoid god classes, hooks, and components.
- Keep dependencies flowing inward: domain → services → adapters.
- Use dependency injection to extract subsystems; keep main components as composition.
- If a feature requires understanding five or more files, improve the architecture before adding it.

## Converge on the intended design

When the right internal design is clear and all consumers are under this repository's control, migrate callers and remove the legacy path in the same change. Prefer deletion over transitional shims, compatibility layers, dual paths, or deprecated wrappers. Update types, tests, docs, examples, and rationale for the final contract.

For external consumers or deployed compatibility commitments, stage deliberately behind a versioned boundary. Still drive toward one final path rather than indefinitely maintaining two.

## Reuse and design exploration

Before adding code, search for existing utilities, patterns, shared types, and tests. Extract shared logic rather than copying it. For UI work, first check the established design system and connected component documentation.

Explore two or three competing designs before one-way-door decisions whose answer is not clear: new schemas, public service APIs, retries/queues/coordination, or new layer boundaries. Compare concrete type signatures and a caller. Do not explore mechanically established work, bug fixes, or constrained changes.

Build a reusable tool, generator, script, or skill only after a task has recurred enough to establish a reliable recipe and it will pay off in remaining work.

## Working in an unhealthy area

If the affected architecture cannot accept the change cleanly, flag the issue and recommend or perform a refactor first. While editing an area, correct nearby dead code, stale comments, inconsistent naming, missing handling, type gaps, pattern violations, and small related bugs unless the remedy requires a new unrelated subsystem.
