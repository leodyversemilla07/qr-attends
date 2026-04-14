// Ensure Web Crypto is available in Node/Jest environments.
// Some CI runners expose Node crypto but not globalThis.crypto by default.
import { webcrypto } from "crypto";

if (!(globalThis as any).crypto) {
  (globalThis as any).crypto = webcrypto;
}

const originalConsole = {
  log: console.log.bind(console),
  info: console.info.bind(console),
  warn: console.warn.bind(console),
  error: console.error.bind(console),
};

const shouldSuppressConsoleMessage = (args: unknown[]) => {
  const message = args
    .map((arg) => {
      if (typeof arg === "string") return arg;
      if (arg instanceof Error) return arg.message;
      try {
        return JSON.stringify(arg);
      } catch {
        return String(arg);
      }
    })
    .join(" ");

  return [
    "Convex functions should not directly call other Convex functions",
    "Queued offline check-in:",
    "Removed synced item from queue:",
    "Item moved to failed list:",
    "Cleared offline queue",
    "Cleared failed items",
    "Failed to save offline check-in",
    "Failed to read offline queue",
    "Failed to clear queue",
    "[offline-manager] Queued offline check-in",
    "[offline-manager] Removed synced item from queue",
    "[offline-manager] Item moved to failed list",
    "[offline-manager] Cleared offline queue",
    "[offline-manager] Cleared failed items",
  ].some((fragment) => message.includes(fragment));
};

beforeAll(() => {
  jest.spyOn(console, "log").mockImplementation((...args: unknown[]) => {
    if (!shouldSuppressConsoleMessage(args)) {
      originalConsole.log(...args);
    }
  });

  jest.spyOn(console, "info").mockImplementation((...args: unknown[]) => {
    if (!shouldSuppressConsoleMessage(args)) {
      originalConsole.info(...args);
    }
  });

  jest.spyOn(console, "warn").mockImplementation((...args: unknown[]) => {
    if (!shouldSuppressConsoleMessage(args)) {
      originalConsole.warn(...args);
    }
  });

  jest.spyOn(console, "error").mockImplementation((...args: unknown[]) => {
    if (!shouldSuppressConsoleMessage(args)) {
      originalConsole.error(...args);
    }
  });
});

afterAll(() => {
  jest.restoreAllMocks();
});
