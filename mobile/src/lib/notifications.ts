import * as SecureStore from 'expo-secure-store';
import type { RemoteMessage } from '@react-native-firebase/messaging';

const storageKey = 'fielded.notifications.v1';
const maxNotifications = 100;

export type StoredNotification = {
  id: string;
  name: string;
  title: string;
  body: string;
  imageUrl?: string;
  receivedAt: string;
  data: Record<string, string>;
};

async function readNotifications(): Promise<StoredNotification[]> {
  const value = await SecureStore.getItemAsync(storageKey);
  if (!value) return [];
  try {
    const parsed = JSON.parse(value) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(item => item && typeof item === 'object' && typeof (item as StoredNotification).id === 'string') as StoredNotification[];
  } catch {
    return [];
  }
}

export async function saveNotification(message: RemoteMessage) {
  const notification = message.notification;
  const data = message.data || {};
  const stringValue = (value: unknown) => typeof value === 'string' ? value : undefined;
  const id = message.messageId || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const item: StoredNotification = {
    id,
    name: stringValue(data.name) || stringValue(data.sender_name) || stringValue(data.from) || 'Fielded',
    title: notification?.title || 'Fielded update',
    body: notification?.body || 'You have a new update.',
    imageUrl: stringValue(data.image_url) || stringValue(data.image) || stringValue((notification?.ios as { imageUrl?: unknown } | undefined)?.imageUrl) || stringValue(notification?.image),
    receivedAt: new Date().toISOString(),
    data: Object.fromEntries(Object.entries(data).map(([key, value]) => [key, String(value)])),
  };
  const existing = await readNotifications();
  if (existing.some(value => value.id === id)) return item;
  await SecureStore.setItemAsync(storageKey, JSON.stringify([item, ...existing].slice(0, maxNotifications)));
  return item;
}

export async function getStoredNotifications() {
  return readNotifications();
}
