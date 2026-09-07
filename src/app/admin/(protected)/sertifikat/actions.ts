'use server';

import { requireAdmin } from '@/lib/auth/guard';
import { createAdminClient } from '@/lib/supabase/admin';
import { teks } from '@/lib/validations/batch-admin';
import { SertifikatFormSchema, type SertifikatFormInput } from '@/lib/validations/sertifikat-admin';

function pesanGagalSimpan(error: { code?: string }) {
  if (error.code === '23505') {
    return 'Nomor sertifikat sudah dipakai. Pilih nomor lain atau kosongkan untuk dibuatkan otomatis.';
  }
  return 'Gagal menyimpan sertifikat. Coba lagi.';
}

export async function simpanSertifikatAction(id: string | null, input: SertifikatFormInput) {
  await requireAdmin();

  const parsed = SertifikatFormSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, pesan: 'Data yang diisi belum valid. Periksa kembali formnya.' };
  }

  const supabaseAdmin = createAdminClient();
  const { jenis, ...rest } = parsed.data;

  // Nomor kosong = otomatis. next_certificate_number() mengunci baris counter,
  // jadi HARUS lewat .rpc() di sini — bukan dihitung di TypeScript (ENGINEERING §3.6).
  // Dipanggil hanya saat benar-benar menyimpan, tidak pernah untuk "preview" di form.
  let nomor = teks(rest.nomor_sertifikat);
  if (!nomor) {
    const { data, error } = await supabaseAdmin.rpc('next_certificate_number', { p_jenis: jenis });
    if (error || !data) {
      console.error('[admin-sertifikat] gagal membuat nomor otomatis:', error);
      return { ok: false as const, pesan: 'Gagal membuat nomor sertifikat. Coba lagi.' };
    }
    nomor = data;
  }

  const sertifikat = {
    nomor_sertifikat: nomor,
    jenis,
    nama_lengkap: rest.nama_lengkap,
    tanggal_terbit: rest.tanggal_terbit,
    tanggal_kedaluwarsa: jenis === 'free_track' ? null : teks(rest.tanggal_kedaluwarsa),
    qr_aktif: rest.qr_aktif,
    catatan: teks(rest.catatan),
  };

  if (id == null) {
    const { error } = await supabaseAdmin.from('certificates').insert(sertifikat);
    if (error) {
      console.error('[admin-sertifikat] gagal membuat sertifikat:', error);
      return { ok: false as const, pesan: pesanGagalSimpan(error) };
    }
  } else {
    const { error } = await supabaseAdmin.from('certificates').update(sertifikat).eq('id', id);
    if (error) {
      console.error('[admin-sertifikat] gagal mengubah sertifikat:', error);
      return { ok: false as const, pesan: pesanGagalSimpan(error) };
    }
  }

  return { ok: true as const };
}

export async function hapusSertifikatAction(id: string) {
  await requireAdmin();
  const supabaseAdmin = createAdminClient();
  const { error } = await supabaseAdmin.from('certificates').delete().eq('id', id);
  if (error) {
    console.error('[admin-sertifikat] gagal hapus sertifikat:', error);
    return { ok: false as const, pesan: 'Gagal menghapus. Coba lagi.' };
  }
  return { ok: true as const };
}
