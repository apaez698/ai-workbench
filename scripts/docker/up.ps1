#!/usr/bin/env bash
set -euo pipefail

docker compose -f sandboxes/spring-webflux-postgres-redis/docker-compose.yml up -d
echo "Local sandbox started."