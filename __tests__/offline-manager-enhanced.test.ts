import { OfflineManager, PendingCheckIn, QueueItemResult } from '../utils/offline-manager';

// Mock storage for tests
let mockStorage: Record<string, string> = {};

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn((key: string, value: string) => {
    mockStorage[key] = value;
    return Promise.resolve();
  }),
  getItem: jest.fn((key: string) => {
    return Promise.resolve(mockStorage[key] || null);
  }),
  removeItem: jest.fn((key: string) => {
    delete mockStorage[key];
    return Promise.resolve();
  }),
}));

describe('OfflineManager', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockStorage = {};
  });

  describe('queueCheckIn', () => {
    it('should add a check-in to the queue', async () => {
      const eventId = 'event-123';
      const memberId = 'member-456';

      const item = await OfflineManager.queueCheckIn(eventId, memberId);

      expect(item).toMatchObject({
        eventId,
        memberId,
        retryCount: 0,
      });
      expect(item.id).toBeDefined();
      expect(item.timestamp).toBeDefined();
    });

    it('should throw error when storage fails', async () => {
      const mockSetItem = require('@react-native-async-storage/async-storage').setItem;
      mockSetItem.mockRejectedValueOnce(new Error('Storage error'));

      await expect(OfflineManager.queueCheckIn('event-1', 'member-1'))
        .rejects.toThrow('Failed to queue check-in');
    });
  });

  describe('getQueue', () => {
    it('should return empty array when no items', async () => {
      const queue = await OfflineManager.getQueue();
      expect(queue).toEqual([]);
    });

    it('should return parsed queue items', async () => {
      const mockQueue: PendingCheckIn[] = [
        { id: '1', eventId: 'e1', memberId: 'm1', timestamp: 123, retryCount: 0 },
      ];
      mockStorage['offline_attendance_queue'] = JSON.stringify(mockQueue);

      const queue = await OfflineManager.getQueue();
      expect(queue).toEqual(mockQueue);
    });

    it('should handle storage errors gracefully', async () => {
      const mockGetItem = require('@react-native-async-storage/async-storage').getItem;
      mockGetItem.mockRejectedValueOnce(new Error('Storage error'));

      const queue = await OfflineManager.getQueue();
      expect(queue).toEqual([]);
    });
  });

  describe('getQueueByEvent', () => {
    it('should filter queue by event ID', async () => {
      const mockQueue: PendingCheckIn[] = [
        { id: '1', eventId: 'event-1', memberId: 'm1', timestamp: 123, retryCount: 0 },
        { id: '2', eventId: 'event-2', memberId: 'm2', timestamp: 124, retryCount: 0 },
        { id: '3', eventId: 'event-1', memberId: 'm3', timestamp: 125, retryCount: 0 },
      ];
      mockStorage['offline_attendance_queue'] = JSON.stringify(mockQueue);

      const queue = await OfflineManager.getQueueByEvent('event-1');
      expect(queue).toHaveLength(2);
      expect(queue.every(item => item.eventId === 'event-1')).toBe(true);
    });
  });

  describe('incrementRetry', () => {
    it('should increment retry count', async () => {
      const mockQueue: PendingCheckIn[] = [
        { id: '1', eventId: 'e1', memberId: 'm1', timestamp: 123, retryCount: 0 },
      ];
      mockStorage['offline_attendance_queue'] = JSON.stringify(mockQueue);

      const item = await OfflineManager.incrementRetry('1', 'Network error');

      expect(item).toMatchObject({
        id: '1',
        retryCount: 1,
        lastError: 'Network error',
      });
    });

    it('should move item to failed after max retries', async () => {
      const mockQueue: PendingCheckIn[] = [
        { id: '1', eventId: 'e1', memberId: 'm1', timestamp: 123, retryCount: 2 },
      ];
      mockStorage['offline_attendance_queue'] = JSON.stringify(mockQueue);

      const item = await OfflineManager.incrementRetry('1', 'Network error');

      expect(item).toBeNull();
      expect(mockStorage['offline_failed_items']).toBeDefined();
      const failedItems = JSON.parse(mockStorage['offline_failed_items']);
      expect(failedItems).toHaveLength(1);
      expect(failedItems[0].retryCount).toBe(3);
    });
  });

  describe('syncWithRetry', () => {
    it('should process all items successfully', async () => {
      const mockQueue: PendingCheckIn[] = [
        { id: '1', eventId: 'e1', memberId: 'm1', timestamp: 123, retryCount: 0 },
        { id: '2', eventId: 'e2', memberId: 'm2', timestamp: 124, retryCount: 0 },
      ];
      mockStorage['offline_attendance_queue'] = JSON.stringify(mockQueue);

      const mockSyncFn = jest.fn().mockResolvedValue(true);
      const onProgress = jest.fn();

      const results = await OfflineManager.syncWithRetry(mockSyncFn, onProgress);

      expect(results).toHaveLength(2);
      expect(results.every(r => r.success)).toBe(true);
      expect(mockSyncFn).toHaveBeenCalledTimes(2);
      expect(onProgress).toHaveBeenCalledTimes(2);
    });

    it('should handle sync failures and retry', async () => {
      const mockQueue: PendingCheckIn[] = [
        { id: '1', eventId: 'e1', memberId: 'm1', timestamp: 123, retryCount: 0 },
      ];
      mockStorage['offline_attendance_queue'] = JSON.stringify(mockQueue);

      const mockSyncFn = jest.fn().mockResolvedValue(false);

      const results = await OfflineManager.syncWithRetry(mockSyncFn);

      expect(results[0].success).toBe(false);
      expect(results[0].retryable).toBe(true);
    });

    it('should handle network errors as retryable', async () => {
      const mockQueue: PendingCheckIn[] = [
        { id: '1', eventId: 'e1', memberId: 'm1', timestamp: 123, retryCount: 0 },
      ];
      mockStorage['offline_attendance_queue'] = JSON.stringify(mockQueue);

      const networkError = new Error('Network timeout');
      const mockSyncFn = jest.fn().mockRejectedValue(networkError);

      const results = await OfflineManager.syncWithRetry(mockSyncFn);

      expect(results[0].success).toBe(false);
      expect(results[0].retryable).toBe(true);
      expect(results[0].error).toContain('timeout');
    });

    it('should handle non-retryable errors', async () => {
      const mockQueue: PendingCheckIn[] = [
        { id: '1', eventId: 'e1', memberId: 'm1', timestamp: 123, retryCount: 0 },
      ];
      mockStorage['offline_attendance_queue'] = JSON.stringify(mockQueue);

      const validationError = new Error('Invalid member ID');
      const mockSyncFn = jest.fn().mockRejectedValue(validationError);

      const results = await OfflineManager.syncWithRetry(mockSyncFn);

      expect(results[0].success).toBe(false);
      expect(results[0].retryable).toBe(false);
    });
  });

  describe('isRetryableError', () => {
    it('should identify network errors as retryable', () => {
      expect(OfflineManager.isRetryableError(new Error('Network error'))).toBe(true);
      expect(OfflineManager.isRetryableError(new Error('timeout'))).toBe(true);
      expect(OfflineManager.isRetryableError(new Error('ECONNREFUSED'))).toBe(true);
    });

    it('should identify validation errors as non-retryable', () => {
      expect(OfflineManager.isRetryableError(new Error('Invalid input'))).toBe(false);
      expect(OfflineManager.isRetryableError(new Error('Already checked in'))).toBe(false);
    });
  });

  describe('getQueueStatus', () => {
    it('should return complete queue status', async () => {
      const mockQueue: PendingCheckIn[] = [
        { id: '1', eventId: 'e1', memberId: 'm1', timestamp: 123, retryCount: 0 },
      ];
      const mockFailed: PendingCheckIn[] = [
        { id: '2', eventId: 'e2', memberId: 'm2', timestamp: 124, retryCount: 3 },
      ];
      const mockStats = { totalAttempts: 10, successfulSyncs: 8, failedSyncs: 2, lastSyncTime: Date.now() };

      mockStorage['offline_attendance_queue'] = JSON.stringify(mockQueue);
      mockStorage['offline_failed_items'] = JSON.stringify(mockFailed);
      mockStorage['offline_sync_stats'] = JSON.stringify(mockStats);

      const status = await OfflineManager.getQueueStatus();

      expect(status).toEqual({
        pending: 1,
        failed: 1,
        stats: mockStats,
      });
    });
  });

  describe('retryFailedItem', () => {
    it('should move failed item back to queue', async () => {
      const mockFailed: PendingCheckIn[] = [
        { id: '1', eventId: 'e1', memberId: 'm1', timestamp: 123, retryCount: 3 },
      ];
      mockStorage['offline_failed_items'] = JSON.stringify(mockFailed);
      mockStorage['offline_attendance_queue'] = JSON.stringify([]);

      const item = await OfflineManager.retryFailedItem('1');

      expect(item).toMatchObject({
        id: '1',
        retryCount: 0,
        lastError: undefined,
      });
      
      const queue = JSON.parse(mockStorage['offline_attendance_queue']);
      expect(queue).toHaveLength(1);
      
      const failed = JSON.parse(mockStorage['offline_failed_items']);
      expect(failed).toHaveLength(0);
    });

    it('should return null if item not found', async () => {
      mockStorage['offline_failed_items'] = JSON.stringify([]);

      const item = await OfflineManager.retryFailedItem('non-existent');

      expect(item).toBeNull();
    });
  });

  describe('clearQueue', () => {
    it('should clear the queue', async () => {
      mockStorage['offline_attendance_queue'] = JSON.stringify([{ id: '1' }]);

      await OfflineManager.clearQueue();

      expect(mockStorage['offline_attendance_queue']).toBeUndefined();
    });

    it('should throw on error', async () => {
      const mockRemoveItem = require('@react-native-async-storage/async-storage').removeItem;
      mockRemoveItem.mockRejectedValueOnce(new Error('Storage error'));

      await expect(OfflineManager.clearQueue()).rejects.toThrow('Failed to clear queue');
    });
  });

  describe('clearFailedItems', () => {
    it('should clear failed items', async () => {
      mockStorage['offline_failed_items'] = JSON.stringify([{ id: '1' }]);

      await OfflineManager.clearFailedItems();

      expect(mockStorage['offline_failed_items']).toBeUndefined();
    });
  });

  describe('resetSyncStats', () => {
    it('should reset sync statistics', async () => {
      mockStorage['offline_sync_stats'] = JSON.stringify({ totalAttempts: 10 });

      await OfflineManager.resetSyncStats();

      expect(mockStorage['offline_sync_stats']).toBeUndefined();
    });
  });
});
