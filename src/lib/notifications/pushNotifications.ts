import { requestNotificationPermission } from './notificationPermission';

interface PushNotificationOptions {
  body: string;
  icon?: string;
  badge?: string;
  data?: any;
  tag?: string;
}

export const sendPushNotification = async (title: string, options: PushNotificationOptions) => {
  const hasPermission = await requestNotificationPermission();
  
  if (!hasPermission) {
    console.warn('Notification permission not granted.');
    return;
  }

  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.ready;
      await registration.showNotification(title, {
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-192x192.png',
        // @ts-ignore
        vibrate: [200, 100, 200],
        ...options
      });
    } catch (error) {
      console.error('Error showing service worker notification:', error);
      // Fallback to standard web notification
      new Notification(title, options);
    }
  } else {
    // Fallback if no SW
    new Notification(title, options);
  }
};
