'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { ReorderButtons } from '@/components/admin/reorder-buttons';
import { moveItem } from '@/lib/reorder';
import { ProdukRowActions } from './produk-row-actions';
import { reorderProdukAction } from './actions';

function formatRupiah(nilai: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(nilai);
}

export type ProdukRow = {
  id: number;
  nama_id: string;
  kategori: string | null;
  harga: number | null;
  tampilkan_harga: boolean;
  is_active: boolean;
  urutan: number;
};

export function ProdukTable({ produk }: { produk: ProdukRow[] }) {
  const router = useRouter();
  const [daftar, setDaftar] = useState(produk);
  const [cari, setCari] = useState('');
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDaftar(produk);
  }, [produk]);

  const terfilter = useMemo(() => {
    const q = cari.trim().toLowerCase();
    if (!q) return daftar;
    return daftar.filter((p) => p.nama_id.toLowerCase().includes(q));
  }, [daftar, cari]);

  // Reorder selalu terhadap daftar penuh (bukan hasil filter) agar index konsisten.
  function pindah(id: number, arah: 'up' | 'down') {
    const index = daftar.findIndex((p) => p.id === id);
    if (index < 0) return;
    const baru = moveItem(daftar, index, arah);
    if (baru === daftar) return;
    setDaftar(baru);
    startTransition(async () => {
      const hasil = await reorderProdukAction(baru.map((p) => p.id));
      if (!hasil.ok) {
        toast.error(hasil.pesan);
        setDaftar(daftar);
        return;
      }
      toast.success('Urutan produk berhasil diubah.');
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <Input
        value={cari}
        onChange={(e) => setCari(e.target.value)}
        placeholder="Cari nama produk..."
        className="max-w-sm"
        aria-label="Cari nama produk"
      />

      <div className="overflow-x-auto rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Urutan</TableHead>
              <TableHead>Nama</TableHead>
              <TableHead>Kategori</TableHead>
              <TableHead>Harga</TableHead>
              <TableHead>Aktif</TableHead>
              <TableHead className="text-right">
                <span className="sr-only">Aksi</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {terfilter.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  Belum ada produk.
                </TableCell>
              </TableRow>
            ) : (
              terfilter.map((row) => {
                const indexPenuh = daftar.findIndex((p) => p.id === row.id);
                return (
                  <TableRow key={row.id}>
                    <TableCell>
                      <ReorderButtons
                        label={row.nama_id}
                        disabledUp={indexPenuh <= 0 || pending || Boolean(cari.trim())}
                        disabledDown={
                          indexPenuh < 0 ||
                          indexPenuh >= daftar.length - 1 ||
                          pending ||
                          Boolean(cari.trim())
                        }
                        onUp={() => pindah(row.id, 'up')}
                        onDown={() => pindah(row.id, 'down')}
                      />
                    </TableCell>
                    <TableCell className="font-medium text-foreground">{row.nama_id}</TableCell>
                    <TableCell>{row.kategori ?? '—'}</TableCell>
                    <TableCell>
                      {row.tampilkan_harga
                        ? row.harga != null
                          ? formatRupiah(row.harga)
                          : '—'
                        : 'Tersembunyi'}
                    </TableCell>
                    <TableCell>{row.is_active ? 'Ya' : 'Tidak'}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end">
                        <ProdukRowActions id={row.id} nama={row.nama_id} />
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
