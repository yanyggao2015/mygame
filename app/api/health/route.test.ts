import { afterEach, describe, expect, it } from "vitest";
import { GET } from "./route";

describe("GET /api/health", () => {
  const originalBuildId = process.env.NEXT_BUILD_ID;

  afterEach(() => {
    if (originalBuildId === undefined) {
      delete process.env.NEXT_BUILD_ID;
    } else {
      process.env.NEXT_BUILD_ID = originalBuildId;
    }
  });

  it("returns 200 with status ok and a buildId", async () => {
    const response = GET();

    expect(response.status).toBe(200);

    const body = await response.json();
    expect(body.status).toBe("ok");
    expect(typeof body.buildId).toBe("string");
    expect(body.buildId.length).toBeGreaterThan(0);
  });

  it("returns the build id from NEXT_BUILD_ID (the same value the root page reads)", async () => {
    process.env.NEXT_BUILD_ID = "abcdef1";

    const response = GET();
    const body = await response.json();

    expect(body.buildId).toBe("abcdef1");
  });
});
