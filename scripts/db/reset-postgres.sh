#!/bin/bash
docker exec aiwb-postgres psql -U postgres -d appdb -c "DROP SCHEMA public CASCADE;"
docker exec aiwb-postgres psql -U postgres -d appdb -c "CREATE SCHEMA public;"
echo "Postgres schema reset."
