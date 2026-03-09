import { execSafe } from "../utils/exec-safe.js";
import { getScriptPath, isWindows } from "../utils/os-detector.js";
import path from "node:path";

export async function dockerDownTool() {
  const scriptPath = path.resolve(
    process.cwd(),
    getScriptPath("down", "../../scripts/docker")
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
        text: result.stdout || "Local sandbox stopped."
      }
    ]
  };
}