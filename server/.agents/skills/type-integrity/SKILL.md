---
name: type-integrity
description: Model TypeScript and API data accurately when defining or changing types, interfaces, boundary contracts, casts, or error handling.
---

# Type Integrity

Model the real data and behavior at each boundary. Use explicit types and contracts that match the domain; do not silence uncertainty with `any`, unsafe casts, or vague escape hatches.

Keep a module's public contract separate from implementation details. If a type change alters an established contract, get explicit approval before making it, then update its consumers and contract tests together.

When a type mismatch appears, correct the source model, parsing, validation, or boundary contract instead of adding a local cast unless the cast is demonstrably safe and documented by the type system's limitations.
