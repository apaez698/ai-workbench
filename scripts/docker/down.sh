#!/bin/bash
docker compose -f sandboxes/spring-webflux-postgres-redis/docker-compose.yml down
echo "Local sandbox stopped."
