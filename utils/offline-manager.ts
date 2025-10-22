// Offline manager - handles online/offline detection and data sync
import { getOfflineStorage } from "./offline-storage.ts";

export interface OnlineStatusListener {
  (isOnline: boolean): void;
}

class OfflineManager {
  private isOnline: boolean;
  private listeners: OnlineStatusListener[] = [];
  private syncInProgress = false;

  constructor() {
    this.isOnline = typeof navigator !== "undefined" ? navigator.onLine : true;
    this.setupListeners();
  }

  private setupListeners() {
    if (typeof globalThis.window === "undefined") return;

    // Listen for online/offline events
    globalThis.addEventListener("online", () => {
      console.log("[OfflineManager] Back online");
      this.isOnline = true;
      this.notifyListeners(true);
      this.syncPendingData();
    });

    globalThis.addEventListener("offline", () => {
      console.log("[OfflineManager] Gone offline");
      this.isOnline = false;
      this.notifyListeners(false);
    });

    // Listen for service worker messages
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.addEventListener("message", (event) => {
        if (event.data.type === "SYNC_ATTENDANCE") {
          console.log("[OfflineManager] Received sync request from SW");
          this.syncPendingData();
        }
      });
    }
  }

  getOnlineStatus(): boolean {
    return this.isOnline;
  }

  onStatusChange(listener: OnlineStatusListener) {
    this.listeners.push(listener);
    // Immediately call with current status
    listener(this.isOnline);
  }

  removeStatusListener(listener: OnlineStatusListener) {
    this.listeners = this.listeners.filter((l) => l !== listener);
  }

  private notifyListeners(isOnline: boolean) {
    this.listeners.forEach((listener) => listener(isOnline));
  }

  async syncPendingData(): Promise<{ success: number; failed: number }> {
    if (this.syncInProgress) {
      console.log("[OfflineManager] Sync already in progress");
      return { success: 0, failed: 0 };
    }

    if (!this.isOnline) {
      console.log("[OfflineManager] Cannot sync while offline");
      return { success: 0, failed: 0 };
    }

    this.syncInProgress = true;
    let successCount = 0;
    let failedCount = 0;

    try {
      const storage = await getOfflineStorage();
      const pendingRecords = await storage.getPendingAttendance();

      console.log(
        `[OfflineManager] Syncing ${pendingRecords.length} pending records`,
      );

      for (const record of pendingRecords) {
        try {
          // Attempt to sync this record
          const response = await fetch("/api/attendance", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              eventId: record.eventId,
              userId: record.userId,
            }),
          });

          if (response.ok) {
            // Successfully synced - mark as synced
            await storage.markAttendanceSynced(record.id);
            successCount++;
            console.log(`[OfflineManager] Synced record ${record.id}`);
          } else {
            // Failed - increment retry count
            await storage.incrementRetryCount(record.id);
            failedCount++;

            // If retry count is too high, delete the record
            if (record.retryCount >= 5) {
              console.warn(
                `[OfflineManager] Deleting record ${record.id} after 5 failed attempts`,
              );
              await storage.deletePendingAttendance(record.id);
            }
          }
        } catch (error) {
          console.error(
            `[OfflineManager] Error syncing record ${record.id}:`,
            error,
          );
          await storage.incrementRetryCount(record.id);
          failedCount++;
        }
      }

      console.log(
        `[OfflineManager] Sync complete: ${successCount} success, ${failedCount} failed`,
      );
    } catch (error) {
      console.error("[OfflineManager] Error during sync:", error);
    } finally {
      this.syncInProgress = false;
    }

    return { success: successCount, failed: failedCount };
  }

  // Request immediate sync via Background Sync API
  async requestBackgroundSync() {
    if ("serviceWorker" in navigator) {
      try {
        const registration = await navigator.serviceWorker.ready;
        // @ts-ignore: Background Sync API might not be in all TS definitions
        if ("sync" in registration) {
          // @ts-ignore: SyncManager.register not in standard TS lib yet
          await registration.sync.register("sync-attendance");
          console.log("[OfflineManager] Background sync registered");
        }
      } catch (error) {
        console.error("[OfflineManager] Background sync failed:", error);
      }
    }
  }
}

// Singleton instance
let managerInstance: OfflineManager | null = null;

export function getOfflineManager(): OfflineManager {
  if (!managerInstance) {
    managerInstance = new OfflineManager();
  }
  return managerInstance;
}
