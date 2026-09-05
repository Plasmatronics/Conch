---
name: server-state-resilience
description: Implement operations that may be retried, restarted, or replayed, including startup, migrations, webhooks, and stateful scripts.
---

# State Resilience

Every state-mutating operation that can be retried, restarted, or replayed must converge on the same correct state. Decide before implementation what occurs on a second execution and after a crash halfway through.

Apply this especially to service startup, migrations, webhook handlers, scripts that change state files, and orchestration cleanup. Reconcile existing state, clean or adopt stale artifacts, and validate the post-operation invariant rather than assuming a clean slate or merely replaying a step.

Restart failures usually arise from persistent state rather than changed code. Inspect configuration, caches, locks, and serialized state first. If clearing state fixes the failure, add state validation or reconciliation instead of a code-only workaround.

The operation is incomplete if its outcome depends on whatever partial state a prior run left behind.
