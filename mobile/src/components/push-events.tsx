import { AuthorizationStatus, getInitialNotification, getMessaging, onMessage, onNotificationOpenedApp, setBackgroundMessageHandler, type RemoteMessage } from '@react-native-firebase/messaging';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { Alert } from 'react-native';
import { useAuth } from '../context/auth';
import { saveNotification } from '../lib/notifications';
import { registerPhoneNotificationToken } from '../lib/push';

setBackgroundMessageHandler(getMessaging(), async message => {
  try { await saveNotification(message); } catch { /* Notification delivery must not depend on local persistence. */ }
});

function openMessage(message: RemoteMessage, signedIn: boolean, management: boolean) {
  const kind = message.data?.kind;
  const id = message.data?.entity_id;
  if (!kind) { router.push('/notifications'); return; }
  if (!signedIn) { router.push('/sign-in'); return; }
  if (kind === 'mission_assigned' && typeof id === 'string' && /^[0-9a-f-]{36}$/i.test(id)) {
    router.push({ pathname: '/conversation/[id]', params: { id } });
  } else if (management && typeof kind === 'string' && kind.startsWith('task_')) {
    router.push({ pathname: '/section/[name]', params: { name: 'follow-ups' } });
  } else {
    router.push('/(tabs)/today');
  }
}

export function PushEvents() {
  const { loading, viewer } = useAuth();
  const signedIn = !!viewer;
  const management = !!viewer && viewer.role !== 'participant';
  useEffect(() => {
    if (loading) return;
    try {
      const messaging = getMessaging();
      void messaging.hasPermission().then(async status => {
        if ((status === AuthorizationStatus.AUTHORIZED || status === AuthorizationStatus.PROVISIONAL) && !messaging.isDeviceRegisteredForRemoteMessages) {
          await messaging.registerDeviceForRemoteMessages();
        }
        if (signedIn && (status === AuthorizationStatus.AUTHORIZED || status === AuthorizationStatus.PROVISIONAL)) {
          const token = await messaging.getToken();
          if (token) await registerPhoneNotificationToken(token);
        }
      }).catch(() => {});
      const unsubscribeToken = messaging.onTokenRefresh(token => {
        if (signedIn) void registerPhoneNotificationToken(token).catch(() => {});
      });
      const unsubscribeMessage = onMessage(messaging, message => {
        void saveNotification(message).catch(() => {});
        Alert.alert(message.notification?.title || 'Fielded update', message.notification?.body || 'You have a new update.', [
          { text: 'Later', style: 'cancel' },
          { text: 'View', onPress: () => openMessage(message, signedIn, management) },
        ]);
      });
      const unsubscribeOpened = onNotificationOpenedApp(messaging, message => {
        void saveNotification(message).catch(() => {});
        openMessage(message, signedIn, management);
      });
      void getInitialNotification(messaging).then(message => {
        if (message) {
          void saveNotification(message).catch(() => {});
          openMessage(message, signedIn, management);
        }
      }).catch(() => {});
      return () => { unsubscribeToken(); unsubscribeMessage(); unsubscribeOpened(); };
    } catch {
      // The notification screen reports setup problems without taking down sign-in.
    }
  }, [loading, signedIn, management]);
  return null;
}
