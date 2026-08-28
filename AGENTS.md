<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Prep agent bootstrap

Prep is a private, real-time group messenger for three invited teammates. This
file is the entrypoint for autonomous Codex work in this repository.

## Start every session

1. Run `git status --short --branch`; preserve unrelated work already present.
2. Read `docs/product/SPEC.md` for authoritative product scope and the ordered
   C00-C07 roadmap.
3. Read `ARCHITECTURE.md` for system boundaries, security constraints, and the
   current technical shape.
4. Read the single plan in `docs/exec-plans/active/`. It owns current status,
   discoveries, verification evidence, blockers, and handoff state.
5. Inspect the code and configuration relevant to that plan. Use `rg --files`
   and targeted reads; the repository deliberately has no hand-maintained map.

There should normally be exactly one active plan while roadmap work remains.
If there is none, choose the earliest roadmap contract in the product spec that
has no completed plan and create one in `docs/exec-plans/active/`. If there is
more than one, reconcile the plans before implementing product work.

## Work autonomously

- Treat the product spec as product truth. Do not expand the MVP without human
  agreement.
- Treat the active plan as working memory: set its status before implementation
  and keep its notes, evidence, blockers, and exact next step current.
- Make implementation decisions from product intent, constraints, architecture,
  and acceptance criteria. Ask only when ambiguity would materially change the
  product or cross an authorization boundary.
- Keep application structure and durable system constraints in
  `ARCHITECTURE.md`. Add a record under `docs/decisions/` only for consequential,
  long-lived choices whose rationale future agents will need.
- When acceptance criteria pass, finalize the plan's evidence and handoff, set
  it to `completed`, and move it from `active/` to `completed/`. Then create the
  next roadmap plan if work remains.
- Keep tasks bounded and verification machine-checkable. The workflow must work
  with one capable agent; delegate only genuinely separable work when useful,
  and keep cross-cutting architecture and security decisions with the lead agent.
- Work on a focused branch rather than directly on `main`. Never discard another
  contributor's changes, commit secrets, or expose a Supabase service-role key.

## Verification

Run the checks named by the active plan. For application changes, the baseline
is `npm run lint` and `npm run build`. For database changes, also run the
applicable local Supabase reset, lint, and pgTAP commands. If a check cannot run,
record why and what remains in the active plan; never claim unverified work is
complete.
