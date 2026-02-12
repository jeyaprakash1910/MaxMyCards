'use client';

import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { CardForm, type CardFormValue } from '@/components/CardForm';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

export default function AddCardPage() {
  const router = useRouter();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [saving, setSaving] = useState(false);

  const initialValue: CardFormValue = {
    name: '',
    imageUrl: null,
    catalogId: null,
    cycleStartDay: 14,
    cycleEndDay: 13,
    dueDateDays: 21,
  };

  return (
    <CardForm
      title="Add Card"
      initialValue={initialValue}
      submitLabel="Save"
      submitting={saving}
      onSubmit={async (v) => {
        setSaving(true);
        try {
          const {
            data: { user },
          } = await supabase.auth.getUser();
          if (!user) {
            alert('Not signed in');
            return;
          }

          const { error } = await supabase.from('credit_cards').insert({
            user_id: user.id,
            name: v.name,
            image_url: v.imageUrl,
            catalog_id: v.catalogId,
            cycle_start_day: v.cycleStartDay,
            cycle_end_day: v.cycleEndDay,
            due_date_days: v.dueDateDays,
          });
          if (error) throw error;

          router.replace('/app');
          router.refresh();
        } catch (e: unknown) {
          const msg = e instanceof Error ? e.message : 'Failed to save';
          alert(msg);
        } finally {
          setSaving(false);
        }
      }}
    />
  );
}

