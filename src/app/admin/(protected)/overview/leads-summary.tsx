import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';

export type StatusCount = { key: string; label: string; count: number };

export type LeadsSummaryProps = {
  pendaftaran: { total: number; items: StatusCount[] };
  penawaran: { total: number; items: StatusCount[] };
};

function formatAngka(n: number) {
  return n.toLocaleString('id-ID');
}

function SummaryCard({
  title,
  description,
  total,
  items,
}: {
  title: string;
  description: string;
  total: number;
  items: StatusCount[];
}) {
  return (
    <Card size="sm">
      <CardHeader className="space-y-1">
        <CardDescription>{title}</CardDescription>
        <div className="mt-1 text-3xl font-semibold tracking-tight tabular-nums text-foreground">
          {formatAngka(total)}
        </div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2 pt-0">
        {items.map((item) => (
          <span
            key={item.key}
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-muted/40 px-2 py-1 text-xs"
          >
            <span className="text-muted-foreground">{item.label}</span>
            <span className="font-semibold tabular-nums text-foreground">{formatAngka(item.count)}</span>
          </span>
        ))}
      </CardContent>
    </Card>
  );
}

export function LeadsSummary({ pendaftaran, penawaran }: LeadsSummaryProps) {
  return (
    <section className="flex flex-col gap-3">
      <div>
        <h2 className="text-sm font-medium text-foreground">Ringkasan Leads</h2>
        <p className="text-xs text-muted-foreground">Total seluruh waktu, dipecah per sumber dan status.</p>
      </div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <SummaryCard
          title="Pendaftaran Batch"
          description="Semua baris di Pendaftaran Batch"
          total={pendaftaran.total}
          items={pendaftaran.items}
        />
        <SummaryCard
          title="Permintaan Penawaran"
          description="Semua baris di Permintaan Penawaran"
          total={penawaran.total}
          items={penawaran.items}
        />
      </div>
    </section>
  );
}
