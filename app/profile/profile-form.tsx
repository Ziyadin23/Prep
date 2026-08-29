"use client";

import { useActionState } from "react";
import { saveProfile } from "./actions";
import { initialProfileState, type ProfileActionState } from "./state";

type ProfileFormProps = {
  initialDisplayName?: string;
  submitLabel?: string;
};

export function ProfileForm({
  initialDisplayName,
  submitLabel = "Continue to chat",
}: ProfileFormProps) {
  const [state, formAction, pending] = useActionState<
    ProfileActionState,
    FormData
  >(saveProfile, initialProfileState);
  const displayNameError = state.fieldErrors?.displayName;

  return (
    <form action={formAction} className="mt-8 space-y-5">
      <div>
        <label
          className="block text-sm font-medium text-stone-800"
          htmlFor="displayName"
        >
          Display name
        </label>
        <p className="mt-1 text-sm leading-6 text-stone-600" id="display-name-help">
          This is the name your two teammates will see. Use 2 to 30 characters.
        </p>
        <input
          aria-describedby={
            displayNameError
              ? "display-name-help display-name-error"
              : "display-name-help"
          }
          aria-invalid={Boolean(displayNameError)}
          autoComplete="nickname"
          className="mt-2 block w-full rounded-xl border border-stone-300 bg-white px-3.5 py-3 text-base text-stone-950 shadow-sm outline-none transition placeholder:text-stone-400 focus:border-teal-700 focus:ring-4 focus:ring-teal-700/15 disabled:cursor-not-allowed disabled:bg-stone-100 disabled:text-stone-500"
          defaultValue={initialDisplayName}
          disabled={pending}
          id="displayName"
          name="displayName"
          placeholder="Your name"
          required
          type="text"
        />
        {displayNameError ? (
          <p className="mt-2 text-sm text-red-700" id="display-name-error">
            {displayNameError}
          </p>
        ) : null}
      </div>

      <div aria-atomic="true" aria-live="polite" className="min-h-5">
        {pending ? (
          <p className="text-sm text-stone-600">Saving your profile…</p>
        ) : state.status === "error" && state.message ? (
          <p className="text-sm text-red-700" role="alert">
            {state.message}
          </p>
        ) : null}
      </div>

      <button
        className="flex w-full items-center justify-center rounded-xl bg-teal-800 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-800 disabled:cursor-not-allowed disabled:bg-stone-400"
        disabled={pending}
        type="submit"
      >
        {pending ? "Saving…" : submitLabel}
      </button>
    </form>
  );
}
