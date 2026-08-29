import Link from "next/link";
import { redirect } from "next/navigation";
import { signOut } from "@/app/auth/actions";
import { ProfileForm } from "@/app/profile/profile-form";
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

  return (
    <main className="flex min-h-dvh flex-1 items-center justify-center px-6 py-16">
      <section className="w-full max-w-xl rounded-3xl border border-stone-200 bg-white p-8 shadow-sm sm:p-12">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-800">
          Prep
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-stone-950">
          Welcome, {profile.display_name}
        </h1>
        {profileSaved ? (
          <p
            aria-live="polite"
            className="mt-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
          >
            Your display name has been saved.
          </p>
        ) : null}
        <p className="mt-3 text-base leading-7 text-stone-600">
          Your profile is ready and the chat gate is open. Realtime messaging is
          the next step in the project roadmap.
        </p>
        <details className="mt-8 rounded-2xl border border-stone-200 p-5">
          <summary className="cursor-pointer text-sm font-semibold text-stone-800 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-800">
            Change display name
          </summary>
          <ProfileForm
            initialDisplayName={profile.display_name}
            submitLabel="Save display name"
          />
        </details>
        <form action={signOut} className="mt-6">
          <button
            type="submit"
            className="inline-flex min-h-11 items-center justify-center rounded-xl border border-stone-300 px-5 py-2.5 text-sm font-semibold text-stone-800 transition hover:border-stone-400 hover:bg-stone-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-800"
          >
            Sign out
          </button>
        </form>
      </section>
    </main>
  );
}
