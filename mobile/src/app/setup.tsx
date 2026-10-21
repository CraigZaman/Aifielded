import { Screen, Card } from '../components/ui';

export default function SetupScreen() {
  return <Screen title="Fielded isn't connected yet" subtitle="This app needs a connection to your organisation's Fielded workspace.">
    <Card title="Connection needed" subtitle="Ask your Fielded administrator to finish setting up this app." />
  </Screen>;
}
