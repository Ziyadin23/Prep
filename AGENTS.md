# Prep Agent Guide

## Project Goal

Build the MVP team messenger described in [PLAN.md](PLAN.md): a private, real-time group chat for three invited users using Next.js, Supabase, and Vercel.

Read `PLAN.md` before starting work. Do not add features outside the MVP without agreement from the team.
Read `AI_CONTRACTS.md` before implementing a task that changes the frontend, Supabase, authentication, or deployment.

## Team Responsibilities

- **Frontend agent** owns the Next.js interface, responsive layout, authentication screens, profile setup, message list, and message composer.
- **Backend agent** owns Supabase configuration, database migrations, row-level security policies, Realtime, and authentication setup.
- **Integration/QA agent** owns environment documentation, frontend-backend integration, automated checks, deployment configuration, and acceptance testing.

If a change crosses these areas, coordinate through a pull request or a GitHub issue before changing another agent's owned files.

## Working Rules

- Start each task by checking `git status` and reading the relevant files.
- Work on a dedicated branch such as `feature/chat-ui`, `feature/supabase-schema`, or `chore/deployment`.
- Do not commit directly to `main`; open a pull request and keep it focused on one task.
- Never overwrite or discard another teammate's changes without their explicit approval.
- Do not commit `.env`, `.env.local`, API keys, Supabase service-role keys, or other secrets. Commit an `.env.example` with variable names only.
- Keep the main branch deployable. Run the relevant checks before requesting review.

## MVP Boundaries

- One shared group chat only.
- Email magic-link access for invited users only; no public registration.
- Text messages, sender name, timestamps, persisted history, and real-time updates.
- No direct messages, attachments, reactions, message editing/deletion, typing indicators, read receipts, or notifications.

## Definition of Done

- The change matches `PLAN.md` and does not expose secrets.
- Tests, type checks, and linting pass when those tools exist.
- The UI works on phone and desktop widths when applicable.
- The pull request explains what changed, how it was tested, and any Supabase or Vercel setup required.
