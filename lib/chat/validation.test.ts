import { describe, expect, it } from "vitest";
import { MESSAGE_MAX_LENGTH } from "./messages";
import { validateMessageBody } from "./validation";

describe("validateMessageBody", () => {
  it("trims and accepts valid text", () => {
    expect(validateMessageBody("  Hello team  ")).toEqual({ body: "Hello team" });
  });

  it.each([null, "", "  \n\t  "])("rejects a missing or blank message: %s", (value) => {
    expect(validateMessageBody(value)).toHaveProperty("error");
  });

  it("rejects text over 2,000 characters", () => {
    expect(validateMessageBody("A".repeat(MESSAGE_MAX_LENGTH + 1))).toEqual({
      error: "Message must be 2,000 characters or fewer.",
    });
  });

  it("counts Unicode code points consistently with PostgreSQL char_length", () => {
    expect(validateMessageBody("🙂".repeat(MESSAGE_MAX_LENGTH))).toEqual({
      body: "🙂".repeat(MESSAGE_MAX_LENGTH),
    });
  });
});
