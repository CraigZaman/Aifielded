import { useCallback, useEffect, useState } from 'react';
import { router } from 'expo-router';
import { Image, Text, View } from 'react-native';
import { Card, Empty, Screen, color } from '../../components/ui';
import { getStoredNotifications, type StoredNotification } from '../../lib/notifications';

export default function UpdatesScreen() {
  const [notifications, setNotifications] = useState<StoredNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const loadNotifications = useCallback(async () => {
    setLoading(true);
    try { setNotifications(await getStoredNotifications()); } finally { setLoading(false); }
  }, []);
  useEffect(() => {
    const task = setTimeout(() => { void loadNotifications(); }, 0);
    return () => clearTimeout(task);
  }, [loadNotifications]);
  return <Screen title="Updates" subtitle="Notifications received by this phone." refreshing={loading} onRefresh={() => void loadNotifications()}>
    {!!notifications.length && <Text style={styles.sectionTitle}>Notifications</Text>}
    {notifications.map(item => <Card key={`notification-${item.id}`} title={item.title} meta={new Date(item.receivedAt).toLocaleString()} onPress={item.data.kind ? () => openNotification(item) : undefined}>
      <View style={styles.notificationDetails}>
        {item.imageUrl && <Image source={{ uri: item.imageUrl }} style={styles.notificationImage} resizeMode="cover" />}
        <View style={styles.notificationText}><Text style={styles.notificationName}>{item.name}</Text><Text style={styles.notificationBody}>{item.body}</Text></View>
      </View>
    </Card>)}
    {!loading && !notifications.length && <Empty title="No notifications yet" body="Notifications received by this phone will appear here." />}
  </Screen>;
}

const styles = {
  sectionTitle: { color: color.ink, fontSize: 15, fontWeight: '700' as const, marginTop: 4 },
  notificationDetails: { flexDirection: 'row' as const, gap: 12, marginTop: 4 },
  notificationImage: { width: 72, height: 72, borderRadius: 10, backgroundColor: color.mint },
  notificationText: { flex: 1, gap: 4 },
  notificationName: { color: color.green, fontSize: 12, fontWeight: '700' as const },
  notificationBody: { color: color.muted, fontSize: 13, lineHeight: 19 },
};

function openNotification(item: StoredNotification) {
  const kind = item.data.kind;
  const id = item.data.entity_id;
  if (kind === 'mission_assigned' && id) {
    router.push({ pathname: '/conversation/[id]', params: { id } });
  } else if (kind?.startsWith('task_')) {
    router.push({ pathname: '/section/[name]', params: { name: 'follow-ups' } });
  }
}
