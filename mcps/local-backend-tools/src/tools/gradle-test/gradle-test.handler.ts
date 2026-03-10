import { gradleTestInputSchema } from "./gradle-test.schema.js";
import { gradleTestTool } from "./gradle-test-tool.tool.js";

export const gradleTestToolDefinition = {
  name: "gradle_test",
  description:
    "Run Gradle tests for a project and optionally filter execution by package, class, method, or explicit test pattern",
  inputSchema: {
    type: "object",
    properties: {
      projectPath: {
        type: "string",
        description: "Absolute or relative path to the Gradle project",
      },
      packageName: {
        type: "string",
        description: "Optional package used to filter tests",
      },
      className: {
        type: "string",
        description: "Optional test class name used to filter tests",
      },
      methodName: {
        type: "string",
        description: "Optional test method name used to filter tests",
      },
      testPattern: {
        type: "string",
        description:
          "Optional explicit Gradle --tests pattern. Takes precedence over package/class/method",
      },
      timeoutMs: {
        type: "number",
        description: "Optional timeout in milliseconds",
      },
    },
    required: ["projectPath"],
    additionalProperties: false,
  },
} as const;

export async function handleGradleTestTool(args: unknown) {
  const input = gradleTestInputSchema.parse(args);
  const result = await gradleTestTool(input);

  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(result, null, 2),
      },
    ],
  };
}
