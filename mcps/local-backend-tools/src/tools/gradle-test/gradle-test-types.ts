export type GradleTestToolInput = {
  projectPath: string;
  packageName?: string;
  className?: string;
  methodName?: string;
  testPattern?: string;
  timeoutMs?: number;
};

export type GradleTestSummary = {
  total?: number;
  passed?: number;
  failed?: number;
  skipped?: number;
};

export type GradleTestFilter = {
  packageName?: string;
  className?: string;
  methodName?: string;
  testPattern?: string;
  resolvedPattern?: string;
};

export type GradleTestToolResult = {
  success: boolean;
  projectPath: string;
  command: string;
  durationMs: number;
  stdout: string;
  stderr: string;
  summary: GradleTestSummary;
  reportPath?: string;
  filter?: GradleTestFilter;
  diagnostics: string[];
};

export type TestFilterInput = {
  packageName?: string;
  className?: string;
  methodName?: string;
  testPattern?: string;
};

export type BuildGradleTestArgsInput = {
  packageName?: string;
  className?: string;
  methodName?: string;
  testPattern?: string;
};
