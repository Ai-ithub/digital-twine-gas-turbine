#!/bin/sh

# Exit immediately if a command exits with a non-zero status.
set -e

# Run the database import script from its new location
echo "--- Running Database Import Script ---"
python scripts/import_to_db.py

# CORRECTED: Execute the main application command from its new location
echo "--- Starting Flask Application ---"
exec python -m backend.api.app