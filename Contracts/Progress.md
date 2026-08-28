# Progress Ledger

This file is the persistent handoff log. Agents must keep it current so interrupted work can continue without repeating completed steps.

Last updated: 2026-08-28

## Current State

- Active contract: C01 - Supabase Schema And Policies
- Next recommended contract: C01 - Supabase Schema And Policies
- Last known branch: feature/supabase-schema
- Last known repository state: C00 completed and verified; C01 schema and policy work is in progress.

## Contract Status

| Contract | Status | Owner | Notes |
| --- | --- | --- | --- |
| C00 - Project Scaffold | done | Frontend | Next.js, TypeScript, Tailwind CSS, ESLint, and `.env.example` verified locally. |
| C01 - Supabase Schema And Policies | in_progress | Backend | Add profiles/messages schema, RLS, and realtime setup. |
| C02 - Authentication Flow | todo | Frontend/Backend | Magic-link sign-in for invited users only. |
| C03 - Profile Setup | todo | Frontend/Backend | Display name setup before chat access. |
| C04 - Realtime Team Chat | todo | Frontend/Backend | Recent history, realtime inserts, de-duplication, composer. |
| C05 - Responsive UI And States | todo | Frontend | Header, user menu, loading/error states, phone/laptop checks. |
| C06 - Deployment Documentation | todo | Integration/QA | Vercel and Supabase setup docs without secrets. |
| C07 - Integration And QA | todo | Integration/QA | End-to-end MVP acceptance checks. |

Allowed statuses: `todo`, `in_progress`, `blocked`, `done`.

## Handoff Notes

### 2026-08-28 - C01 Started

Status: in_progress
Branch: `feature/supabase-schema`

Completed:
- Confirmed C01 is the next unfinished contract.
- Reviewed the current Supabase migration, Row Level Security, and Realtime publication guidance.

Next exact step:
- Add the first schema migration for profiles, messages, RLS policies, and the Realtime publication.

Blockers:
- Local Supabase/Docker tooling is not installed, so database execution tests may require a Supabase project or local Docker setup.

### 2026-08-28 - C01 Schema Milestone

Status: in_progress
Changed files:
- `supabase/config.toml`
- `supabase/migrations/20260828120156_create_messenger_schema.sql`
- `Contracts/Plan.md`, `Contracts/Progress.md`, and `Contracts/RepoMap.md`

Completed:
- Initialized the Supabase CLI project structure.
- Added `profiles` and `messages` tables, validation constraints, a message-order index, least-privilege grants, and Row Level Security policies.
- Added `messages` to the `supabase_realtime` publication.
- Disabled public sign-up in the local Supabase Auth configuration.

Commands run:
- `npm ci` -> dependencies installed successfully.
- `npm run lint` -> passed.
- `npx supabase db lint` -> not run against a database; no Postgres service is listening on the local Supabase port.
- `npx supabase start` -> blocked because Docker and Podman are not installed.

Next exact step:
- Start the local Supabase stack with Docker and run `supabase db reset` plus `supabase db lint`, then verify anonymous reads and impersonated inserts are rejected.

Blockers:
- Docker and a linked Supabase project are not available in this workspace, so the migration and RLS policies cannot yet be executed end to end.

### 2026-08-28 - C01 Policy Tests Added

Status: in_progress
Changed files:
- `supabase/tests/profiles_messages_rls.test.sql`

Completed:
- Added pgTAP coverage for anonymous read denial, own-profile creation and update, shared authenticated reads, impersonated message denial, and blocked message editing/deletion.

Commands run:
- `npx supabase test db` -> could not connect to the local database because the Supabase stack is not running.

Next exact step:
- Install and start Docker or Podman, run `supabase start`, then run `supabase db reset`, `supabase db lint`, and `supabase test db`.

Blockers:
- Docker and Podman are unavailable; `sudo` requires interactive user authentication to install a container runtime.

### 2026-08-28 - C00 Completed

Status: done
Changed files:
- Next.js app shell and configuration in `app/`, `public/`, and root config files.
- `.env.example`
- `Contracts/Plan.md`, `Contracts/Progress.md`, `Contracts/RepoMap.md`

Commands run:
- `npm ci` -> dependencies installed successfully.
- `npm run lint` -> passed.
- `npm run build` -> production build completed successfully.
- `npm run dev` and `Invoke-WebRequest http://localhost:3000` -> server ready and returned HTTP 200.

Completed:
- Created the root Next.js App Router scaffold with TypeScript, Tailwind CSS, and ESLint.
- Added public Supabase environment-variable names without any values.

Next exact step:
- Begin C01 - Supabase Schema And Policies on a dedicated backend branch.

Blockers:
- None.

### 2026-08-28 - C00 Started

- Confirmed C00 is the next unfinished contract and checked the working tree.
- Working on branch `codex/docs-ai-agent-contracts` because this repository must not be changed directly on `main`.
- Generated the Next.js App Router scaffold with TypeScript, Tailwind CSS, ESLint, and locked npm dependencies.
- Added `.env.example` with public Supabase variable names only.
- Next step: run lint, build, and a local development-server smoke test.

### 2026-08-28 - Contract System Setup

- Created `Contracts` folder.
- Moved project plan to `Contracts/Plan.md`.
- Moved agent guide to `Contracts/Agents.md`.
- Added persistent progress ledger and repo map.
- Added resume rules for token-limit or tool-interruption scenarios.
- No MVP application code has been implemented yet.

Next step: start C00 - Project Scaffold.

## Interruption Template

Use this template before token/context loss or when stopping mid-contract:

```text
### YYYY-MM-DD - CXX Handoff

Status: in_progress | blocked | done
Changed files:
- path/to/file

Commands run:
- command -> result

Completed:
- Short factual bullet.

Next exact step:
- Short factual bullet.

Blockers:
- None, or describe missing input/tool failure.
```
