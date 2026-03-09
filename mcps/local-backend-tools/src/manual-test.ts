import { dockerUpTool } from "./tools/docker-up.js";
import { resetPostgresTool } from "./tools/reset-postgres.js";
import { flushRedisTool } from "./tools/flush-redis.js";
import { dockerDownTool } from "./tools/docker-down.js";

async function main() {
  console.log("=== DOCKER UP ===");
  console.log(JSON.stringify(await dockerUpTool(), null, 2));

  console.log("=== RESET POSTGRES ===");
  console.log(JSON.stringify(await resetPostgresTool(), null, 2));

  console.log("=== FLUSH REDIS ===");
  console.log(JSON.stringify(await flushRedisTool(), null, 2));

  console.log("=== DOCKER DOWN ===");
  console.log(JSON.stringify(await dockerDownTool(), null, 2));
}

main().catch((error) => {
  console.error("Manual test failed:");
  console.error(error.message);
  process.exit(1);
});