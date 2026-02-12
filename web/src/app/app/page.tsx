import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { CreditCard } from '@/lib/types';
import { DashboardClient } from './DashboardClient';

export default async function AppHome() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Layout already redirects when user is missing, but keep this defensive.
  if (!user) {
    return null;
  }

  const { data, error } = await supabase
    .from('credit_cards')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    // Client component shows error state too; passing empty list is OK.
    console.error(error);
  }

  return <DashboardClient initialCards={((data ?? []) as CreditCard[]) ?? []} />;
}

