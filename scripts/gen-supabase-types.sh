#!/usr/bin/env bash
# Regenerate shared/database.types.ts from the live Supabase schema.
# Requires: `npx supabase login` (or SUPABASE_ACCESS_TOKEN) and network access.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PROJECT_ID="${SUPABASE_PROJECT_ID:-fjduloefmqtohtnkqtfp}"
OUT="$ROOT/client-portal/shared/database.types.ts"

npx --yes supabase gen types typescript \
  --project-id "$PROJECT_ID" \
  --schema public \
  > "$OUT"

echo "Wrote $OUT"
