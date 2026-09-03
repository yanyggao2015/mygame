import { describe, expect, it } from "vitest";
import { computeBuildId } from "./compute-build-id";

describe("computeBuildId", () => {
  it("returns a 7-character short SHA when a commit SHA is given", () => {
    expect(
      computeBuildId(
        "abcdef1234567890abcdef1234567890abcdef12",
        "2026-09-02T00:00:00.000Z",
      ),
    ).toBe("abcdef1");
  });

  it("returns the fallback when no commit SHA is given", () => {
    expect(computeBuildId(undefined, "2026-09-02T00:00:00.000Z")).toBe(
      "2026-09-02T00:00:00.000Z",
    );
  });

  it("returns the fallback when the commit SHA is an empty string", () => {
    expect(computeBuildId("", "2026-09-02T00:00:00.000Z")).toBe(
      "2026-09-02T00:00:00.000Z",
    );
  });
});
