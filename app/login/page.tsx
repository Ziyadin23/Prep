import type { Metadata } from "next";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to Prep with an email magic link.",
};

type LoginPageProps = {
  searchParams: Promise<{ error?: string | string[] }>;
};

const callbackErrors: Record<string, string> = {
  configuration:
    "Sign-in is not configured. Please contact the project owner.",
  invalid_or_expired:
    "This sign-in link is invalid or has expired. Please request a new link.",
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { error } = await searchParams;
  const callbackError =
    typeof error === "string" ? callbackErrors[error] : undefined;

  return (
    <main className="flex min-h-dvh items-center justify-center px-5 py-10 sm:px-6">
      <section
        aria-labelledby="login-heading"
        className="w-full max-w-md rounded-2xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8"
      >
        <p className="text-sm font-semibold tracking-wide text-teal-800">PREP</p>
        <h1
          className="mt-3 text-3xl font-semibold tracking-tight text-stone-950"
          id="login-heading"
        >
          Sign in to your team
        </h1>
        <p className="mt-3 text-base leading-7 text-stone-600">
          Enter your invited email address and we’ll send you a secure sign-in
          link.
        </p>
        <LoginForm callbackError={callbackError} />
      </section>
    </main>
  );
}
