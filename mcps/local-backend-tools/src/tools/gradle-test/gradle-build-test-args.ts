import { resolveGradleTestPattern } from "./gradle-resolve-patterns";
import { BuildGradleTestArgsInput } from "./gradle-test-types";

export function buildGradleTestArgs(input: BuildGradleTestArgsInput): {
  args: string[];
  resolvedPattern?: string;
} {
  const args = ["test", "--console=plain"];
  const resolvedPattern = resolveGradleTestPattern(input);

  if (resolvedPattern) {
    args.push("--tests", resolvedPattern);
  }

  return {
    args,
    resolvedPattern,
  };
}
