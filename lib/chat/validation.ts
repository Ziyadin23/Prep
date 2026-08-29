import { MESSAGE_MAX_LENGTH } from "./messages";

type ValidMessage = { body: string };
type InvalidMessage = { error: string };

export function validateMessageBody(
  value: FormDataEntryValue | null,
): ValidMessage | InvalidMessage {
  if (typeof value !== "string") {
    return { error: "Enter a message." };
  }

  const body = value.trim();
  const characterCount = Array.from(body).length;

  if (characterCount === 0) {
    return { error: "Message cannot be blank." };
  }

  if (characterCount > MESSAGE_MAX_LENGTH) {
    return {
      error: `Message must be ${MESSAGE_MAX_LENGTH.toLocaleString("en-US")} characters or fewer.`,
    };
  }

  return { body };
}
