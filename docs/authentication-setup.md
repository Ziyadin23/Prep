# Deployment and authentication setup

This is the complete setup path for local development and a Vercel production
deployment. Prep is a private group messenger for **exactly three manually
invited teammates**. It has no public sign-up, in-app invitation, or
administration flow.

## Credentials and browser boundary

The application accepts exactly these public browser variables:

```text
NEXT_PUBLIC_SUPABASE_URL=<your-supabase-project-url>
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<your-supabase-publishable-key>
NEXT_PUBLIC_SITE_URL=<your-application-origin>
```

`NEXT_PUBLIC_*` values are exposed to browser JavaScript. The Supabase project
URL and publishable key are designed for that use; database access remains
limited by Auth and row-level security.

> **Never use, commit, log, screenshot, or set a Supabase secret key or legacy
> service-role key in Vercel or any `NEXT_PUBLIC_*` variable.** Prep does not
> need a privileged key. Keep any credential used for dashboard or CLI
> administration outside this repository and out of client configuration.

Copy `.env.example` to the ignored `.env.local` file rather than editing the
example. Do not commit `.env.local`.

## Local development

1. Start the local stack:

   ```bash
   npx --yes supabase@2.116.0 start
   ```

2. In `.env.local`, set `NEXT_PUBLIC_SUPABASE_URL` to the local API URL and
   `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` to the **publishable** key shown by
   your local Supabase instance. Keep
   `NEXT_PUBLIC_SITE_URL=http://127.0.0.1:3000` unless you deliberately use
   `http://localhost:3000` instead. Do not copy any secret or service-role
   value from the local status output.

3. Install dependencies if needed, then run the app:

   ```bash
   npm install
   npm run dev
   ```

4. Open `http://127.0.0.1:3000`. Local email is delivered to Mailpit at
   `http://127.0.0.1:54324`, not to real inboxes.

5. To exercise sign-in locally, open Supabase Studio at
   `http://127.0.0.1:54323`, choose **Authentication > Users**, then
   **Add user > Send invitation** for a disposable test address. Open its
   invitation in Mailpit. Do not use a real teammate address for disposable
   local data.

The tracked local Auth configuration in `supabase/config.toml` already sets the
local **Site URL** to `http://127.0.0.1:3000` and permits these exact callbacks:

```text
http://127.0.0.1:3000/auth/confirm
http://localhost:3000/auth/confirm
```

Use the callback matching `NEXT_PUBLIC_SITE_URL`. Local project-wide sign-up is
disabled (`auth.enable_signup = false`) while email remains enabled for users
who have been manually created or invited.

## Production: Supabase and Vercel

Before inviting anyone, create the hosted Supabase project, apply this
repository's migrations, and connect the Vercel project to this repository. The
production application and database must use the same Supabase project. From an
authenticated Supabase CLI session, link and migrate the intended project:

```bash
npx --yes supabase@2.116.0 link --project-ref <your-project-ref>
npx --yes supabase@2.116.0 db push
```

Confirm the project reference before approving the database push. Keep CLI
access tokens and database credentials outside the repository.

### 1. Configure Supabase Auth

In the hosted Supabase project's **Authentication > URL Configuration**:

1. Set **Site URL** to the one canonical HTTPS origin, for example
   `https://prep.example`.
2. Add the matching exact redirect URL:
   `https://prep.example/auth/confirm`.
3. Do not use a broad production wildcard. Add a preview callback only when a
   deliberately configured preview environment needs email authentication, and
   set that preview deployment's `NEXT_PUBLIC_SITE_URL` to the same origin.

Keep the Email provider enabled, configure production SMTP before sending real
mail, and disable project-wide new-user sign-up. The app also passes
`shouldCreateUser: false` when requesting every magic link. Both protections
are required so the sign-in form cannot create accounts.

Configure the hosted email templates to use the token-hash callback expected by
the application:

```html
<!-- Magic Link -->
<a href="{{ .RedirectTo }}?token_hash={{ .TokenHash }}&type=email">
  Sign in to Prep
</a>
```

```html
<!-- Invite user -->
<a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=invite">
  Accept invitation
</a>
```

The callback accepts only `email` and `invite` token types, verifies the
one-time token with Supabase, sets the cookie-backed session, and redirects to
the configured application origin.

### 2. Configure Vercel

In **Vercel > Project > Settings > Environment Variables**, add the following
values to the **Production** environment before the production build:

| Variable | Production value |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Hosted Supabase project URL, for example `https://<project-ref>.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Hosted Supabase **publishable** key |
| `NEXT_PUBLIC_SITE_URL` | Canonical app origin, for example `https://prep.example` |

These are public browser values, so do not place any other Supabase credential
there. `NEXT_PUBLIC_*` variables are bundled during `next build`; redeploy after
changing one. Set `NEXT_PUBLIC_SITE_URL` to the exact origin configured as the
Supabase Site URL so magic links return to the right deployment.

## Provision exactly three teammates

Perform this once after the production redirect URLs, templates, SMTP, and Vercel
deployment are verified. The addresses below are placeholders; replace them in
the private operator checklist, not in this repository.

```text
<teammate-1@example.com>
<teammate-2@example.com>
<teammate-3@example.com>
```

1. Confirm the approved list contains exactly these three addresses and no
   fourth address.
2. In the hosted Supabase dashboard, open **Authentication > Users**, choose
   **Add user > Send invitation**, and send one invitation to each approved
   address. Do not create users through the browser application and do not add
   an invitation UI.
3. Ask each teammate to use the one-time invite link. It opens
   `/auth/confirm`, establishes a session, and then requires a display name
   before chat access.
4. After acceptance, each teammate signs in from Prep's `/login` page with a
   magic link. Test an uninvited address as well: the generic login response
   must not establish a session or create an account.

Record the private list and invitation completion outside the repository. Do
not add teammates' addresses, invitation URLs, tokens, or screenshots to Git.

## Deployment checks

Before considering the deployment ready, verify all of the following:

- `/login` can request a link for an invited user and the link returns through
  the exact production `/auth/confirm` URL.
- A non-invited address cannot obtain access or create an account.
- Each of the three invitees can set a display name, enter the shared chat, and
  sign out.
- No source file, `.env.example`, Vercel browser variable, build log, or
  screenshot contains a secret or legacy service-role key.

## Primary references

- [Next.js environment variables](https://nextjs.org/docs/app/guides/environment-variables)
- [Vercel environment variables](https://vercel.com/docs/environment-variables)
- [Vercel Next.js deployments](https://vercel.com/docs/frameworks/full-stack/nextjs)
- [Supabase passwordless email](https://supabase.com/docs/guides/auth/auth-email-passwordless)
- [Supabase redirect URLs](https://supabase.com/docs/guides/auth/redirect-urls)
- [Supabase email templates](https://supabase.com/docs/guides/auth/auth-email-templates)
- [Supabase user invitations](https://supabase.com/docs/guides/auth/users#inviting-users)
- [Supabase API keys](https://supabase.com/docs/guides/getting-started/api-keys)
- [Supabase custom SMTP](https://supabase.com/docs/guides/auth/auth-smtp)
