# Authentication setup

This document covers the configuration required by C02. Complete deployment and
invitation operations remain part of C06.

## Application environment

Copy `.env.example` to an ignored `.env.local` and set:

```text
NEXT_PUBLIC_SUPABASE_URL=<project URL>
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<public publishable key>
NEXT_PUBLIC_SITE_URL=http://127.0.0.1:3000
```

For Vercel, define the same variables for the relevant environments and set
`NEXT_PUBLIC_SITE_URL` to the canonical HTTPS application origin. All three
values are public client configuration. Never add a Supabase secret or legacy
service-role key to the application or a `NEXT_PUBLIC_` variable.

## Supabase Auth settings

In a hosted project's **Authentication > URL Configuration**:

1. Set **Site URL** to the canonical production origin.
2. Add the exact production callback, such as
   `https://prep.example/auth/confirm`.
3. Add `http://127.0.0.1:3000/auth/confirm` for local development.
4. Add only the preview callback patterns that are actually needed. Keep the
   production callback exact rather than using a broad wildcard.

Keep the Email provider enabled so invited users can receive magic links, but
disable project-wide new-user sign-up in the hosted Auth settings. The
application also sends `shouldCreateUser: false` with every magic-link request.
Both controls are required: the login form must authenticate existing invited
users without becoming a registration surface. Locally these settings correspond
to `[auth].enable_signup = false` and `[auth.email].enable_signup = true`.

## PKCE-compatible email templates

Cookie-based server rendering uses the PKCE-compatible token-hash callback.
Configure the hosted **Magic Link** template link as:

```html
<a href="{{ .RedirectTo }}?token_hash={{ .TokenHash }}&type=email">
  Sign in to Prep
</a>
```

Configure the hosted **Invite user** template link as:

```html
<a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=invite">
  Accept invitation
</a>
```

Local Supabase uses the equivalent tracked templates in `supabase/templates/`.
The callback accepts only `email` and `invite` token types, verifies the token
with Supabase, sets cookie-backed session state, and returns a non-cacheable
redirect.

## Local verification

Start Supabase and the application, then use Mailpit at
`http://127.0.0.1:54324` to inspect local email:

```bash
npx supabase start
npm run dev
```

Create an invited test user through the local Supabase admin surface, request a
link from `/login`, open it in the same browser, confirm the protected home page
loads, and verify sign-out returns to `/login`. Also request a link for an email
that is not a user and confirm it cannot establish a session or access `/`.

Primary references:

- [Supabase server-side client setup](https://supabase.com/docs/guides/auth/server-side/creating-a-client)
- [Supabase passwordless email](https://supabase.com/docs/guides/auth/auth-email-passwordless)
- [Supabase redirect URLs](https://supabase.com/docs/guides/auth/redirect-urls)
- [Supabase email templates](https://supabase.com/docs/guides/auth/auth-email-templates)
