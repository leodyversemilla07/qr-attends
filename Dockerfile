# Dockerfile for QR Attendance System with Deno KV
FROM denoland/deno:2.5.4

# Set working directory
WORKDIR /app

# Copy dependency files first for better caching
COPY deno.json deno.lock* ./

# Copy all source files
COPY . .

# Cache dependencies
RUN deno install --entrypoint main.ts

# Make entrypoint script executable
RUN chmod +x docker-entrypoint.sh

# Build the Fresh application for production
RUN deno task build

# Expose port
EXPOSE 5173

# Set environment variables
ENV DENO_KV_PATH=/data/kv.db
ENV PORT=5173

# Create volume mount point for KV data persistence
VOLUME ["/data"]

# Set entrypoint
ENTRYPOINT ["/app/docker-entrypoint.sh"]

# Run the built Fresh server
CMD ["deno", "task", "start"]
