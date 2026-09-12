import { requireAdmin } from '@/lib/auth/guard';
import { ImporSoalForm } from './impor-form';

export default async function AdminSoalImporPage() {
  await requireAdmin();

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-bold text-warna-teks">Impor Massal Bank Soal</h1>
      <p className="text-sm text-warna-teks-2">
        Unduh template, isi datanya, lalu unggah kembali. Kolom <code>jawaban_benar</code> diisi salah satu dari
        a/b/c/d. Kolom <code>_en</code> boleh dikosongkan seluruhnya. Baris yang gagal akan dilewati dan dilaporkan
        satu per satu — baris lainnya tetap tersimpan.
      </p>
      <a
        href="/templates/bank-soal-import-template.xlsx"
        download
        className="inline-flex h-11 w-fit items-center justify-center rounded-lg border border-warna-utama px-5 text-base font-semibold text-warna-utama"
      >
        Unduh Template
      </a>
      <ImporSoalForm />
    </div>
  );
}
