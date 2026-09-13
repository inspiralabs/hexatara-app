import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export type RecentLeadRow = {
  id: string;
  jenis: 'minat' | 'penawaran';
  nama: string;
  kontak: string;
  status: 'baru' | 'dihubungi' | 'selesai';
  created_at: string;
};

const LABEL_JENIS: Record<RecentLeadRow['jenis'], string> = {
  minat: 'Minat',
  penawaran: 'Penawaran',
};

const LABEL_STATUS: Record<RecentLeadRow['status'], string> = {
  baru: 'Baru',
  dihubungi: 'Dihubungi',
  selesai: 'Selesai',
};

function formatTanggal(iso: string) {
  return new Date(iso).toLocaleString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function RecentLeadsTable({ rows }: { rows: RecentLeadRow[] }) {
  return (
    <Card>
      <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-2">
        <div>
          <CardTitle>Aktivitas terbaru</CardTitle>
          <CardDescription>10 lead terakhir (minat & penawaran)</CardDescription>
        </div>
        <Link
          href="/admin/leads"
          className="text-sm font-medium text-foreground underline-offset-4 hover:underline"
        >
          Lihat semua
        </Link>
      </CardHeader>
      <CardContent className="px-0 sm:px-(--card-spacing)">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tanggal</TableHead>
                <TableHead>Nama</TableHead>
                <TableHead>Kontak</TableHead>
                <TableHead>Jenis</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    Belum ada lead.
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="whitespace-nowrap text-muted-foreground">
                      {formatTanggal(row.created_at)}
                    </TableCell>
                    <TableCell className="font-medium">{row.nama}</TableCell>
                    <TableCell className="max-w-[10rem] truncate sm:max-w-xs">
                      {row.kontak || '—'}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{LABEL_JENIS[row.jenis]}</Badge>
                    </TableCell>
                    <TableCell>{LABEL_STATUS[row.status]}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
