'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const ALL_VALUE = 'semua';

/** Filter batch via `?batch=` — server query, dipakai F08.1 + F08.2. */
export function AdminBatchFilter({
  options,
  value,
}: {
  options: { value: string; label: string }[];
  value?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const items = [{ value: ALL_VALUE, label: 'Semua Batch' }, ...options];

  function update(next: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (next && next !== ALL_VALUE) params.set('batch', next);
    else params.delete('batch');
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  return (
    <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
      <span className="shrink-0 text-sm font-medium text-muted-foreground">Batch</span>
      <Select
        items={items}
        value={value ?? ALL_VALUE}
        onValueChange={(v: string | null) => update(v)}
      >
        <SelectTrigger className="h-11 w-full sm:w-fit sm:max-w-[min(100%,40rem)] *:data-[slot=select-value]:line-clamp-none">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="w-max min-w-(--anchor-width) max-w-[min(100vw-2rem,40rem)]">
          {items.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
