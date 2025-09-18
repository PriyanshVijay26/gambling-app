import { useEffect, useState } from 'react';
import { useNotification } from '../context/NotificationContext';

export const usePushNotifications = () => {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState('default');
  const [subscription, setSubscription] = useState(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const { info, error, warning } = useNotification();

  useEffect(() => {
    // Check if push notifications are supported
    const supported = 'serviceWorker' in navigator && 'PushManager' in window;
    setIsSupported(supported);
    
    if (supported) {
      setPermission(Notification.permission);
      checkExistingSubscription();
    }
  }, []);

  // Check if user is already subscribed
  const checkExistingSubscription = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const existingSubscription = await registration.pushManager.getSubscription();
      
      if (existingSubscription) {
        setSubscription(existingSubscription);
        setIsSubscribed(true);
        console.log('Existing push subscription found');
      }
    } catch (err) {
      console.error('Error checking existing subscription:', err);
    }
  };

  // Request permission and subscribe to push notifications
  const subscribe = async () => {
    if (!isSupported) {
      error('Push notifications are not supported in this browser');
      return false;
    }

    try {
      // Request permission
      const permission = await Notification.requestPermission();
      setPermission(permission);

      if (permission !== 'granted') {
        warning('Push notifications permission denied');
        return false;
      }

      // Get service worker registration
      const registration = await navigator.serviceWorker.ready;
      
      // Create subscription
      const newSubscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(process.env.REACT_APP_VAPID_PUBLIC_KEY || '')
      });

      setSubscription(newSubscription);
      setIsSubscribed(true);

      // Send subscription to server
      await sendSubscriptionToServer(newSubscription);
      
      info('Push notifications enabled!');
      return true;

    } catch (err) {
      console.error('Error subscribing to push notifications:', err);
      error('Failed to enable push notifications');
      return false;
    }
  };

  // Unsubscribe from push notifications
  const unsubscribe = async () => {
    if (!subscription) {
      return false;
    }

    try {
      await subscription.unsubscribe();
      await removeSubscriptionFromServer(subscription);
      
      setSubscription(null);
      setIsSubscribed(false);
      
      info('Push notifications disabled');
      return true;

    } catch (err) {
      console.error('Error unsubscribing from push notifications:', err);
      error('Failed to disable push notifications');
      return false;
    }
  };

  // Send subscription to server
  const sendSubscriptionToServer = async (subscription) => {
    try {
      const response = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscription,
          userAgent: navigator.userAgent,
          timestamp: Date.now()
        })
      });

      if (!response.ok) {
        throw new Error('Failed to send subscription to server');
      }

      console.log('Subscription sent to server successfully');
    } catch (err) {
      console.error('Error sending subscription to server:', err);
      throw err;
    }
  };

  // Remove subscription from server
  const removeSubscriptionFromServer = async (subscription) => {
    try {
      const response = await fetch('/api/push/unsubscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ subscription })
      });

      if (!response.ok) {
        throw new Error('Failed to remove subscription from server');
      }

      console.log('Subscription removed from server successfully');
    } catch (err) {
      console.error('Error removing subscription from server:', err);
    }
  };

  // Show local notification (for testing)
  const showLocalNotification = (title, options = {}) => {
    if (!isSupported || permission !== 'granted') {
      console.warn('Notifications not available');
      return;
    }

    const defaultOptions = {
      body: 'This is a test notification',
      icon: '/pwa/icon-192x192.png',
      badge: '/pwa/badge-72x72.png',
      tag: 'test-notification',
      requireInteraction: false,
      ...options
    };

    new Notification(title, defaultOptions);
  };

  return {
    isSupported,
    permission,
    isSubscribed,
    subscription,
    subscribe,
    unsubscribe,
    showLocalNotification
  };
};

// Utility function to convert VAPID key
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default usePushNotifications;