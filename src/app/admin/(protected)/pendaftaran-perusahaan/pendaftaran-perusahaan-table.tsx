'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { DownloadIcon } from 'lucide-react';
import { toast } from 'sonner';
import { formatRupiah } from '@/lib/batch';
import { DataTable, SortableHeader, createDataTableColumnHelper } from '@/components/data-table';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Database } from '@/types/database';
import { updatePendaftaranPerusahaanAction } from './actions';
import { eksporPendaftaranPerusahaanXlsx } from './pendaftaran-perusahaan-export';

type StatusRegistrasi = Database['public']['Enums']['status_registrasi_batch'];

export type PendaftaranPerusahaanRow = {
  id: number;
  nama_pic: string;
  whatsapp_pic: string;
  email_pic: string;
  nama_perusahaan: string;
  jumlah_peserta: number;
  catatan: string | null;
  nominal: number | null;
  status: StatusRegistrasi;
  alasan_tolak: string | null;
  catatan_admin: string | null;
  created_at: string;
  batchJudul: string;
  excelSignedUrl: string | null;
  peserta: { id: number; nama: string; whatsapp: string; email: string }[];
};

const LABEL_STATUS: Record<StatusRegistrasi, string> = {
  menunggu_verifikasi: 'Menunggu verifikasi',
  disetujui: 'Disetujui',
  ditolak: 'Ditolak',
};

const STATUS_BADGE: Record<StatusRegistrasi, 'secondary' | 'outline' | 'destructive'> = {
  menunggu_verifikasi: 'secondary',
  disetujui: 'outline',
  ditolak: 'destructive',
};

const STATUS_BADGE_CLASS: Partial<Record<StatusRegistrasi, string>> = {
  disetujui: 'border-transparent bg-emerald-600/10 text-emerald-700',
};

function BarisDetail({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1 border-b border-border py-2.5 sm:grid-cols-[9rem_1fr] sm:gap-4">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="text-sm whitespace-pre-wrap break-words text-foreground">{value || '—'}</dd>
    </div>
  );
}

function DetailDialog({ row }: { row: PendaftaranPerusahaanRow }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<StatusRegistrasi>(row.status);
  const [alasan, setAlasan] = useState(row.alasan_tolak ?? '');
  const [nominal, setNominal] = useState(row.nominal != null ? String(row.nominal) : '');
  const [catatanAdmin, setCatatanAdmin] = useState(row.catatan_admin ?? '');
  const [pending, startTransition] = useTransition();

  function simpan() {
    const nominalTrim = nominal.trim();
    let nominalVal: number | null = null;
    if (nominalTrim !== '') {
      const n = Number.parseInt(nominalTrim, 10);
      if (!Number.isFinite(n) || n < 0) {
        toast.error('Nominal harus angka bulat ≥ 0.');
        return;
      }
      nominalVal = n;
    }

    startTransition(async () => {
      const hasil = await updatePendaftaranPerusahaanAction({
        id: row.id,
        status,
        alasan_tolak: alasan,
        nominal: nominalVal,
        catatan_admin: catatanAdmin,
      });
      if (!hasil.ok) {
        toast.error(hasil.pesan);
        return;
      }
      toast.success('Pendaftaran perusahaan disimpan.');
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) {
          setStatus(row.status);
          setAlasan(row.alasan_tolak ?? '');
          setNominal(row.nominal != null ? String(row.nominal) : '');
          setCatatanAdmin(row.catatan_admin ?? '');
        }
      }}
    >
      <DialogTrigger render={<Button size="sm" variant="outline" />}>Detail</DialogTrigger>
      <DialogContent className="flex max-h-[90vh] flex-col gap-0 overflow-hidden sm:max-w-2xl">
        <div className="flex flex-col gap-4 overflow-y-auto p-1">
          <DialogHeader>
            <DialogTitle>Detail pendaftaran perusahaan</DialogTitle>
          </DialogHeader>

          <dl>
            <BarisDetail label="Perusahaan" value={row.nama_perusahaan} />
            <BarisDetail label="PIC" value={row.nama_pic} />
            <BarisDetail label="WhatsApp PIC" value={row.whatsapp_pic} />
            <BarisDetail label="Email PIC" value={row.email_pic} />
            <BarisDetail label="Batch" value={row.batchJudul} />
            <BarisDetail label="Jumlah peserta" value={String(row.jumlah_peserta)} />
            <BarisDetail label="Catatan PIC" value={row.catatan ?? ''} />
            <BarisDetail
              label="Diajukan"
              value={format(new Date(row.created_at), 'd MMM yyyy HH:mm', { locale: localeId })}
            />
          </dl>

          <div>
            <p className="text-sm font-medium text-foreground">File Excel asli</p>
            {row.excelSignedUrl ? (
              <a
                href={row.excelSignedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  buttonVariants({ variant: 'outline', size: 'default' }),
                  'mt-2 h-11 gap-1.5 px-4',
                )}
              >
                <DownloadIcon className="size-4" aria-hidden />
                Unduh berkas peserta
              </a>
            ) : (
              <p className="mt-1 text-sm text-muted-foreground">Berkas tidak tersedia.</p>
            )}
          </div>

          <div>
            <p className="text-sm font-medium text-foreground">Daftar peserta</p>
            <div className="mt-2 overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/40 text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2 font-medium">Nama</th>
                    <th className="px-3 py-2 font-medium">WhatsApp</th>
                    <th className="px-3 py-2 font-medium">Email</th>
                  </tr>
                </thead>
                <tbody>
                  {row.peserta.map((p) => (
                    <tr key={p.id} className="border-t border-border">
                      <td className="px-3 py-2 text-foreground">{p.nama}</td>
                      <td className="px-3 py-2 text-foreground">{p.whatsapp}</td>
                      <td className="px-3 py-2 text-foreground">{p.email}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-3 border-t border-border pt-4">
            <p className="text-sm font-medium text-foreground">Aksi Admin</p>
            <div className="space-y-1.5">
              <Label htmlFor={`status-${row.id}`}>Status</Label>
              <Select
                value={status}
                onValueChange={(v) => {
                  if (v) setStatus(v as StatusRegistrasi);
                }}
              >
                <SelectTrigger id={`status-${row.id}`} className="h-11 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="menunggu_verifikasi">Menunggu verifikasi</SelectItem>
                  <SelectItem value="disetujui">Disetujui</SelectItem>
                  <SelectItem value="ditolak">Ditolak</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {status === 'ditolak' && (
              <div className="space-y-1.5">
                <Label htmlFor={`alasan-${row.id}`}>Alasan penolakan</Label>
                <Textarea
                  id={`alasan-${row.id}`}
                  value={alasan}
                  onChange={(e) => setAlasan(e.target.value)}
                  rows={2}
                  required
                />
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor={`nominal-${row.id}`}>Nominal total (Rp)</Label>
              <Input
                id={`nominal-${row.id}`}
                inputMode="numeric"
                placeholder="Kosongkan jika belum nego"
                value={nominal}
                onChange={(e) => setNominal(e.target.value.replace(/[^\d]/g, ''))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={`catatan-admin-${row.id}`}>Catatan Admin (opsional)</Label>
              <Textarea
                id={`catatan-admin-${row.id}`}
                value={catatanAdmin}
                onChange={(e) => setCatatanAdmin(e.target.value)}
                rows={2}
              />
            </div>
            <Button type="button" onClick={simpan} disabled={pending} className="h-11 w-full">
              {pending ? 'Menyimpan…' : 'Simpan'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

const columnHelper = createDataTableColumnHelper<PendaftaranPerusahaanRow>();

const columns = [
  columnHelper.accessor('nama_perusahaan', {
    id: 'nama',
    header: (ctx) => <SortableHeader column={ctx.column} label="Nama Perusahaan" />,
    cell: (info) => <span className="font-medium text-foreground">{info.getValue()}</span>,
  }),
  columnHelper.accessor((row) => `${row.nama_pic} · ${row.whatsapp_pic}`, {
    id: 'pic',
    header: 'PIC',
    cell: (info) => <span className="text-sm text-foreground">{info.getValue()}</span>,
  }),
  columnHelper.accessor('batchJudul', {
    id: 'batch',
    header: (ctx) => <SortableHeader column={ctx.column} label="Batch" />,
  }),
  columnHelper.accessor('jumlah_peserta', {
    header: 'Jumlah',
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor('status', {
    id: 'status',
    header: 'Status',
    filterFn: 'equalsString',
    cell: (info) => {
      const status = info.getValue();
      return (
        <Badge variant={STATUS_BADGE[status]} className={STATUS_BADGE_CLASS[status]}>
          {LABEL_STATUS[status]}
        </Badge>
      );
    },
  }),
  columnHelper.accessor('nominal', {
    header: (ctx) => <SortableHeader column={ctx.column} label="Nominal" />,
    cell: (info) => {
      const v = info.getValue();
      return v == null ? '—' : formatRupiah(v);
    },
  }),
  columnHelper.accessor('created_at', {
    header: (ctx) => <SortableHeader column={ctx.column} label="Tanggal" />,
    cell: (info) => format(new Date(info.getValue()), 'd MMM yyyy', { locale: localeId }),
  }),
  columnHelper.display({
    id: 'aksi',
    header: () => <span className="sr-only">Aksi</span>,
    cell: ({ row }) => (
      <div className="flex justify-end">
        <DetailDialog row={row.original} />
      </div>
    ),
  }),
];

export function PendaftaranPerusahaanTable({ rows }: { rows: PendaftaranPerusahaanRow[] }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-foreground">Pendaftaran Perusahaan</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Verifikasi grup, isi nominal setelah nego WA, unduh Excel asli PIC.
          </p>
        </div>
        <Button
          type="button"
          onClick={() => void eksporPendaftaranPerusahaanXlsx(rows)}
          disabled={rows.length === 0}
          className="h-11 shrink-0 gap-1.5 px-5"
        >
          <DownloadIcon className="size-4" /> Ekspor Excel
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={rows}
        getRowId={(row) => String(row.id)}
        searchColumnId="nama"
        searchPlaceholder="Cari nama perusahaan..."
        emptyMessage="Belum ada pendaftaran perusahaan/komunitas."
        columnFilters={[
          {
            id: 'status',
            label: 'Status',
            options: [
              { value: 'menunggu_verifikasi', label: 'Menunggu verifikasi' },
              { value: 'disetujui', label: 'Disetujui' },
              { value: 'ditolak', label: 'Ditolak' },
            ],
          },
        ]}
      />
    </div>
  );
}
