// Health check endpoint for monitoring
import { define } from "../../utils.ts";
import { getKv } from "../../db.ts";
import { logger } from "../../utils/logger.ts";

interface HealthStatus {
  status: "healthy" | "unhealthy";
  timestamp: string;
  uptime: number;
  version: string;
  checks: {
    database: "ok" | "error";
    memory?: {
      heapUsed: number;
      heapTotal: number;
    };
  };
}

const startTime = Date.now();

export const handler = define.handlers({
  async GET(_ctx) {
    const health: HealthStatus = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: Math.floor((Date.now() - startTime) / 1000), // seconds
      version: "1.0.0",
      checks: {
        database: "ok",
      },
    };

    try {
      // Check database connectivity
      const kv = await getKv();
      await kv.get(["health_check"]);
      health.checks.database = "ok";

      // Add memory info if available
      if (Deno.memoryUsage) {
        const mem = Deno.memoryUsage();
        health.checks.memory = {
          heapUsed: Math.round(mem.heapUsed / 1024 / 1024), // MB
          heapTotal: Math.round(mem.heapTotal / 1024 / 1024), // MB
        };
      }

      return new Response(JSON.stringify(health), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      logger.error("Health check failed", error);
      health.status = "unhealthy";
      health.checks.database = "error";

      return new Response(JSON.stringify(health), {
        status: 503,
        headers: { "Content-Type": "application/json" },
      });
    }
  },
});
