# C06 - Deployment Documentation

- Status: `ready`
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

## Implementation discoveries

- `docs/authentication-setup.md`, `.env.example`, and the README already contain
  partial local authentication guidance and must be reconciled rather than
  duplicated.
- C02 intentionally uses a public publishable/anon key in browser configuration
  and keeps user provisioning outside the application.

## Blockers

None known.

## Handoff / remaining work

Set this plan to `in_progress` on a focused C06 branch, audit the existing docs
and configuration against current official guidance, then write and verify the
smallest complete local-to-production setup path.
