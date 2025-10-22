// IndexedDB wrapper for offline storage
// Stores events and pending attendance records locally

const DB_NAME = "qr-attends-offline";
const DB_VERSION = 1;

export interface PendingAttendance {
  id: string;
  eventId: string;
  userId: string;
  timestamp: string;
  synced: boolean;
  retryCount: number;
}

export interface CachedEvent {
  id: string;
  name: string;
  date: string;
  time: string;
  location: string;
  description?: string;
  cachedAt: string;
}

export interface CachedMember {
  id: string;
  firstName: string;
  lastName: string;
  middleInitial?: string;
  email: string;
  studentId?: string;
  yearSection?: string;
  cardNo?: string;
  cachedAt: string;
}

class OfflineStorage {
  private db: IDBDatabase | null = null;

  init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Store for pending attendance records
        if (!db.objectStoreNames.contains("pendingAttendance")) {
          const attendanceStore = db.createObjectStore("pendingAttendance", {
            keyPath: "id",
          });
          attendanceStore.createIndex("eventId", "eventId", { unique: false });
          attendanceStore.createIndex("synced", "synced", { unique: false });
        }

        // Store for cached events
        if (!db.objectStoreNames.contains("events")) {
          const eventsStore = db.createObjectStore("events", { keyPath: "id" });
          eventsStore.createIndex("date", "date", { unique: false });
        }

        // Store for cached members
        if (!db.objectStoreNames.contains("members")) {
          const membersStore = db.createObjectStore("members", {
            keyPath: "id",
          });
          membersStore.createIndex("studentId", "studentId", { unique: false });
        }
      };
    });
  }

  private getStore(
    storeName: string,
    mode: IDBTransactionMode = "readonly",
  ): IDBObjectStore {
    if (!this.db) throw new Error("Database not initialized");
    const transaction = this.db.transaction(storeName, mode);
    return transaction.objectStore(storeName);
  }

  // === PENDING ATTENDANCE ===

  addPendingAttendance(
    attendance: Omit<PendingAttendance, "id" | "synced" | "retryCount">,
  ): Promise<string> {
    const record: PendingAttendance = {
      ...attendance,
      id: crypto.randomUUID(),
      synced: false,
      retryCount: 0,
    };

    return new Promise((resolve, reject) => {
      const store = this.getStore("pendingAttendance", "readwrite");
      const request = store.add(record);
      request.onsuccess = () => resolve(record.id);
      request.onerror = () => reject(request.error);
    });
  }

  getPendingAttendance(): Promise<PendingAttendance[]> {
    return new Promise((resolve, reject) => {
      const store = this.getStore("pendingAttendance");
      const index = store.index("synced");
      const request = index.getAll(IDBKeyRange.only(false));
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  markAttendanceSynced(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const store = this.getStore("pendingAttendance", "readwrite");
      const getRequest = store.get(id);

      getRequest.onsuccess = () => {
        const record = getRequest.result;
        if (record) {
          record.synced = true;
          const updateRequest = store.put(record);
          updateRequest.onsuccess = () => resolve();
          updateRequest.onerror = () => reject(updateRequest.error);
        } else {
          resolve();
        }
      };
      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  incrementRetryCount(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const store = this.getStore("pendingAttendance", "readwrite");
      const getRequest = store.get(id);

      getRequest.onsuccess = () => {
        const record = getRequest.result;
        if (record) {
          record.retryCount += 1;
          const updateRequest = store.put(record);
          updateRequest.onsuccess = () => resolve();
          updateRequest.onerror = () => reject(updateRequest.error);
        } else {
          resolve();
        }
      };
      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  deletePendingAttendance(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const store = this.getStore("pendingAttendance", "readwrite");
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // === EVENTS CACHE ===

  cacheEvent(event: Omit<CachedEvent, "cachedAt">): Promise<void> {
    const cachedEvent: CachedEvent = {
      ...event,
      cachedAt: new Date().toISOString(),
    };

    return new Promise((resolve, reject) => {
      const store = this.getStore("events", "readwrite");
      const request = store.put(cachedEvent);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  getCachedEvent(id: string): Promise<CachedEvent | null> {
    return new Promise((resolve, reject) => {
      const store = this.getStore("events");
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  getAllCachedEvents(): Promise<CachedEvent[]> {
    return new Promise((resolve, reject) => {
      const store = this.getStore("events");
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // === MEMBERS CACHE ===

  cacheMember(member: Omit<CachedMember, "cachedAt">): Promise<void> {
    const cachedMember: CachedMember = {
      ...member,
      cachedAt: new Date().toISOString(),
    };

    return new Promise((resolve, reject) => {
      const store = this.getStore("members", "readwrite");
      const request = store.put(cachedMember);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  getCachedMember(id: string): Promise<CachedMember | null> {
    return new Promise((resolve, reject) => {
      const store = this.getStore("members");
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  getAllCachedMembers(): Promise<CachedMember[]> {
    return new Promise((resolve, reject) => {
      const store = this.getStore("members");
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // === CLEANUP ===

  clearOldCache(daysOld = 7): Promise<void> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);
    const cutoffISO = cutoffDate.toISOString();

    // Clear old events
    return new Promise((resolve, reject) => {
      const store = this.getStore("events", "readwrite");
      const request = store.openCursor();

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
        if (cursor) {
          if (cursor.value.cachedAt < cutoffISO) {
            cursor.delete();
          }
          cursor.continue();
        } else {
          resolve();
        }
      };
      request.onerror = () => reject(request.error);
    });
  }
}

// Singleton instance
let storageInstance: OfflineStorage | null = null;

export async function getOfflineStorage(): Promise<OfflineStorage> {
  if (!storageInstance) {
    storageInstance = new OfflineStorage();
    await storageInstance.init();
  }
  return storageInstance;
}
