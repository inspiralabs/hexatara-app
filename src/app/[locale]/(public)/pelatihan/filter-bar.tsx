'use client';

import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { useRouter, usePathname } from '@/i18n/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SORT_VALUES, type PelatihanSort } from './sort-options';

const STATUS_VALUES = ['upcoming', 'open', 'closed'] as const;
const ALL_VALUE = 'semua';

export function FilterBar({
  kategoriOptions,
  kategoriValue,
  statusValue,
  sortValue,
}: {
  kategoriOptions: { value: string; label: string }[];
  kategoriValue?: string;
  statusValue?: string;
  sortValue: PelatihanSort;
}) {
  const t = useTranslations('pelatihan');
  const tBatch = useTranslations('batch');
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function update(key: 'kategori' | 'status' | 'sort', value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== ALL_VALUE) params.set(key, value);
    else params.delete(key);
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  const kategoriItems = [{ value: ALL_VALUE, label: t('semua') }, ...kategoriOptions];
  const statusItems = [
    { value: ALL_VALUE, label: t('semua') },
    ...STATUS_VALUES.map((s) => ({ value: s, label: tBatch(`status.${s}`) })),
  ];
  const sortItems = SORT_VALUES.map((s) => ({ value: s, label: t(`sort.${s}`) }));

  return (
    <div className="flex flex-col gap-3 md:flex-row md:flex-wrap md:items-center">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-muted-foreground">{t('filterKategoriLabel')}</span>
        <Select
          items={kategoriItems}
          value={kategoriValue ?? ALL_VALUE}
          onValueChange={(v: string | null) => update('kategori', v)}
        >
          <SelectTrigger className="h-11 w-full sm:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {kategoriItems.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-muted-foreground">{t('filterStatusLabel')}</span>
        <Select
          items={statusItems}
          value={statusValue ?? ALL_VALUE}
          onValueChange={(v: string | null) => update('status', v)}
        >
          <SelectTrigger className="h-11 w-full sm:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {statusItems.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2 md:ml-auto">
        <Select items={sortItems} value={sortValue} onValueChange={(v: string | null) => update('sort', v)}>
          <SelectTrigger className="h-11 w-full sm:w-56">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {sortItems.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
