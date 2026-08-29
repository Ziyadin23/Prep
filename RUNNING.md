# Running Prep locally

## Prerequisites

- Node.js and npm
- Docker running locally (required by Supabase)

## Start the application

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the local Supabase stack:

   ```bash
   npx --yes supabase@2.116.0 start
   ```

3. Copy the public local settings template and fill it from the **public**
   values shown by `supabase status`:

   ```bash
   cp .env.example .env.local
   npx --yes supabase@2.116.0 status
   ```

   Set these values in `.env.local`:

   - `NEXT_PUBLIC_SUPABASE_URL` = `API_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` = `PUBLISHABLE_KEY`
   - `NEXT_PUBLIC_SITE_URL` = `http://127.0.0.1:3000`

   `.env.local` is ignored by Git. Never use a secret key or service-role key
   in this file.

4. Start the Next.js development server:

   ```bash
   npm run dev
   ```

5. Open [http://127.0.0.1:3000](http://127.0.0.1:3000).

## Test local sign-in

Prep has no public registration. Create disposable local users through
Supabase Studio at [http://127.0.0.1:54323](http://127.0.0.1:54323), then find
their invite or magic-link emails in Mailpit at
[http://127.0.0.1:54324](http://127.0.0.1:54324). Use only test addresses
locally.

## Verification commands

```bash
npm test
npx tsc --noEmit
npm run lint
npm run build -- --webpack
npx --yes supabase@2.116.0 db lint
npx --yes supabase@2.116.0 test db
```

## Stop local services

Stop the app server with `Ctrl+C`, then stop Supabase when it is no longer
needed:

```bash
npx --yes supabase@2.116.0 stop
```

For hosted deployment and the private three-person invitation procedure, see
[docs/authentication-setup.md](docs/authentication-setup.md).
