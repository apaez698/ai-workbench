import { execSafe } from "../utils/exec-safe.js";
import { getScriptPath, isWindows } from "../utils/os-detector.js";
import path from "node:path";

export async function resetPostgresTool() {
  const scriptPath = path.resolve(
    process.cwd(),
    getScriptPath("reset-postgres", "../../scripts/db")
  );

  let command: string;
  if (isWindows()) {
    command = `powershell -NoProfile -ExecutionPolicy Bypass -File "${scriptPath}"`;
  } else {
    command = `bash "${scriptPath}"`;
  }

  const result = await execSafe(command);

  return {
    content: [
      {
        type: "text",
        text: result.stdout || "Postgres schema reset."
      }
    ]
  };
}