import { redirect } from "next/navigation";
import { signOut } from "@/app/auth/actions";
import { getSupabasePublicConfig } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
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

  return (
    <main className="flex min-h-dvh flex-1 items-center justify-center px-6 py-16">
      <section className="w-full max-w-xl rounded-3xl border border-stone-200 bg-white p-8 shadow-sm sm:p-12">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-800">
          Prep
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-stone-950">
          You&apos;re signed in
        </h1>
        <p className="mt-3 text-base leading-7 text-stone-600">
          Signed in as <span className="font-medium text-stone-900">{email}</span>.
          Profile setup is the next step in the project roadmap.
        </p>
        <form action={signOut} className="mt-8">
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
