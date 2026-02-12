'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { CardForm, type CardFormValue } from '@/components/CardForm';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import type { CreditCard } from '@/lib/types';

export default function EditCardPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const router = useRouter();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [card, setCard] = useState<CreditCard | null>(null);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const { data, error } = await supabase.from('credit_cards').select('*').eq('id', id).single();
      if (error || !data) {
        alert('Card not found');
        router.replace('/app');
        router.refresh();
        return;
      }
      setCard(data as CreditCard);
      setLoading(false);
    })();
  }, [id, router, supabase]);

  if (loading || !card) {
    return (
      <div className="rounded-2xl border border-white/10 bg-[#16213e] p-8 text-slate-300">
        Loading…
      </div>
    );
  }

  const initialValue: CardFormValue = {
    name: card.name,
    imageUrl: card.image_url,
    catalogId: card.catalog_id,
    cycleStartDay: card.cycle_start_day,
    cycleEndDay: card.cycle_end_day,
    dueDateDays: card.due_date_days,
  };

  return (
    <CardForm
      title="Edit Card"
      initialValue={initialValue}
      submitLabel="Save"
      submitting={saving}
      onSubmit={async (v) => {
        if (!id) return;
        setSaving(true);
        try {
          const { error } = await supabase
            .from('credit_cards')
            .update({
              name: v.name,
              image_url: v.imageUrl,
              catalog_id: v.catalogId,
              cycle_start_day: v.cycleStartDay,
              cycle_end_day: v.cycleEndDay,
              due_date_days: v.dueDateDays,
            })
            .eq('id', id);
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
      onDelete={async () => {
        if (!id) return;
        const { error } = await supabase.from('credit_cards').delete().eq('id', id);
        if (error) {
          alert(error.message);
          return;
        }
        router.replace('/app');
        router.refresh();
      }}
    />
  );
}

