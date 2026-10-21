import { useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { Button, Card, Message, Screen, color } from '../components/ui';
import { useAuth } from '../context/auth';
import { enablePhoneNotifications, registerPhoneNotificationToken, sendPhoneTestNotification } from '../lib/push';

export default function NotificationsScreen() {
  const { viewer } = useAuth();
  const [token, setToken] = useState('');
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');

  async function enable() {
    setBusy(true);
    setNotice('');
    try {
      const value = await enablePhoneNotifications();
      setToken(value);
      try {
        await registerPhoneNotificationToken(value);
        setNotice('Notifications are enabled and this phone is registered for Fielded work alerts.');
      } catch {
        setNotice('Firebase is ready for a test push. Sign in to register this phone for automatic Fielded alerts.');
      }
    } catch (cause) {
      setNotice(cause instanceof Error ? cause.message : 'Could not enable phone alerts. Check Firebase setup and try again.');
    } finally {
      setBusy(false);
    }
  }

  async function sendTest() {
    setBusy(true);
    setNotice('');
    try {
      await sendPhoneTestNotification(token);
      setNotice('Backend test alert sent. Check the alert on this phone.');
    } catch (cause) {
      setNotice(cause instanceof Error ? cause.message : 'Could not send the backend test alert.');
    } finally {
      setBusy(false);
    }
  }

  return <Screen title="Notifications" subtitle="Get Fielded alerts on this phone.">
    <Card title="Firebase test alerts" subtitle="Allow notifications, then send a test message from Firebase Console to this phone.">
      <Button label="Enable test notifications" onPress={() => void enable()} busy={busy} />
    </Card>
    {!!notice && <Message text={notice} error={notice.startsWith('Could not') || notice.startsWith('Notifications were') || notice.includes('not enabled')} />}
    {token && <Card title="Firebase test token" subtitle="Use this device token in Firebase Console → Messaging → Send test message. Keep it private; it can target this phone.">
      <Text selectable style={styles.token}>{token}</Text>
    </Card>}
    {viewer && token && <Card title="Test the Fielded backend" subtitle="Send an alert to this signed-in phone through the Fielded backend and Firebase.">
      <Button label="Send backend test alert" onPress={() => void sendTest()} busy={busy} />
    </Card>}
    {!viewer && <Message text="Sign in to register this phone for automatic Fielded work alerts. Firebase test alerts can be sent without signing in." />}
  </Screen>;
}

const styles = StyleSheet.create({
  token: { color: color.ink, fontSize: 12, lineHeight: 19 },
});
