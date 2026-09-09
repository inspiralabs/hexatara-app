import 'server-only';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { PDFDocument, StandardFonts, rgb, degrees } from 'pdf-lib';

const TEMPLATE_PATH = path.join(process.cwd(), 'public/templates/sertifikat.pdf');

function formatTanggalId(iso: string) {
  return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }).format(
    new Date(iso)
  );
}

// ponytail: koordinat di bawah dikalibrasi untuk placeholder A4 landscape kosong
// (public/templates/sertifikat.pdf, dibuat sendiri — desain asli belum dikirim
// Hexatara, lihat feature-registry.md "Diblokir"). Begitu template asli datang,
// timpa berkasnya dan sesuaikan ulang angka x/y ini terhadap layout barunya —
// tidak ada perubahan lain yang dibutuhkan.
export async function generateSertifikatPreviewPdf({
  namaLengkap,
  tanggalSelesai,
}: {
  namaLengkap: string;
  tanggalSelesai: string; // ISO, dari profiles.free_track_selesai_at
}): Promise<Uint8Array> {
  const templateBytes = await readFile(TEMPLATE_PATH);
  const pdfDoc = await PDFDocument.load(templateBytes);

  const page = pdfDoc.getPages()[0];
  if (!page) throw new Error('Template sertifikat tidak punya halaman apa pun');
  const { width, height } = page.getSize();

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // Watermark PREVIEW — diagonal, transparan, menutupi seluruh halaman.
  page.drawText('PREVIEW', {
    x: width / 2 - 180,
    y: height / 2 - 40,
    size: 90,
    font: fontBold,
    color: rgb(0.86, 0.15, 0.15),
    opacity: 0.15,
    rotate: degrees(30),
  });

  // Badge "Ready To Fly".
  page.drawText('READY TO FLY', {
    x: width - 190,
    y: height - 60,
    size: 14,
    font: fontBold,
    color: rgb(0.96, 0.62, 0.04),
  });

  page.drawText(namaLengkap, {
    x: 60,
    y: height - 220,
    size: 26,
    font: fontBold,
    color: rgb(0.07, 0.09, 0.15),
  });

  page.drawText(`Menyelesaikan materi dasar keselamatan penerbangan drone pada ${formatTanggalId(tanggalSelesai)}`, {
    x: 60,
    y: height - 255,
    size: 12,
    font,
    color: rgb(0.3, 0.35, 0.4),
  });

  // Nomor sertifikat: SENGAJA KOSONG saat preview (ADR-005, PRD §8.6) — belum
  // ada baris di tabel certificates, jadi belum ada nomor untuk ditampilkan.
  page.drawText('Nomor sertifikat: aktif setelah upgrade', {
    x: 60,
    y: height - 285,
    size: 10,
    font,
    color: rgb(0.55, 0.55, 0.55),
  });

  // Kotak QR: placeholder polos, BUKAN QR asli yang di-blur. Tidak ada
  // public_token yang pernah sampai ke fungsi ini untuk digambar.
  const kotakUkuran = 110;
  const kotakX = width - 60 - kotakUkuran;
  const kotakY = 60;
  page.drawRectangle({
    x: kotakX,
    y: kotakY,
    width: kotakUkuran,
    height: kotakUkuran,
    color: rgb(0.9, 0.9, 0.91),
  });
  page.drawText('Aktif setelah', {
    x: kotakX + 12,
    y: kotakY + 62,
    size: 9,
    font,
    color: rgb(0.45, 0.45, 0.47),
  });
  page.drawText('upgrade', {
    x: kotakX + 12,
    y: kotakY + 48,
    size: 9,
    font,
    color: rgb(0.45, 0.45, 0.47),
  });

  return pdfDoc.save();
}
