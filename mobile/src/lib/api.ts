import { apiOrigin, supabase } from './supabase';

export class ApiError extends Error {
  saved: boolean;
  constructor(message: string, saved = false) { super(message); this.saved = saved; }
}

async function apiRequest<T>(method: 'POST' | 'DELETE', path: string, body?: unknown, timeoutMs = 70000): Promise<T> {
  if (!supabase || !path.startsWith('/api/')) throw new ApiError('The API is not configured.');
  const { data, error } = await supabase.auth.getSession();
  if (error || !data.session?.access_token) throw new ApiError('Please sign in again.');
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(`${apiOrigin}${path}`, {
      method,
      headers: { Authorization: `Bearer ${data.session.access_token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body || {}),
      signal: controller.signal,
    });
    if (response.redirected || !response.headers.get('content-type')?.includes('application/json')) {
      throw new ApiError('This server has not enabled the native API response yet. Please ask the Fielded deployment owner to publish the mobile backend changes.');
    }
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new ApiError(payload.error || `The request failed (${response.status}).`, payload.saved === true);
    return payload as T;
  } catch (cause) {
    if (cause instanceof ApiError) throw cause;
    throw new ApiError(cause instanceof Error && cause.name === 'AbortError' ? 'The request timed out. Refresh before trying again.' : 'Connection interrupted. Refresh before trying again.');
  } finally { clearTimeout(timeout); }
}

export function apiPost<T>(path: string, body?: unknown, timeoutMs?: number): Promise<T> {
  return apiRequest('POST', path, body, timeoutMs);
}

export function apiDelete<T>(path: string, body?: unknown, timeoutMs?: number): Promise<T> {
  return apiRequest('DELETE', path, body, timeoutMs);
}
