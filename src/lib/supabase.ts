import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Retrieve active credentials from localStorage (if configured via Admin Panel) or .env fallback
export function getActiveSupabaseCredentials(): { url: string; anonKey: string } {
  try {
    const customUrl = localStorage.getItem('gs_supabase_url');
    const customKey = localStorage.getItem('gs_supabase_anon_key');
    if (customUrl && customKey) {
      return { url: customUrl.trim(), anonKey: customKey.trim() };
    }
  } catch {}

  return {
    url: (import.meta.env.VITE_SUPABASE_URL || '').trim(),
    anonKey: (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim(),
  };
}

const { url: initialUrl, anonKey: initialAnonKey } = getActiveSupabaseCredentials();

export function checkIsSupabaseConfigured(url: string, key: string): boolean {
  return Boolean(
    url &&
    key &&
    url.startsWith('https://') &&
    !url.includes('your-project-id') &&
    key.length > 20
  );
}

export let isSupabaseConfigured = checkIsSupabaseConfigured(initialUrl, initialAnonKey);

export let supabase: SupabaseClient<any, 'public', any> | null = null;

export function initSupabaseClient(url: string, anonKey: string): SupabaseClient | null {
  if (!checkIsSupabaseConfigured(url, anonKey)) {
    isSupabaseConfigured = false;
    supabase = null;
    return null;
  }

  try {
    supabase = createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
    isSupabaseConfigured = true;
    return supabase;
  } catch (err) {
    console.warn('Failed to initialize Supabase client:', err);
    supabase = null;
    isSupabaseConfigured = false;
    return null;
  }
}

// Initial client initialization
initSupabaseClient(initialUrl, initialAnonKey);

// Save credentials from Admin Panel UI
export function saveSupabaseCredentials(url: string, key: string): { success: boolean; message: string } {
  try {
    const cleanUrl = url.trim();
    const cleanKey = key.trim();

    if (!cleanUrl || !cleanKey) {
      localStorage.removeItem('gs_supabase_url');
      localStorage.removeItem('gs_supabase_anon_key');
      initSupabaseClient('', '');
      return { success: true, message: 'Supabase credentials cleared. Using local storage mode.' };
    }

    if (!cleanUrl.startsWith('https://')) {
      return { success: false, message: 'URL must start with https://' };
    }

    if (cleanKey.length < 20) {
      return { success: false, message: 'Anon Key appears too short (must be > 20 characters)' };
    }

    localStorage.setItem('gs_supabase_url', cleanUrl);
    localStorage.setItem('gs_supabase_anon_key', cleanKey);
    const newClient = initSupabaseClient(cleanUrl, cleanKey);

    if (newClient) {
      return { success: true, message: 'Supabase connected successfully!' };
    } else {
      return { success: false, message: 'Failed to create Supabase client with provided credentials' };
    }
  } catch (e: any) {
    return { success: false, message: e.message || 'Error saving Supabase settings' };
  }
}
