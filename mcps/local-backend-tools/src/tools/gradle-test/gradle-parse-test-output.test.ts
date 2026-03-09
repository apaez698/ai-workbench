import { describe, expect, it } from "vitest";
import { parseGradleTestOutput } from "./gradle-parse-test-output";

describe("parseGradleTestOutput", () => {
  it("should parse total and failed tests", () => {
    const output = "10 tests completed, 2 failed";
    expect(parseGradleTestOutput(output)).toEqual({
      total: 10,
      failed: 2,
      skipped: 0,
      passed: 8,
    });
  });

  it("should parse total, failed and skipped tests", () => {
    const output = "15 tests completed, 3 failed, 2 skipped";
    expect(parseGradleTestOutput(output)).toEqual({
      total: 15,
      failed: 3,
      skipped: 2,
      passed: 10,
    });
  });

  it("should return empty summary when no match exists", () => {
    expect(parseGradleTestOutput("BUILD SUCCESSFUL")).toEqual({});
  });
});
