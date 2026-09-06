export type EmailTemplate = { subject: string; html: string };

function escapeHtml(nilai: string): string {
  return nilai
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function baseLayout(judul: string, isiHtml: string): string {
  return `<!DOCTYPE html>
<html lang="id">
<body style="margin:0;padding:0;background:#F9FAFB;font-family:Inter,Arial,sans-serif;color:#111827;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F9FAFB;padding:24px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="background:#FFFFFF;border-radius:8px;overflow:hidden;">
          <tr>
            <td style="background:#1E40AF;padding:20px 32px;">
              <span style="color:#FFFFFF;font-size:18px;font-weight:700;">Hexatara</span>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;font-size:16px;line-height:1.5;color:#111827;">
              <h1 style="font-size:20px;margin:0 0 16px;color:#111827;">${judul}</h1>
              ${isiHtml}
            </td>
          </tr>
          <tr>
            <td style="padding:16px 32px;background:#F9FAFB;font-size:14px;color:#4B5563;">
              Email otomatis dari Hexatara. Jangan balas email ini.
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
    <a href="${tautan}" style="display:inline-block;background:#F59E0B;color:#111827;font-size:16px;font-weight:600;text-decoration:none;padding:12px 24px;border-radius:6px;">${label}</a>
  </p>`;
}

export function templateVerifikasiEmail(params: { nama: string; tautan: string }): EmailTemplate {
  const nama = escapeHtml(params.nama);
  return {
    subject: 'Verifikasi email Hexatara Anda',
    html: baseLayout(
      'Verifikasi email Anda',
      `<p>Halo ${nama},</p>
       <p>Terima kasih sudah mendaftar di Hexatara. Klik tombol di bawah untuk memverifikasi email Anda dan mengaktifkan akun.</p>
       ${tombol(params.tautan, 'Verifikasi Email')}
       <p style="font-size:14px;color:#4B5563;">Kalau Anda tidak merasa mendaftar, abaikan email ini.</p>`
    ),
  };
}

export function templateResetSandi(params: { tautan: string }): EmailTemplate {
  return {
    subject: 'Reset kata sandi Hexatara',
    html: baseLayout(
      'Reset kata sandi',
      `<p>Ada permintaan untuk mengatur ulang kata sandi akun Hexatara Anda.</p>
       ${tombol(params.tautan, 'Atur Ulang Kata Sandi')}
       <p style="font-size:14px;color:#4B5563;">Tautan ini sementara dan hanya berlaku sekali pakai. Kalau Anda tidak meminta ini, abaikan email ini — kata sandi Anda tidak berubah.</p>`
    ),
  };
}

export function templatePembayaranDisetujui(params: {
  nama: string;
  tautanDashboard: string;
}): EmailTemplate {
  const nama = escapeHtml(params.nama);
  return {
    subject: 'Sertifikat Anda sudah aktif',
    html: baseLayout(
      'Sertifikat Anda aktif!',
      `<p>Halo ${nama},</p>
       <p>Pembayaran Anda sudah kami verifikasi. QR sertifikat Anda sekarang aktif dan dapat diverifikasi siapa pun di halaman publik Hexatara.</p>
       ${tombol(params.tautanDashboard, 'Lihat Sertifikat')}`
    ),
  };
}

export function templatePembayaranDitolak(params: {
  nama: string;
  alasan: string;
  tautanUpload: string;
}): EmailTemplate {
  const nama = escapeHtml(params.nama);
  const alasan = escapeHtml(params.alasan);
  return {
    subject: 'Bukti pembayaran perlu diunggah ulang',
    html: baseLayout(
      'Bukti pembayaran belum bisa diverifikasi',
      `<p>Halo ${nama},</p>
       <p>Bukti pembayaran yang Anda unggah belum bisa kami verifikasi, dengan alasan:</p>
       <p style="background:#F9FAFB;border-left:3px solid #DC2626;padding:12px 16px;color:#111827;">${alasan}</p>
       <p>Silakan unggah ulang bukti pembayaran Anda.</p>
       ${tombol(params.tautanUpload, 'Unggah Ulang Bukti')}`
    ),
  };
}

export function templateLeadBaru(params: {
  jenis: 'minat_batch' | 'penawaran';
  nama: string;
  kontak: string;
  detail: string;
  tautanAdmin: string;
}): EmailTemplate {
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
       ${tombol(params.tautanAdmin, 'Buka Admin Panel')}`
    ),
  };
}
