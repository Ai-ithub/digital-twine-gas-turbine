#!/bin/sh

# Exit immediately if a command exits with a non-zero status.
set -e

# Run the database import script first
echo "--- Running Database Import Script ---"
python backend/import_to_db.py

# Then, execute the main application command
echo "--- Starting Flask Application ---"
exec "$@"