#!/bin/sh
# Startup script for Fly.io deployment

echo "Starting Mad Rush API..."

# Run database migrations
echo "Running database migrations..."
alembic upgrade head

# Start the application
echo "Starting uvicorn server..."
exec uvicorn main:app --host 0.0.0.0 --port 8000
