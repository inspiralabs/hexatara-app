'use client';

import { useMemo, useState } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export type MonthBucket = {
  /** YYYY-MM */
  key: string;
  label: string;
  total: number;
};

const PERIODE = [
  { value: '3', label: '3 bulan' },
  { value: '6', label: '6 bulan' },
  { value: '12', label: '12 bulan' },
] as const;

export function LeadsTrendChart({ data }: { data: MonthBucket[] }) {
  const [bulan, setBulan] = useState<'3' | '6' | '12'>('6');

  const sliced = useMemo(() => {
    const n = Number(bulan);
    return data.slice(-n);
  }, [data, bulan]);

  return (
    <Card>
      <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3">
        <div>
          <CardTitle>Tren lead</CardTitle>
          <CardDescription>Pendaftaran minat + permintaan penawaran per bulan</CardDescription>
        </div>
        <Select value={bulan} onValueChange={(v) => setBulan(v as '3' | '6' | '12')}>
          <SelectTrigger className="h-9 w-[8.5rem]" aria-label="Filter periode chart">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PERIODE.map((p) => (
              <SelectItem key={p.value} value={p.value}>
                {p.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <div className="h-56 w-full min-w-0 sm:h-72">
          {sliced.every((b) => b.total === 0) ? (
            <p className="flex h-full items-center justify-center text-sm text-muted-foreground">
              Belum ada lead pada periode ini.
            </p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sliced} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="leadFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--foreground)" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="var(--foreground)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  className="text-xs fill-muted-foreground"
                />
                <YAxis
                  allowDecimals={false}
                  width={32}
                  tickLine={false}
                  axisLine={false}
                  className="text-xs fill-muted-foreground"
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 8,
                    border: '1px solid var(--border)',
                    background: 'var(--popover)',
                    color: 'var(--popover-foreground)',
                    fontSize: 12,
                  }}
                  formatter={(value) => [Number(value), 'Lead']}
                />
                <Area
                  type="monotone"
                  dataKey="total"
                  name="Lead"
                  stroke="var(--foreground)"
                  fill="url(#leadFill)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
