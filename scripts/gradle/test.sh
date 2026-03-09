#!/usr/bin/env bash
set -e

PROJECT_PATH="${1:-.}"

cd "$PROJECT_PATH"

if [ ! -f "./gradlew" ]; then
  echo "No se encontró gradlew en $PROJECT_PATH"
  exit 1
fi

./gradlew test