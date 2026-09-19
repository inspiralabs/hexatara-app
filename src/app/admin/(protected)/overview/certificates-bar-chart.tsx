'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CHART_COBALT_PRIMARY } from './chart-colors';

export type CertMonthBucket = {
  key: string;
  label: string;
  total: number;
};

export function CertificatesBarChart({ data }: { data: CertMonthBucket[] }) {
  const kosong = data.every((b) => b.total === 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sertifikat diterbitkan</CardTitle>
        <CardDescription>Jumlah per bulan (12 bulan terakhir)</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-64 w-full min-w-0 sm:h-72">
          {kosong ? (
            <p className="flex h-full items-center justify-center text-sm text-muted-foreground">
              Belum ada sertifikat pada periode ini.
            </p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
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
                  formatter={(value) => [Number(value).toLocaleString('id-ID'), 'Sertifikat']}
                />
                <Bar
                  dataKey="total"
                  name="Sertifikat"
                  fill={CHART_COBALT_PRIMARY}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
