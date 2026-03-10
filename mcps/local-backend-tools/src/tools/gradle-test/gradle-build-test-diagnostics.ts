import { GradleTestSummary } from "./gradle-test-types.js";

type BuildGradleTestDiagnosticsInput = {
  success: boolean;
  summary: GradleTestSummary;
  resolvedPattern?: string;
  stdout: string;
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

  const isUpToDateRun = /:test\s+UP-TO-DATE/i.test(input.stdout);

  if ((input.summary.total ?? 0) === 0 && !isUpToDateRun) {
    diagnostics.push("No tests were detected or parsed from Gradle output");
  }

  if (isUpToDateRun) {
    diagnostics.push(
      "Gradle test task is UP-TO-DATE; tests were not re-executed",
    );
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
