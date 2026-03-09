import { spawn } from "node:child_process";
import { CommandOutput } from "./command-output";
import { CommandInput } from "./command-input";

export async function runCommand({
  command,
  args = [],
  cwd,
  timeoutMs = 120_000,
  env = process.env,
}: CommandInput): Promise<CommandOutput> {
  const startedAt = Date.now();
  return new Promise((resolve) => {
    const child = spawn(command, args, {
      cwd,
      env,
      shell: process.platform === "win32",
    });

    let stdout = "";
    let stderr = "";
    let finished = false;
    let timedOut = false;

    const timer = setTimeout(() => {
      if (!finished) {
        timedOut = true;
        stderr += `\nProcess timed out after ${timeoutMs}ms`;
        child.kill("SIGTERM");
      }
    }, timeoutMs);

    child.stdout?.on("data", (chunk) => {
      stdout += chunk.toString();
    });

    child.stderr?.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    child.on("close", (exitCode) => {
      if (finished) return;
      finished = true;
      clearTimeout(timer);

      resolve({
        success: !timedOut && exitCode === 0,
        exitCode,
        stdout,
        stderr,
        command: [command, ...args].join(" "),
        durationMs: Date.now() - startedAt,
      });
    });

    child.on("error", (error) => {
      if (finished) return;
      finished = true;
      clearTimeout(timer);

      resolve({
        success: false,
        exitCode: -1,
        stdout,
        stderr: `${stderr}\n${error.message}`.trim(),
        command: [command, ...args].join(" "),
        durationMs: Date.now() - startedAt,
      });
    });
  });
}
