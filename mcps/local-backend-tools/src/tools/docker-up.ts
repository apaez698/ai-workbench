import { execSafe } from "../utils/exec-safe.js";
import { getScriptPath, isWindows } from "../utils/os-detector.js";
import * as path from "path";

export async function dockerUpTool() {
  const scriptPath = path.resolve(
    process.cwd(),
    getScriptPath("up", "../../scripts/docker")
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
        text: result.stdout || "Local sandbox started."
      }
    ]
  };
}