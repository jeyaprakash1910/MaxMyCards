import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { getSupabaseEnv } from './env';

/**
 * Server client intended for **reads** in Server Components (middleware handles refresh).
 * If you need to set cookies (server actions / route handlers), add a mutable variant.
 */
export async function createSupabaseServerClient() {
  const { url, anonKey } = getSupabaseEnv();
  const cookieStore = await cookies();

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      // In Server Components, cookies are read-only; middleware keeps sessions fresh.
      setAll() {},
    },
  });
}

