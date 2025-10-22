// Singleton Deno KV instance for better performance
// Reuses a single connection instead of opening/closing on every request

let kvInstance: Deno.Kv | null = null;

/**
 * Get the singleton KV instance.
 * Opens the connection on first call, then reuses it.
 *
 * On Deno Deploy: Uses managed Deno KV (pass undefined)
 * Locally: Uses DENO_KV_PATH if provided
 */
export async function getKv(): Promise<Deno.Kv> {
  if (!kvInstance) {
    // Deno Deploy: undefined uses managed KV
    // Local: DENO_KV_PATH or undefined uses local file
    const kvPath = Deno.env.get("DENO_KV_PATH");
    kvInstance = await Deno.openKv(kvPath || undefined);
    console.log("✓ KV database connection established");
  }
  return kvInstance;
}

/**
 * Close the KV connection (typically only called on shutdown)
 */
export function closeKv(): void {
  if (kvInstance) {
    kvInstance.close();
    kvInstance = null;
    console.log("✓ KV database connection closed");
  }
}
