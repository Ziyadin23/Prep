# C04 - Realtime Team Chat

- Status: `ready`
- Depends on: C00 through C03 (completed)
- Product source: `docs/product/SPEC.md`, section "C04 - Realtime Team Chat"
- Created: 2026-08-29

## Objective

Replace the profiled-user placeholder with the single shared team chat: load
recent persisted history, send validated text, and deliver new messages to
signed-in teammates promptly without duplicates.

## Scope

- Load the latest 100 messages with sender profiles and present them in ascending
  timestamp order.
- Subscribe to new `messages` inserts through Supabase Realtime.
- Reconcile initial history, insert responses, and subscription events by message
  ID so one persisted message appears once.
- Send trimmed, non-blank text of at most 2,000 characters under the verified
  signed-in user's identity.
- Provide the functional loading, empty, validation, network, and send-error
  states needed to exercise chat behavior; final responsive visual polish stays
  with C05.
- Add focused automated coverage for message validation, ordering, deduplication,
  sender derivation, and failure boundaries.

## Non-goals

- Direct messages, rooms, attachments, reactions, presence, typing indicators,
  read receipts, notifications, message editing, or deletion
- Final chat header/user-menu composition and representative viewport polish
  beyond a usable implementation (C05)
- Production deployment setup (C06)
- Final three-user release evidence (C07)

## Constraints

- Read and write access still requires verified claims and a valid owned profile.
- The browser receives only public Supabase configuration; no secret or service-
  role key enters application code, logs, or client configuration.
- Sender identity is derived from the trusted session, never a client-supplied ID.
- Browser validation improves feedback, but the existing database constraints and
  RLS policies remain authoritative.
- Realtime is an additional delivery path for persisted inserts, not an authority
  separate from the database. Merge every path by message ID and keep deterministic
  `(created_at, id)` ordering.
- Subscribe only after establishing the initial view, handle events arriving near
  the history-query boundary, and release channels during component cleanup.
- Follow the installed Next.js 16 guidance before changing framework code and the
  installed Supabase client API/types before implementing Realtime behavior.

## Acceptance criteria

The C04 product criteria are authoritative. Completion requires evidence that:

- two separately signed-in users see a new persisted message without refreshing;
- refreshing loads recent history in timestamp order;
- initial query, insert response, and Realtime delivery do not duplicate a message;
- blank and whitespace-only messages cannot be sent;
- messages over 2,000 characters cannot be sent; and
- database rules still reject sender impersonation and message mutation.

## Verification

Expected automated baseline:

```bash
npm test
npx tsc --noEmit
npm run lint
npm run build -- --webpack
npx --yes supabase@2.116.0 db lint
npx --yes supabase@2.116.0 test db
```

Exercise the full flow against local Supabase with two isolated authenticated
sessions. Record history order across refresh, live delivery latency/behavior,
deduplication, validation, persistence, sender ownership, connection failure,
and sign-out regression evidence.

## Implementation discoveries

- C01 already supplies the immutable `messages` table, `(created_at desc, id
  desc)` history index, shared authenticated reads, own-sender inserts, and
  Realtime publication membership.
- C03 leaves valid profiled users at the root chat placeholder and includes an
  own-name correction control. The root route remains the natural authenticated
  and profiled entry boundary.
- A browser Supabase client factory exists but has not yet been used by an
  interactive feature. C04 must ensure one client/channel lifecycle per mounted
  chat experience and avoid shared mutable session state on the server.

## Blockers

None known.

## Handoff / remaining work

Set this plan to `in_progress`, create a focused C04 branch after C03 is committed,
read the installed Next.js client/server guidance and the installed Supabase
Realtime/query APIs, then inspect the current root gate and schema before choosing
the smallest testable chat state boundary.
