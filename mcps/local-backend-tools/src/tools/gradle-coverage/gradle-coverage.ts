import fs from "node:fs";
import path from "node:path";
import { promisify } from "node:util";
import { execFile as execFileCb } from "node:child_process";
import { XMLParser } from "fast-xml-parser";
import { z } from "zod";

const execFile = promisify(execFileCb);

const GradleCoverageArgsSchema = z.object({
  projectPath: z.string().min(1, "projectPath is required"),
  task: z.string().default("jacocoTestReport"),
  packageFilter: z.string().optional(),
  classFilter: z.string().optional(),
});

type CounterMap = Record<string, { missed: number; covered: number }>;

type CoverageNode = {
  counter?: Array<{
    type: string;
    missed: string | number;
    covered: string | number;
  }> | {
    type: string;
    missed: string | number;
    covered: string | number;
  };
};

type CoverageSummary = {
  instruction: number;
  branch: number;
  line: number;
  complexity: number;
  method: number;
  class: number;
};

function toArray<T>(value?: T | T[]): T[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function normalizePath(value: string): string {
  return value.replace(/\\/g, "/");
}

function getGradleCommand(projectPath: string): { cmd: string; args: string[] } {
  const isWin = process.platform === "win32";

  const wrapperUnix = path.join(projectPath, "gradlew");
  const wrapperWin = path.join(projectPath, "gradlew.bat");

  if (isWin && fs.existsSync(wrapperWin)) {
    return { cmd: wrapperWin, args: [] };
  }

  if (!isWin && fs.existsSync(wrapperUnix)) {
    return { cmd: wrapperUnix, args: [] };
  }

  return {
    cmd: isWin ? "gradle.bat" : "gradle",
    args: [],
  };
}

function safeNumber(value: string | number | undefined): number {
  if (value === undefined) return 0;
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function extractCounters(node?: CoverageNode): CounterMap {
  const counters: CounterMap = {};
  for (const counter of toArray(node?.counter)) {
    counters[counter.type] = {
      missed: safeNumber(counter.missed),
      covered: safeNumber(counter.covered),
    };
  }
  return counters;
}

function pct(covered: number, missed: number): number {
  const total = covered + missed;
  if (total === 0) return 100;
  return Number(((covered / total) * 100).toFixed(2));
}

function buildCoverageSummary(counters: CounterMap): CoverageSummary {
  return {
    instruction: pct(counters.INSTRUCTION?.covered ?? 0, counters.INSTRUCTION?.missed ?? 0),
    branch: pct(counters.BRANCH?.covered ?? 0, counters.BRANCH?.missed ?? 0),
    line: pct(counters.LINE?.covered ?? 0, counters.LINE?.missed ?? 0),
    complexity: pct(counters.COMPLEXITY?.covered ?? 0, counters.COMPLEXITY?.missed ?? 0),
    method: pct(counters.METHOD?.covered ?? 0, counters.METHOD?.missed ?? 0),
    class: pct(counters.CLASS?.covered ?? 0, counters.CLASS?.missed ?? 0),
  };
}

function findJacocoXml(projectPath: string): string | null {
  const candidates = [
    path.join(projectPath, "build/reports/jacoco/test/jacocoTestReport.xml"),
    path.join(projectPath, "build/reports/jacoco/jacocoTestReport/jacocoTestReport.xml"),
    path.join(projectPath, "build/reports/jacoco/testCodeCoverageReport/testCodeCoverageReport.xml"),
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }

  return null;
}

function buildDiagnostics(input: {
  totalLineCoverage: number;
  packages: Array<{ name: string; coverage: CoverageSummary }>;
  classes: Array<{ name: string; packageName: string; coverage: CoverageSummary; missedLines: number; missedMethods: number }>;
}) {
  const diagnostics: string[] = [];

  if (input.totalLineCoverage < 50) {
    diagnostics.push("Cobertura global baja: primero cubre flujos felices de los servicios principales.");
  } else if (input.totalLineCoverage < 70) {
    diagnostics.push("Cobertura global media-baja: faltan tests en paths alternos, validaciones y errores.");
  } else if (input.totalLineCoverage < 85) {
    diagnostics.push("Cobertura aceptable, pero aún hay huecos en ramas y casos borde.");
  } else {
    diagnostics.push("Cobertura global sólida. Enfócate en branches, errores y regresiones críticas.");
  }

  const weakPackages = input.packages
    .filter((p) => p.coverage.line < 70)
    .sort((a, b) => a.coverage.line - b.coverage.line)
    .slice(0, 5);

  for (const pkg of weakPackages) {
    diagnostics.push(`Paquete débil: ${pkg.name} (${pkg.coverage.line}% line coverage).`);
  }

  const weakClasses = input.classes
    .filter((c) => c.coverage.line < 60)
    .sort((a, b) => a.coverage.line - b.coverage.line)
    .slice(0, 5);

  for (const cls of weakClasses) {
    if (cls.missedMethods > 0) {
      diagnostics.push(
        `Clase crítica: ${cls.packageName}.${cls.name} (${cls.coverage.line}% líneas, ${cls.missedMethods} métodos sin cubrir).`
      );
    } else {
      diagnostics.push(
        `Clase crítica: ${cls.packageName}.${cls.name} (${cls.coverage.line}% líneas, revisar branches y edge cases).`
      );
    }
  }

  if (diagnostics.length === 0) {
    diagnostics.push("No se detectaron gaps evidentes. Revisa mutación o tests de integración para subir el nivel.");
  }

  return diagnostics;
}

export function registerGradleCoverageTool(server: any) {
  server.tool(
    "gradle_coverage",
    "Runs jacocoTestReport, parses JaCoCo XML and returns structured coverage diagnostics.",
    GradleCoverageArgsSchema.shape,
    async (args: z.infer<typeof GradleCoverageArgsSchema>) => {
      const parsed = GradleCoverageArgsSchema.parse(args);
      const projectPath = path.resolve(parsed.projectPath);

      if (!fs.existsSync(projectPath)) {
        throw new Error(`Project path does not exist: ${projectPath}`);
      }

      const { cmd, args: baseArgs } = getGradleCommand(projectPath);
      const gradleArgs = [...baseArgs, parsed.task, "--no-daemon"];

      const execResult = await execFile(cmd, gradleArgs, {
        cwd: projectPath,
        maxBuffer: 1024 * 1024 * 20,
      });

      const jacocoXmlPath = findJacocoXml(projectPath);
      if (!jacocoXmlPath) {
        throw new Error(
          `JaCoCo XML report not found. Expected one of the standard report paths under: ${projectPath}/build/reports/jacoco`
        );
      }

      const xmlContent = fs.readFileSync(jacocoXmlPath, "utf-8");
      const parser = new XMLParser({
        ignoreAttributes: false,
        attributeNamePrefix: "",
      });

      const parsedXml = parser.parse(xmlContent);
      const report = parsedXml.report;

      const reportCounters = extractCounters(report);
      const totalCoverage = buildCoverageSummary(reportCounters);

      const packageEntries = toArray(report.package).map((pkg: any) => {
        const packageName = normalizePath(pkg.name ?? "");
        const counters = extractCounters(pkg);

        return {
          name: packageName,
          coverage: buildCoverageSummary(counters),
          missedLines: counters.LINE?.missed ?? 0,
          coveredLines: counters.LINE?.covered ?? 0,
          missedMethods: counters.METHOD?.missed ?? 0,
          coveredMethods: counters.METHOD?.covered ?? 0,
        };
      });

      const classEntries = toArray(report.package).flatMap((pkg: any) => {
        const packageName = normalizePath(pkg.name ?? "");
        return toArray(pkg.class).map((cls: any) => {
          const className = cls.name?.split("/").pop() ?? cls.name ?? "UnknownClass";
          const fullClassName = normalizePath(cls.name ?? className);
          const counters = extractCounters(cls);

          return {
            name: className,
            fullName: fullClassName,
            packageName,
            coverage: buildCoverageSummary(counters),
            missedLines: counters.LINE?.missed ?? 0,
            coveredLines: counters.LINE?.covered ?? 0,
            missedMethods: counters.METHOD?.missed ?? 0,
            coveredMethods: counters.METHOD?.covered ?? 0,
          };
        });
      });

      const filteredPackages = parsed.packageFilter
        ? packageEntries.filter((p) => p.name.includes(parsed.packageFilter!))
        : packageEntries;

      const filteredClasses = classEntries
        .filter((c) => {
          const packageOk = parsed.packageFilter
            ? c.packageName.includes(parsed.packageFilter)
            : true;

          const classOk = parsed.classFilter
            ? c.name.includes(parsed.classFilter) || c.fullName.includes(parsed.classFilter)
            : true;

          return packageOk && classOk;
        })
        .sort((a, b) => a.coverage.line - b.coverage.line);

      const worstClasses = filteredClasses.slice(0, 10).map((c) => ({
        fullName: `${c.packageName}.${c.name}`,
        lineCoverage: c.coverage.line,
        methodCoverage: c.coverage.method,
        branchCoverage: c.coverage.branch,
        missedLines: c.missedLines,
        missedMethods: c.missedMethods,
      }));

      const diagnostics = buildDiagnostics({
        totalLineCoverage: totalCoverage.line,
        packages: filteredPackages,
        classes: filteredClasses,
      });

      const result = {
        projectPath,
        executedTask: parsed.task,
        reportPath: jacocoXmlPath,
        coverageTotal: totalCoverage,
        packageCount: filteredPackages.length,
        classCount: filteredClasses.length,
        packages: filteredPackages
          .sort((a, b) => a.coverage.line - b.coverage.line)
          .map((p) => ({
            name: p.name,
            lineCoverage: p.coverage.line,
            methodCoverage: p.coverage.method,
            branchCoverage: p.coverage.branch,
            missedLines: p.missedLines,
            missedMethods: p.missedMethods,
          })),
        classes: filteredClasses.map((c) => ({
          packageName: c.packageName,
          className: c.name,
          fullName: `${c.packageName}.${c.name}`,
          lineCoverage: c.coverage.line,
          methodCoverage: c.coverage.method,
          branchCoverage: c.coverage.branch,
          missedLines: c.missedLines,
          missedMethods: c.missedMethods,
        })),
        worstClasses,
        diagnostics,
        gradle: {
          command: cmd,
          args: gradleArgs,
          stdout: execResult.stdout?.slice(-4000) ?? "",
          stderr: execResult.stderr?.slice(-4000) ?? "",
        },
      };

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    }
  );
}