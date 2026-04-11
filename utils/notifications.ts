import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { useEffect, useRef, useState } from 'react';
import { useAuth } from './auth-context';
import { logger } from './logger';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export interface NotificationData extends Record<string, unknown> {
  type: 'event_reminder' | 'sync_complete' | 'check_in_success' | 'system';
  eventId?: string;
  eventName?: string;
  message?: string;
}

export function usePushNotifications() {
  const { officer } = useAuth();
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notification, setNotification] = useState<Notifications.Notification | null>(null);
  const notificationListener = useRef<any>(null);
  const responseListener = useRef<any>(null);

  useEffect(() => {
    registerForPushNotificationsAsync().then(token => {
      if (token) {
        setExpoPushToken(token);
      }
    });

    // Listen for incoming notifications
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      setNotification(notification);
    });

    // Listen for notification responses (when user taps notification)
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data as unknown as NotificationData;
      handleNotificationResponse(data);
    });

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, []);

  return { expoPushToken, notification };
}

async function registerForPushNotificationsAsync(): Promise<string | null> {
  let token: string | null = null;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#2563EB',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      logger.warn('notifications', 'Failed to get push token for push notification');
      return null;
    }

    try {
      const pushToken = await Notifications.getExpoPushTokenAsync({
        projectId: 'ec883fcc-96c3-48c2-a46d-6c0624ce3e67', // From app.json
      });
      token = pushToken.data;
    } catch (error) {
      logger.error('notifications', 'Error getting push token', error);
    }
  } else {
    logger.warn('notifications', 'Must use physical device for Push Notifications');
  }

  return token;
}

function handleNotificationResponse(data: NotificationData) {
  logger.debug('notifications', 'Notification response received', data);
  
  // Handle different notification types
  switch (data.type) {
    case 'event_reminder':
      // Navigate to event
      logger.info('notifications', `Navigate to event: ${data.eventId ?? 'unknown'}`);
      break;
    case 'sync_complete':
      // Refresh data
      logger.info('notifications', 'Sync completed, refreshing...');
      break;
    case 'check_in_success':
      // Show success feedback
      logger.info('notifications', 'Check-in successful');
      break;
    default:
      break;
  }
}

// Local notification helpers
export async function scheduleLocalNotification(
  title: string,
  body: string,
  data: NotificationData,
  trigger?: Notifications.NotificationTriggerInput
) {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: data as Record<string, unknown>,
        sound: 'default',
        badge: 1,
      },
      trigger: trigger || null, // null = immediate
    });
  } catch (error) {
    logger.error('notifications', 'Error scheduling notification', error);
  }
}

export async function scheduleEventReminder(
  eventName: string,
  eventDate: Date,
  minutesBefore: number = 30
) {
  const reminderTime = new Date(eventDate.getTime() - minutesBefore * 60000);
  
  if (reminderTime > new Date()) {
    await scheduleLocalNotification(
      'Event Reminder',
      `${eventName} starts in ${minutesBefore} minutes`,
      { type: 'event_reminder', eventName },
      { type: SchedulableTriggerInputTypes.DATE, date: reminderTime }
    );
  }
}

export async function sendSyncCompleteNotification(successCount: number) {
  await scheduleLocalNotification(
    'Sync Complete',
    `Successfully synced ${successCount} offline check-ins`,
    { type: 'sync_complete' }
  );
}

export async function sendCheckInSuccessNotification(memberName: string) {
  await scheduleLocalNotification(
    'Check-in Successful',
    `${memberName} has been checked in`,
    { type: 'check_in_success' }
  );
}

// Cancel all scheduled notifications
export async function cancelAllNotifications() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

// Get badge count
export async function getBadgeCount(): Promise<number> {
  return await Notifications.getBadgeCountAsync();
}

// Set badge count
export async function setBadgeCount(count: number) {
  await Notifications.setBadgeCountAsync(count);
}

// Import type
import { SchedulableTriggerInputTypes } from 'expo-notifications';
