# Prep MVP Product Specification

This is the authoritative source for product requirements and roadmap scope.
Execution plans may add implementation discoveries and verification evidence but
must not silently change these requirements.

## Product intent

Build a private, responsive web messenger for three invited teammates. The MVP
provides one shared group chat with email magic-link access, display names, text
messages, timestamps, saved recent history, and realtime updates.

The product should be deployable on Vercel and use Supabase for authentication,
database storage, row-level security, and Realtime.

## Users and access

- Exactly three team members are invited outside the application.
- Invited users authenticate by email magic link.
- The application has no public registration or in-app invitation/admin flow.
- A first-time authenticated user chooses a display name before entering chat.

## MVP behavior

- There is one shared group chat and no other conversation type.
- Signed-in members can read teammate profiles and the latest 100 messages in
  timestamp order.
- Each message shows its sender name, text, and timestamp.
- Valid new messages persist and appear to other signed-in members without a
  refresh.
- Message text is trimmed, non-blank, and at most 2,000 characters.
- The interface provides clear signed-out, loading, empty, network, validation,
  and send-error states.
- The chat is usable at phone and laptop widths.

## Security and privacy requirements

- Anonymous users cannot read profiles or messages.
- Users can create and update only their own profile.
- Users can insert messages only under their own identity.
- Messages cannot be edited or deleted in the MVP.
- Database constraints and row-level security enforce these rules independently
  of browser validation.
- Only public Supabase client variables may be exposed to the browser or Vercel.
  The Supabase service-role key must never be committed or exposed.

## Out of scope

- Direct messages or multiple rooms
- Attachments or file upload
- Reactions
- Typing indicators
- Read receipts
- Notifications
- Message editing or deletion
- In-app invitations, registration, or administration

## Roadmap contracts

Contracts are completed in order unless a human explicitly changes priorities.
Status and work-in-progress details live only in `docs/exec-plans/`: the plan in
`active/` is current, while files in `completed/` are verified history.

### C00 - Project Scaffold

Objective: establish the deployable application foundation.

Required outcomes:

- A root Next.js application with TypeScript and Tailwind CSS
- A basic locally renderable application shell
- Public Supabase environment variable names documented without values

Acceptance criteria:

- Dependency installation succeeds.
- Lint and production build pass.
- The development server returns a successful response.

### C01 - Supabase Schema and Policies

Objective: establish persistence, realtime publication, and database-enforced
access rules for profiles and messages.

Required outcomes:

- `profiles` stores an authenticated user ID, display name, and creation time.
- `messages` stores an ID, sender profile ID, text of at most 2,000 characters,
  and creation time.
- Row-level security enforces the security requirements in this specification.
- The `messages` table is available through Supabase Realtime.

Acceptance criteria:

- Migrations apply and database lint reports no schema errors.
- Automated policy tests reject anonymous reads and sender impersonation.
- Tests confirm profile ownership and immutable messages.

### C02 - Authentication Flow

Objective: give invited users a reliable magic-link sign-in and sign-out flow.

Required outcomes:

- An email sign-in screen and magic-link request behavior
- Explicit signed-out, loading, success, and error feedback
- Session-aware access to the private application
- Sign-out behavior
- Public self-registration disabled
- Local and Vercel redirect URL setup documented

Acceptance criteria:

- An invited user can request a magic link and establish an application session.
- An uninvited user cannot register or access the private application.
- A signed-in user can sign out and returns to the signed-out experience.

### C03 - Profile Setup

Objective: require each authenticated user to establish a valid display name
before entering chat.

Required outcomes:

- Profile lookup after sign-in
- Profile creation with display-name validation
- Own-profile correction behavior where needed
- A routing or rendering gate that prevents profile-less users entering chat

Acceptance criteria:

- A new user must set a valid display name before chat.
- An existing profiled user proceeds directly to chat.
- A user cannot create or edit another user's profile.

### C04 - Realtime Team Chat

Objective: implement persisted shared messaging with realtime delivery.

Required outcomes:

- Load the latest 100 messages in timestamp order.
- Subscribe to new message inserts and append them promptly.
- Reconcile insert responses and realtime events by message ID without duplicates.
- Send valid text of at most 2,000 characters.
- Prevent blank or invalid sends.

Acceptance criteria:

- Two signed-in users see new messages without refreshing.
- Refresh preserves recent history in timestamp order.
- Blank and over-limit messages cannot be sent.

### C05 - Responsive UI and States

Objective: make the complete messenger clear and usable on phone and laptop
widths, including failure and transitional states.

Required outcomes:

- Chat header and signed-in user menu with sign-out
- Scrollable message history grouped clearly by sender
- Message composer
- Inline authentication, loading, network, and send-error states
- Responsive layouts without overlapping or clipped controls

Acceptance criteria:

- The complete flow is usable at representative phone and laptop widths.
- Long permitted text does not overlap or overflow interactive controls.
- All asynchronous flows provide actionable feedback.

### C06 - Deployment Documentation

Objective: make production setup reproducible without exposing secrets.

Required outcomes:

- Vercel public environment variable instructions
- Supabase local and production auth redirect URL instructions
- Manual invitation instructions for the three team emails
- An explicit service-role key warning

Acceptance criteria:

- A new developer can configure local and production environments from the docs.
- Repository and documented client configuration contain no secrets.

### C07 - Integration and QA

Objective: verify the MVP end to end and state release readiness honestly.

Required outcomes:

- Pass/fail evidence for three invited users
- Auth, profile, chat, persistence, realtime, validation, responsive, and security
  checks
- Known limitations and every remaining release blocker recorded

Acceptance criteria:

- Each invited user can sign in, establish a profile, send text, and receive a
  teammate's message without refreshing.
- History persists across refresh and remains ordered.
- Invalid messages and unauthorized database actions are rejected.
- Phone and laptop checks pass.
- Every MVP check has recorded evidence or an explicit blocker.

## MVP completion

The MVP is complete only when C00-C07 have completed execution plans, no release
blocker remains, relevant automated checks pass, and manual behavior that cannot
be automated has recorded evidence.
