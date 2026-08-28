# C01 - Supabase Schema and Policies

- Status: `completed`
- Completed: 2026-08-28
- Depends on: C00 (completed)
- Product source: `docs/product/SPEC.md`, section "C01 - Supabase Schema and Policies"

## Objective

Establish the Supabase schema, constraints, Realtime publication, least-privilege
grants, and row-level security for profiles and immutable shared messages.

## Scope delivered

- Supabase CLI project configuration
- Timestamped migration for `profiles` and `messages`
- Display-name and message-body validation constraints
- Message history ordering index
- Authenticated grants and row-level security policies
- `messages` Realtime publication membership
- pgTAP coverage for the primary authorization rules
- Local public and email sign-up disabled

## Non-goals

Browser Supabase integration, magic-link UI, hosted project configuration,
profile screens, and chat behavior were deferred to later contracts.

## Acceptance evidence

The completed local verification record is:

```text
supabase start   -> local stack started and migration applied
supabase db reset -> completed successfully
supabase db lint  -> no schema errors
supabase test db  -> 15 pgTAP tests passed
npm run lint      -> passed
```

Database inspection confirmed row-level security on `profiles` and `messages`
and confirmed `messages` in the `supabase_realtime` publication. Tests confirmed:

- anonymous users cannot read profiles or messages;
- users create and update only their own profile;
- authenticated teammates read shared profiles and messages;
- users cannot insert a message under another user's ID; and
- authenticated users cannot update or delete messages.

## Implementation notes and history

- The migration is `supabase/migrations/20260828120156_create_messenger_schema.sql`.
- Policy tests are `supabase/tests/profiles_messages_rls.test.sql`.
- Initial schema work was completed before a container runtime was available.
  During that interval, lint and policy execution were explicitly recorded as
  blocked rather than treated as passing.
- Fifteen pgTAP checks were then added for anonymous denial, profile ownership,
  shared reads, sender impersonation denial, and message immutability.
- After local Supabase/Docker became available, reset, lint, tests, and direct
  database inspection passed; the earlier tool blocker was resolved.
- Work was performed on `feature/supabase-schema`.

## Blockers

None. The earlier absence of Docker/Podman and a linked project was resolved for
local verification before completion.

## Handoff

The schema and policies are ready for application integration. C02 should build
authentication without changing C01 security semantics unless a discovered
product or correctness issue requires a documented revision.
