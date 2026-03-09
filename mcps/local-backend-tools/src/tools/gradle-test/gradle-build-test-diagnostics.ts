import { GradleTestSummary } from "./gradle-test-types";

type BuildGradleTestDiagnosticsInput = {
  success: boolean;
  summary: GradleTestSummary;
  resolvedPattern?: string;
  stderr: string;
};

export function buildGradleTestDiagnostics(
  input: BuildGradleTestDiagnosticsInput,
): string[] {
  const diagnostics: string[] = [];

  if (input.resolvedPattern) {
    diagnostics.push(`Tests executed with filter: ${input.resolvedPattern}`);
  }

  if ((input.summary.failed ?? 0) > 0) {
    diagnostics.push(`${input.summary.failed} test(s) failed`);
  }

  if ((input.summary.total ?? 0) === 0) {
    diagnostics.push("No tests were detected or parsed from Gradle output");
  }

  if (/No tests found for given includes/i.test(input.stderr)) {
    diagnostics.push("Gradle did not find tests matching the provided filter");
  }

  if (/Compilation failed/i.test(input.stderr)) {
    diagnostics.push("Build failed during compilation before test execution");
  }

  if (input.success) {
    diagnostics.push("Gradle test task completed successfully");
  }

  return diagnostics;
}
