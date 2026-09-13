import 'server-only';
import { resend, EMAIL_FROM } from './client';
import { getAdminNotifyEmail } from '@/lib/site-settings';
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

export function kirimEmailVerifikasi(to: string, params: { nama: string; tautan: string }) {
  return kirim(to, templateVerifikasiEmail(params));
}

export function kirimEmailResetSandi(to: string, params: { tautan: string }) {
  return kirim(to, templateResetSandi(params));
}

export function kirimEmailPembayaranDisetujui(
  to: string,
  params: { nama: string; tautanDashboard: string }
) {
  return kirim(to, templatePembayaranDisetujui(params));
}

export function kirimEmailPembayaranDitolak(
  to: string,
  params: { nama: string; alasan: string; tautanUpload: string }
) {
  return kirim(to, templatePembayaranDitolak(params));
}

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
  return kirim(to, templateLeadBaru({ ...params, tautanAdmin }));
}
