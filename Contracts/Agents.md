# Prep Agent Contract

This file defines how AI agents must work in this repository. The goal is to make progress repeatable, resumable, and economical with context tokens.

## Required Startup Sequence

Every agent must start with this sequence:

1. Read `Contracts/README.md`.
2. Read `Contracts/Progress.md`.
3. Read the active or next contract section in `Contracts/Plan.md`.
4. Read `Contracts/RepoMap.md`.
5. Run `git status --short --branch`.
6. Use `rg --files` to find relevant files, then read only the files needed for the active contract.

Do not read the entire repository unless the active contract explicitly requires it or the user asks for a full audit.

## Resume Logic

Agents must use `Contracts/Progress.md` as the persistent memory for interrupted work.

- If a contract is marked `in_progress`, continue that contract first.
- If a contract is marked `done`, do not redo it.
- If a contract is marked `blocked`, resolve the blocker or ask the user for the missing input.
- If no contract is active, choose the first `todo` contract in `Contracts/Progress.md`.
- Before making new changes, compare `git status` and the progress notes to understand what was already changed.

When token limits are close, immediately update `Contracts/Progress.md` with:

- Current contract ID.
- Files already changed.
- Last successful command.
- Tests/checks already run.
- Exact next step.
- Any known blockers.

This rule is mandatory. The next agent must be able to resume without repeating completed work.

## Progress Update Rules

Update `Contracts/Progress.md` at these points:

- Before starting a contract: set it to `in_progress`.
- After a meaningful milestone: add a short note.
- Before risky cross-area changes: record why the change is needed.
- After tests/checks: record command and result.
- After completing a contract: set it to `done`, update the next recommended contract, and leave a handoff note.

Do not mark a contract `done` until the acceptance checks in `Contracts/Plan.md` pass or the reason for not running them is documented.

## Token Budget Rules

- Prefer targeted reads over broad reads.
- Use `rg --files`, `rg "symbol"`, and config file names to navigate.
- Keep `Contracts/RepoMap.md` updated when adding important directories or ownership areas.
- Read by contract scope from `Contracts/Plan.md`.
- Avoid repeated reads of unchanged files; rely on your own notes and `git diff` for current edits.
- Make small edits and verify them before widening scope.

## Project Goal

Build the MVP team messenger described in `Contracts/Plan.md`: a private, real-time group chat for three invited users using Next.js, Supabase, and Vercel.

Do not add features outside the MVP without explicit agreement from the team.

## Team Responsibilities

- Frontend agent owns the Next.js interface, responsive layout, authentication screens, profile setup, message list, and message composer.
- Backend agent owns Supabase configuration, database migrations, row-level security policies, Realtime, and authentication setup.
- Integration/QA agent owns environment documentation, frontend-backend integration, automated checks, deployment configuration, and acceptance testing.

If a change crosses these areas, record the reason in `Contracts/Progress.md` before changing another agent's owned files.

## Working Rules

- Work on a dedicated branch such as `feature/chat-ui`, `feature/supabase-schema`, or `chore/deployment`.
- Do not commit directly to `main`; open a pull request and keep it focused on one contract.
- Never overwrite or discard another teammate's changes without explicit approval.
- Do not commit `.env`, `.env.local`, API keys, Supabase service-role keys, or other secrets.
- Commit an `.env.example` with variable names only.
- Keep the main branch deployable.
- Run relevant checks before requesting review.

## MVP Boundaries

- One shared group chat only.
- Email magic-link access for invited users only; no public registration.
- Text messages, sender name, timestamps, persisted history, and realtime updates.
- No direct messages, attachments, reactions, message editing/deletion, typing indicators, read receipts, or notifications.

## Definition Of Done

- The change matches `Contracts/Plan.md`.
- The active contract in `Contracts/Progress.md` is updated.
- No secrets are exposed.
- Tests, type checks, and linting pass when those tools exist.
- The UI works on phone and desktop widths when applicable.
- Documentation is updated for any setup or deployment change.
- The handoff note explains what changed, how it was tested, and the next recommended step.
