// Structured logging utility for production environments
// Provides different log levels and JSON formatting for log aggregation

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  FATAL = 4,
}

interface LogContext {
  [key: string]: unknown;
}

class Logger {
  private minLevel: LogLevel;
  private serviceName: string;

  constructor() {
    const env = Deno.env.get("DENO_ENV") || "development";
    this.minLevel = env === "production" ? LogLevel.INFO : LogLevel.DEBUG;
    this.serviceName = "qr-attends";
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.minLevel;
  }

  private formatLog(
    level: string,
    message: string,
    context?: LogContext,
  ): string {
    const env = Deno.env.get("DENO_ENV") || "development";

    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      service: this.serviceName,
      message,
      ...context,
    };

    // JSON format for production (easier to parse), human-readable for dev
    if (env === "production") {
      return JSON.stringify(logEntry);
    } else {
      const contextStr = context ? ` ${JSON.stringify(context)}` : "";
      return `[${logEntry.timestamp}] [${level}] ${message}${contextStr}`;
    }
  }

  debug(message: string, context?: LogContext): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.log(this.formatLog("DEBUG", message, context));
    }
  }

  info(message: string, context?: LogContext): void {
    if (this.shouldLog(LogLevel.INFO)) {
      console.log(this.formatLog("INFO", message, context));
    }
  }

  warn(message: string, context?: LogContext): void {
    if (this.shouldLog(LogLevel.WARN)) {
      console.warn(this.formatLog("WARN", message, context));
    }
  }

  error(message: string, error?: Error | unknown, context?: LogContext): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      const errorContext = {
        ...context,
        error: error instanceof Error
          ? {
            name: error.name,
            message: error.message,
            stack: error.stack,
          }
          : String(error),
      };
      console.error(this.formatLog("ERROR", message, errorContext));
    }
  }

  fatal(message: string, error?: Error | unknown, context?: LogContext): void {
    if (this.shouldLog(LogLevel.FATAL)) {
      const errorContext = {
        ...context,
        error: error instanceof Error
          ? {
            name: error.name,
            message: error.message,
            stack: error.stack,
          }
          : String(error),
      };
      console.error(this.formatLog("FATAL", message, errorContext));
    }
  }

  // Audit logging for security-relevant events
  audit(action: string, context: LogContext): void {
    const auditLog = {
      timestamp: new Date().toISOString(),
      level: "AUDIT",
      service: this.serviceName,
      action,
      ...context,
    };
    console.log(JSON.stringify(auditLog));
  }
}

// Export singleton instance
export const logger = new Logger();
