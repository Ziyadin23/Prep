# MVP Team Messenger

## Summary

Build a private, responsive web messenger for three invited teammates. It will provide one real-time group chat with text messages, sender names, timestamps, and saved recent history.

Use Next.js, TypeScript, and Tailwind CSS for the app; Supabase for authentication, database, and realtime; and Vercel for deployment.

## Implementation Changes

- Create three app states:
  - **Sign-in:** enter an email address and receive a magic link. Disable public account creation; only accounts invited through the Supabase dashboard can sign in.
  - **Profile setup:** on first sign-in, choose a display name.
  - **Team chat:** show recent messages, sender names, timestamps, and a text composer.

- Create Supabase tables:
  - `profiles`: authenticated user ID, display name, and created timestamp.
  - `messages`: ID, sender profile ID, text body (maximum 2,000 characters), and created timestamp.

- Apply security policies:
  - Only signed-in users can read messages.
  - A user may create messages only under their own user ID.
  - Users may create and edit only their own profile.
  - Messages cannot be edited or deleted in the MVP.

- Enable Supabase Realtime for `messages`.
  - Load the most recent 100 messages when chat opens.
  - Subscribe to new messages and append them immediately.
  - De-duplicate the returned insert result and realtime event by message ID.

- Build a mobile-and-desktop responsive chat interface with:
  - A chat header and signed-in user menu with sign-out.
  - A scrollable message list grouped clearly by sender.
  - A disabled send button for blank or invalid text.
  - Inline loading, network, sign-in, and send-error states.

- Configure deployment:
  - Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to Vercel.
  - Configure the Vercel URL as the Supabase auth redirect URL.
  - Invite the three team email addresses in the Supabase dashboard.
  - Never expose the Supabase service-role key in the frontend or Vercel client environment.

## Team Split

- **Frontend:** Next.js UI, responsive layout, profile setup, message list/composer, and auth states.
- **Backend:** Supabase project, database migrations, row-level security policies, Realtime configuration, and invite setup.
- **Integration/QA:** connect frontend to Supabase, set environment variables, deploy Vercel, and test all three accounts together.

## Test Plan

- Verify an uninvited email cannot create or access an account.
- Verify each invited user can sign in, set a display name, send text, and see another user's message without refreshing.
- Verify message history remains after refresh and appears in timestamp order.
- Verify blank and over-limit messages cannot be sent.
- Verify database policies reject anonymous reads and attempts to send as another user.
- Verify the chat works at phone and laptop widths.

## Assumptions

- The first release has exactly one shared team room.
- No direct messages, reactions, files, typing indicators, read receipts, notifications, editing, or deletion.
- Team membership is managed manually in Supabase by the project owner; there is no in-app invitation or admin screen.
