import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { getBuildId } from "./build-info";

describe("getBuildId", () => {
  const originalBuildId = process.env.NEXT_BUILD_ID;

  beforeEach(() => {
    delete process.env.NEXT_BUILD_ID;
  });

  afterEach(() => {
    if (originalBuildId === undefined) {
      delete process.env.NEXT_BUILD_ID;
    } else {
      process.env.NEXT_BUILD_ID = originalBuildId;
    }
  });

  it("returns the build-time-inlined NEXT_BUILD_ID when set", () => {
    process.env.NEXT_BUILD_ID = "abcdef1";

    expect(getBuildId()).toBe("abcdef1");
  });

  it("falls back to a literal dev-local marker when NEXT_BUILD_ID is unset", () => {
    expect(getBuildId()).toBe("dev-local");
  });
});
