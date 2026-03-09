import fs from "node:fs";
import path from "node:path";
import { runCommand } from "../../shared/process/run-command";
import { GradleTestToolInput, GradleTestToolResult } from "./gradle-test-types";
import { buildGradleTestArgs } from "./gradle-build-test-args";
import { parseGradleTestOutput } from "./gradle-parse-test-output";
import { buildGradleTestDiagnostics } from "./gradle-build-test-diagnostics";

function resolveGradleCommand(projectPath: string): string {
  const fileName = process.platform === "win32" ? "gradlew.bat" : "gradlew";
  return path.join(projectPath, fileName);
}

function hasGradleBuildFile(projectPath: string): boolean {
  return (
    fs.existsSync(path.join(projectPath, "build.gradle")) ||
    fs.existsSync(path.join(projectPath, "build.gradle.kts"))
  );
}

export async function gradleTestTool(
  input: GradleTestToolInput,
): Promise<GradleTestToolResult> {
  const {
    projectPath,
    packageName,
    className,
    methodName,
    testPattern,
    timeoutMs = 180_000,
  } = input;

  if (!fs.existsSync(projectPath)) {
    return {
      success: false,
      projectPath,
      command: "",
      durationMs: 0,
      stdout: "",
      stderr: `Project path does not exist: ${projectPath}`,
      summary: {},
      diagnostics: ["Provided project path does not exist"],
    };
  }

  const stats = fs.statSync(projectPath);
  if (!stats.isDirectory()) {
    return {
      success: false,
      projectPath,
      command: "",
      durationMs: 0,
      stdout: "",
      stderr: `Project path is not a directory: ${projectPath}`,
      summary: {},
      diagnostics: ["Provided project path is not a directory"],
    };
  }

  if (!hasGradleBuildFile(projectPath)) {
    return {
      success: false,
      projectPath,
      command: "",
      durationMs: 0,
      stdout: "",
      stderr: `Gradle build file not found in: ${projectPath}`,
      summary: {},
      diagnostics: ["Gradle build file was not found"],
    };
  }

  const gradleCommand = resolveGradleCommand(projectPath);
  if (!fs.existsSync(gradleCommand)) {
    return {
      success: false,
      projectPath,
      command: "",
      durationMs: 0,
      stdout: "",
      stderr: `Gradle wrapper not found at: ${gradleCommand}`,
      summary: {},
      diagnostics: ["Gradle wrapper was not found"],
    };
  }

  const { args, resolvedPattern } = buildGradleTestArgs({
    packageName,
    className,
    methodName,
    testPattern,
  });

  const commandResult = await runCommand({
    command: gradleCommand,
    args,
    cwd: projectPath,
    timeoutMs,
  });

  const combinedOutput = `${commandResult.stdout}\n${commandResult.stderr}`;
  const summary = parseGradleTestOutput(combinedOutput);

  const reportPath = path.join(
    projectPath,
    "build",
    "reports",
    "tests",
    "test",
    "index.html",
  );

  const diagnostics = buildGradleTestDiagnostics({
    success: commandResult.success,
    summary,
    resolvedPattern,
    stdout: commandResult.stdout,
    stderr: commandResult.stderr,
  });

  return {
    success: commandResult.success,
    projectPath,
    command: commandResult.command,
    durationMs: commandResult.durationMs,
    stdout: commandResult.stdout,
    stderr: commandResult.stderr,
    summary,
    reportPath: fs.existsSync(reportPath) ? reportPath : undefined,
    filter: {
      packageName,
      className,
      methodName,
      testPattern,
      resolvedPattern,
    },
    diagnostics,
  };
}
