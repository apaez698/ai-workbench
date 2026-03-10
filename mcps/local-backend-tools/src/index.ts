import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";

import { flushRedisTool } from "./tools/flush-redis.js";
import { dockerUpTool } from "./tools/docker-up.js";
import { dockerDownTool } from "./tools/docker-down.js";
import { resetPostgresTool } from "./tools/reset-postgres.js";
import { handleGradleTestTool } from "./tools/gradle-test/gradle-test.handler.js";
import { registerGradleCoverageTool } from "./tools/gradle-coverage/gradle-coverage.js";
const server = new Server(
  {
    name: "local-backend-tools",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  },
);

const tools: Tool[] = [
  {
    name: "flush_redis",
    description: "Flush all Redis cache data",
    inputSchema: {
      type: "object" as const,
      properties: {},
      required: [],
    },
  },
  {
    name: "docker_up",
    description: "Start the local sandbox (Docker Compose up)",
    inputSchema: {
      type: "object" as const,
      properties: {},
      required: [],
    },
  },
  {
    name: "docker_down",
    description: "Stop the local sandbox (Docker Compose down)",
    inputSchema: {
      type: "object" as const,
      properties: {},
      required: [],
    },
  },
  {
    name: "reset_postgres",
    description: "Reset Postgres database schema",
    inputSchema: {
      type: "object" as const,
      properties: {},
      required: [],
    },
  },
  {
    name: "gradle_test",
    description:
      "Run Gradle tests for a project, optionally filtering by package, class, method, or explicit test pattern",
    inputSchema: {
      type: "object" as const,
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
    },
  },
  {
    name: "gradle_coverage",
    description:
      "Run jacocoTestReport and return structured JaCoCo coverage information",
    inputSchema: {
      type: "object" as const,
      properties: {
        projectPath: {
          type: "string",
          description: "Absolute or relative path to the Gradle project",
        },
        packageFilter: {
          type: "string",
          description: "Optional package filter",
        },
        classFilter: {
          type: "string",
          description: "Optional class filter",
        },
      },
      required: ["projectPath"],
    },
  },
];

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    const toolName = request.params.name;
    const args = request.params.arguments ?? {};

    switch (toolName) {
      case "flush_redis":
        return await flushRedisTool();

      case "docker_up":
        return await dockerUpTool();

      case "docker_down":
        return await dockerDownTool();

      case "reset_postgres":
        return await resetPostgresTool();

      case "gradle_test":
        return await handleGradleTestTool(args);

      default:
        return {
          content: [
            {
              type: "text",
              text: `Unknown tool: ${toolName}`,
            },
          ],
        };
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);

    return {
      content: [
        {
          type: "text",
          text: `Error executing tool: ${errorMessage}`,
        },
      ],
    };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("local-backend-tools MCP server started");
}

main().catch((error) => {
  console.error("MCP server error:", error);
  process.exit(1);
});
