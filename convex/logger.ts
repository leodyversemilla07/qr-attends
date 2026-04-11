type LogLevel = "debug" | "info" | "warn" | "error";

const levelPriority: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

function getMinLevel(): LogLevel {
  const configured = process.env.LOG_LEVEL?.toLowerCase();
  if (configured === "debug" || configured === "info" || configured === "warn" || configured === "error") {
    return configured;
  }
  return process.env.NODE_ENV === "production" ? "warn" : "debug";
}

function shouldLog(level: LogLevel): boolean {
  return levelPriority[level] >= levelPriority[getMinLevel()];
}

function format(scope: string, message: string): string {
  return `[${scope}] ${message}`;
}

export const logger = {
  debug(scope: string, message: string, ...meta: unknown[]) {
    if (!shouldLog("debug")) return;
    console.log(format(scope, message), ...meta);
  },
  info(scope: string, message: string, ...meta: unknown[]) {
    if (!shouldLog("info")) return;
    console.info(format(scope, message), ...meta);
  },
  warn(scope: string, message: string, ...meta: unknown[]) {
    if (!shouldLog("warn")) return;
    console.warn(format(scope, message), ...meta);
  },
  error(scope: string, message: string, ...meta: unknown[]) {
    if (!shouldLog("error")) return;
    console.error(format(scope, message), ...meta);
  },
};
