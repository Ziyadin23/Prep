import { describe, expect, it } from "vitest";
import {
  DISPLAY_NAME_MAX_LENGTH,
  validateDisplayName,
} from "./validation";

describe("validateDisplayName", () => {
  it("trims and accepts a valid display name", () => {
    expect(validateDisplayName("  Ada Lovelace  ")).toEqual({
      displayName: "Ada Lovelace",
    });
  });

  it.each([null, "", "   ", "A"])("rejects a missing or short name: %s", (value) => {
    expect(validateDisplayName(value)).toHaveProperty("error");
  });

  it("rejects a name over the database limit", () => {
    expect(validateDisplayName("A".repeat(DISPLAY_NAME_MAX_LENGTH + 1))).toEqual({
      error: "Display name must be 30 characters or fewer.",
    });
  });

  it("counts Unicode code points consistently with PostgreSQL char_length", () => {
    expect(validateDisplayName("🙂".repeat(DISPLAY_NAME_MAX_LENGTH))).toEqual({
      displayName: "🙂".repeat(DISPLAY_NAME_MAX_LENGTH),
    });
  });
});
