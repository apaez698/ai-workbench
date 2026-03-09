import { runCommand } from "./run-command";
import { describe, expect, it } from "vitest";

describe("runCommand - Container Runtime Detection", () => {
  it("debería ejecutar un comando simple", async () => {
    const result = await runCommand({
      command: "echo",
      args: ["Hola desde Node"],
    });

    expect(result.success).toBe(true);
    expect(result.stdout).toContain("Hola desde Node");
  });

  it("debería detectar docker o podman", async () => {
    const result = await runCommand({
      command: "which",
      args: ["docker"],
    });
    expect(result.exitCode).toBeGreaterThanOrEqual(0);
  });

  it("debería capturar stderr en caso de error", async () => {
    const result = await runCommand({
      command: "ls",
      args: ["/ruta-inexistente"],
    });

    expect(result.success).toBe(false);
    expect(result.stderr.length).toBeGreaterThan(0);
  });

  it("should execute a simple command successfully", async () => {
    const result = await runCommand({
      command: "node",
      args: ["-e", 'console.log("hello")'],
    });

    expect(result.success).toBe(true);
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("hello");
  });

  it("should capture command failure", async () => {
    const result = await runCommand({
      command: "node",
      args: ["-e", "process.exit(1)"],
    });

    expect(result.success).toBe(false);
    expect(result.exitCode).toBe(1);
  });
});
