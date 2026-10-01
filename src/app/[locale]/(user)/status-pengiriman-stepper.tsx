import { CheckIcon } from 'lucide-react';
import type { Database } from '@/types/database';

type StatusKirim = Database['public']['Enums']['status_kirim'];

const LANGKAH = ['belum_diproses', 'diproses', 'dikirim', 'diterima'] as const;

const LABEL: Record<(typeof LANGKAH)[number], string> = {
  belum_diproses: 'Belum Diproses',
  diproses: 'Diproses',
  dikirim: 'Dikirim',
  diterima: 'Diterima',
};

export function StatusPengirimanStepper({ status }: { status: StatusKirim }) {
  const aktif = LANGKAH.indexOf(status as (typeof LANGKAH)[number]);
  return (
    <ol className="flex gap-3 overflow-x-auto pb-1">
      {LANGKAH.map((langkah, i) => {
        const lewat = aktif >= 0 && i <= aktif;
        return (
          <li key={langkah} className="flex min-w-36 flex-1 items-center gap-2">
            <span
              className={
                lewat
                  ? 'inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white'
                  : 'inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-sm text-muted-foreground'
              }
            >
              {aktif >= 0 && i < aktif ? <CheckIcon className="size-4" aria-hidden /> : i + 1}
            </span>
            <span className={lewat ? 'text-sm font-medium text-foreground' : 'text-sm text-muted-foreground'}>
              {LABEL[langkah]}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
