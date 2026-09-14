import Link from 'next/link';
import { requireAdmin } from '@/lib/auth/guard';
import { createClient } from '@/lib/supabase/server';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { SertifikatTable } from './sertifikat-table';

export default async function AdminSertifikatPage() {
  // Layout sudah memanggil requireAdmin(), tapi Server Component ini dipanggil
  // lagi secara eksplisit sesuai ENGINEERING §4.1 — bukan cuma diandalkan dari layout.
  await requireAdmin();

  const supabase = await createClient();

  // Dua query paralel: certificates untuk data penuh (id, qr_aktif — tidak ada di
  // view publik), certificates_public untuk kolom status yang SUDAH dihitung DB
  // lewat status_sertifikat() — supaya tidak menghitung ulang di TypeScript
  // (ENGINEERING §3.6, dua sumber kebenaran). Digabung lewat nomor_sertifikat (unik).
  const [{ data: sertifikat, error }, { data: statusRows }] = await Promise.all([
    supabase
      .from('certificates')
      .select('id, nomor_sertifikat, jenis, nama_lengkap, tanggal_terbit, tanggal_kedaluwarsa, qr_aktif')
      .order('created_at', { ascending: false }),
    supabase.from('certificates_public').select('nomor_sertifikat, status'),
  ]);

  if (error) console.error('[admin-sertifikat] gagal memuat daftar:', error);

  const statusByNomor = new Map((statusRows ?? []).map((s) => [s.nomor_sertifikat, s.status]));
  const rows = (sertifikat ?? []).map((s) => ({
    ...s,
    invalid: statusByNomor.get(s.nomor_sertifikat) === 'invalid',
  }));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-foreground">Sertifikat</h1>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/sertifikat/impor" className={cn(buttonVariants({ variant: 'outline' }), 'h-11 px-5')}>
            Impor Massal
          </Link>
          <Link href="/admin/sertifikat/baru" className={cn(buttonVariants(), 'h-11 px-5')}>
            Tambah Sertifikat
          </Link>
        </div>
      </div>

      <SertifikatTable sertifikat={rows} />
    </div>
  );
}
