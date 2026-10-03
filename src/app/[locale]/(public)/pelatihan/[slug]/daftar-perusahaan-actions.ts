'use server';

import { z } from 'zod';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { parsePesertaPerusahaan, type BarisGagal } from '@/lib/company-registration/import';
import { kirimEmailLeadBaru } from '@/lib/email/send';
import { getWhatsappAdmin } from '@/lib/site-settings';
import { CompanyRegistrationFormSchema } from '@/lib/validations/company-registration';

const BatchIdSchema = z.number().int().positive();

function namaAman(nama: string) {
  return nama.replace(/[^a-zA-Z0-9._-]+/g, '_').slice(0, 80) || 'peserta.xlsx';
}

export async function daftarPerusahaanAction(
  batchId: unknown,
  formInput: unknown,
  file: File,
): Promise<
  | { ok: true; waLink: string | null; jumlahPeserta: number }
  | { ok: false; pesan: string; gagal?: BarisGagal[] }
> {
  const parsedBatchId = BatchIdSchema.safeParse(batchId);
  const parsedForm = CompanyRegistrationFormSchema.safeParse(formInput);
  if (!parsedBatchId.success || !parsedForm.success) {
    return { ok: false, pesan: 'Data yang diisi belum valid. Periksa kembali formnya.' };
  }

  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, pesan: 'Unggah berkas Excel peserta terlebih dahulu.' };
  }

  const parsedExcel = await parsePesertaPerusahaan(file);
  if (!parsedExcel.ok) {
    return {
      ok: false,
      pesan:
        parsedExcel.pesan ??
        `Ada ${parsedExcel.gagal.length} baris gagal. Perbaiki berkas lalu unggah ulang — tidak ada data yang disimpan.`,
      gagal: parsedExcel.gagal,
    };
  }

  const supabase = await createClient();
  const { data: batch } = await supabase
    .from('batches')
    .select('id, judul_id, is_active, status')
    .eq('id', parsedBatchId.data)
    .eq('is_active', true)
    .maybeSingle();

  if (!batch || batch.status === 'closed') {
    return { ok: false, pesan: 'Batch tidak tersedia untuk pendaftaran saat ini.' };
  }

  const admin = createAdminClient();
  const form = parsedForm.data;
  const peserta = parsedExcel.peserta;
  const path = `${parsedBatchId.data}/${Date.now()}-${namaAman(file.name)}`;

  const { error: uploadError } = await admin.storage
    .from('company-registrations')
    .upload(path, file, {
      contentType: file.type || 'application/octet-stream',
      upsert: false,
    });
  if (uploadError) {
    console.error('[daftar-perusahaan] gagal upload excel:', uploadError);
    return { ok: false, pesan: 'Gagal mengunggah berkas Excel. Coba lagi.' };
  }

  const { data: inserted, error: insertError } = await admin
    .from('company_registrations')
    .insert({
      batch_id: parsedBatchId.data,
      nama_pic: form.nama_pic,
      whatsapp_pic: form.whatsapp_pic,
      email_pic: form.email_pic,
      nama_perusahaan: form.nama_perusahaan,
      jumlah_peserta: peserta.length,
      file_excel_url: path,
      catatan: form.catatan?.trim() || null,
      status: 'menunggu_verifikasi',
    })
    .select('id')
    .single();

  if (insertError || !inserted) {
    console.error('[daftar-perusahaan] gagal insert induk:', insertError);
    await admin.storage.from('company-registrations').remove([path]);
    return { ok: false, pesan: 'Gagal menyimpan pendaftaran. Coba lagi.' };
  }

  const { error: pesertaError } = await admin.from('company_registration_participants').insert(
    peserta.map((p) => ({
      registration_id: inserted.id,
      nama: p.nama,
      whatsapp: p.whatsapp,
      email: p.email,
    })),
  );

  if (pesertaError) {
    console.error('[daftar-perusahaan] gagal insert peserta — rollback:', pesertaError);
    await admin.from('company_registrations').delete().eq('id', inserted.id);
    await admin.storage.from('company-registrations').remove([path]);
    return { ok: false, pesan: 'Gagal menyimpan daftar peserta. Coba lagi.' };
  }

  await kirimEmailLeadBaru({
    jenis: 'pendaftaran_perusahaan',
    nama: form.nama_perusahaan,
    kontak: form.whatsapp_pic,
    detail: `${peserta.length} peserta, batch ${batch.judul_id}`,
  });

  const nomorAdmin = await getWhatsappAdmin();
  const pesanWa =
    `Halo Admin Hexatara, saya ${form.nama_pic} dari ${form.nama_perusahaan} ` +
    `sudah mendaftarkan ${peserta.length} peserta untuk pelatihan "${batch.judul_id}".`;
  const waLink = nomorAdmin
    ? `https://wa.me/${nomorAdmin}?text=${encodeURIComponent(pesanWa)}`
    : null;

  return { ok: true, waLink, jumlahPeserta: peserta.length };
}
