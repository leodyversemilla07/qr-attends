#!/bin/sh
# Docker entrypoint script for QR Attendance System
# This script handles initialization and starts the application

set -e

echo "🚀 Starting QR Attendance System..."

# Check if KV database directory exists
if [ ! -d "/data" ]; then
    echo "📁 Creating /data directory for Deno KV..."
    mkdir -p /data
fi

# Display configuration
echo "📋 Configuration:"
echo "  - KV Path: ${DENO_KV_PATH:-/data/kv.db}"
echo "  - Environment: ${DENO_ENV:-production}"
echo "  - Port: ${PORT:-5173}"

# Start the application
echo "✅ Starting Deno server..."
exec "$@"
