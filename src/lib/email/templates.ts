import 'server-only';

import type { KontakSettings } from '@/lib/site-settings';

export type EmailTemplate = { subject: string; html: string };

function escapeHtml(nilai: string): string {
  return nilai
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function siteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? '').replace(/\/$/, '');
}

function footerKontak(kontak?: KontakSettings): string {
  const baris: string[] = [];
  if (kontak?.wa) {
    baris.push(
      `WhatsApp: <a href="https://wa.me/${escapeHtml(kontak.wa)}" style="color:#1E40AF;text-decoration:none;">+${escapeHtml(kontak.wa)}</a>`
    );
  }
  if (kontak?.email) {
    baris.push(
      `Email: <a href="mailto:${escapeHtml(kontak.email)}" style="color:#1E40AF;text-decoration:none;">${escapeHtml(kontak.email)}</a>`
    );
  }
  if (kontak?.instagram) {
    baris.push(
      `Instagram: <a href="${escapeHtml(kontak.instagram)}" style="color:#1E40AF;text-decoration:none;">@Hexatara</a>`
    );
  }
  if (kontak?.jam_operasional?.trim()) {
    baris.push(escapeHtml(kontak.jam_operasional.trim()));
  }
  if (baris.length === 0) {
    return `<p style="margin:0;font-size:13px;line-height:1.5;color:#6B7280;">Hubungi kami lewat website Hexatara.</p>`;
  }
  return `<p style="margin:0;font-size:13px;line-height:1.7;color:#4B5563;">${baris.join('<br/>')}</p>`;
}

function baseLayout(judul: string, isiHtml: string, kontak?: KontakSettings): string {
  const logo = `${siteUrl()}/hexatara-logo-default.png`;
  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${judul}</title>
</head>
<body style="margin:0;padding:0;background:#F4F4F5;font-family:Arial,Helvetica,sans-serif;color:#18181B;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F4F4F5;padding:24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#FFFFFF;border:1px solid #E4E4E7;border-radius:12px;overflow:hidden;">
          <tr>
            <td style="padding:20px 28px;border-bottom:1px solid #E4E4E7;background:#FAFAFA;">
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="vertical-align:middle;padding-right:12px;">
                    <img src="${logo}" alt="Hexatara" width="40" height="40" style="display:block;border:0;border-radius:8px;" />
                  </td>
                  <td style="vertical-align:middle;">
                    <div style="font-size:18px;font-weight:700;color:#18181B;line-height:1.2;">Hexatara</div>
                    <div style="font-size:13px;color:#71717A;line-height:1.3;">Indonesia</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:28px;font-size:15px;line-height:1.6;color:#18181B;">
              <h1 style="font-size:20px;margin:0 0 16px;color:#18181B;font-weight:700;">${judul}</h1>
              ${isiHtml}
            </td>
          </tr>
          <tr>
            <td style="padding:20px 28px;background:#FAFAFA;border-top:1px solid #E4E4E7;">
              <p style="margin:0 0 8px;font-size:13px;font-weight:700;color:#18181B;">Kontak Hexatara</p>
              ${footerKontak(kontak)}
              <p style="margin:14px 0 0;font-size:12px;color:#A1A1AA;">Email otomatis — jangan balas pesan ini.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function tombol(tautan: string, label: string): string {
  return `<p style="margin:24px 0;">
    <a href="${tautan}" style="display:inline-block;background:#1E40AF;color:#FFFFFF;font-size:15px;font-weight:600;text-decoration:none;padding:12px 22px;border-radius:8px;">${label}</a>
  </p>`;
}

export function templateVerifikasiEmail(
  params: { nama: string; tautan: string },
  kontak?: KontakSettings
): EmailTemplate {
  const nama = escapeHtml(params.nama);
  return {
    subject: 'Verifikasi email Hexatara Anda',
    html: baseLayout(
      'Verifikasi email Anda',
      `<p>Halo ${nama},</p>
       <p>Terima kasih sudah mendaftar di Hexatara. Klik tombol di bawah untuk memverifikasi email Anda dan mengaktifkan akun.</p>
       ${tombol(params.tautan, 'Verifikasi Email')}
       <p style="font-size:13px;color:#71717A;">Kalau Anda tidak merasa mendaftar, abaikan email ini.</p>`,
      kontak
    ),
  };
}

export function templateResetSandi(params: { tautan: string }, kontak?: KontakSettings): EmailTemplate {
  return {
    subject: 'Reset kata sandi Hexatara',
    html: baseLayout(
      'Reset kata sandi',
      `<p>Ada permintaan untuk mengatur ulang kata sandi akun Hexatara Anda.</p>
       ${tombol(params.tautan, 'Atur Ulang Kata Sandi')}
       <p style="font-size:13px;color:#71717A;">Tautan ini sementara dan hanya berlaku sekali pakai. Kalau Anda tidak meminta ini, abaikan email ini — kata sandi Anda tidak berubah.</p>`,
      kontak
    ),
  };
}

export function templatePembayaranDisetujui(
  params: { nama: string; tautanDashboard: string },
  kontak?: KontakSettings
): EmailTemplate {
  const nama = escapeHtml(params.nama);
  return {
    subject: 'Sertifikat Anda sudah aktif',
    html: baseLayout(
      'Sertifikat Anda aktif!',
      `<p>Halo ${nama},</p>
       <p>Pembayaran paket Sertifikat Saja sudah kami verifikasi. QR sertifikat Anda sekarang aktif dan dapat diverifikasi siapa pun di halaman publik Hexatara. Paket ini tidak termasuk merchandise.</p>
       ${tombol(params.tautanDashboard, 'Lihat Sertifikat')}`,
      kontak
    ),
  };
}

export function templateCertMerchDisetujui(
  params: { nama: string; tautanDashboard: string },
  kontak?: KontakSettings
): EmailTemplate {
  const nama = escapeHtml(params.nama);
  return {
    subject: 'Sertifikat aktif, merchandise akan dikirim',
    html: baseLayout(
      'Sertifikat + merchandise disetujui',
      `<p>Halo ${nama},</p>
       <p>Pembayaran paket Sertifikat + Merchandise sudah kami verifikasi. QR sertifikat Anda sekarang aktif, dan merchandise akan diproses untuk pengiriman.</p>
       ${tombol(params.tautanDashboard, 'Lihat di Dashboard')}`,
      kontak
    ),
  };
}

export function templateMerchDisetujui(
  params: { nama: string; tautanMerchandise: string },
  kontak?: KontakSettings
): EmailTemplate {
  const nama = escapeHtml(params.nama);
  return {
    subject: 'Pesanan merchandise Anda sudah disetujui',
    html: baseLayout(
      'Merchandise akan diproses',
      `<p>Halo ${nama},</p>
       <p>Pembayaran tambahan merchandise sudah kami verifikasi. Pesanan akan diproses untuk pengiriman. Sertifikat Anda tidak berubah — QR yang sudah aktif tetap berlaku.</p>
       ${tombol(params.tautanMerchandise, 'Lihat Pesanan Merchandise')}`,
      kontak
    ),
  };
}

export function templatePembayaranDitolak(
  params: { nama: string; alasan: string; tautanUpload: string },
  kontak?: KontakSettings
): EmailTemplate {
  const nama = escapeHtml(params.nama);
  const alasan = escapeHtml(params.alasan);
  return {
    subject: 'Bukti pembayaran perlu diunggah ulang',
    html: baseLayout(
      'Bukti pembayaran belum bisa diverifikasi',
      `<p>Halo ${nama},</p>
       <p>Bukti pembayaran yang Anda unggah belum bisa kami verifikasi, dengan alasan:</p>
       <p style="background:#FAFAFA;border-left:3px solid #DC2626;padding:12px 16px;color:#18181B;">${alasan}</p>
       <p>Silakan unggah ulang bukti pembayaran Anda.</p>
       ${tombol(params.tautanUpload, 'Unggah Ulang Bukti')}`,
      kontak
    ),
  };
}

/** Cabang `minat_batch` ditahan untuk Fase 2 (email pendaftaran batch) — lihat komentar di `send.ts`. */
export function templateLeadBaru(
  params: {
    jenis: 'minat_batch' | 'penawaran';
    nama: string;
    kontak: string;
    detail: string;
    tautanAdmin: string;
  },
  kontakSite?: KontakSettings
): EmailTemplate {
  const nama = escapeHtml(params.nama);
  const kontak = escapeHtml(params.kontak);
  const detail = escapeHtml(params.detail);
  const judul =
    params.jenis === 'minat_batch'
      ? 'Pendaftaran minat batch baru'
      : 'Permintaan penawaran produk baru';
  return {
    subject: `Lead baru: ${judul}`,
    html: baseLayout(
      judul,
      `<p><strong>Nama:</strong> ${nama}</p>
       <p><strong>Kontak:</strong> ${kontak}</p>
       <p><strong>Detail:</strong> ${detail}</p>
       ${tombol(params.tautanAdmin, 'Buka Admin Panel')}`,
      kontakSite
    ),
  };
}
