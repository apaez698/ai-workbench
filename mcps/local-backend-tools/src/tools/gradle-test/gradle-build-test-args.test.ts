import { describe, expect, it } from "vitest";
import { buildGradleTestArgs } from "./gradle-build-test-args";

describe("buildGradleTestArgs", () => {
  it("should build default test args without filters", () => {
    const result = buildGradleTestArgs({});
    expect(result.args).toEqual(["test", "--console=plain"]);
    expect(result.resolvedPattern).toBeUndefined();
  });

  it("should append --tests when filter exists", () => {
    const result = buildGradleTestArgs({
      packageName: "com.example.user",
    });

    expect(result.args).toEqual([
      "test",
      "--console=plain",
      "--tests",
      "com.example.user.*",
    ]);
    expect(result.resolvedPattern).toBe("com.example.user.*");
  });
});
