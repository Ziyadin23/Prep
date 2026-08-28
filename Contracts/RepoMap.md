# Repository Map

This file is a lightweight navigation map. Keep it short and update it when important files or directories are added.

## Current Top Level

- `app/`: Next.js App Router routes and the initial application shell.
- `Contracts/`: project plan, agent contract, progress ledger, and repo map.
- `public/`: static assets used by the Next.js application.
- `supabase/`: Supabase CLI configuration, database migrations, and pgTAP security tests.
- `package.json`, `package-lock.json`: Node.js scripts and locked application dependencies.
- `.env.example`: names of the public Supabase client variables; values are intentionally omitted.
- `README.md`: short repository title.
- `TEST.md`: temporary test file confirming repository changes can be committed and pushed.

## Expected Areas

These areas do not exist yet, but are expected as contracts are implemented:

- `app/`: Next.js app routes and screens.
- `components/`: reusable UI components.
- `lib/`: Supabase client and shared helpers.
- `docs/`: deployment or setup documentation, if it grows beyond README-level notes.

## Reading Guidance

- For a new task, read `Contracts/Progress.md` first.
- Use `rg --files` for the file list.
- Read only files related to the active contract from `Contracts/Plan.md`.
- Update this file when adding a new directory, important config file, or ownership boundary.
