#!/bin/bash
docker exec aiwb-redis redis-cli FLUSHALL
echo "Redis cache flushed."
