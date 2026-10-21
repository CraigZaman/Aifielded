import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { color } from '../components/ui';

type Icon = keyof typeof Ionicons.glyphMap;
type Tab = 'Today' | 'Discuss' | 'Updates' | 'Manage' | 'More';
type Detail = { title: string; eyebrow: string; description: string; messages?: boolean };

const tabs: { label: Tab; icon: Icon; selected: Icon }[] = [
  { label: 'Today', icon: 'today-outline', selected: 'today' },
  { label: 'Discuss', icon: 'chatbubbles-outline', selected: 'chatbubbles' },
  { label: 'Updates', icon: 'megaphone-outline', selected: 'megaphone' },
  { label: 'Manage', icon: 'grid-outline', selected: 'grid' },
  { label: 'More', icon: 'ellipsis-horizontal-circle-outline', selected: 'ellipsis-horizontal-circle' },
];

const mission: Detail = {
  eyebrow: 'DISCOVERY MISSION',
  title: 'What would it take to enter Spain?',
  description: 'Sales sees demand and Finance has the budget. Operations can support the launch, but local customer support ownership is still unresolved. This sample mission shows how Fielded brings perspectives together before a decision.',
};
const dialogue: Detail = {
  eyebrow: 'CONVERSATION',
  title: 'Spain launch readiness',
  description: 'A sample conversation about the open questions behind a potential market launch.',
  messages: true,
};
const policy: Detail = {
  eyebrow: 'POLICY UPDATE',
  title: 'Travel and expenses',
  description: 'Get manager approval before booking travel. Fielded can explain approved policies and collect questions that need a human answer. This is sample content for the native preview.',
};

function Badge({ children }: { children: string }) {
  return <View style={styles.badge}><Text style={styles.badgeText}>{children}</Text></View>;
}

function Item({ icon, title, description, meta, onPress }: { icon: Icon; title: string; description: string; meta?: string; onPress: () => void }) {
  return <Pressable style={styles.item} onPress={onPress} accessibilityRole="button">
    <View style={styles.itemIcon}><Ionicons name={icon} size={20} color={color.green} /></View>
    <View style={styles.itemCopy}>{meta && <Text style={styles.meta}>{meta}</Text>}<Text style={styles.itemTitle}>{title}</Text><Text style={styles.itemDescription}>{description}</Text></View>
    <Ionicons name="chevron-forward" size={18} color={color.muted} />
  </Pressable>;
}

function SectionTitle({ children }: { children: string }) {
  return <Text style={styles.sectionTitle}>{children}</Text>;
}

export default function PreviewScreen() {
  const [tab, setTab] = useState<Tab>('Today');
  const [detail, setDetail] = useState<Detail | null>(null);
  const [draft, setDraft] = useState('');
  const [reply, setReply] = useState('');

  function selectTab(next: Tab) { setDetail(null); setTab(next); }
  function open(next: Detail) { setReply(''); setDraft(''); setDetail(next); }

  return <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
    <View style={styles.header}>
      <Pressable onPress={() => router.replace('/sign-in')} accessibilityRole="button" accessibilityLabel="Back to sign in" hitSlop={8} style={styles.headerBack}><Ionicons name="chevron-back" size={23} color={color.green} /></Pressable>
      <View style={styles.brandMark}><Text style={styles.brandLetter}>F</Text></View>
      <View style={styles.brandCopy}><Text style={styles.brand}>Fielded</Text><Text style={styles.brandSub}>Native app preview</Text></View>
      <Badge>PREVIEW</Badge>
    </View>
    <KeyboardAvoidingView style={styles.main} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag">
        {detail ? <>
          <Pressable onPress={() => setDetail(null)} style={styles.back} accessibilityRole="button"><Ionicons name="chevron-back" size={19} color={color.green} /><Text style={styles.backText}>Back to {tab}</Text></Pressable>
          <Text style={styles.eyebrow}>{detail.eyebrow}</Text>
          <Text style={styles.title}>{detail.title}</Text>
          <Text style={styles.subtitle}>{detail.description}</Text>
          {detail.messages ? <>
            <SectionTitle>Conversation</SectionTitle>
            <View style={styles.bubble}><Text style={styles.bubbleName}>Fielded</Text><Text style={styles.bubbleText}>What do you think would most affect a Spain launch?</Text></View>
            <View style={[styles.bubble, styles.ownBubble]}><Text style={styles.bubbleName}>You · sample</Text><Text style={styles.bubbleText}>We should confirm who will own local support before committing to a date.</Text></View>
            {reply ? <View style={[styles.bubble, styles.ownBubble]}><Text style={styles.bubbleName}>You · on this phone only</Text><Text style={styles.bubbleText}>{reply}</Text></View> : null}
            <TextInput style={styles.input} value={draft} onChangeText={setDraft} placeholder="Write a sample reply…" placeholderTextColor="#8da099" multiline />
            <Pressable style={[styles.action, !draft.trim() && styles.actionDisabled]} disabled={!draft.trim()} onPress={() => { setReply(draft.trim()); setDraft(''); }}><Text style={styles.actionText}>Send sample reply</Text></Pressable>
            <Text style={styles.caption}>Preview replies stay on this device and are not sent to Fielded.</Text>
          </> : <>
            <SectionTitle>What this means</SectionTitle>
            <View style={styles.panel}><Text style={styles.panelText}>This is illustrative content from the Fielded product. Live workspace data will appear here when the app is connected to the production backend.</Text></View>
          </>}
        </> : tab === 'Today' ? <>
          <Text style={styles.eyebrow}>YOUR WORKSPACE</Text>
          <Text style={styles.title}>Good to see you.</Text>
          <Text style={styles.subtitle}>A clear view of the conversations and decisions that need attention.</Text>
          <View style={styles.notice}><Ionicons name="information-circle-outline" size={20} color={color.green} /><Text style={styles.noticeText}>This is a native preview with sample data. No browser, cookies, or live account connection.</Text></View>
          <SectionTitle>For you today</SectionTitle>
          <Item icon="compass-outline" title="Spain launch readiness" description="Four perspectives collected · one open question" meta="DISCOVERY MISSION" onPress={() => open(mission)} />
          <Item icon="chatbubbles-outline" title="Continue the conversation" description="Share what you know about local support" meta="YOUR CONVERSATION" onPress={() => open(dialogue)} />
          <SectionTitle>Keep moving</SectionTitle>
          <Item icon="document-text-outline" title="Travel and expenses" description="Review the sample policy update" onPress={() => open(policy)} />
        </> : tab === 'Discuss' ? <>
          <Text style={styles.eyebrow}>DIRECT DIALOGUE</Text><Text style={styles.title}>Conversations</Text><Text style={styles.subtitle}>A place to share context, ask questions, and follow up.</Text>
          <SectionTitle>Recent</SectionTitle>
          <Item icon="chatbubble-ellipses-outline" title="Spain launch readiness" description="Fielded asked what could affect the launch." meta="MISSION CONVERSATION" onPress={() => open(dialogue)} />
          <Item icon="help-circle-outline" title="Travel policy questions" description="See how a policy conversation could work." meta="POLICY CONVERSATION" onPress={() => open(policy)} />
        </> : tab === 'Updates' ? <>
          <Text style={styles.eyebrow}>STAY INFORMED</Text><Text style={styles.title}>Updates</Text><Text style={styles.subtitle}>Important communications, explained in plain language.</Text>
          <SectionTitle>Latest</SectionTitle>
          <Item icon="document-text-outline" title="Travel and expenses" description="Manager approval is needed before booking." meta="POLICY UPDATE" onPress={() => open(policy)} />
          <Item icon="compass-outline" title="Discovery mission progress" description="Review what the sample Spain mission has learned." meta="MISSION UPDATE" onPress={() => open(mission)} />
        </> : tab === 'Manage' ? <>
          <Text style={styles.eyebrow}>WORKSPACE OVERVIEW</Text><Text style={styles.title}>Manage</Text><Text style={styles.subtitle}>See emerging evidence and the work behind it.</Text>
          <View style={styles.stats}><View style={styles.stat}><Text style={styles.statNumber}>1</Text><Text style={styles.statLabel}>Sample mission</Text></View><View style={styles.stat}><Text style={styles.statNumber}>4</Text><Text style={styles.statLabel}>Perspectives</Text></View><View style={styles.stat}><Text style={styles.statNumber}>1</Text><Text style={styles.statLabel}>Open question</Text></View></View>
          <SectionTitle>Explore</SectionTitle>
          <Item icon="compass-outline" title="Discovery missions" description="Start with a business question." onPress={() => open(mission)} />
          <Item icon="bulb-outline" title="Intelligence" description="Connect the evidence before deciding." onPress={() => open(mission)} />
          <Item icon="megaphone-outline" title="Communications" description="Explain approved changes and hear what lands." onPress={() => open(policy)} />
        </> : <>
          <Text style={styles.eyebrow}>FIELDED</Text><Text style={styles.title}>More</Text><Text style={styles.subtitle}>Your profile and workspace tools.</Text>
          <SectionTitle>Workspace</SectionTitle>
          <Item icon="log-in-outline" title="Sign in" description="Open the native login screen." onPress={() => router.replace('/sign-in')} />
          <Item icon="person-add-outline" title="Create an account" description="Open the native registration screen." onPress={() => router.replace('/sign-up')} />
          <Item icon="pricetags-outline" title="Packages" description="Compare Startup, SME and Enterprise pricing." onPress={() => router.push('/packages')} />
          <Item icon="notifications-outline" title="Notifications" description="Enable phone alerts and get a Firebase test token." onPress={() => router.push('/notifications')} />
          <Item icon="person-outline" title="My profile" description="Profile details will appear with a connected account." onPress={() => open({ eyebrow: 'PROFILE', title: 'My profile', description: 'Your native profile screen is ready. Sign-in will be enabled when the app is connected to Fielded.' })} />
          <Item icon="settings-outline" title="Settings" description="Account and workspace preferences." onPress={() => open({ eyebrow: 'SETTINGS', title: 'Settings', description: 'Your native settings screen is ready. Live preferences require a connected account.' })} />
          <View style={styles.notice}><Ionicons name="shield-checkmark-outline" size={20} color={color.green} /><Text style={styles.noticeText}>This preview uses no website pages or cookie settings. Sample content is clearly marked and stays on your phone.</Text></View>
        </>}
      </ScrollView>
    </KeyboardAvoidingView>
    <View style={styles.tabBar}>{tabs.map(item => <Pressable key={item.label} onPress={() => selectTab(item.label)} style={styles.tab} accessibilityRole="tab" accessibilityState={{ selected: tab === item.label }}><Ionicons name={tab === item.label ? item.selected : item.icon} size={22} color={tab === item.label ? color.green : color.muted} /><Text style={[styles.tabText, tab === item.label && styles.tabTextSelected]}>{item.label}</Text></Pressable>)}</View>
  </SafeAreaView>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: color.white },
  header: { minHeight: 64, paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: color.line, gap: 10 },
  headerBack: { minWidth: 32, minHeight: 44, justifyContent: 'center' },
  brandMark: { width: 36, height: 36, borderRadius: 11, backgroundColor: color.navy, alignItems: 'center', justifyContent: 'center' },
  brandLetter: { color: color.white, fontSize: 25, fontWeight: '800' },
  brandCopy: { flex: 1 }, brand: { color: color.ink, fontSize: 18, fontWeight: '800' }, brandSub: { color: color.muted, fontSize: 11 },
  badge: { paddingHorizontal: 9, paddingVertical: 5, borderRadius: 99, backgroundColor: color.mint }, badgeText: { color: color.green, fontSize: 10, fontWeight: '800', letterSpacing: 0.6 },
  main: { flex: 1, backgroundColor: color.background }, content: { flexGrow: 1, padding: 20, paddingBottom: 32, gap: 12 },
  eyebrow: { color: color.green, fontSize: 11, fontWeight: '800', letterSpacing: 1.2, marginTop: 8 },
  title: { color: color.ink, fontSize: 29, fontWeight: '800', letterSpacing: -0.8 }, subtitle: { color: color.muted, fontSize: 14, lineHeight: 21, marginBottom: 8 },
  notice: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, backgroundColor: color.mint, borderRadius: 14, padding: 14 }, noticeText: { flex: 1, color: color.navy, fontSize: 13, lineHeight: 19 },
  sectionTitle: { color: color.ink, fontSize: 18, fontWeight: '800', marginTop: 10, marginBottom: 1 },
  item: { backgroundColor: color.white, borderWidth: 1, borderColor: color.line, borderRadius: 16, padding: 15, flexDirection: 'row', alignItems: 'center', gap: 12 },
  itemIcon: { width: 39, height: 39, borderRadius: 12, backgroundColor: color.mint, alignItems: 'center', justifyContent: 'center' }, itemCopy: { flex: 1, gap: 4 },
  meta: { color: color.green, fontSize: 10, fontWeight: '800', letterSpacing: 0.5 }, itemTitle: { color: color.ink, fontSize: 15, fontWeight: '700' }, itemDescription: { color: color.muted, fontSize: 12, lineHeight: 18 },
  back: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', paddingVertical: 7, gap: 2 }, backText: { color: color.green, fontSize: 14, fontWeight: '700' },
  panel: { backgroundColor: color.white, borderWidth: 1, borderColor: color.line, borderRadius: 16, padding: 18 }, panelText: { color: color.ink, fontSize: 14, lineHeight: 21 },
  bubble: { backgroundColor: color.white, borderRadius: 15, padding: 15, gap: 6, maxWidth: '88%' }, ownBubble: { alignSelf: 'flex-end', backgroundColor: color.mint }, bubbleName: { color: color.green, fontSize: 11, fontWeight: '800' }, bubbleText: { color: color.ink, fontSize: 14, lineHeight: 20 },
  input: { backgroundColor: color.white, borderColor: color.line, borderWidth: 1, borderRadius: 12, minHeight: 53, paddingHorizontal: 14, paddingVertical: 11, color: color.ink, fontSize: 14 },
  action: { backgroundColor: color.green, borderRadius: 12, minHeight: 46, alignItems: 'center', justifyContent: 'center' }, actionDisabled: { opacity: 0.5 }, actionText: { color: color.white, fontSize: 14, fontWeight: '800' }, caption: { color: color.muted, fontSize: 11, lineHeight: 17 },
  stats: { flexDirection: 'row', gap: 8 }, stat: { flex: 1, backgroundColor: color.white, borderWidth: 1, borderColor: color.line, borderRadius: 14, padding: 12 }, statNumber: { color: color.green, fontSize: 23, fontWeight: '800' }, statLabel: { color: color.muted, fontSize: 11, lineHeight: 15 },
  tabBar: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: color.line, backgroundColor: color.white, paddingTop: 7 }, tab: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 4, minHeight: 50 }, tabText: { color: color.muted, fontSize: 10, fontWeight: '600' }, tabTextSelected: { color: color.green, fontWeight: '800' },
});
