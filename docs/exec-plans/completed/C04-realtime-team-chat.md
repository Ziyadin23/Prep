# C04 - Realtime Team Chat

- Status: `completed`
- Completed: 2026-08-29
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

Final automated verification on 2026-08-29:

```text
npm test                           -> 9 files and 54 tests passed
npx tsc --noEmit                   -> passed
npm run lint                       -> passed
npm run build -- --webpack         -> passed
npx --yes supabase@2.116.0 db lint -> no schema errors
npx --yes supabase@2.116.0 test db  -> 15 pgTAP tests passed
git diff --check                   -> passed
```

Focused tests cover trimming and Unicode-aware limits, blank and over-limit
validation, claim and profile requirements, provider failure, forged sender-ID
rejection, deterministic `(created_at, id)` ordering, latest-window limiting,
ID-based duplicate reconciliation, malformed event rejection, embedded sender
mapping, the 100-row descending history query, and route-level error boundaries.
The production bundle compiled and type-checked successfully.

Local end-to-end acceptance used Supabase CLI 2.116.0, two disposable profiled
users with isolated sessions, the progressive-enhancement Server Action form,
the installed `@supabase/supabase-js` Realtime client, and direct persisted-state
inspection:

- both sessions initially rendered the empty Team chat state;
- user one sent trimmed text while also submitting a forged `sender_id` for user
  two; the inserted row retained user one's verified ID;
- user two's already-subscribed client received that persisted INSERT over the
  Realtime websocket without a query or refresh;
- user two replied, and user one's separately subscribed client received the
  second INSERT the same way;
- a fresh protected render contained both messages oldest-to-newest;
- whitespace-only and 2,001-character form posts returned their actionable
  validation errors and left the database at two messages;
- unit evidence confirms an action response, subscription event, and catch-up row
  sharing one ID collapse to one rendered message; and
- pgTAP independently reconfirmed sender impersonation denial and immutable
  messages.

The disposable users, messages, and cookie jars were deleted after acceptance.
No test credentials or Supabase secret/service-role values were written to the
repository.

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
- The installed Realtime client supports column selection on `postgres_changes`,
  exposes explicit subscribed/error/timeout states, and recommends channel
  removal on cleanup. The chat follows those installed APIs directly.
- Message insertion stays in a Server Action so the application can derive the
  sender exclusively from verified claims and return the persisted row. RLS
  remains an independent final check.
- The server loads the initial window; after the channel reports `SUBSCRIBED`, a
  browser catch-up query merges the same latest window. That sequence closes the
  initial-query/subscription race, while the shared ID reducer makes overlaps safe.
- The embedded `messages.sender_id -> profiles.id` relation works with the
  installed PostgREST client and supplies names for both initial and catch-up
  history. Realtime rows are enriched by a focused profile lookup before merge.

## Blockers

None known.

## Handoff / remaining work

C04 is complete. C05 should refine the complete auth/profile/chat flow into the
final responsive messenger layout and systematically exercise every transitional
and failure state at representative phone and laptop widths. Preserve the C04
server/client boundary, catch-up ordering, channel cleanup, and ID reconciliation.
