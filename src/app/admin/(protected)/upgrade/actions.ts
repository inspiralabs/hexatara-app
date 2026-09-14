'use server';

import { requireAdmin } from '@/lib/auth/guard';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { generateSertifikatFinalPdf } from '@/lib/certificate/pdf';
import { kirimEmailPembayaranDisetujui, kirimEmailPembayaranDitolak } from '@/lib/email/send';
import type { Database } from '@/types/database';

// AKTIVASI — satu Server Action, PRD §8.8 / ENGINEERING §5.2.
// Langkah 1-2-3-4-6 dibungkus RPC (satu transaksi Postgres, rollback otomatis
// kalau gagal — docs/sql/14_aktivasi_sertifikat.sql). Langkah 5 (PDF) dan 7
// (email) dan 8 (activity_logs) berjalan SETELAH RPC sukses: kegagalannya
// tidak membatalkan sertifikat yang sudah sah terbit, cuma dicatat & bisa
// diulang — baris certificates yang terlanjur dibuat tidak bisa ditarik lagi.
export async function setujuiPesananAction(orderId: number) {
  await requireAdmin();
  const supabase = await createClient();

  const { data, error } = await supabase
    .rpc('aktivasi_sertifikat_free_track', { p_order_id: orderId })
    .single();

  if (error || !data) {
    console.error('[admin-upgrade] gagal aktivasi sertifikat:', error);
    return { ok: false as const, pesan: 'Gagal mengaktifkan sertifikat. Coba lagi.' };
  }

  const { certificate_id, nomor_sertifikat, user_id } = data;

  const { data: cert } = await supabase
    .from('certificates')
    .select('nama_lengkap, tanggal_terbit, public_token')
    .eq('id', certificate_id)
    .single();

  const supabaseAdmin = createAdminClient();

  // Best-effort — kegagalan di sini tidak membatalkan aktivasi yang sudah tercatat.
  if (cert) {
    try {
      const pdfBytes = await generateSertifikatFinalPdf({
        namaLengkap: cert.nama_lengkap,
        nomorSertifikat: nomor_sertifikat,
        tanggalTerbit: cert.tanggal_terbit,
        publicToken: cert.public_token,
      });
      const { error: uploadError } = await supabaseAdmin.storage
        .from('certificates')
        .upload(`final/${certificate_id}.pdf`, pdfBytes, {
          contentType: 'application/pdf',
          upsert: true,
        });
      if (uploadError) {
        console.error('[admin-upgrade] gagal simpan PDF final:', uploadError);
      }
    } catch (err) {
      console.error('[admin-upgrade] gagal membuat PDF final:', err);
    }
  }

  // Email cuma ada di auth.users — perlu Admin API, tidak bisa dibaca client biasa.
  const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(user_id);
  const email = authUser.user?.email;
  if (email) {
    await kirimEmailPembayaranDisetujui(email, {
      nama: cert?.nama_lengkap ?? '',
      tautanDashboard: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard`,
    });
  }

  const { error: logError } = await supabaseAdmin.from('activity_logs').insert({
    user_id,
    aksi: 'sertifikat_aktif',
    detail: { order_id: orderId, nomor_sertifikat },
  });
  if (logError) {
    console.error('[admin-upgrade] gagal catat activity_log:', logError);
  }

  return { ok: true as const };
}

export async function tolakPesananAction(orderId: number, alasan: string) {
  await requireAdmin();
  const supabase = await createClient();

  // Filter status di sini juga (bukan cuma di UI) — pesanan yang sudah disetujui
  // tidak boleh ditimpa jadi ditolak lewat panggilan action yang telat/diulang.
  const { data: order, error } = await supabase
    .from('certificate_orders')
    .update({ status: 'ditolak', alasan_tolak: alasan })
    .eq('id', orderId)
    .eq('status', 'menunggu_verifikasi')
    .select('user_id')
    .single();

  if (error || !order) {
    console.error('[admin-upgrade] gagal tolak pesanan:', error);
    return { ok: false as const, pesan: 'Gagal menolak pesanan. Coba lagi.' };
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('nama_lengkap')
    .eq('id', order.user_id)
    .single();

  const supabaseAdmin = createAdminClient();
  const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(order.user_id);
  const email = authUser.user?.email;
  if (email) {
    await kirimEmailPembayaranDitolak(email, {
      nama: profile?.nama_lengkap ?? '',
      alasan,
      tautanUpload: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/transaksi`,
    });
  }

  return { ok: true as const };
}

export async function updateStatusPengirimanAction(
  orderId: number,
  status: Database['public']['Enums']['status_kirim']
) {
  await requireAdmin();
  const supabase = await createClient();

  const { error } = await supabase
    .from('certificate_orders')
    .update({ status_pengiriman: status })
    .eq('id', orderId);
  if (error) {
    console.error('[admin-upgrade] gagal ubah status pengiriman:', error);
    return { ok: false as const, pesan: 'Gagal mengubah status pengiriman. Coba lagi.' };
  }

  return { ok: true as const };
}
