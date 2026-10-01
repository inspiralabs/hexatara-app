import { DetailPesananMerch, type KartuMerch } from './kartu-pesanan-merch';

export function PesananSelesai({ rows }: { rows: KartuMerch[] }) {
  if (rows.length === 0) return null;
  return (
    <section className="mt-6">
      <h2 className="text-base font-semibold text-foreground">Pesanan selesai</h2>
      <ul className="mt-3 flex flex-col gap-2">
        {rows.map((row) => (
          <li key={row.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border px-4 py-3 text-sm">
            <div>
              <p className="font-medium text-foreground">{row.tanggal}</p>
              <p className="mt-1 text-muted-foreground">{row.items.map((item) => `${item.nama} × ${item.qty}`).join(', ') || '—'}</p>
            </div>
            <DetailPesananMerch row={row} />
          </li>
        ))}
      </ul>
    </section>
  );
}
