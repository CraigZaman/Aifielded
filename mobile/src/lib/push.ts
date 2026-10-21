import {
  AuthorizationStatus,
  deleteToken,
  getMessaging,
  getToken,
  isDeviceRegisteredForRemoteMessages,
  registerDeviceForRemoteMessages,
  requestPermission,
} from '@react-native-firebase/messaging';
import { PermissionsAndroid, Platform } from 'react-native';
import { apiDelete, apiPost } from './api';

export async function enablePhoneNotifications() {
  if (Platform.OS === 'ios') {
    const status = await requestPermission(getMessaging());
    if (status !== AuthorizationStatus.AUTHORIZED && status !== AuthorizationStatus.PROVISIONAL) {
      throw new Error('Notifications were not allowed. Enable them in your iPhone settings and try again.');
    }
    if (!isDeviceRegisteredForRemoteMessages(getMessaging())) {
      await registerDeviceForRemoteMessages(getMessaging());
    }
  } else if (Platform.OS === 'android' && Number(Platform.Version) >= 33) {
    const result = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
    if (result !== PermissionsAndroid.RESULTS.GRANTED) {
      throw new Error('Notifications were not allowed. Enable them in Android settings and try again.');
    }
  }
  const token = await getToken(getMessaging());
  if (!token) throw new Error('Firebase did not return a device token. Check the Firebase app configuration.');
  return token;
}

export async function registerPhoneNotificationToken(token: string) {
  await apiPost('/api/devices/register', { token, platform: Platform.OS });
}

export async function sendPhoneTestNotification(token: string) {
  return apiPost<{ ok: boolean }>('/api/devices/test', { token });
}

export async function unregisterPhoneNotificationToken() {
  const messaging = getMessaging();
  if (!isDeviceRegisteredForRemoteMessages(messaging)) return;
  try {
    const token = await getToken(messaging).catch(() => null);
    if (token) await apiDelete('/api/devices/register', { token }, 5000);
  } finally {
    await deleteToken(messaging);
  }
}
