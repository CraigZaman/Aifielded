import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useRef, useState, type ComponentType, type RefAttributes } from 'react';
import {
  ActivityIndicator,
  BackHandler,
  Linking,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  StatusBar as NativeStatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import WebView, { type WebViewNavigation } from 'react-native-webview';
import type { AndroidWebViewProps, IOSWebViewProps } from 'react-native-webview/lib/WebViewTypes';

// WebView 14's published root type intersects iOS, Android and Windows-only
// props into `never`; the runtime component is cross-platform.
const NativeWebView = WebView as unknown as ComponentType<IOSWebViewProps & Pick<AndroidWebViewProps, 'thirdPartyCookiesEnabled' | 'domStorageEnabled'> & RefAttributes<WebView>>;

const APP_ORIGIN = process.env.EXPO_PUBLIC_API_ORIGIN?.trim().replace(/\/$/, '') || 'https://app.fielded.ai';
const WORKSPACE_URL = `${APP_ORIGIN}/app`;
const RootView = Platform.OS === 'ios' ? SafeAreaView : View;

type IconName = keyof typeof Ionicons.glyphMap;
type Tab = { label: string; path: string; icon: IconName; selectedIcon: IconName };
type WorkspaceState = { role: string | null; organisation: string; path: string; company: boolean };

const myWorkTabs: Tab[] = [
  { label: 'Today', path: '/app/my-day', icon: 'today-outline', selectedIcon: 'today' },
  { label: 'Discuss', path: '/app/conversations', icon: 'chatbubbles-outline', selectedIcon: 'chatbubbles' },
  { label: 'Updates', path: '/app/updates', icon: 'megaphone-outline', selectedIcon: 'megaphone' },
  { label: 'Profile', path: '/app/profile', icon: 'person-outline', selectedIcon: 'person' },
];
const managementTabs: Tab[] = [
  { label: 'Home', path: '/app', icon: 'grid-outline', selectedIcon: 'grid' },
  { label: 'Missions', path: '/app/missions', icon: 'compass-outline', selectedIcon: 'compass' },
  { label: 'Comms', path: '/app/communications', icon: 'chatbox-ellipses-outline', selectedIcon: 'chatbox-ellipses' },
  { label: 'My Day', path: '/app/my-day', icon: 'today-outline', selectedIcon: 'today' },
];

// The website remains the source of truth for data, auth, role access and pages.
// Inside this installed app only, its duplicate mobile chrome is replaced by native UI.
const mobileChrome = `
  (function () {
    var css = '@media (max-width: 760px) {' +
      '.mobile-bar, .mobile-workspace-nav, .mobile-workspace-mode { display: none !important; }' +
      '.app-main { padding-bottom: 18px !important; }' +
      '.fielded-chat-launcher { bottom: 18px !important; }' +
      '.fielded-chat-dialog { margin-bottom: 12px !important; max-height: calc(100dvh - 30px) !important; }' +
      '.conversation-page { height: calc(100dvh - 170px); min-height: 360px; }' +
      '.page { padding-bottom: 32px; }' +
    '}';
    var style = document.getElementById('fielded-native-mobile-chrome');
    if (!style) {
      style = document.createElement('style');
      style.id = 'fielded-native-mobile-chrome';
      (document.head || document.documentElement).appendChild(style);
    }
    style.textContent = css;
  })();
  true;
`;

const workspaceBridge = `
  (function () {
    if (window.__fieldedNativeBridge) return;
    window.__fieldedNativeBridge = true;
    var previous = '';
    var timer;
    function send() {
      var frame = document.querySelector('.app-frame');
      var roleClass = frame && Array.from(frame.classList).find(function (name) { return name.indexOf('role-') === 0; });
      var payload = JSON.stringify({
        type: 'fielded-state',
        role: roleClass ? roleClass.slice(5) : null,
        organisation: (document.querySelector('.sidebar-organisation strong') || {}).textContent || '',
        path: location.pathname,
        company: !!document.querySelector('.sidebar .primary-nav a[href="/app/company"]')
      });
      if (payload !== previous && window.ReactNativeWebView) {
        previous = payload;
        window.ReactNativeWebView.postMessage(payload);
      }
    }
    function schedule() { clearTimeout(timer); timer = setTimeout(send, 100); }
    ['pushState', 'replaceState'].forEach(function (method) {
      var original = history[method];
      history[method] = function () { var result = original.apply(this, arguments); schedule(); return result; };
    });
    window.addEventListener('popstate', schedule);
    new MutationObserver(schedule).observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
    send();
  })();
  true;
`;

function isActive(path: string, tab: Tab) {
  if (tab.path === '/app') return path === '/app';
  if (tab.path === '/app/missions') return ['/app/missions', '/app/intelligence', '/app/investigations', '/app/publishing', '/app/follow-ups'].some(base => path === base || path.startsWith(`${base}/`));
  if (tab.path === '/app/updates') return path.startsWith('/app/updates') || path.startsWith('/app/communications/respond');
  return path === tab.path || path.startsWith(`${tab.path}/`);
}

function isMyWork(path: string) {
  return ['/app/my-day', '/app/conversations', '/app/updates', '/app/communications/respond', '/app/profile', '/app/suggestions', '/app/concerns', '/app/settings'].some(base => path === base || path.startsWith(`${base}/`));
}

export default function App() {
  const webView = useRef<WebView>(null);
  const [canGoBack, setCanGoBack] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [workspace, setWorkspace] = useState<WorkspaceState>({ role: null, organisation: '', path: '/app', company: false });

  const signedIn = !!workspace.role && (workspace.path === '/app' || workspace.path.startsWith('/app/'));
  const management = signedIn && workspace.role !== 'participant';
  const tabs = !management || isMyWork(workspace.path) ? myWorkTabs : managementTabs;

  const goBack = useCallback(() => {
    if (menuVisible) {
      setMenuVisible(false);
      return true;
    }
    if (canGoBack) {
      webView.current?.goBack();
      return true;
    }
    // Returning false exits the app and can reveal Chrome behind it.
    // Keep the user in Fielded when the web history has no previous entry.
    if (signedIn && workspace.path !== '/app') {
      webView.current?.injectJavaScript(`window.location.replace(${JSON.stringify(WORKSPACE_URL)}); true;`);
    }
    return true;
  }, [canGoBack, menuVisible, signedIn, workspace.path]);

  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', goBack);
    return () => subscription.remove();
  }, [goBack]);

  const reload = () => {
    setError(null);
    setLoading(true);
    webView.current?.reload();
  };

  const handleNavigation = (navigation: WebViewNavigation) => {
    setCanGoBack(navigation.canGoBack);
    try {
      const path = new URL(navigation.url).pathname;
      setWorkspace(current => ({ ...current, path, role: path.startsWith('/app') ? current.role : null }));
    } catch { /* Ignore transient about:blank navigation. */ }
  };

  const navigate = (path: string) => {
    setMenuVisible(false);
    webView.current?.injectJavaScript(`
      (function () {
        var path = ${JSON.stringify(path)};
        var link = Array.from(document.querySelectorAll('a[href]')).find(function (item) { return item.getAttribute('href') === path; });
        if (link) link.click(); else window.location.assign(${JSON.stringify(APP_ORIGIN)} + path);
      })(); true;
    `);
  };

  const signOut = () => {
    setMenuVisible(false);
    webView.current?.injectJavaScript(`
      (function () {
        var form = document.querySelector('.sidebar-bottom form');
        if (!form) form = Array.from(document.querySelectorAll('form')).find(function (item) {
          return /sign out/i.test(item.textContent || '');
        });
        if (form) form.requestSubmit();
      })(); true;
    `);
  };

  const menuItem = (label: string, icon: IconName, action: () => void, danger = false) => (
    <Pressable key={label} style={styles.sheetItem} onPress={action} accessibilityRole="button">
      <Ionicons name={icon} size={21} color={danger ? '#b33838' : '#35504b'} />
      <Text style={[styles.sheetItemText, danger && styles.dangerText]}>{label}</Text>
      <Ionicons name="chevron-forward" size={17} color="#a2b0ac" />
    </Pressable>
  );

  return (
    <RootView style={styles.safeArea}>
      <StatusBar style="dark" />
      {signedIn && (
        <View style={styles.header}>
          <View style={styles.brandBlock}>
            <View style={styles.brandMark}><Text style={styles.brandMarkText}>F</Text></View>
            <View style={styles.brandCopy}>
              <Text style={styles.brandName}>Fielded</Text>
              {!!workspace.organisation && <Text style={styles.organisation} numberOfLines={1}>{workspace.organisation.trim()}</Text>}
            </View>
          </View>
          <Pressable onPress={() => setMenuVisible(true)} accessibilityLabel="Open workspace menu" style={styles.avatarButton}>
            <Ionicons name="person-outline" size={19} color="#186a5b" />
          </Pressable>
        </View>
      )}

      <View style={styles.content}>
        <NativeWebView
          ref={webView}
          source={{ uri: WORKSPACE_URL }}
          originWhitelist={['https://*']}
          injectedJavaScriptBeforeContentLoaded={mobileChrome}
          injectedJavaScript={`${mobileChrome}\n${workspaceBridge}`}
          onMessage={({ nativeEvent }) => {
            try {
              const state = JSON.parse(nativeEvent.data);
              if (state.type === 'fielded-state' && typeof state.path === 'string') {
                setWorkspace({ role: state.role || null, organisation: state.organisation || '', path: state.path, company: !!state.company });
              }
            } catch { /* Other web messages are not native navigation state. */ }
          }}
          onNavigationStateChange={handleNavigation}
          onLoadStart={() => { setLoading(true); setError(null); }}
          onLoadEnd={() => setLoading(false)}
          onError={({ nativeEvent }) => { setLoading(false); setError(nativeEvent.description || 'Could not reach Fielded.'); }}
          onHttpError={({ nativeEvent }) => {
            if (nativeEvent.statusCode >= 500 && nativeEvent.url.startsWith(WORKSPACE_URL)) {
              setLoading(false);
              setError(`The workspace returned an error (${nativeEvent.statusCode}).`);
            }
          }}
          onShouldStartLoadWithRequest={({ url }) => {
            if (url.startsWith(`${APP_ORIGIN}/`) || url === APP_ORIGIN || url === 'about:blank') return true;
            if (/^(https?:|mailto:|tel:)/i.test(url)) Linking.openURL(url).catch(() => {});
            return false;
          }}
          onOpenWindow={({ nativeEvent }) => {
            const targetUrl = nativeEvent.targetUrl;
            if (!targetUrl) return;
            try {
              if (new URL(targetUrl).origin === APP_ORIGIN) {
                webView.current?.injectJavaScript(`window.location.assign(${JSON.stringify(targetUrl)}); true;`);
                return;
              }
            } catch { /* Ignore malformed popup URLs. */ }
            if (/^(https?:|mailto:|tel:)/i.test(targetUrl)) Linking.openURL(targetUrl).catch(() => {});
          }}
          sharedCookiesEnabled
          thirdPartyCookiesEnabled
          domStorageEnabled
          javaScriptEnabled
          allowsBackForwardNavigationGestures
          pullToRefreshEnabled
          style={styles.webView}
        />

        {loading && !error && (
          <View style={styles.loading} pointerEvents="none">
            <View style={styles.loadingMark}><Text style={styles.loadingMarkText}>F</Text></View>
            <ActivityIndicator color="#0f766e" size="small" />
            <Text style={styles.loadingText}>Opening Fielded…</Text>
          </View>
        )}

        {error && (
          <View style={styles.error}>
            <Ionicons name="cloud-offline-outline" size={36} color="#0f766e" />
            <Text style={styles.errorTitle}>Workspace unavailable</Text>
            <Text style={styles.errorText}>{error}</Text>
            <Pressable onPress={reload} style={styles.retryButton}>
              <Text style={styles.retryText}>Try again</Text>
            </Pressable>
          </View>
        )}
      </View>

      {signedIn && (
        <View style={styles.tabBar} accessibilityRole="tablist">
          {tabs.map(tab => {
            const active = isActive(workspace.path, tab);
            return <Pressable key={tab.path} onPress={() => navigate(tab.path)} accessibilityRole="tab" accessibilityState={{ selected: active }} style={styles.tab}>
              <Ionicons name={active ? tab.selectedIcon : tab.icon} size={23} color={active ? '#0f766e' : '#7b8d89'} />
              <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{tab.label}</Text>
            </Pressable>;
          })}
          <Pressable onPress={() => setMenuVisible(true)} accessibilityRole="tab" accessibilityLabel="More" style={styles.tab}>
            <Ionicons name="ellipsis-horizontal-circle-outline" size={23} color="#7b8d89" />
            <Text style={styles.tabLabel}>More</Text>
          </Pressable>
        </View>
      )}

      <Modal visible={menuVisible} transparent animationType="slide" onRequestClose={() => setMenuVisible(false)}>
        <View style={styles.modalRoot}>
          <Pressable style={styles.menuBackdrop} onPress={() => setMenuVisible(false)} accessibilityLabel="Close menu" />
          <View style={styles.sheet}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetEyebrow}>YOUR WORKSPACE</Text>
            <Text style={styles.sheetTitle}>{workspace.organisation.trim() || 'Fielded'}</Text>
            {management && menuItem('Management dashboard', 'grid-outline', () => navigate('/app'))}
            {menuItem('My work', 'today-outline', () => navigate('/app/my-day'))}
            {workspace.company && menuItem('Company', 'business-outline', () => navigate('/app/company'))}
            {menuItem('My profile', 'person-outline', () => navigate('/app/profile'))}
            {menuItem('Settings', 'settings-outline', () => navigate('/app/settings'))}
            <View style={styles.sheetDivider} />
            {menuItem('Refresh workspace', 'refresh-outline', () => { setMenuVisible(false); reload(); })}
            {menuItem('Sign out', 'log-out-outline', signOut, true)}
          </View>
        </View>
      </Modal>
    </RootView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff', paddingTop: Platform.OS === 'android' ? NativeStatusBar.currentHeight || 32 : 0 },
  header: { height: 60, paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#fff', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#dce5e1' },
  brandBlock: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  brandMark: { width: 35, height: 35, borderRadius: 10, backgroundColor: '#123f37', alignItems: 'center', justifyContent: 'center' },
  brandMarkText: { color: '#fff', fontSize: 24, fontWeight: '800', lineHeight: 29 },
  brandCopy: { flex: 1 },
  brandName: { color: '#172923', fontSize: 18, fontWeight: '700', letterSpacing: -0.5 },
  organisation: { color: '#698078', fontSize: 11, marginTop: 1 },
  avatarButton: { width: 39, height: 39, borderRadius: 20, backgroundColor: '#e7f3ef', alignItems: 'center', justifyContent: 'center' },
  content: { flex: 1, backgroundColor: '#f6f8f7' },
  webView: { flex: 1, backgroundColor: '#f6f8f7' },
  loading: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: '#f6f8f7', alignItems: 'center', justifyContent: 'center', gap: 13 },
  loadingMark: { width: 54, height: 54, borderRadius: 16, backgroundColor: '#123f37', alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  loadingMarkText: { color: '#fff', fontSize: 37, fontWeight: '800', lineHeight: 45 },
  loadingText: { color: '#607870', fontSize: 13 },
  error: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: '#f6f8f7', padding: 28, justifyContent: 'center', alignItems: 'flex-start' },
  errorTitle: { color: '#172923', fontSize: 27, fontWeight: '700', marginTop: 16 },
  errorText: { color: '#607870', fontSize: 14, lineHeight: 21, marginTop: 12 },
  retryButton: { marginTop: 28, paddingHorizontal: 20, paddingVertical: 13, backgroundColor: '#0f766e', borderRadius: 10 },
  retryText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  tabBar: { height: 63, flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#dce5e1', paddingHorizontal: 4 },
  tab: { flex: 1, height: 58, alignItems: 'center', justifyContent: 'center', gap: 4 },
  tabLabel: { color: '#7b8d89', fontSize: 10, fontWeight: '600' },
  tabLabelActive: { color: '#0f766e', fontWeight: '800' },
  modalRoot: { flex: 1, justifyContent: 'flex-end' },
  menuBackdrop: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: 'rgba(15, 32, 29, .42)' },
  sheet: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingTop: 10, paddingHorizontal: 22, paddingBottom: Platform.OS === 'ios' ? 34 : 22 },
  sheetHandle: { alignSelf: 'center', width: 36, height: 4, borderRadius: 2, backgroundColor: '#c9d5d0', marginBottom: 24 },
  sheetEyebrow: { color: '#0f766e', fontSize: 10, fontWeight: '800', letterSpacing: 1.4 },
  sheetTitle: { color: '#172923', fontSize: 24, fontWeight: '700', marginTop: 5, marginBottom: 19 },
  sheetItem: { minHeight: 51, flexDirection: 'row', alignItems: 'center', gap: 15 },
  sheetItemText: { flex: 1, color: '#243a33', fontSize: 15, fontWeight: '500' },
  dangerText: { color: '#b33838' },
  sheetDivider: { height: StyleSheet.hairlineWidth, backgroundColor: '#dce5e1', marginVertical: 9 },
});
