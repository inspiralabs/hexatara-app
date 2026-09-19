'use client';

import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CHART_COBALT } from './chart-colors';

export type PieSlice = {
  key: string;
  name: string;
  value: number;
  /** Index 0–5 ke palet cobalt; diisi di page.tsx */
  colorIndex: number;
};

export function LeadsStatusPie({ data }: { data: PieSlice[] }) {
  const aktif = data.filter((d) => d.value > 0);
  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Distribusi status leads</CardTitle>
        <CardDescription>
          Enam potongan: 3 status Pendaftaran Batch + 3 status Permintaan Penawaran.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-64 w-full min-w-0 sm:h-72">
          {total === 0 ? (
            <p className="flex h-full items-center justify-center text-sm text-muted-foreground">
              Belum ada data leads.
            </p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={aktif}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="45%"
                  innerRadius="45%"
                  outerRadius="70%"
                  paddingAngle={2}
                >
                  {aktif.map((entry) => (
                    <Cell
                      key={entry.key}
                      fill={CHART_COBALT[entry.colorIndex % CHART_COBALT.length]}
                      stroke="var(--card)"
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: 8,
                    border: '1px solid var(--border)',
                    background: 'var(--popover)',
                    color: 'var(--popover-foreground)',
                    fontSize: 12,
                  }}
                  formatter={(value) => [Number(value).toLocaleString('id-ID'), 'Jumlah']}
                />
                <Legend
                  verticalAlign="bottom"
                  wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
