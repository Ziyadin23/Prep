import { describe, expect, it } from "vitest";
import {
  getAuthCallbackUrl,
  isAcceptedOtpType,
  validateEmailInput,
} from "./validation";

describe("validateEmailInput", () => {
  it("normalizes a valid email", () => {
    expect(validateEmailInput("  TEAMMATE@Example.com ")).toEqual({
      email: "teammate@example.com",
    });
  });

  it.each([null, "", "not-an-email", "name@example", `${"a".repeat(250)}@x.io`])(
    "rejects invalid input %s",
    (value) => {
      expect(validateEmailInput(value).error).toBeTruthy();
    },
  );
});

describe("isAcceptedOtpType", () => {
  it.each(["email", "invite"])("accepts %s", (value) => {
    expect(isAcceptedOtpType(value)).toBe(true);
  });

  it.each([null, "signup", "recovery", "magiclink", "email_change"])(
    "rejects %s",
    (value) => {
      expect(isAcceptedOtpType(value)).toBe(false);
    },
  );
});

it("builds an application-owned callback URL", () => {
  expect(getAuthCallbackUrl("https://prep.example")).toBe(
    "https://prep.example/auth/confirm",
  );
});
