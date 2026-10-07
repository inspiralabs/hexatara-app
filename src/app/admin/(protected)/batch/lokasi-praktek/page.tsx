import { requireAdmin } from '@/lib/auth/guard';
import { createAdminClient } from '@/lib/supabase/admin';
import { LokasiPraktekManager } from './lokasi-praktek-manager';

export default async function AdminLokasiPraktekPage() {
  await requireAdmin();

  const supabaseAdmin = createAdminClient();
  const { data, error } = await supabaseAdmin
    .from('practice_locations')
    .select('id, nama_kota, urutan, is_active, created_at, updated_at')
    .order('urutan', { ascending: true })
    .order('nama_kota', { ascending: true });

  if (error) console.error('[admin-lokasi-praktek] gagal memuat:', error);

  return <LokasiPraktekManager items={data ?? []} />;
}
