#!/usr/bin/env bash
set -euo pipefail

if pgrep -f "next dev --hostname 0.0.0.0 --port 3000" >/dev/null 2>&1; then
  exit 0
fi

nohup npm run dev -- --hostname 0.0.0.0 --port 3000 >/tmp/next-dev.log 2>&1 &
