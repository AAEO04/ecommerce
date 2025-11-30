#!/bin/bash
# MAD RUSH Cleanup Job for Linux Production
# Run this script every 15 minutes via cron or systemd timer

set -e

# Configuration
PROJECT_DIR="/var/www/madrush/backend/monolith"
VENV_PATH="$PROJECT_DIR/venv/bin/python"
SCRIPT_PATH="$PROJECT_DIR/jobs/cleanup_expired_checkouts.py"
LOG_FILE="/var/log/madrush/cleanup.log"
ERROR_LOG="/var/log/madrush/cleanup-error.log"

# Create log directory if it doesn't exist
mkdir -p "$(dirname "$LOG_FILE")"

# Log function
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

log_error() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ERROR: $1" | tee -a "$ERROR_LOG" "$LOG_FILE"
}

# Main execution
log "Starting cleanup job..."

if [ ! -f "$VENV_PATH" ]; then
    log_error "Python virtual environment not found at $VENV_PATH"
    exit 1
fi

if [ ! -f "$SCRIPT_PATH" ]; then
    log_error "Cleanup script not found at $SCRIPT_PATH"
    exit 1
fi

# Run cleanup
if "$VENV_PATH" "$SCRIPT_PATH"; then
    log "Cleanup completed successfully"
    exit 0
else
    EXIT_CODE=$?
    log_error "Cleanup failed with exit code $EXIT_CODE"
    exit $EXIT_CODE
fi
