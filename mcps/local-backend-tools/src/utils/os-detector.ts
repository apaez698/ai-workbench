import * as os from "os";
import * as path from "path";
import { execSync } from "child_process";

/**
 * Detecta automáticamente el sistema operativo y retorna la extensión correcta
 * @returns 'ps1' para Windows, 'sh' para Unix/Linux/macOS
 */
export function getScriptExtension(): string {
  return os.platform() === "win32" ? "ps1" : "sh";
}

/**
 * Detecta si estamos en Windows
 */
export function isWindows(): boolean {
  return os.platform() === "win32";
}

/**
 * Ejecuta un script específico del sistema operativo
 * @param scriptName Nombre del script sin extensión (ej: 'flush-redis')
 * @param scriptDir Directorio donde está el script (ej: 'scripts/cache')
 * @returns Salida del comando
 */
export function runOSSpecificScript(scriptName: string, scriptDir: string): string {
  const ext = getScriptExtension();
  const scriptPath = path.join(process.cwd(), scriptDir, `${scriptName}.${ext}`);

  try {
    let command: string;

    if (isWindows()) {
      // En Windows, ejecutar PowerShell
      command = `powershell -NoProfile -ExecutionPolicy Bypass -File "${scriptPath}"`;
    } else {
      // En Unix, ejecutar bash
      command = `bash "${scriptPath}"`;
    }

    const output = execSync(command, { encoding: "utf-8", stdio: "pipe" });
    return output;
  } catch (error) {
    throw new Error(
      `Error executing script ${scriptName}: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Retorna la ruta del script específico del SO
 */
export function getScriptPath(scriptName: string, scriptDir: string): string {
  const ext = getScriptExtension();
  return path.join(scriptDir, `${scriptName}.${ext}`);
}
