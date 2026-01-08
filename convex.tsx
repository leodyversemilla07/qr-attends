import { ConvexReactClient } from "convex/react";

// The URL will be populated by the .env file (EXPO_PUBLIC_CONVEX_URL)
const convexUrl = process.env.EXPO_PUBLIC_CONVEX_URL;

export const convex = new ConvexReactClient(convexUrl || "http://127.0.0.1:8181", {
  unsavedChangesWarning: false,
});
