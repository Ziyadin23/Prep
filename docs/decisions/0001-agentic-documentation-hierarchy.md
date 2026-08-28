# Decision 0001 - Agentic documentation hierarchy

- Status: accepted
- Date: 2026-08-28

## Context

The initial `Contracts/` system successfully made C00 and C01 resumable, but it
distributed authority across a plan, agent manual, progress ledger, index, and
manually maintained repository map. Product boundaries, status rules, ownership,
and handoff instructions were repeated. A new agent had to reconcile several
files before discovering that C02 was next.

## Decision

- Use root `AGENTS.md` only as the Codex bootstrap and workflow navigator.
- Keep stable product requirements and the ordered C00-C07 roadmap in
  `docs/product/SPEC.md`.
- Keep implemented system shape and technical boundaries in `ARCHITECTURE.md`.
- Keep exactly one current, self-contained plan under `docs/exec-plans/active/`
  during normal roadmap work.
- Move verified plans to `docs/exec-plans/completed/` as durable evidence and
  history.
- Let the active plan own progress, blockers, verification, and handoff instead
  of maintaining a parallel global ledger.
- Discover repository contents from the filesystem and search tools rather than
  maintaining a file-by-file map.

## Consequences

A fresh session has a deterministic reading path and one current task. Product
truth, architecture, and transient progress have separate owners, so conflicts
are easier to detect. Completed contract context remains available without
burdening every startup. The active plan must be kept current because there is no
fallback progress ledger; Git state and executable checks remain the authority
for repository and verification claims.
