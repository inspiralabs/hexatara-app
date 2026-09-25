'use server';

import { z } from 'zod';
import { getOptionalUser } from '@/lib/auth/guard';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { PendaftaranBatchSchema } from '@/lib/validations/pendaftaran-batch';
import { getWhatsappAdmin } from '@/lib/site-settings';

const BatchIdSchema = z.number().int().positive();
const FORMAT_DIIZINKAN = ['image/jpeg', 'image/png', 'image/webp'] as const;
const UKURAN_MAKS = 5 * 1024 * 1024;

function extDariMime(type: string) {
  if (type === 'image/png') return 'png';
  if (type === 'image/webp') return 'webp';
  return 'jpg';
}

function isImageFile(file: FormDataEntryValue | null): file is File {
  return (
    file instanceof File &&
    file.size > 0 &&
    FORMAT_DIIZINKAN.includes(file.type as (typeof FORMAT_DIIZINKAN)[number]) &&
    file.size <= UKURAN_MAKS
  );
}

async function hapusRegistrasiDanObjek(
  admin: ReturnType<typeof createAdminClient>,
  registrasiId: number,
  paths: string[],
) {
  if (paths.length > 0) {
    const { error } = await admin.storage.from('identity-documents').remove(paths);
    if (error) console.error('[daftar-batch] gagal hapus object storage:', error.message);
  }
  const { error } = await admin.from('batch_registrations').delete().eq('id', registrasiId);
  if (error) console.error('[daftar-batch] gagal hapus baris registrasi:', error.message);
}

/** Prefill untuk dialog — dipanggil dari Server Component / action ringan. */
export async function getPrefillPendaftaranBatch() {
  const claims = await getOptionalUser();
  if (!claims) {
    return { loggedIn: false as const, lengkap: false as const, prefill: null };
  }

  const supabase = await createClient();
  const [{ data: profile }, { data: authUser }, { data: lengkap }] = await Promise.all([
    supabase
      .from('profiles')
      .select(
        'nama_lengkap, whatsapp, nomor_ktp, tempat_lahir, tanggal_lahir, alamat_lengkap, foto_ktp_url, pas_foto_url',
      )
      .eq('id', claims.sub)
      .maybeSingle(),
    supabase.auth.getUser(),
    supabase.rpc('profil_identitas_lengkap', { p_user_id: claims.sub }),
  ]);

  const isLengkap = lengkap === true;
  if (!isLengkap || !profile) {
    return { loggedIn: true as const, lengkap: false as const, prefill: null };
  }

  return {
    loggedIn: true as const,
    lengkap: true as const,
    prefill: {
      nama_lengkap: profile.nama_lengkap ?? '',
      email: authUser.user?.email ?? '',
      whatsapp: profile.whatsapp ?? '',
      nomor_ktp: profile.nomor_ktp ?? '',
      tempat_lahir: profile.tempat_lahir ?? '',
      tanggal_lahir: profile.tanggal_lahir ?? '',
      alamat_lengkap: profile.alamat_lengkap ?? '',
      foto_ktp_url: profile.foto_ktp_url,
      pas_foto_url: profile.pas_foto_url,
    },
  };
}

export async function daftarBatchAction(batchId: unknown, formData: FormData) {
  const parsedBatchId = BatchIdSchema.safeParse(batchId);
  if (!parsedBatchId.success) {
    return { ok: false as const, pesan: 'Batch tidak valid. Muat ulang halaman dan coba lagi.' };
  }

  const sumberPilihan = String(formData.get('sumber_info') ?? '');
  const sumberLainnya = String(formData.get('sumber_info_lainnya') ?? '').trim();
  const sumberInfo =
    sumberPilihan === 'Lainnya' ? sumberLainnya || 'Lainnya' : sumberPilihan || undefined;

  const parsed = PendaftaranBatchSchema.safeParse({
    nama_lengkap: formData.get('nama_lengkap'),
    email: formData.get('email'),
    whatsapp: formData.get('whatsapp'),
    nomor_ktp: formData.get('nomor_ktp'),
    tempat_lahir: formData.get('tempat_lahir'),
    tanggal_lahir: formData.get('tanggal_lahir'),
    alamat_lengkap: formData.get('alamat_lengkap'),
    kategori_peserta: formData.get('kategori_peserta'),
    sumber_info: sumberInfo,
    kode_referral: String(formData.get('kode_referral') ?? '').trim() || undefined,
  });

  if (!parsed.success) {
    return { ok: false as const, pesan: 'Data yang diisi belum valid. Periksa kembali formnya.' };
  }

  const sebagaiTamu = formData.get('sebagai_tamu') === '1';
  const claims = await getOptionalUser();
  const userId = sebagaiTamu ? null : (claims?.sub ?? null);
  const data = parsed.data;

  const fileKtp = formData.get('foto_ktp');
  const filePas = formData.get('pas_foto');
  const ktpOk = isImageFile(fileKtp);
  const pasOk = isImageFile(filePas);

  const supabase = await createClient();
  const admin = createAdminClient();

  // Foto wajib untuk anon. Untuk login: boleh pakai path profil yang sudah ada.
  let pathKtpProfil: string | null = null;
  let pathPasProfil: string | null = null;
  if (userId && (!ktpOk || !pasOk)) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('foto_ktp_url, pas_foto_url')
      .eq('id', userId)
      .maybeSingle();
    pathKtpProfil = profile?.foto_ktp_url ?? null;
    pathPasProfil = profile?.pas_foto_url ?? null;
  }

  if ((!ktpOk && !pathKtpProfil) || (!pasOk && !pathPasProfil)) {
    return {
      ok: false as const,
      pesan: 'Foto KTP dan pas foto wajib diunggah (JPG/PNG/WebP, maks. 5 MB).',
    };
  }

  const { data: batch } = await supabase
    .from('batches')
    .select('id, judul_id, is_active, status')
    .eq('id', parsedBatchId.data)
    .eq('is_active', true)
    .maybeSingle();

  if (!batch || batch.status === 'closed') {
    return { ok: false as const, pesan: 'Batch tidak tersedia untuk pendaftaran saat ini.' };
  }

  // 1) Insert tanpa path foto dulu — dapat id untuk path anon `registrasi/<id>/…`
  const { data: inserted, error: insertError } = await admin
    .from('batch_registrations')
    .insert({
      batch_id: parsedBatchId.data,
      user_id: userId,
      nama_lengkap: data.nama_lengkap,
      email: data.email,
      whatsapp: data.whatsapp,
      nomor_ktp: data.nomor_ktp,
      tempat_lahir: data.tempat_lahir,
      tanggal_lahir: data.tanggal_lahir,
      alamat_lengkap: data.alamat_lengkap,
      kategori_peserta: data.kategori_peserta,
      sumber_info: data.sumber_info ?? null,
      kode_referral: data.kode_referral ?? null,
      foto_ktp_url: null,
      pas_foto_url: null,
      status: 'menunggu_verifikasi',
    })
    .select('id')
    .single();

  if (insertError || !inserted) {
    if (insertError?.code === '23505') {
      return { ok: false as const, pesan: 'Kamu sudah terdaftar di batch ini.' };
    }
    console.error('[daftar-batch] gagal insert:', insertError);
    return { ok: false as const, pesan: 'Gagal menyimpan pendaftaran. Coba lagi.' };
  }

  const registrasiId = inserted.id;
  const uploadedPaths: string[] = [];

  try {
    let pathKtp = pathKtpProfil;
    let pathPas = pathPasProfil;

    if (ktpOk) {
      const ext = extDariMime(fileKtp.type);
      pathKtp = userId
        ? `${userId}/ktp.${ext}`
        : `registrasi/${registrasiId}/ktp.${ext}`;
      const { error } = await admin.storage
        .from('identity-documents')
        .upload(pathKtp, fileKtp, { contentType: fileKtp.type, upsert: true });
      if (error) throw new Error(`upload-ktp: ${error.message}`);
      uploadedPaths.push(pathKtp);
    }

    if (pasOk) {
      const ext = extDariMime(filePas.type);
      pathPas = userId
        ? `${userId}/pas-foto.${ext}`
        : `registrasi/${registrasiId}/pas-foto.${ext}`;
      const { error } = await admin.storage
        .from('identity-documents')
        .upload(pathPas, filePas, { contentType: filePas.type, upsert: true });
      if (error) throw new Error(`upload-pas: ${error.message}`);
      uploadedPaths.push(pathPas);
    }

    if (!pathKtp || !pathPas) {
      throw new Error('path-foto-kosong');
    }

    const { error: updateError } = await admin
      .from('batch_registrations')
      .update({ foto_ktp_url: pathKtp, pas_foto_url: pathPas })
      .eq('id', registrasiId);

    if (updateError) throw new Error(`update-path: ${updateError.message}`);

    if (userId) {
      const profilPatch: {
        nama_lengkap: string;
        whatsapp: string;
        nomor_ktp: string;
        tempat_lahir: string;
        tanggal_lahir: string;
        alamat_lengkap: string;
        foto_ktp_url?: string;
        pas_foto_url?: string;
      } = {
        nama_lengkap: data.nama_lengkap,
        whatsapp: data.whatsapp,
        nomor_ktp: data.nomor_ktp,
        tempat_lahir: data.tempat_lahir,
        tanggal_lahir: data.tanggal_lahir,
        alamat_lengkap: data.alamat_lengkap,
      };
      if (pathKtp.startsWith(`${userId}/`)) profilPatch.foto_ktp_url = pathKtp;
      if (pathPas.startsWith(`${userId}/`)) profilPatch.pas_foto_url = pathPas;

      const { error: profilError } = await admin.from('profiles').update(profilPatch).eq('id', userId);
      if (profilError) {
        console.error('[daftar-batch] sync profiles gagal (non-fatal):', profilError.message);
      }
    }

    const nomorAdmin = await getWhatsappAdmin();
    const pesanWa = `Halo Admin Hexatara, saya ${data.nama_lengkap} sudah mendaftar pelatihan "${batch.judul_id}".\nEmail: ${data.email}\nWhatsApp: ${data.whatsapp}`;
    const waLink = nomorAdmin
      ? `https://wa.me/${nomorAdmin}?text=${encodeURIComponent(pesanWa)}`
      : null;

    return {
      ok: true as const,
      registrasiId,
      waLink,
      pesan: 'Pendaftaran diterima dan menunggu verifikasi Admin.',
    };
  } catch (err) {
    console.error('[daftar-batch] gagal setelah insert — rollback:', err);
    await hapusRegistrasiDanObjek(admin, registrasiId, uploadedPaths);
    return {
      ok: false as const,
      pesan: 'Gagal mengunggah foto. Pendaftaran dibatalkan — silakan coba lagi.',
    };
  }
}
