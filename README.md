# Prep

A private, real-time group messenger for three invited teammates, built as an
experiment in autonomous Codex development.

## Run locally

Prep has no public registration flow. A local Supabase instance provides its
own disposable test users and Mailpit inbox.

1. Copy `.env.example` to the ignored `.env.local` file.
2. Start the local Supabase stack with `npx --yes supabase@2.116.0 start`, then
   fill in the public URL and publishable key for that instance. Keep
   `NEXT_PUBLIC_SITE_URL` aligned with the local address you use.
3. Start the app with `npm run dev` and open the configured local origin.

The complete local, Supabase, Vercel, redirect URL, and three-person invitation
procedure is in [the deployment and authentication guide](docs/authentication-setup.md).
It intentionally uses placeholders only: never commit an `.env.local` file or
a credential.

- Codex entrypoint: [`AGENTS.md`](AGENTS.md)
- Product requirements and roadmap: [`docs/product/SPEC.md`](docs/product/SPEC.md)
- System architecture: [`ARCHITECTURE.md`](ARCHITECTURE.md)
- Current work: [`docs/exec-plans/active/`](docs/exec-plans/active/)
- Completed work: [`docs/exec-plans/completed/`](docs/exec-plans/completed/)
- Durable decisions: [`docs/decisions/`](docs/decisions/)
- Authentication configuration: [`docs/authentication-setup.md`](docs/authentication-setup.md)
