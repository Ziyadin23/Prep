# MVP Team Messenger Plan

This file is the product and implementation source of truth for the MVP. Agents must pair it with `Contracts/Agents.md` and `Contracts/Progress.md` before changing code.

## Summary

Build a private, responsive web messenger for three invited teammates. It will provide one real-time group chat with text messages, sender names, timestamps, and saved recent history.

Use Next.js, TypeScript, and Tailwind CSS for the app; Supabase for authentication, database, and realtime; and Vercel for deployment.

## MVP Scope

- One shared group chat only.
- Email magic-link access for invited users only; no public registration.
- First sign-in profile setup with a display name.
- Text messages with sender name, timestamp, persisted recent history, and realtime updates.
- Mobile and desktop responsive chat interface.
- Supabase row-level security for private access and ownership rules.
- Vercel deployment using public Supabase client variables only.

## Out Of Scope

- Direct messages.
- Attachments or file upload.
- Reactions.
- Typing indicators.
- Read receipts.
- Notifications.
- Message editing or deletion.
- In-app invitation or admin screens.

## Contract Status Rules

- `[ ]` means not started.
- `[~]` means in progress.
- `[x]` means completed and verified.
- A contract may be marked `[x]` only after its acceptance checks pass or the reason for skipping a check is recorded in `Contracts/Progress.md`.
- If work stops because of token limits, time limits, tool failure, or any other interruption, do not restart completed contracts. Resume from the contract marked `[~]` in `Contracts/Progress.md`.

## Implementation Contracts

### [x] C00 - Project Scaffold

Goal: Create the initial Next.js, TypeScript, and Tailwind CSS application structure.

Required output:
- Next.js app installed in the repository root.
- TypeScript enabled.
- Tailwind CSS configured.
- Basic app shell renders locally.
- `.env.example` contains required public variable names without values.

Read scope:
- `Contracts/Plan.md`
- `Contracts/Progress.md`
- `Contracts/RepoMap.md`
- Root package/config files after they exist.

Acceptance checks:
- Dependency install succeeds.
- Development server starts.
- Type check or build passes if available.

### [ ] C01 - Supabase Schema And Policies

Goal: Define database tables and security policies for profiles and messages.

Required output:
- `profiles` table with authenticated user ID, display name, and created timestamp.
- `messages` table with ID, sender profile ID, text body limited to 2,000 characters, and created timestamp.
- Row-level security enabled.
- Policies enforce signed-in reads, own-profile creation/editing, own-user message creation, and no message editing/deletion for the MVP.
- Supabase Realtime enabled for `messages` through documented setup or migration where possible.

Read scope:
- `Contracts/Plan.md`
- `Contracts/Progress.md`
- Supabase migrations/config files.
- Supabase client integration files only if needed.

Acceptance checks:
- SQL/migrations are syntactically valid.
- Policies reject anonymous reads and attempts to send as another user.

### [ ] C02 - Authentication Flow

Goal: Implement private magic-link sign-in for invited users.

Required output:
- Email sign-in screen.
- Magic-link request handling.
- Signed-out, loading, and error states.
- Public self-registration disabled through Supabase configuration notes.
- Redirect URL setup documented for Vercel and local development.

Read scope:
- App auth pages/components.
- Supabase client files.
- Environment documentation.

Acceptance checks:
- Invited user can request a magic link.
- Uninvited user cannot access the app.
- Sign-out works.

### [ ] C03 - Profile Setup

Goal: Let first-time signed-in users choose a display name before entering chat.

Required output:
- Profile lookup after sign-in.
- Profile creation form.
- Display name validation.
- Own-profile update behavior if needed for correction.

Read scope:
- Profile components/pages.
- Supabase profile queries.
- Database policy files if profile behavior changes.

Acceptance checks:
- New user must set a display name before chat.
- Existing user goes directly to chat.
- User cannot create or edit another user's profile.

### [ ] C04 - Realtime Team Chat

Goal: Implement the shared group chat with persisted history and realtime inserts.

Required output:
- Load latest 100 messages in timestamp order.
- Subscribe to new `messages` inserts.
- Append realtime messages immediately.
- De-duplicate insert responses and realtime events by message ID.
- Send text messages up to 2,000 characters.
- Disable sending blank or invalid text.

Read scope:
- Chat page/components.
- Message query/mutation helpers.
- Supabase realtime client code.

Acceptance checks:
- Two signed-in users can see new messages without refreshing.
- Refresh preserves recent history.
- Blank and over-limit messages cannot be sent.

### [ ] C05 - Responsive UI And States

Goal: Polish the messenger interface for phone and laptop widths.

Required output:
- Chat header.
- Signed-in user menu with sign-out.
- Scrollable message list grouped clearly by sender.
- Message composer.
- Inline loading, network, sign-in, and send-error states.
- Responsive layout tested at phone and desktop widths.

Read scope:
- UI components and styles.
- Tailwind config.
- Chat/auth/profile files touched by UI work.

Acceptance checks:
- UI is usable on phone width.
- UI is usable on laptop width.
- Text does not overlap or overflow controls.

### [ ] C06 - Deployment Documentation

Goal: Document the production setup without exposing secrets.

Required output:
- Vercel environment variable instructions.
- Supabase auth redirect URL instructions.
- Manual invite instructions for the three team emails.
- Clear warning never to expose the Supabase service-role key in frontend or Vercel client variables.

Read scope:
- Deployment docs.
- `.env.example`
- Any Vercel/Supabase config files.

Acceptance checks:
- A new developer can configure the project from docs.
- No secrets are committed.

### [ ] C07 - Integration And QA

Goal: Verify the MVP end to end.

Required output:
- Test notes for three invited users.
- Auth, profile, chat, persistence, realtime, validation, and security checks completed.
- Known limitations recorded.

Read scope:
- `Contracts/Progress.md`
- Test files.
- Docs and files touched by the current QA task.

Acceptance checks:
- All MVP test plan checks are pass/fail recorded.
- Any remaining release blocker is listed in `Contracts/Progress.md`.

## Team Split

- Frontend agent: Next.js UI, responsive layout, profile setup, message list/composer, and auth states.
- Backend agent: Supabase project, database migrations, row-level security policies, Realtime configuration, and invite setup.
- Integration/QA agent: environment documentation, frontend-backend integration, automated checks, deployment configuration, and acceptance testing.

If a change crosses these areas, record the reason in `Contracts/Progress.md` before changing another agent's owned files.

## Test Plan

- Verify an uninvited email cannot create or access an account.
- Verify each invited user can sign in, set a display name, send text, and see another user's message without refreshing.
- Verify message history remains after refresh and appears in timestamp order.
- Verify blank and over-limit messages cannot be sent.
- Verify database policies reject anonymous reads and attempts to send as another user.
- Verify the chat works at phone and laptop widths.

## Resume Protocol

When continuing after an interruption:

1. Read `Contracts/README.md`, `Contracts/Agents.md`, `Contracts/Progress.md`, and only the relevant contract section in this file.
2. Check `git status --short --branch`.
3. If `Contracts/Progress.md` has an active `[~]` contract, continue that contract.
4. If no contract is active, start the first `[ ]` contract in order.
5. Do not re-implement `[x]` contracts unless the user explicitly asks for a revision.
6. Update `Contracts/Progress.md` before major risky edits and after each verified milestone.

## Token Budget Rules

- Do not read the whole repository at the start of every task.
- Use `rg --files` for a file map, then read only files listed in the active contract read scope.
- Keep a short repo map in `Contracts/RepoMap.md` whenever new directories or important files are created.
- Prefer small, verifiable contracts over large multi-area changes.
- At the end of a task, leave a concise handoff note in `Contracts/Progress.md` with changed files, commands run, tests, and next step.
