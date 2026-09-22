'use client';

import { useId } from 'react';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { useRouter, usePathname } from '@/i18n/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SORT_VALUES, type ProdukSort } from './sort-options';

const ALL_VALUE = 'semua';
/** Beat SelectTrigger data-[size=default]:h-8 (32px) → PRD §12.3 min 44px */
const TRIGGER_H = 'h-11 min-h-11 data-[size=default]:h-11';

export function FilterBar({
  kategoriOptions,
  kategoriValue,
  sortValue,
}: {
  kategoriOptions: { value: string; label: string }[];
  kategoriValue?: string;
  sortValue: ProdukSort;
}) {
  const t = useTranslations('catalog');
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const kategoriLabelId = useId();

  function update(key: 'kategori' | 'sort', value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== ALL_VALUE) params.set(key, value);
    else params.delete(key);
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  const kategoriItems = [{ value: ALL_VALUE, label: t('semua') }, ...kategoriOptions];
  const sortItems = SORT_VALUES.map((s) => ({ value: s, label: t(`sort.${s}`) }));

  return (
    <div className="flex flex-col gap-3 md:flex-row md:flex-wrap md:items-center">
      <div className="flex items-center gap-2">
        <span id={kategoriLabelId} className="text-sm font-medium text-muted-foreground">
          {t('filterKategoriLabel')}
        </span>
        <Select
          items={kategoriItems}
          value={kategoriValue ?? ALL_VALUE}
          onValueChange={(v: string | null) => update('kategori', v)}
        >
          <SelectTrigger
            className={`${TRIGGER_H} w-full sm:w-auto sm:min-w-48 sm:max-w-md`}
            aria-labelledby={kategoriLabelId}
          >
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

      <div className="flex items-center gap-2 md:ml-auto">
        <Select items={sortItems} value={sortValue} onValueChange={(v: string | null) => update('sort', v)}>
          <SelectTrigger
            className={`${TRIGGER_H} w-full sm:w-56`}
            aria-label={t('filterSortLabel')}
          >
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
