import { ConvexReactClient } from "convex/react";

// Environment configuration
// Set ACTIVE_ENVIRONMENT to "dev" or "production" in .env.local

const DEV_URL = "http://127.0.0.1:8181";
const PROD_URL = "https://glorious-axolotl-616.convex.cloud";

// Get environment from environment variable, default to development
const environment = process.env.ACTIVE_ENVIRONMENT || "dev";
const isProduction = environment === "production";

// Select the appropriate URL
const convexUrl = isProduction
    ? process.env.CONVEX_PRODUCTION_URL || PROD_URL
    : process.env.EXPO_PUBLIC_CONVEX_URL || DEV_URL;

// Create the Convex client
export const convex = new ConvexReactClient(convexUrl, {
    unsavedChangesWarning: false,
});

// Export environment info for debugging
export const getEnvironmentInfo = () => ({
    environment,
    isProduction,
    url: convexUrl,
});

// Example usage:
// - Development: http://127.0.0.1:8181 (run `npx convex dev`)
// - Production: https://glorious-axolotl-616.convex.cloud
