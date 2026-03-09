import { describe, expect, it } from "vitest";
import { resolveGradleTestPattern } from "./gradle-resolve-patterns";

describe("resolveGradleTestPattern", () => {
  it("should prioritize explicit testPattern", () => {
    expect(
      resolveGradleTestPattern({
        testPattern: "com.example.user.*",
        packageName: "ignored.package",
      }),
    ).toBe("com.example.user.*");
  });

  it("should build package + class + method pattern", () => {
    expect(
      resolveGradleTestPattern({
        packageName: "com.example.user",
        className: "UserServiceTest",
        methodName: "shouldCreateUser",
      }),
    ).toBe("com.example.user.UserServiceTest.shouldCreateUser");
  });

  it("should build package + class pattern", () => {
    expect(
      resolveGradleTestPattern({
        packageName: "com.example.user",
        className: "UserServiceTest",
      }),
    ).toBe("com.example.user.UserServiceTest");
  });

  it("should build package wildcard pattern", () => {
    expect(
      resolveGradleTestPattern({
        packageName: "com.example.user",
      }),
    ).toBe("com.example.user.*");
  });

  it("should return undefined when no filters are provided", () => {
    expect(resolveGradleTestPattern({})).toBeUndefined();
  });
});
