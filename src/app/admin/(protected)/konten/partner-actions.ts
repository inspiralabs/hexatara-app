'use server';

import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/auth/guard';
import { createAdminClient } from '@/lib/supabase/admin';
import { nextUrutan } from '@/lib/reorder';
import { PartnerFormSchema, type PartnerFormInput } from '@/lib/validations/partner-admin';

const FORMAT_LOGO = ['image/jpeg', 'image/png', 'image/webp'] as const;

function revalidateBeranda() {
  revalidatePath('/');
  revalidatePath('/en');
}

/** Path di bucket `content` dari public URL (atau path mentah partners/…). */
function pathDariLogoUrl(url: string): string | null {
  const marker = '/storage/v1/object/public/content/';
  const i = url.indexOf(marker);
  if (i !== -1) return decodeURIComponent(url.slice(i + marker.length));
  if (url.startsWith('partners/')) return url;
  return null;
}

export async function uploadLogoPartnerAction(formData: FormData) {
  await requireAdmin();
  const file = formData.get('file');
  if (!(file instanceof File)) {
    return { ok: false as const, pesan: 'Berkas tidak ditemukan.' };
  }
  if (!FORMAT_LOGO.includes(file.type as (typeof FORMAT_LOGO)[number])) {
    return {
      ok: false as const,
      pesan: 'Format tidak didukung. Gunakan JPG, PNG, atau WebP (SVG tidak diizinkan).',
    };
  }

  const ext = file.name.split('.').pop()?.toLowerCase() || 'png';
  if (ext === 'svg') {
    return { ok: false as const, pesan: 'SVG tidak diizinkan. Gunakan JPG, PNG, atau WebP.' };
  }

  const path = `partners/${crypto.randomUUID()}.${ext}`;
  const supabaseAdmin = createAdminClient();
  const { error } = await supabaseAdmin.storage.from('content').upload(path, file, {
    contentType: file.type,
  });
  if (error) {
    console.error('[admin-partner] gagal unggah logo:', error);
    return { ok: false as const, pesan: 'Gagal mengunggah logo. Coba lagi.' };
  }

  const { data } = supabaseAdmin.storage.from('content').getPublicUrl(path);
  return { ok: true as const, url: data.publicUrl };
}

export async function simpanPartnerAction(partnerId: number | null, input: PartnerFormInput) {
  await requireAdmin();

  const parsed = PartnerFormSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, pesan: 'Data yang diisi belum valid. Periksa kembali formnya.' };
  }

  const p = parsed.data;
  const partner = {
    nama: p.nama,
    logo_url: p.logo_url,
    is_active: p.is_active,
  };

  const supabaseAdmin = createAdminClient();

  if (partnerId == null) {
    // Item baru selalu muncul paling bawah (F15.7) — bukan dari input manual.
    const { data: existing } = await supabaseAdmin.from('partners').select('urutan');
    const { error } = await supabaseAdmin.from('partners').insert({ ...partner, urutan: nextUrutan(existing ?? []) });
    if (error) {
      console.error('[admin-partner] gagal membuat partner:', error);
      return { ok: false as const, pesan: 'Gagal menyimpan partner. Coba lagi.' };
    }
  } else {
    const { error } = await supabaseAdmin.from('partners').update(partner).eq('id', partnerId);
    if (error) {
      console.error('[admin-partner] gagal mengubah partner:', error);
      return { ok: false as const, pesan: 'Gagal menyimpan partner. Coba lagi.' };
    }
  }

  revalidateBeranda();
  return { ok: true as const };
}

export async function hapusPartnerAction(partnerId: number) {
  await requireAdmin();
  const supabaseAdmin = createAdminClient();

  const { data: row, error: bacaError } = await supabaseAdmin
    .from('partners')
    .select('id, logo_url')
    .eq('id', partnerId)
    .single();

  if (bacaError || !row) {
    console.error('[admin-partner] gagal baca sebelum hapus:', bacaError);
    return { ok: false as const, pesan: 'Partner tidak ditemukan.' };
  }

  const path = pathDariLogoUrl(row.logo_url);
  if (path) {
    const { error: storageError } = await supabaseAdmin.storage.from('content').remove([path]);
    if (storageError) {
      console.error('[admin-partner] gagal hapus logo storage:', storageError);
    }
  }

  const { error } = await supabaseAdmin.from('partners').delete().eq('id', partnerId);
  if (error) {
    console.error('[admin-partner] gagal hapus partner:', error);
    return { ok: false as const, pesan: 'Gagal menghapus. Coba lagi.' };
  }

  revalidateBeranda();
  return { ok: true as const };
}

// partners.urutan TIDAK unique — aman di-update langsung per baris.
export async function reorderPartnerAction(partnerIds: number[]) {
  await requireAdmin();
  const supabaseAdmin = createAdminClient();
  for (const [index, id] of partnerIds.entries()) {
    const { error } = await supabaseAdmin.from('partners').update({ urutan: index }).eq('id', id);
    if (error) {
      console.error('[admin-partner] gagal reorder partner:', error);
      return { ok: false as const, pesan: 'Gagal mengubah urutan. Coba lagi.' };
    }
  }
  revalidateBeranda();
  return { ok: true as const };
}

export async function toggleAktifPartnerAction(partnerId: number, aktif: boolean) {
  await requireAdmin();
  const supabaseAdmin = createAdminClient();
  const { error } = await supabaseAdmin.from('partners').update({ is_active: aktif }).eq('id', partnerId);
  if (error) {
    console.error('[admin-partner] gagal ubah status aktif:', error);
    return { ok: false as const, pesan: 'Gagal mengubah status. Coba lagi.' };
  }
  revalidateBeranda();
  return { ok: true as const };
}
