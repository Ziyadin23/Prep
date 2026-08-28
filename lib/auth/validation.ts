const MAX_EMAIL_LENGTH = 254;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type ValidatedEmail =
  | { email: string; error?: never }
  | { email?: never; error: string };

export function validateEmailInput(
  value: FormDataEntryValue | null,
): ValidatedEmail {
  if (typeof value !== "string") {
    return { error: "Enter your email address." };
  }

  const email = value.trim().toLowerCase();

  if (!email) {
    return { error: "Enter your email address." };
  }

  if (email.length > MAX_EMAIL_LENGTH || !EMAIL_PATTERN.test(email)) {
    return { error: "Enter a valid email address." };
  }

  return { email };
}

export function isAcceptedOtpType(
  value: string | null,
): value is "email" | "invite" {
  return value === "email" || value === "invite";
}

export function getAuthCallbackUrl(siteUrl: string) {
  return new URL("/auth/confirm", siteUrl).toString();
}
