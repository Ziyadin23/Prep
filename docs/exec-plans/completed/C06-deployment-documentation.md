# C06 - Deployment Documentation

- Status: `completed`
- Completed: 2026-08-29
- Depends on: C00 through C05 (completed)
- Product source: `docs/product/SPEC.md`, section "C06 - Deployment Documentation"
- Created: 2026-08-29

## Objective

Make local and production configuration reproducible for a new developer while
keeping every secret and privileged Supabase credential out of the browser and
repository.

## Scope

- Document the public variables required locally and in Vercel.
- Document Supabase local and production Site URL and redirect URL setup for
  magic-link authentication.
- Document the manual, out-of-band invitation/setup procedure for exactly three
  teammate email addresses.
- State clearly which Supabase keys are safe for the browser and that the
  service-role/secret key must never be committed or exposed.
- Reconcile existing README, environment example, and authentication setup docs
  into one consistent setup path without adding deployment automation.

## Non-goals

- Deploying a production project or changing external account state
- Adding public registration, invitations, administration, or a service-role
  application path
- Final three-user end-to-end certification (C07)

## Constraints

- Use only current official Next.js, Vercel, and Supabase guidance for setup
  details that may change.
- Keep browser configuration limited to `NEXT_PUBLIC_*` values.
- Use placeholders in examples; do not copy local or production credentials into
  tracked files, command output, or screenshots.
- Preserve the current authentication and application architecture.

## Acceptance criteria

The C06 product criteria are authoritative. Completion requires evidence that:

- a new developer can configure local Supabase, run the application, and set the
  correct redirect URLs from repository documentation;
- a production operator can configure Vercel and Supabase redirects and manually
  provision exactly three invited users;
- documentation distinguishes public client configuration from privileged
  service credentials; and
- tracked files and documented client configuration contain no secrets.

## Verification

Expected baseline:

```bash
npm test
npx tsc --noEmit
npm run lint
npm run build -- --webpack
git diff --check
```

Also audit tracked files for credential patterns, validate every documented path
and variable name against the repository, and record the official sources used
for temporally sensitive setup instructions.

Final verification on 2026-08-29:

```text
npm test                           -> 9 files and 54 tests passed
npx tsc --noEmit                   -> passed (sequential rerun after build)
npm run lint                       -> passed
npm run build -- --webpack         -> passed
git diff --check                   -> passed
tracked credential-pattern audit  -> no credential values found
documented path/variable audit     -> passed
official reference link check     -> 9 of 9 returned HTTP 200
```

The first TypeScript command ran concurrently with `next build` and observed
`.next/types` while Next regenerated it. A sequential rerun after the successful
build passed; this was a verification-command race, not an application failure.

The source audit used the installed Next.js 16 environment-variable guide plus
current official Vercel environment-variable/Next.js deployment and Supabase
redirect, passwordless email, email template, user invitation, API key, and SMTP
documentation. The resulting guide links those primary sources directly.

## Implementation discoveries

- `docs/authentication-setup.md`, `.env.example`, and the README already contain
  partial local authentication guidance and must be reconciled rather than
  duplicated.
- C02 intentionally uses a public publishable/anon key in browser configuration
  and keeps user provisioning outside the application.
- Supabase's hosted default email service is not suitable for general production
  delivery and normally sends only to authorized project-team addresses. The
  guide therefore requires production SMTP before inviting real teammates.
- Current Supabase guidance distinguishes browser-safe publishable keys from
  secret and legacy service-role keys that bypass RLS. Prep needs only the former.
- A Terra sub-agent produced the bounded documentation draft at the user's
  request. The lead agent reconciled missing local-user and migration steps,
  checked every primary-source link, and independently ran the credential audit
  and full application baseline.

## Blockers

None known.

## Handoff / remaining work

C06 is complete. C07 should execute and record the final three-user integration,
security, responsive, and release-readiness matrix without placing identities,
tokens, or other private operational data in the repository.
