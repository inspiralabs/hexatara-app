const LABEL: Record<string, string> = {
  menunggu_bukti: 'Menunggu bukti',
  menunggu_verifikasi: 'Menunggu verifikasi',
  disetujui: 'Disetujui',
  ditolak: 'Ditolak',
};

export type RiwayatMerch = { id: number; tanggal: string; status: string; produk: string };

export function RiwayatPesananMerchandise({ rows }: { rows: RiwayatMerch[] }) {
  if (rows.length === 0) return null;
  return (
    <section className="mt-6">
      <h2 className="text-base font-semibold text-foreground">Riwayat Pesanan Merchandise</h2>
      <ul className="mt-3 flex flex-col gap-2">
        {rows.map((row) => (
          <li key={row.id} className="rounded-lg border border-border px-4 py-3 text-sm">
            <p className="font-medium text-foreground">
              {row.tanggal} · {LABEL[row.status] ?? row.status}
            </p>
            <p className="mt-1 text-muted-foreground">{row.produk || '—'}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
