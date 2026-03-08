#!/usr/bin/env bash
set -euo pipefail

docker exec -i aiwb-redis redis-cli FLUSHALL
echo "Redis cache flushed."