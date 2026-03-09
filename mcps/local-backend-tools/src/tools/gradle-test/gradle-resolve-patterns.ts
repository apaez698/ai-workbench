import { TestFilterInput } from "./gradle-test-types";

export function resolveGradleTestPattern(
  input: TestFilterInput,
): string | undefined {
  const { packageName, className, methodName, testPattern } = input;

  if (testPattern?.trim()) {
    return testPattern.trim();
  }

  if (packageName && className && methodName) {
    return `${packageName}.${className}.${methodName}`;
  }

  if (packageName && className) {
    return `${packageName}.${className}`;
  }

  if (className && methodName) {
    return `${className}.${methodName}`;
  }

  if (className) {
    return className;
  }

  if (packageName) {
    return `${packageName}.*`;
  }

  return undefined;
}
