import { router } from 'expo-router';
import { Card, Screen } from '../../components/ui';
import { useAuth } from '../../context/auth';
import { canManage, canManagePeople } from '../../lib/viewer';

const open = (name: string) => router.push({ pathname: '/section/[name]', params: { name } });

export default function MoreScreen() {
  const { viewer } = useAuth();
  if (!viewer) return null;
  const management = canManage(viewer.role);
  return <Screen title="More" subtitle={`${viewer.organisationName} · ${viewer.role}`}>
    <Card title="My profile" subtitle="Personal context and preferences" onPress={() => router.push('/profile')} />
    <Card title="Suggestions" subtitle="Ideas for your organisation" onPress={() => open('suggestions')} />
    <Card title="Confidential concerns" subtitle="Speak with designated handlers" onPress={() => open('concerns')} />
    {management && <>
      <Card title="Missions" onPress={() => open('missions')} />
      <Card title="Intelligence" onPress={() => open('intelligence')} />
      <Card title="Investigations" onPress={() => open('investigations')} />
      <Card title="Follow-up work" onPress={() => open('follow-ups')} />
      <Card title="Publishing" onPress={() => open('publishing')} />
      <Card title="Communications" onPress={() => open('communications')} />
      <Card title="Company" onPress={() => open('company')} />
      {canManagePeople(viewer.role) && <Card title="People" onPress={() => open('people')} />}
    </>}
    <Card title="Settings" subtitle="Account and workspace details" onPress={() => router.push('/settings')} />
    <Card title="Packages" subtitle="Compare workspace plans and pricing" onPress={() => router.push('/packages')} />
    <Card title="Notifications" subtitle="Phone alerts and Firebase test token" onPress={() => router.push('/notifications')} />
  </Screen>;
}
