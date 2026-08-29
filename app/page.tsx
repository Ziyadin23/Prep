import Link from "next/link";
import { redirect } from "next/navigation";
import { signOut } from "@/app/auth/actions";
import { Chat } from "@/app/chat/chat";
import { ProfileForm } from "@/app/profile/profile-form";
import { parseMessageRecord, type ChatMessage } from "@/lib/chat/messages";
import { getSupabasePublicConfig } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

type HomePageProps = {
  searchParams: Promise<{ profile?: string | string[] }>;
};

export default async function Home({ searchParams }: HomePageProps) {
  if (!getSupabasePublicConfig()) {
    redirect("/login?error=configuration");
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();

  if (error || !data?.claims) {
    redirect("/login");
  }

  const email =
    typeof data.claims.email === "string" ? data.claims.email : "Team member";
  const userId = data.claims.sub;

  if (typeof userId !== "string") {
    redirect("/login");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", userId)
    .maybeSingle();
  const { profile: profileStatus } = await searchParams;
  const profileSaved = profileStatus === "saved";

  if (profileError) {
    console.error("Supabase profile lookup failed", { code: profileError.code });

    return (
      <main className="flex min-h-dvh flex-1 items-center justify-center px-6 py-16">
        <section
          aria-labelledby="profile-error-heading"
          className="w-full max-w-xl rounded-3xl border border-stone-200 bg-white p-8 shadow-sm sm:p-12"
        >
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-800">
            Prep
          </p>
          <h1
            className="mt-4 text-3xl font-semibold tracking-tight text-stone-950"
            id="profile-error-heading"
          >
            We couldn&apos;t load your profile
          </h1>
          <p className="mt-3 text-base leading-7 text-stone-600">
            Check your connection and refresh this page. Your chat remains locked
            until your profile can be verified.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              className="inline-flex min-h-11 items-center justify-center rounded-xl bg-teal-800 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-800"
              href="/"
            >
              Try again
            </Link>
            <form action={signOut}>
              <button
                className="inline-flex min-h-11 items-center justify-center rounded-xl border border-stone-300 px-5 py-2.5 text-sm font-semibold text-stone-800 transition hover:border-stone-400 hover:bg-stone-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-800"
                type="submit"
              >
                Sign out
              </button>
            </form>
          </div>
        </section>
      </main>
    );
  }

  if (!profile) {
    return (
      <main className="flex min-h-dvh flex-1 items-center justify-center px-6 py-16">
        <section
          aria-labelledby="profile-heading"
          className="w-full max-w-xl rounded-3xl border border-stone-200 bg-white p-8 shadow-sm sm:p-12"
        >
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-800">
            Prep
          </p>
          <h1
            className="mt-4 text-3xl font-semibold tracking-tight text-stone-950"
            id="profile-heading"
          >
            Choose your display name
          </h1>
          <p className="mt-3 text-base leading-7 text-stone-600">
            You&apos;re signed in as{" "}
            <span className="font-medium text-stone-900">{email}</span>. Set the
            name your teammates will see before entering chat.
          </p>
          <ProfileForm />
          <form action={signOut} className="mt-4">
            <button
              className="flex w-full items-center justify-center rounded-xl border border-stone-300 px-4 py-3 text-sm font-semibold text-stone-800 transition hover:border-stone-400 hover:bg-stone-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-800"
              type="submit"
            >
              Sign out
            </button>
          </form>
        </section>
      </main>
    );
  }

  const { data: messageRecords, error: messagesError } = await supabase
    .from("messages")
    .select(
      "id, sender_id, body, created_at, sender:profiles!messages_sender_id_fkey(display_name)",
    )
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .limit(100);

  if (messagesError) {
    console.error("Supabase message history lookup failed", {
      code: messagesError.code,
    });

    return (
      <main className="flex min-h-dvh flex-1 items-center justify-center px-6 py-16">
        <section
          aria-labelledby="messages-error-heading"
          className="w-full max-w-xl rounded-3xl border border-stone-200 bg-white p-8 shadow-sm sm:p-12"
        >
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-800">
            Prep
          </p>
          <h1
            className="mt-4 text-3xl font-semibold tracking-tight text-stone-950"
            id="messages-error-heading"
          >
            We couldn&apos;t load your messages
          </h1>
          <p className="mt-3 text-base leading-7 text-stone-600">
            Check your connection and refresh this page. No message history was
            changed.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              className="inline-flex min-h-11 items-center justify-center rounded-xl bg-teal-800 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-800"
              href="/"
            >
              Try again
            </Link>
            <form action={signOut}>
              <button
                className="inline-flex min-h-11 items-center justify-center rounded-xl border border-stone-300 px-5 py-2.5 text-sm font-semibold text-stone-800 transition hover:border-stone-400 hover:bg-stone-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-800"
                type="submit"
              >
                Sign out
              </button>
            </form>
          </div>
        </section>
      </main>
    );
  }

  const initialMessages = (messageRecords ?? [])
    .map(parseMessageRecord)
    .filter((message): message is ChatMessage => Boolean(message));

  return (
    <main className="flex min-h-dvh flex-1 justify-center py-0 sm:px-6 sm:py-10">
      <section className="w-full max-w-4xl bg-white sm:rounded-3xl sm:border sm:border-stone-200 sm:shadow-sm">
        <header className="flex flex-col gap-4 border-b border-stone-200 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <div className="min-w-0">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-800">
              Prep
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-stone-950 sm:text-3xl">
              Your team space
            </h1>
          </div>
          <details className="w-full rounded-xl border border-stone-200 bg-stone-50 sm:w-auto sm:min-w-64">
            <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-4 py-2.5 text-left text-sm font-semibold text-stone-800 marker:content-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-800">
              <span className="min-w-0 truncate">{profile.display_name}</span>
              <span className="shrink-0 text-stone-500">
                Account
              </span>
            </summary>
            <div className="border-t border-stone-200 px-4 py-4">
              <p className="break-all text-sm text-stone-600">Signed in as {email}</p>
              <ProfileForm
                initialDisplayName={profile.display_name}
                submitLabel="Save display name"
              />
              <form action={signOut} className="mt-4">
                <button
                  type="submit"
                  className="flex min-h-11 w-full items-center justify-center rounded-xl border border-stone-300 px-4 py-2.5 text-sm font-semibold text-stone-800 transition hover:border-stone-400 hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-800"
                >
                  Sign out
                </button>
              </form>
            </div>
          </details>
        </header>
        <div className="px-5 pb-6 pt-5 sm:px-8 sm:pb-8">
        {profileSaved ? (
          <p
            aria-live="polite"
            className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
          >
            Your display name has been saved.
          </p>
        ) : null}
        <p className={`${profileSaved ? "mt-4" : ""} text-base leading-7 text-stone-600`}>
          You&apos;re chatting as <span className="font-medium text-stone-800">{profile.display_name}</span> in your private team space.
        </p>
        <Chat currentUserId={userId} initialMessages={initialMessages} />
        </div>
      </section>
    </main>
  );
}
