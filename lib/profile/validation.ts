export const DISPLAY_NAME_MIN_LENGTH = 2;
export const DISPLAY_NAME_MAX_LENGTH = 30;

type ValidDisplayName = { displayName: string };
type InvalidDisplayName = { error: string };

export function validateDisplayName(
  value: FormDataEntryValue | null,
): ValidDisplayName | InvalidDisplayName {
  if (typeof value !== "string") {
    return { error: "Enter a display name." };
  }

  const displayName = value.trim();
  const characterCount = Array.from(displayName).length;

  if (characterCount < DISPLAY_NAME_MIN_LENGTH) {
    return {
      error: `Display name must be at least ${DISPLAY_NAME_MIN_LENGTH} characters.`,
    };
  }

  if (characterCount > DISPLAY_NAME_MAX_LENGTH) {
    return {
      error: `Display name must be ${DISPLAY_NAME_MAX_LENGTH} characters or fewer.`,
    };
  }

  return { displayName };
}
