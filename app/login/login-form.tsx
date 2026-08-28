"use client";

import { useActionState } from "react";
import { requestMagicLink } from "@/app/auth/actions";
import { initialAuthState, type AuthActionState } from "@/app/auth/state";

type LoginFormProps = {
  callbackError?: string;
};

export function LoginForm({ callbackError }: LoginFormProps) {
  const [state, formAction, pending] = useActionState<AuthActionState, FormData>(
    requestMagicLink,
    initialAuthState,
  );
  const emailError = state.fieldErrors?.email;
  const actionMessage =
    state.status === "success"
      ? "If this address can sign in, you’ll receive an email with a secure link shortly."
      : state.status === "error"
        ? state.message
        : undefined;
  const message = actionMessage ?? callbackError;
  const isError =
    state.status === "error" || Boolean(callbackError && !actionMessage);

  return (
    <form action={formAction} className="mt-8 space-y-5">
      <div>
        <label
          className="block text-sm font-medium text-stone-800"
          htmlFor="email"
        >
          Email address
        </label>
        <input
          aria-describedby={emailError ? "email-error" : undefined}
          aria-invalid={Boolean(emailError)}
          autoComplete="email"
          className="mt-2 block w-full rounded-xl border border-stone-300 bg-white px-3.5 py-3 text-base text-stone-950 shadow-sm outline-none transition placeholder:text-stone-400 focus:border-teal-700 focus:ring-4 focus:ring-teal-700/15 disabled:cursor-not-allowed disabled:bg-stone-100 disabled:text-stone-500"
          disabled={pending}
          id="email"
          name="email"
          placeholder="you@example.com"
          required
          type="email"
        />
        {emailError ? (
          <p className="mt-2 text-sm text-red-700" id="email-error">
            {emailError}
          </p>
        ) : null}
      </div>

      <div aria-atomic="true" aria-live="polite" className="min-h-5">
        {pending ? (
          <p className="text-sm text-stone-600">Sending your sign-in link…</p>
        ) : message ? (
          <p
            className={`text-sm ${
              isError ? "text-red-700" : "text-emerald-800"
            }`}
            role={isError ? "alert" : undefined}
          >
            {message}
          </p>
        ) : null}
      </div>

      <button
        className="flex w-full items-center justify-center rounded-xl bg-teal-800 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-800 disabled:cursor-not-allowed disabled:bg-stone-400"
        disabled={pending}
        type="submit"
      >
        {pending ? "Sending link…" : "Email me a sign-in link"}
      </button>
    </form>
  );
}
