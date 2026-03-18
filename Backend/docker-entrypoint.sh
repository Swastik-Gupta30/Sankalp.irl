#!/bin/sh
set -e

echo "Running database schema migration for priority scoring columns..."
node scripts/update_schema.js || echo "Schema migration skipped (columns may already exist)."

echo "Backfilling priority scores for existing complaints..."
node scripts/backfill_priorities.js || echo "Backfill skipped or completed."

echo "Running database schema migration for user locations and wards..."
node scripts/002_add_user_location.js || echo "User location migration failed or skipped."

echo "Starting backend server..."
exec npx nodemon -L server.js
