'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { updateStatusPengirimanAction } from './actions';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Database } from '@/types/database';

type StatusKirim = Database['public']['Enums']['status_kirim'];

const OPTIONS: { value: StatusKirim; label: string }[] = [
  { value: 'belum_diproses', label: 'Belum Diproses' },
  { value: 'diproses', label: 'Diproses' },
  { value: 'dikirim', label: 'Dikirim' },
  { value: 'diterima', label: 'Diterima' },
];

// Bebas pilih, tidak dipaksa maju-saja — PRD cuma minta "diperbarui manual",
// tidak minta validasi transisi. Kalau Admin salah klik, select bebas lebih
// simpel daripada membangun mesin status yang tidak diminta.
export function StatusPengirimanSelect({
  orderId,
  statusSaatIni,
}: {
  orderId: number;
  statusSaatIni: StatusKirim;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function ubah(status: StatusKirim | null) {
    if (!status) return;
    startTransition(async () => {
      await updateStatusPengirimanAction(orderId, status);
      router.refresh();
    });
  }

  return (
    <Select value={statusSaatIni} onValueChange={ubah} disabled={pending}>
      <SelectTrigger className="h-9 w-40">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {OPTIONS.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
