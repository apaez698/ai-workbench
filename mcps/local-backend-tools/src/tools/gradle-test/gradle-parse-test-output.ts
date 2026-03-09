import { GradleTestSummary } from "./gradle-test-types";

export function parseGradleTestOutput(output: string): GradleTestSummary {
  const summary: GradleTestSummary = {};

  const match = output.match(
    /(\d+)\s+tests?\s+completed(?:,\s+(\d+)\s+failed)?(?:,\s+(\d+)\s+skipped)?/i,
  );

  if (!match) {
    return summary;
  }

  const total = Number(match[1]);
  const failed = match[2] ? Number(match[2]) : 0;
  const skipped = match[3] ? Number(match[3]) : 0;
  const passed = total - failed - skipped;

  return {
    total,
    failed,
    skipped,
    passed,
  };
}
