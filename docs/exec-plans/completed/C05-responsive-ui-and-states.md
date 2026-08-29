# C05 - Responsive UI and States

- Status: `completed`
- Completed: 2026-08-29
- Depends on: C00 through C04 (completed)
- Product source: `docs/product/SPEC.md`, section "C05 - Responsive UI and States"
- Created: 2026-08-29

## Objective

Turn the complete functional messenger into a clear, cohesive experience at
representative phone and laptop widths, with accessible and actionable feedback
for every asynchronous state.

## Scope

- Compose the final chat header and signed-in user controls, including profile
  correction and sign-out.
- Refine scrollable message history, sender grouping, timestamps, and the message
  composer without changing C04 persistence or Realtime semantics.
- Audit and improve signed-out, auth loading/success/error, profile loading/error,
  history loading/empty/network, Realtime connection, validation, pending, and
  send-error states.
- Verify permitted long text wraps safely and controls remain reachable without
  overlap, clipping, or horizontal overflow.
- Verify keyboard focus, labels, live regions, contrast-sensitive states, and
  touch target usability at phone and laptop widths.
- Add focused automated coverage where presentation behavior can be checked
  meaningfully without duplicating browser-level acceptance.

## Non-goals

- New conversation types or any other feature excluded by the MVP specification
- Changes to persistence, RLS, sender authority, or Realtime reconciliation unless
  UI verification exposes a correctness regression
- Production deployment documentation (C06)
- Final three-user release certification (C07)

## Constraints

- Preserve the existing request-scoped auth/profile/history reads, Server Action
  mutations, and browser Realtime channel lifecycle.
- Do not hide failures behind indefinite loading states; every recoverable failure
  provides a clear retry, refresh, or sign-in path.
- Phone behavior must not rely on hover, and controls should remain usable with
  the on-screen keyboard reducing available height.
- Message and display-name constraints remain aligned with database enforcement.
- Avoid expanding the design system or adding UI dependencies without a concrete
  acceptance need.
- Read the installed Next.js guidance before framework changes.

## Acceptance criteria

The C05 product criteria are authoritative. Completion requires evidence that:

- sign-in, profile setup/correction, chat history, sending, and sign-out are
  usable at representative phone and laptop widths;
- the header, user controls, history, and composer do not overlap or clip;
- maximum permitted text and long unbroken content wrap without horizontal
  overflow or covering interactive controls; and
- every asynchronous flow presents an appropriate loading, empty, success,
  validation, network, connection, or send-error state.

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

Exercise the full flow in a real browser at a representative phone viewport and
laptop viewport. Record screenshots or equivalent concrete observations for the
main flow, long-content wrapping, reduced-height composer behavior, keyboard
focus, and each asynchronous/error state that cannot be proven automatically.

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

Browser acceptance used Chromium with disposable local Supabase users at
390 x 844 phone, 390 x 640 reduced-height phone, and 1440 x 900 laptop
viewports:

- the signed-out magic-link form, first-time display-name gate, profiled chat,
  account menu, and sign-out control rendered without horizontal clipping;
- a maximum-length 2,000-character unbroken message wrapped within its message
  bubble without covering controls or widening the page;
- full-page reduced-height capture confirmed that the internally scrollable
  history leaves the composer, count, and send control reachable through normal
  page scrolling;
- consecutive messages from one sender appeared as a named group while each
  message retained its own timestamp;
- labels, visible focus styles, live regions, minimum-height touch controls, and
  the Realtime refresh action remained present at phone and laptop layouts; and
- the root loading UI, non-enumerating authentication success and validation
  states, profile/history network boundaries, empty history, Realtime connection
  failure, profile/message pending and validation feedback, and send failure are
  represented by explicit UI branches and focused automated coverage.

The browser-only Playwright CLI was used ephemerally and was not added as a
project dependency. Disposable users, messages, session state, and test
credentials were removed after acceptance.

## Implementation discoveries

- C02-C04 already provide accessible form labels, live regions, pending/error
  copy, root loading UI, fail-closed profile/history errors, empty chat, Realtime
  connection feedback, send validation, and responsive Tailwind primitives.
- The current profiled view appends profile correction and sign-out below the chat.
  C05 should decide the final header/user-control composition without altering
  those actions' security boundaries.
- No browser automation dependency is currently installed. Prefer the smallest
  verification approach that produces honest phone/laptop evidence without
  adding a durable dependency solely for one manual audit.
- The final shell uses a full-width phone layout and a bordered laptop card. The
  signed-in account menu keeps profile correction and sign-out in the header,
  while the chat groups consecutive messages and makes a disconnected Realtime
  state actionable with a touch-sized refresh button.
- A Terra sub-agent implemented the bounded responsive UI refinement at the
  user's request. The lead agent reviewed the diff, adjusted the account label's
  accessible name, and independently ran browser, application, and database
  verification before completion.

## Blockers

None known.

## Handoff / remaining work

C05 is complete. C06 should document reproducible local and production setup,
including public Vercel variables, Supabase redirect URLs, three manual user
invitations, and the prohibition on exposing the service-role key.
