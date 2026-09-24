import 'server-only';
import { resend, EMAIL_FROM } from './client';
import { getAdminNotifyEmail, getKontak } from '@/lib/site-settings';
import {
  templateVerifikasiEmail,
  templateResetSandi,
  templatePembayaranDisetujui,
  templatePembayaranDitolak,
  templateLeadBaru,
  type EmailTemplate,
} from './templates';

type HasilKirim = { ok: boolean };

async function kirim(to: string, template: EmailTemplate): Promise<HasilKirim> {
  try {
    const { error } = await resend.emails.send({
      from: EMAIL_FROM,
      to,
      subject: template.subject,
      html: template.html,
    });
    if (error) {
      console.error('[email] gagal kirim:', template.subject, error);
      return { ok: false };
    }
    return { ok: true };
  } catch (err) {
    console.error('[email] gagal kirim:', template.subject, err);
    return { ok: false };
  }
}

export async function kirimEmailVerifikasi(to: string, params: { nama: string; tautan: string }) {
  const kontak = await getKontak();
  return kirim(to, templateVerifikasiEmail(params, kontak));
}

export async function kirimEmailResetSandi(to: string, params: { tautan: string }) {
  const kontak = await getKontak();
  return kirim(to, templateResetSandi(params, kontak));
}

export async function kirimEmailPembayaranDisetujui(
  to: string,
  params: { nama: string; tautanDashboard: string }
) {
  const kontak = await getKontak();
  return kirim(to, templatePembayaranDisetujui(params, kontak));
}

export async function kirimEmailPembayaranDitolak(
  to: string,
  params: { nama: string; alasan: string; tautanUpload: string }
) {
  const kontak = await getKontak();
  return kirim(to, templatePembayaranDitolak(params, kontak));
}

// jenis 'minat_batch': sengaja DITAHAN (tidak dipanggil dari UI). Keputusan Alif
// 2026-09-24 — jangan hapus sampai Fase 2 punya email notifikasi pendaftaran batch
// baru (batch_registrations). Saat itu pertimbangkan jenis baru (mis. pendaftaran_batch)
// daripada menghidupkan label "minat". Jalur hidup sekarang hanya 'penawaran' (F04.5).
export async function kirimEmailLeadBaru(params: {
  jenis: 'minat_batch' | 'penawaran';
  nama: string;
  kontak: string;
  detail: string;
}) {
  const to = await getAdminNotifyEmail();
  if (!to) {
    console.error('[email] admin_notify_email kosong — lead tidak dikirim');
    return { ok: false };
  }
  const tautanAdmin = `${process.env.NEXT_PUBLIC_SITE_URL}/admin/leads`;
  const kontakSite = await getKontak();
  return kirim(to, templateLeadBaru({ ...params, tautanAdmin }, kontakSite));
}
