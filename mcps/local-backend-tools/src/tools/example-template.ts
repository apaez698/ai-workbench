/**
 * Ejemplo de cómo usar el sistema de auto-detección en nuevos tools
 */

import { execSafe } from "../utils/exec-safe.js";
import { getScriptPath, isWindows } from "../utils/os-detector.js";
import path from "node:path";

/**
 * Template para crear nuevos tools
 * 
 * Pasos:
 * 1. Copiar esta función
 * 2. Reemplazar 'example' con el nombre del script
 * 3. Reemplazar 'category' con la categoría (cache, db, docker, gradle, etc)
 * 4. Reemplazar 'Example action' con la descripción real
 */
export async function exampleTool() {
  // 1. Obtener la ruta del script automáticamente
  //    Busca 'example.ps1' en Windows o 'example.sh' en Unix
  const scriptPath = path.resolve(
    process.cwd(),
    getScriptPath("example", "../../scripts/category")
  );

  // 2. Construir el comando basado en el SO
  let command: string;
  if (isWindows()) {
    command = `powershell -NoProfile -ExecutionPolicy Bypass -File "${scriptPath}"`;
  } else {
    command = `bash "${scriptPath}"`;
  }

  // 3. Ejecutar el comando
  const result = await execSafe(command);

  // 4. Retornar el resultado
  return {
    content: [
      {
        type: "text",
        text: result.stdout || "Example action completed."
      }
    ]
  };
}

/**
 * Ejemplo con parámetros
 */
export async function exampleWithParamsTool(param: string) {
  const scriptPath = path.resolve(
    process.cwd(),
    getScriptPath("example-params", "../../scripts/category")
  );

  let command: string;
  if (isWindows()) {
    // En PowerShell, pasar argumentos
    command = `powershell -NoProfile -ExecutionPolicy Bypass -File "${scriptPath}" -Param "${param}"`;
  } else {
    // En Bash, pasar como argumento positional
    command = `bash "${scriptPath}" "${param}"`;
  }

  const result = await execSafe(command);

  return {
    content: [
      {
        type: "text",
        text: result.stdout || "Example action with params completed."
      }
    ]
  };
}
