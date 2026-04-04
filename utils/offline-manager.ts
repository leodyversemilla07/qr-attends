import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'offline_attendance_queue';
const FAILED_ITEMS_KEY = 'offline_failed_items';
const SYNC_STATS_KEY = 'offline_sync_stats';

export interface PendingCheckIn {
  id: string;
  eventId: string;
  cardNo: string;
  timestamp: number;
  retryCount: number;
  lastError?: string;
}

export interface SyncStats {
  totalAttempts: number;
  successfulSyncs: number;
  failedSyncs: number;
  lastSyncTime?: number;
}

export interface QueueItemResult {
  id: string;
  success: boolean;
  error?: string;
  retryable: boolean;
}

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 5000;

export const OfflineManager = {
  // Add a scan to the offline queue
  async queueCheckIn(eventId: string, cardNo: string): Promise<PendingCheckIn> {
    const newItem: PendingCheckIn = {
      id: Math.random().toString(36).substring(7),
      eventId,
      cardNo,
      timestamp: Date.now(),
      retryCount: 0,
    };

    try {
      const currentQueue = await this.getQueue();
      const updatedQueue = [...currentQueue, newItem];
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedQueue));
      console.log('Queued offline check-in:', newItem);
      return newItem;
    } catch (e) {
      console.error('Failed to save offline check-in', e);
      throw new Error('Failed to queue check-in');
    }
  },

  // Retrieve the current queue
  async getQueue(): Promise<PendingCheckIn[]> {
    try {
      const json = await AsyncStorage.getItem(STORAGE_KEY);
      if (json == null) return [];

      return JSON.parse(json).map((item: Partial<PendingCheckIn> & { memberId?: string }) => ({
        ...item,
        cardNo: item.cardNo ?? item.memberId ?? "",
      }));
    } catch (e) {
      console.error('Failed to read offline queue', e);
      return [];
    }
  },

  // Get queue items filtered by event
  async getQueueByEvent(eventId: string): Promise<PendingCheckIn[]> {
    const queue = await this.getQueue();
    return queue.filter(item => item.eventId === eventId);
  },

  // Get failed items (exceeded max retries)
  async getFailedItems(): Promise<PendingCheckIn[]> {
    try {
      const json = await AsyncStorage.getItem(FAILED_ITEMS_KEY);
      return json != null ? JSON.parse(json) : [];
    } catch (e) {
      console.error('Failed to read failed items', e);
      return [];
    }
  },

  // Clear a specific item from the queue (after successful sync)
  async removeFromQueue(id: string): Promise<void> {
    try {
      const currentQueue = await this.getQueue();
      const updatedQueue = currentQueue.filter(item => item.id !== id);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedQueue));
      console.log('Removed synced item from queue:', id);
    } catch (e) {
      console.error('Failed to remove item from queue', e);
      throw new Error('Failed to remove item from queue');
    }
  },

  // Increment retry count for an item
  async incrementRetry(id: string, errorMessage: string): Promise<PendingCheckIn | null> {
    try {
      const currentQueue = await this.getQueue();
      const itemIndex = currentQueue.findIndex(item => item.id === id);
      
      if (itemIndex === -1) return null;

      const item = currentQueue[itemIndex];
      item.retryCount++;
      item.lastError = errorMessage;

      // If max retries exceeded, move to failed items
      if (item.retryCount >= MAX_RETRIES) {
        await this.moveToFailed(item);
        const updatedQueue = currentQueue.filter(i => i.id !== id);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedQueue));
        return null;
      }

      currentQueue[itemIndex] = item;
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(currentQueue));
      return item;
    } catch (e) {
      console.error('Failed to increment retry count', e);
      return null;
    }
  },

  // Move item to failed items list
  async moveToFailed(item: PendingCheckIn): Promise<void> {
    try {
      const failedItems = await this.getFailedItems();
      failedItems.push(item);
      await AsyncStorage.setItem(FAILED_ITEMS_KEY, JSON.stringify(failedItems));
      console.log('Item moved to failed list:', item.id);
    } catch (e) {
      console.error('Failed to move item to failed list', e);
    }
  },

  // Retry a failed item
  async retryFailedItem(id: string): Promise<PendingCheckIn | null> {
    try {
      const failedItems = await this.getFailedItems();
      const itemIndex = failedItems.findIndex(item => item.id === id);
      
      if (itemIndex === -1) return null;

      const item = failedItems[itemIndex];
      item.retryCount = 0;
      item.lastError = undefined;

      // Move back to queue
      const queue = await this.getQueue();
      queue.push(item);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(queue));

      // Remove from failed
      failedItems.splice(itemIndex, 1);
      await AsyncStorage.setItem(FAILED_ITEMS_KEY, JSON.stringify(failedItems));

      return item;
    } catch (e) {
      console.error('Failed to retry item', e);
      return null;
    }
  },

  // Clear entire queue
  async clearQueue(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
      console.log('Cleared offline queue');
    } catch (e) {
      console.error('Failed to clear queue', e);
      throw new Error('Failed to clear queue');
    }
  },

  // Clear failed items
  async clearFailedItems(): Promise<void> {
    try {
      await AsyncStorage.removeItem(FAILED_ITEMS_KEY);
      console.log('Cleared failed items');
    } catch (e) {
      console.error('Failed to clear failed items', e);
    }
  },

  // Sync with retry logic
  async syncWithRetry(
    syncFn: (item: PendingCheckIn) => Promise<boolean>,
    onProgress?: (completed: number, total: number) => void
  ): Promise<QueueItemResult[]> {
    const queue = await this.getQueue();
    const results: QueueItemResult[] = [];

    for (let i = 0; i < queue.length; i++) {
      const item = queue[i];
      
      try {
        const success = await syncFn(item);
        
        if (success) {
          await this.removeFromQueue(item.id);
          results.push({ id: item.id, success: true, retryable: false });
        } else {
          // Mark for retry
          const updatedItem = await this.incrementRetry(item.id, 'Sync returned false');
          results.push({ 
            id: item.id, 
            success: false, 
            retryable: updatedItem !== null,
            error: 'Sync returned false'
          });
        }
      } catch (error: any) {
        const errorMessage = error?.message || 'Unknown error';
        const isRetryable = this.isRetryableError(error);
        
        if (isRetryable) {
          const updatedItem = await this.incrementRetry(item.id, errorMessage);
          results.push({ 
            id: item.id, 
            success: false, 
            retryable: updatedItem !== null,
            error: errorMessage
          });
        } else {
          // Non-retryable error, remove from queue
          await this.removeFromQueue(item.id);
          results.push({ 
            id: item.id, 
            success: false, 
            retryable: false,
            error: errorMessage
          });
        }
      }

      onProgress?.(i + 1, queue.length);
      
      // Small delay between items to avoid overwhelming the server
      if (i < queue.length - 1) {
        await this.delay(100);
      }
    }

    await this.updateSyncStats(results);
    return results;
  },

  // Determine if an error is retryable
  isRetryableError(error: any): boolean {
    const retryableErrors = [
      'network',
      'timeout',
      'ECONNREFUSED',
      'ENOTFOUND',
      'ETIMEDOUT',
    ];
    
    const errorMessage = (error?.message || '').toLowerCase();
    return retryableErrors.some(err => errorMessage.includes(err.toLowerCase()));
  },

  // Get sync statistics
  async getSyncStats(): Promise<SyncStats> {
    try {
      const json = await AsyncStorage.getItem(SYNC_STATS_KEY);
      return json != null 
        ? JSON.parse(json) 
        : { totalAttempts: 0, successfulSyncs: 0, failedSyncs: 0 };
    } catch (e) {
      console.error('Failed to read sync stats', e);
      return { totalAttempts: 0, successfulSyncs: 0, failedSyncs: 0 };
    }
  },

  // Update sync statistics
  async updateSyncStats(results: QueueItemResult[]): Promise<void> {
    try {
      const stats = await this.getSyncStats();
      stats.totalAttempts += results.length;
      stats.successfulSyncs += results.filter(r => r.success).length;
      stats.failedSyncs += results.filter(r => !r.success).length;
      stats.lastSyncTime = Date.now();
      
      await AsyncStorage.setItem(SYNC_STATS_KEY, JSON.stringify(stats));
    } catch (e) {
      console.error('Failed to update sync stats', e);
    }
  },

  // Reset sync statistics
  async resetSyncStats(): Promise<void> {
    try {
      await AsyncStorage.removeItem(SYNC_STATS_KEY);
    } catch (e) {
      console.error('Failed to reset sync stats', e);
    }
  },

  // Delay utility
  delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  },

  // Get queue status summary
  async getQueueStatus(): Promise<{
    pending: number;
    failed: number;
    stats: SyncStats;
  }> {
    const [queue, failedItems, stats] = await Promise.all([
      this.getQueue(),
      this.getFailedItems(),
      this.getSyncStats(),
    ]);

    return {
      pending: queue.length,
      failed: failedItems.length,
      stats,
    };
  },
};
