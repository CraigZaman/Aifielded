import 'react-native-url-polyfill/auto';

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { AppState } from 'react-native';

const projectUrl = process.env.EXPO_PUBLIC_SUPABASE_URL?.trim();
const publishableKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();
export const apiOrigin = process.env.EXPO_PUBLIC_API_ORIGIN?.trim().replace(/\/$/, '');

export const apiConfigured = !!projectUrl && !!publishableKey && !!apiOrigin;

// Sessions can be larger than SecureStore's historically safe per-value size.
// Store them in encrypted 1.8 KB pieces and write the count last.
const storage = {
  async getItem(key: string) {
    const count = Number(await SecureStore.getItemAsync(`${key}.count`));
    if (!Number.isInteger(count) || count < 1 || count > 100) return null;
    const pieces = await Promise.all(Array.from({ length: count }, (_, index) => SecureStore.getItemAsync(`${key}.${index}`)));
    return pieces.some(piece => piece == null) ? null : pieces.join('');
  },
  async setItem(key: string, value: string) {
    const previous = Number(await SecureStore.getItemAsync(`${key}.count`)) || 0;
    const pieces = value.match(/[\s\S]{1,1800}/g) || [''];
    await Promise.all(pieces.map((piece, index) => SecureStore.setItemAsync(`${key}.${index}`, piece)));
    await SecureStore.setItemAsync(`${key}.count`, String(pieces.length));
    await Promise.all(Array.from({ length: Math.max(0, previous - pieces.length) }, (_, offset) => SecureStore.deleteItemAsync(`${key}.${pieces.length + offset}`)));
  },
  async removeItem(key: string) {
    const count = Number(await SecureStore.getItemAsync(`${key}.count`)) || 0;
    await SecureStore.deleteItemAsync(`${key}.count`);
    await Promise.all(Array.from({ length: count }, (_, index) => SecureStore.deleteItemAsync(`${key}.${index}`)));
  },
};

export const supabase: SupabaseClient | null = apiConfigured
  ? createClient(projectUrl!, publishableKey!, {
      auth: { storage, autoRefreshToken: true, persistSession: true, detectSessionInUrl: false },
    })
  : null;

if (supabase) {
  AppState.addEventListener('change', state => {
    if (state === 'active') supabase.auth.startAutoRefresh();
    else supabase.auth.stopAutoRefresh();
  });
}
