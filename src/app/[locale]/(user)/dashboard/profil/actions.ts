'use server';

import { revalidatePath } from 'next/cache';
import { requireUser } from '@/lib/auth/guard';
import { createClient } from '@/lib/supabase/server';
import { IdentitasProfilSchema } from '@/lib/validations/identitas-profil';

const FORMAT_DIIZINKAN = ['image/jpeg', 'image/png', 'image/webp'] as const;
const UKURAN_MAKS = 5 * 1024 * 1024;

function extDariMime(type: string) {
  if (type === 'image/png') return 'png';
  if (type === 'image/webp') return 'webp';
  return 'jpg';
}

function revalidateProfil() {
  revalidatePath('/dashboard/profil');
  revalidatePath('/dashboard');
}

export async function simpanIdentitasAction(input: unknown) {
  const claims = await requireUser();
  const parsed = IdentitasProfilSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, pesan: 'Data yang diisi belum valid. Periksa kembali formnya.' };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from('profiles')
    .update({
      nomor_ktp: parsed.data.nomor_ktp,
      tempat_lahir: parsed.data.tempat_lahir,
      tanggal_lahir: parsed.data.tanggal_lahir,
      alamat_lengkap: parsed.data.alamat_lengkap,
    })
    .eq('id', claims.sub);

  if (error) {
    console.error('[profil-identitas] gagal simpan:', error);
    return { ok: false as const, pesan: 'Gagal menyimpan data identitas. Coba lagi.' };
  }

  revalidateProfil();
  return { ok: true as const };
}

export async function unggahIdentitasFotoAction(
  jenis: 'ktp' | 'pas_foto',
  formData: FormData,
) {
  const claims = await requireUser();
  const file = formData.get('file');

  if (!(file instanceof File) || !FORMAT_DIIZINKAN.includes(file.type as (typeof FORMAT_DIIZINKAN)[number])) {
    return { ok: false as const, pesan: 'Berkas harus JPG, PNG, atau WebP.' };
  }
  if (file.size > UKURAN_MAKS) {
    return { ok: false as const, pesan: 'Ukuran berkas maksimal 5 MB.' };
  }

  const ext = extDariMime(file.type);
  const basename = jenis === 'ktp' ? 'ktp' : 'pas-foto';
  const path = `${claims.sub}/${basename}.${ext}`;

  const supabase = await createClient();
  const { error: uploadError } = await supabase.storage
    .from('identity-documents')
    .upload(path, file, { contentType: file.type, upsert: true });

  if (uploadError) {
    console.error('[profil-identitas] gagal unggah:', uploadError);
    return { ok: false as const, pesan: 'Gagal mengunggah foto. Coba lagi.' };
  }

  const patch =
    jenis === 'ktp' ? { foto_ktp_url: path } : { pas_foto_url: path };
  const { error: updateError } = await supabase
    .from('profiles')
    .update(patch)
    .eq('id', claims.sub);

  if (updateError) {
    console.error('[profil-identitas] gagal simpan path foto:', updateError);
    return { ok: false as const, pesan: 'Foto terunggah tapi gagal disimpan. Coba lagi.' };
  }

  revalidateProfil();
  return { ok: true as const, path };
}
