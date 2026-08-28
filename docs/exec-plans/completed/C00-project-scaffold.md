# C00 - Project Scaffold

- Status: `completed`
- Completed: 2026-08-28
- Depends on: none
- Product source: `docs/product/SPEC.md`, section "C00 - Project Scaffold"

## Objective

Establish the root Next.js, TypeScript, Tailwind CSS, and ESLint application
foundation with a renderable shell and secret-safe environment template.

## Scope delivered

- Next.js App Router scaffold in the repository root
- Strict TypeScript, Tailwind CSS, and ESLint configuration
- Generated application shell and static assets
- Locked npm dependencies
- `.env.example` containing public Supabase variable names without values

## Non-goals

Authentication, data access, profile behavior, messaging, and deployment setup
were deferred to later roadmap contracts.

## Acceptance evidence

- Dependency installation succeeded with `npm ci`.
- `npm run lint` passed.
- `npm run build` completed successfully.
- `npm run dev` started successfully and an HTTP request to
  `http://localhost:3000` returned 200.
- `.env.example` contains names only and no credentials.

## Implementation notes and history

Work began on the focused `codex/docs-ai-agent-contracts` branch. The scaffold
uses the App Router, React, TypeScript, Tailwind, and ESLint defaults current at
creation time. The application remained intentionally at the generated landing
page so later contracts could own product behavior.

## Blockers

None.

## Handoff

C00 established the application baseline used by C01. No remaining C00 work was
recorded at completion.
