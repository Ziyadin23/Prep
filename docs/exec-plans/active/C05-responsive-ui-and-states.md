# C05 - Responsive UI and States

- Status: `ready`
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

## Blockers

None known.

## Handoff / remaining work

After C04 is committed, create a focused C05 branch, set this plan to
`in_progress`, inspect all auth/profile/chat surfaces together, and choose the
smallest coherent layout refinement before viewport and state verification.
