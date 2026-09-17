'use client';

import { useState } from 'react';
import { format, parse } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from 'cn';

// Nilai disimpan sebagai string "yyyy-MM-dd" (format tanggal Postgres), bukan
// objek Date — konsisten dari form sampai Server Action, tanpa konversi di batas apa pun.
export function DatePickerField({
  label,
  value,
  onChange,
  disabled,
  captionLayout = 'label',
  startMonth,
  endMonth,
  reverseYears,
  disableFuture,
}: {
  label: string;
  value: string | null;
  onChange: (value: string | null) => void;
  disabled?: boolean;
  /** `dropdown` = pilih bulan & tahun langsung (cocok untuk tanggal lahir). */
  captionLayout?: 'label' | 'dropdown' | 'dropdown-months' | 'dropdown-years';
  startMonth?: Date;
  endMonth?: Date;
  reverseYears?: boolean;
  disableFuture?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const selected = value ? parse(value, 'yyyy-MM-dd', new Date()) : undefined;
  const today = new Date();

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-foreground">{label}</span>
      <Popover open={open && !disabled} onOpenChange={(next) => setOpen(disabled ? false : next)}>
        <PopoverTrigger
          disabled={disabled}
          className={cn(
            'flex h-11 w-full items-center gap-2 rounded-lg border border-input bg-background px-3 text-left text-sm outline-none transition-colors',
            'hover:bg-muted focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50',
            'disabled:cursor-not-allowed disabled:opacity-50',
            !selected && 'text-muted-foreground',
          )}
        >
          <CalendarIcon className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          {selected ? format(selected, 'd MMMM yyyy', { locale: localeId }) : 'Pilih tanggal'}
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            mode="single"
            locale={localeId}
            captionLayout={captionLayout}
            reverseYears={reverseYears}
            startMonth={startMonth}
            endMonth={endMonth}
            defaultMonth={selected ?? endMonth ?? startMonth}
            selected={selected}
            disabled={disableFuture ? { after: today } : undefined}
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
