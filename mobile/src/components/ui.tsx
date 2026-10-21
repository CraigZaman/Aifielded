import { Ionicons } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';

export const color = { navy: '#17352f', green: '#0f766e', ink: '#172923', muted: '#63786f', background: '#f4f7f5', line: '#dce6e0', white: '#fff', mint: '#e5f3ec', danger: '#b33838' };

export function Screen({ title, subtitle, children, refreshing, onRefresh }: { title: string; subtitle?: string; children: ReactNode; refreshing?: boolean; onRefresh?: () => void }) {
  return <ScrollView contentContainerStyle={styles.screen} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag" automaticallyAdjustKeyboardInsets refreshControl={onRefresh ? <RefreshControl refreshing={!!refreshing} onRefresh={onRefresh} tintColor={color.green} colors={[color.green]} /> : undefined}>
      <View style={styles.heading}><Text style={styles.title}>{title}</Text>{subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}</View>
      {refreshing && <ActivityIndicator color={color.green} />}
      {children}
  </ScrollView>;
}

export function Card({ title, subtitle, meta, onPress, children }: { title: string; subtitle?: string; meta?: string; onPress?: () => void; children?: ReactNode }) {
  const content = <><View style={styles.cardTop}><Text style={styles.cardTitle}>{title}</Text>{onPress && <Ionicons name="chevron-forward" size={18} color={color.muted} />}</View>{subtitle && <Text style={styles.cardSubtitle}>{subtitle}</Text>}{meta && <Text style={styles.cardMeta}>{meta}</Text>}{children}</>;
  return onPress ? <Pressable onPress={onPress} style={styles.card}>{content}</Pressable> : <View style={styles.card}>{content}</View>;
}

export function Button({ label, onPress, busy, secondary, disabled }: { label: string; onPress: () => void; busy?: boolean; secondary?: boolean; disabled?: boolean }) {
  return <Pressable onPress={onPress} disabled={busy || disabled} style={[styles.button, secondary && styles.buttonSecondary, (busy || disabled) && styles.disabled]} accessibilityRole="button">
    {busy ? <ActivityIndicator color={secondary ? color.green : color.white} /> : <Text style={[styles.buttonText, secondary && styles.buttonSecondaryText]}>{label}</Text>}
  </Pressable>;
}

export function Field({ label, ...props }: { label: string } & TextInputProps) {
  return <View style={styles.field}><Text style={styles.fieldLabel}>{label}</Text><TextInput style={styles.input} placeholderTextColor="#9aa9a2" autoCapitalize="none" {...props} /></View>;
}

export function Message({ text, error }: { text: string; error?: boolean }) {
  return <View style={[styles.message, error && styles.messageError]}><Text style={[styles.messageText, error && styles.messageErrorText]}>{text}</Text></View>;
}

export function Empty({ title, body }: { title: string; body: string }) {
  return <View style={styles.empty}><Ionicons name="leaf-outline" size={29} color={color.green} /><Text style={styles.emptyTitle}>{title}</Text><Text style={styles.emptyBody}>{body}</Text></View>;
}

const styles = StyleSheet.create({
  screen: { flexGrow: 1, padding: 20, paddingBottom: 42, backgroundColor: color.background, gap: 12 },
  heading: { marginBottom: 7 },
  title: { color: color.ink, fontSize: 28, fontWeight: '700', letterSpacing: -0.7 },
  subtitle: { color: color.muted, fontSize: 14, lineHeight: 21, marginTop: 5 },
  card: { backgroundColor: color.white, borderWidth: 1, borderColor: color.line, borderRadius: 16, padding: 17, gap: 7 },
  cardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  cardTitle: { flex: 1, color: color.ink, fontSize: 16, fontWeight: '700' },
  cardSubtitle: { color: color.muted, fontSize: 13, lineHeight: 19 },
  cardMeta: { color: color.green, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.6 },
  button: { minHeight: 49, borderRadius: 12, backgroundColor: color.green, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 17 },
  buttonSecondary: { backgroundColor: color.mint },
  buttonText: { color: color.white, fontSize: 15, fontWeight: '700' },
  buttonSecondaryText: { color: color.green },
  disabled: { opacity: 0.55 },
  field: { gap: 7, marginBottom: 7 },
  fieldLabel: { color: color.ink, fontSize: 12, fontWeight: '700' },
  input: { minHeight: 50, borderWidth: 1, borderColor: color.line, borderRadius: 12, paddingHorizontal: 14, backgroundColor: color.white, color: color.ink, fontSize: 15 },
  message: { borderRadius: 12, backgroundColor: color.mint, padding: 13 },
  messageError: { backgroundColor: '#fff0ee' },
  messageText: { color: color.navy, fontSize: 13, lineHeight: 19 },
  messageErrorText: { color: color.danger },
  empty: { backgroundColor: color.white, borderWidth: 1, borderColor: color.line, borderRadius: 16, padding: 28, alignItems: 'center', gap: 9 },
  emptyTitle: { color: color.ink, fontSize: 17, fontWeight: '700', textAlign: 'center' },
  emptyBody: { color: color.muted, fontSize: 13, lineHeight: 19, textAlign: 'center' },
});
