import { ConvexReactClient } from "convex/react";

// Environment configuration
// Production URL for release builds
const convexUrl = "https://glorious-axolotl-616.convex.cloud";

// Create the Convex client
export const convex = new ConvexReactClient(convexUrl, {
    unsavedChangesWarning: false,
});

// Export environment info for debugging
export const getEnvironmentInfo = () => ({
    url: convexUrl,
});

// Example usage:
// - Development: http://127.0.0.1:8181 (run `npx convex dev`)
// - Production: https://glorious-axolotl-616.convex.cloud
