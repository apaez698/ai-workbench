#!/usr/bin/env bash
set -euo pipefail

docker exec -i aiwb-postgres psql -U postgres -d appdb -c "DROP SCHEMA public CASCADE;"
docker exec -i aiwb-postgres psql -U postgres -d appdb -c "CREATE SCHEMA public;"
echo "Postgres schema reset."