import * as fs from "node:fs";
import { describe, expect, it, vi, afterEach } from "vitest";
import { gradleTestTool } from "./gradle-test-tool.tool";

vi.mock("node:fs", async () => {
  const actual = await vi.importActual<typeof import("node:fs")>("node:fs");
  return {
    ...actual,
    existsSync: vi.fn(),
    statSync: vi.fn(),
  };
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("gradleTestTool", () => {
  it("should fail when project path does not exist", async () => {
    vi.mocked(fs.existsSync).mockReturnValue(false);

    const result = await gradleTestTool({
      projectPath: "/invalid/path",
    });

    expect(result.success).toBe(false);
    expect(result.stderr).toContain("Project path does not exist");
  });
});
