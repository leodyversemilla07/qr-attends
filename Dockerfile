# Dockerfile for QR Attendance System with Deno KV
FROM denoland/deno:2.5.4

# Set working directory
WORKDIR /app

# Copy dependency files first for better caching
COPY deno.json deno.lock* ./

# Copy application files needed for dependency resolution
COPY main.ts utils.ts ./

# Cache dependencies
RUN deno install --entrypoint main.ts

# Copy rest of application files
COPY . .

# Make entrypoint script executable
RUN chmod +x docker-entrypoint.sh

# Expose Vite dev server port
EXPOSE 5173

# Set environment variables
ENV DENO_KV_PATH=/data/kv.db
ENV PORT=5173

# Create volume mount point for KV data persistence
VOLUME ["/data"]

# Set entrypoint
ENTRYPOINT ["/app/docker-entrypoint.sh"]

# Run the application with Vite dev server (Fresh 2.x requires Vite)
CMD ["deno", "task", "dev"]
