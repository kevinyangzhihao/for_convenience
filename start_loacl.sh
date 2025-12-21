#!/usr/bin/env bash

set -e

echo "=============================="
echo "Stopping existing containers…"
echo "=============================="

docker compose down --remove-orphans

echo
echo "=============================="
echo "Building & starting containers (detached)…"
echo "=============================="

docker compose up -d --build

echo
echo "=============================="
echo "Previewing logs (Ctrl+C to stop log view)…"
echo "=============================="

docker compose logs -f