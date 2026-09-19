import {
  InboxIcon,
  BadgeCheckIcon,
  CalendarDaysIcon,
  ClipboardListIcon,
  TrendingDownIcon,
  TrendingUpIcon,
  MinusIcon,
  type LucideIcon,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export type StatCardItem = {
  id: string;
  label: string;
  value: number;
  caption: string;
  icon: 'inbox' | 'clipboard' | 'badge' | 'calendar';
  /** Persen vs periode sebelumnya; null = tanpa badge delta */
  deltaPct: number | null;
};

const ICONS: Record<StatCardItem['icon'], LucideIcon> = {
  inbox: InboxIcon,
  clipboard: ClipboardListIcon,
  badge: BadgeCheckIcon,
  calendar: CalendarDaysIcon,
};

function formatAngka(n: number) {
  return n.toLocaleString('id-ID');
}

function DeltaBadge({ deltaPct }: { deltaPct: number }) {
  const flat = Math.abs(deltaPct) < 0.05;
  const up = deltaPct > 0;
  const Icon = flat ? MinusIcon : up ? TrendingUpIcon : TrendingDownIcon;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-medium',
        flat && 'bg-muted text-muted-foreground',
        !flat && up && 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
        !flat && !up && 'bg-red-500/10 text-red-700 dark:text-red-400'
      )}
    >
      <Icon className="size-3" aria-hidden />
      {flat ? '0%' : `${up ? '+' : ''}${deltaPct.toFixed(0)}%`}
    </span>
  );
}

export function StatCards({ items }: { items: StatCardItem[] }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => {
        const Icon = ICONS[item.icon];
        return (
          <Card key={item.id} size="sm">
            <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0">
              <div className="min-w-0">
                <CardDescription className="truncate">{item.label}</CardDescription>
                <CardTitle className="mt-1 text-4xl font-semibold tracking-tight tabular-nums sm:text-5xl">
                  {formatAngka(item.value)}
                </CardTitle>
              </div>
              <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                <Icon className="size-5" aria-hidden />
              </span>
            </CardHeader>
            <CardContent className="flex items-center gap-2 pt-0">
              {item.deltaPct != null ? <DeltaBadge deltaPct={item.deltaPct} /> : null}
              <p className="text-xs text-muted-foreground">{item.caption}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
