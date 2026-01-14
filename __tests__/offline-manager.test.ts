/**
 * Unit tests for offline manager functionality
 */

import { OfflineManager } from '../utils/offline-manager';

import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
}));

const mockedAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

describe('OfflineManager', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getQueue', () => {
        it('should return empty array when no queue exists', async () => {
            mockedAsyncStorage.getItem.mockResolvedValue(null);

            const queue = await OfflineManager.getQueue();

            expect(queue).toEqual([]);
            expect(mockedAsyncStorage.getItem).toHaveBeenCalledWith('offline_attendance_queue');
        });

        it('should return parsed queue when data exists', async () => {
            const mockQueue = [
                { id: '1', eventId: 'event1', memberId: 'card1', timestamp: '2026-01-14T10:00:00Z' },
                { id: '2', eventId: 'event2', memberId: 'card2', timestamp: '2026-01-14T10:05:00Z' },
            ];
            mockedAsyncStorage.getItem.mockResolvedValue(JSON.stringify(mockQueue));

            const queue = await OfflineManager.getQueue();

            expect(queue).toEqual(mockQueue);
        });

        it('should return empty array on parse error', async () => {
            mockedAsyncStorage.getItem.mockResolvedValue('invalid-json');

            const queue = await OfflineManager.getQueue();

            expect(queue).toEqual([]);
        });
    });

    describe('queueCheckIn', () => {
        it('should add a new check-in to empty queue', async () => {
            mockedAsyncStorage.getItem.mockResolvedValue(null);

            await OfflineManager.queueCheckIn('event123', 'card456');

            expect(mockedAsyncStorage.setItem).toHaveBeenCalledWith(
                'offline_attendance_queue',
                expect.stringContaining('event123')
            );
            expect(mockedAsyncStorage.setItem).toHaveBeenCalledWith(
                'offline_attendance_queue',
                expect.stringContaining('card456')
            );
        });

        it('should append to existing queue', async () => {
            const existingQueue = [
                { id: '1', eventId: 'event1', memberId: 'card1', timestamp: '2026-01-14T10:00:00Z' },
            ];
            mockedAsyncStorage.getItem.mockResolvedValue(JSON.stringify(existingQueue));

            await OfflineManager.queueCheckIn('event2', 'card2');

            const setItemCall = mockedAsyncStorage.setItem.mock.calls[0];
            const savedQueue = JSON.parse(setItemCall[1]);

            expect(savedQueue).toHaveLength(2);
            expect(savedQueue[0].eventId).toBe('event1');
            expect(savedQueue[1].eventId).toBe('event2');
        });
    });

    describe('removeFromQueue', () => {
        it('should remove item by id', async () => {
            const existingQueue = [
                { id: 'id1', eventId: 'event1', memberId: 'card1', timestamp: '2026-01-14T10:00:00Z' },
                { id: 'id2', eventId: 'event2', memberId: 'card2', timestamp: '2026-01-14T10:05:00Z' },
            ];
            mockedAsyncStorage.getItem.mockResolvedValue(JSON.stringify(existingQueue));

            await OfflineManager.removeFromQueue('id1');

            const setItemCall = mockedAsyncStorage.setItem.mock.calls[0];
            const savedQueue = JSON.parse(setItemCall[1]);

            expect(savedQueue).toHaveLength(1);
            expect(savedQueue[0].id).toBe('id2');
        });

        it('should handle removing non-existent id', async () => {
            const existingQueue = [
                { id: 'id1', eventId: 'event1', memberId: 'card1', timestamp: '2026-01-14T10:00:00Z' },
            ];
            mockedAsyncStorage.getItem.mockResolvedValue(JSON.stringify(existingQueue));

            await OfflineManager.removeFromQueue('non-existent');

            const setItemCall = mockedAsyncStorage.setItem.mock.calls[0];
            const savedQueue = JSON.parse(setItemCall[1]);

            expect(savedQueue).toHaveLength(1);
        });
    });

    describe('clearQueue', () => {
        it('should clear all items from queue', async () => {
            await OfflineManager.clearQueue();

            expect(mockedAsyncStorage.removeItem).toHaveBeenCalledWith('offline_attendance_queue');
        });
    });
});
