import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { Button, Card, Message, Screen, color } from '../components/ui';
import { apiConfigured } from '../lib/supabase';
import { plans } from '../lib/plans';

export default function PackagesScreen() {
  return <Screen title="Packages" subtitle="Choose the space your company needs.">
    <Message text={apiConfigured
      ? 'Published early-access pricing. Package selection continues in native account creation; payment is not taken in this app.'
      : 'Published early-access pricing. This app can show and select a package, but live account creation and payment are not connected yet.'} />
    {plans.map(plan => <Card key={plan.id} title={plan.name} subtitle={plan.description}>
      <View style={styles.priceRow}><Text style={styles.price}>{plan.monthlyPrice}</Text><Text style={styles.period}>/ month</Text></View>
      <Text style={styles.seats}>One workspace · up to {plan.seats} people</Text>
      <View style={styles.features}>{plan.features.map(feature => <Text key={feature} style={styles.feature}>✓  {feature}</Text>)}</View>
      <Button label={`Choose ${plan.name}`} onPress={() => router.push({ pathname: '/sign-up', params: { plan: plan.id } })} secondary={plan.id !== 'sme'} />
    </Card>)}
    <Card title="How the trial works">
      <Text style={styles.detail}>30-day trial. Payment details are required on the live service, including with a promo code. Subscriptions renew monthly after the trial unless cancelled.</Text>
      <Text style={styles.detail}>Prices are in GBP per workspace per month. Applicable taxes are shown at checkout. More than 100 people? Contact tech@fielded.ai for a quote.</Text>
    </Card>
  </Screen>;
}

const styles = StyleSheet.create({
  priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 5, marginTop: 7 },
  price: { color: color.ink, fontSize: 29, fontWeight: '800' },
  period: { color: color.muted, fontSize: 13 },
  seats: { color: color.green, fontSize: 13, fontWeight: '700' },
  features: { gap: 8, paddingVertical: 10 },
  feature: { color: color.ink, fontSize: 13, lineHeight: 19 },
  detail: { color: color.muted, fontSize: 13, lineHeight: 19 },
});
