import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";
import { Server } from "@modelcontextprotocol/sdk/server.js";

import { flushRedisTool } from "./tools/flush-redis.js";
import { dockerUpTool } from "./tools/docker-up.js";
import { dockerDownTool } from "./tools/docker-down.js";
import { resetPostgresTool } from "./tools/reset-postgres.js";
import { gradleTestTool } from "./tools/gradle-test/gradle-test.js";

const server = new Server({
  name: "local-backend-tools",
  version: "1.0.0",
});

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
    description: "Run Gradle tests",
    inputSchema: {
      type: "object" as const,
      properties: {},
      required: [],
    },
  },
];

// Handle tool listing
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request: any) => {
  try {
    switch (request.params.name) {
      case "flush_redis":
        return await flushRedisTool();
      case "docker_up":
        return await dockerUpTool();
      case "docker_down":
        return await dockerDownTool();
      case "reset_postgres":
        return await resetPostgresTool();
      case "gradle_test":
        return await gradleTestTool();
      default:
        return {
          content: [
            {
              type: "text",
              text: `Unknown tool: ${request.params.name}`,
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

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.log("local-backend-tools MCP server started");
}

main().catch((error) => {
  console.error("MCP server error:", error);
  process.exit(1);
});
