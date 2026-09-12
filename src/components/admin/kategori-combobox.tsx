'use client';

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@/components/ui/combobox';

export type KategoriOption = { value: string; label: string };

export function KategoriCombobox({
  items,
  value,
  onChange,
  placeholder = 'Cari kategori…',
}: {
  items: KategoriOption[];
  value: string | null | undefined;
  onChange: (value: string | null) => void;
  placeholder?: string;
}) {
  return (
    <Combobox
      items={items}
      value={value ?? null}
      onValueChange={(v) => onChange(v)}
      itemToStringLabel={(v) => items.find((item) => item.value === v)?.label ?? ''}
    >
      <ComboboxInput placeholder={placeholder} showClear className="w-full" />
      <ComboboxContent>
        <ComboboxEmpty>Kategori tidak ditemukan.</ComboboxEmpty>
        <ComboboxList>
          {(item: KategoriOption) => (
            <ComboboxItem key={item.value} value={item.value}>
              {item.label}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}
