# Progress Ledger

This file is the persistent handoff log. Agents must keep it current so interrupted work can continue without repeating completed steps.

Last updated: 2026-08-28

## Current State

- Active contract: none
- Next recommended contract: C00 - Project Scaffold
- Last known branch: main
- Last known repository state: planning contracts added; no MVP application code implemented yet

## Contract Status

| Contract | Status | Owner | Notes |
| --- | --- | --- | --- |
| C00 - Project Scaffold | todo | Frontend | Create Next.js, TypeScript, Tailwind, and `.env.example`. |
| C01 - Supabase Schema And Policies | todo | Backend | Add profiles/messages schema, RLS, and realtime setup. |
| C02 - Authentication Flow | todo | Frontend/Backend | Magic-link sign-in for invited users only. |
| C03 - Profile Setup | todo | Frontend/Backend | Display name setup before chat access. |
| C04 - Realtime Team Chat | todo | Frontend/Backend | Recent history, realtime inserts, de-duplication, composer. |
| C05 - Responsive UI And States | todo | Frontend | Header, user menu, loading/error states, phone/laptop checks. |
| C06 - Deployment Documentation | todo | Integration/QA | Vercel and Supabase setup docs without secrets. |
| C07 - Integration And QA | todo | Integration/QA | End-to-end MVP acceptance checks. |

Allowed statuses: `todo`, `in_progress`, `blocked`, `done`.

## Handoff Notes

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
