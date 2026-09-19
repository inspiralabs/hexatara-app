'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { updatePenawaranStatusAction } from './penawaran-actions';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Database } from '@/types/database';

type StatusLead = Database['public']['Enums']['status_lead'];

const OPTIONS: { value: StatusLead; label: string }[] = [
  { value: 'baru', label: 'Baru' },
  { value: 'dihubungi', label: 'Dihubungi' },
  { value: 'selesai', label: 'Selesai' },
];

// Bebas pilih, tidak dipaksa maju-saja — PRD cuma minta diperbarui manual,
// tidak minta validasi transisi. Kalau Admin salah klik, select bebas lebih
// simpel daripada membangun mesin status yang tidak diminta.
export function PenawaranStatusSelect({
  id,
  statusSaatIni,
}: {
  id: number;
  statusSaatIni: StatusLead;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function ubah(status: StatusLead | null) {
    if (!status) return;
    startTransition(async () => {
      const hasil = await updatePenawaranStatusAction(id, status);
      if (!hasil.ok) {
        toast.error(hasil.pesan);
        return;
      }
      toast.success('Status permintaan penawaran berhasil diubah.');
      router.refresh();
    });
  }

  return (
    <Select value={statusSaatIni} onValueChange={ubah} disabled={pending}>
      <SelectTrigger className="h-9 w-36">
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
