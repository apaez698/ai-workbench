import { exec } from "child_process";
import type { ExecException } from "child_process";

export function execSafe(
  command: string,
  cwd?: string
): Promise<{ stdout: string; stderr: string }> {
  return new Promise((resolve, reject) => {
    exec(command, { cwd }, (error: ExecException | null, stdout: string, stderr: string) => {
      if (error) {
        reject(new Error(stderr || error.message));
        return;
      }
      resolve({ stdout, stderr });
    });
  });
}