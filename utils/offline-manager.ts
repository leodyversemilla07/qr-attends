import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'offline_attendance_queue';

export interface PendingCheckIn {
  id: string; // unique ID for the queue item
  eventId: string;
  memberId: string; // The scanned data (might be memberId or raw QR content)
  timestamp: number;
}

export const OfflineManager = {
  // Add a scan to the offline queue
  async queueCheckIn(eventId: string, memberId: string): Promise<void> {
    const newItem: PendingCheckIn = {
      id: Math.random().toString(36).substring(7),
      eventId,
      memberId,
      timestamp: Date.now(),
    };

    try {
      const currentQueue = await this.getQueue();
      const updatedQueue = [...currentQueue, newItem];
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedQueue));
      console.log('Queued offline check-in:', newItem);
    } catch (e) {
      console.error('Failed to save offline check-in', e);
    }
  },

  // Retrieve the current queue
  async getQueue(): Promise<PendingCheckIn[]> {
    try {
      const json = await AsyncStorage.getItem(STORAGE_KEY);
      return json != null ? JSON.parse(json) : [];
    } catch (e) {
      console.error('Failed to read offline queue', e);
      return [];
    }
  },

  // Clear a specific item from the queue (after successful sync)
  async removeFromQueue(id: string): Promise<void> {
    try {
      const currentQueue = await this.getQueue();
      const updatedQueue = currentQueue.filter(item => item.id !== id);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedQueue));
    } catch (e) {
      console.error('Failed to remove item from queue', e);
    }
  },

  // Clear entire queue
  async clearQueue(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.error('Failed to clear queue', e);
    }
  }
};
