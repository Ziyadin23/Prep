# Prep Architecture

This document records the system shape, boundaries, and durable engineering
constraints. Product behavior belongs in `docs/product/SPEC.md`; task progress
belongs in the active execution plan.

## System context

Prep is a browser-based messenger deployed as a Next.js application on Vercel.
Supabase provides identity, PostgreSQL persistence, row-level authorization, and
Realtime delivery. The browser may use only the public Supabase URL and anon
key. Authorization is enforced by Supabase Auth and database policies, not by
trusted client state.

```text
Browser
  |-- HTTPS --> Next.js application on Vercel
  |-- Supabase public client --> Auth / PostgreSQL API / Realtime
                                      |
                                      `-- row-level security
```

## Current technical shape

- Next.js 16 App Router, React 19, and strict TypeScript form the application
  runtime. Tailwind CSS 4 is loaded through PostCSS.
- Authentication uses request-scoped Supabase SSR clients with cookie-backed
  sessions. Next.js Proxy refreshes tokens; protected server-rendered pages
  validate signed JWT claims before rendering.
- Supabase CLI configuration lives under `supabase/`. Public sign-up and
  anonymous sign-in are disabled in the local configuration.
- The applied database design is represented by timestamped migrations. pgTAP
  tests exercise access rules; migrations are the schema source of truth.
- Deployment targets Vercel, but production setup is intentionally deferred to
  its roadmap contract.

## Data and authorization boundaries

`auth.users` is managed by Supabase Auth. Application-owned public data is:

- `profiles`: one row per authenticated user, keyed to `auth.users.id`, with a
  validated display name and creation timestamp.
- `messages`: immutable text messages keyed by UUID, linked to the sender's
  profile, with a creation timestamp.

Row-level security is mandatory on both application tables. Authenticated users
may read shared profiles and messages, write only their own profile, and insert
messages only as themselves. The application grants no message update or delete
capability. Anonymous database access is denied. `messages` participates in the
Supabase Realtime publication.

Supabase secret and legacy service-role keys must never appear in browser code,
public environment variables, logs, or Vercel client configuration. Current MVP
flows do not require either key in the application.

## Application boundaries

- Route and rendering concerns belong in the Next.js `app/` tree.
- Reusable UI and Supabase integration modules may be introduced when a contract
  needs them; their exact layout is an implementation decision, not a promised
  file map.
- Authentication gates access to profile setup and chat. A valid profile gates
  entry to the message experience.
- Database constraints and RLS remain the final enforcement layer even when the
  UI validates the same input for usability.
- Realtime events are an additional delivery path for persisted messages; the UI
  must reconcile query, insert-response, and subscription results by message ID.

## Engineering constraints

- Read the bundled Next.js guidance referenced by `AGENTS.md` before changing
  framework code; this repository's installed version is authoritative.
- Prefer server/client boundaries that keep session and secret handling explicit.
- Keep the main branch deployable and changes scoped to one execution plan.
- Do not make single-agent development depend on model routing or subagents.
- Update this document only when the implemented system or a durable boundary
  changes. Record rationale in `docs/decisions/` only when the decision is likely
  to be revisited or has meaningful long-term consequences.
