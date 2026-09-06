'use client';

import { useState } from 'react';
import { format, parse } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

// Nilai disimpan sebagai string "yyyy-MM-dd" (format tanggal Postgres), bukan
// objek Date — konsisten dari form sampai Server Action, tanpa konversi di batas apa pun.
export function DatePickerField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string | null;
  onChange: (value: string | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const selected = value ? parse(value, 'yyyy-MM-dd', new Date()) : undefined;

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-warna-teks">{label}</span>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger className="flex h-11 items-center gap-2 rounded-lg border border-warna-latar-2 px-3 text-left text-sm text-warna-teks">
          <CalendarIcon className="size-4 text-warna-teks-2" aria-hidden="true" />
          {selected ? format(selected, 'd MMMM yyyy', { locale: localeId }) : 'Pilih tanggal'}
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            mode="single"
            locale={localeId}
            selected={selected}
            onSelect={(date) => {
              onChange(date ? format(date, 'yyyy-MM-dd') : null);
              setOpen(false);
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
