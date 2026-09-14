import { requireAdmin } from '@/lib/auth/guard';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ImporSoalForm } from './impor-form';

export default async function AdminSoalImporPage() {
  await requireAdmin();

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold text-foreground">Impor Massal Bank Soal</h1>
      <p className="text-sm text-muted-foreground">
        Unduh template, isi datanya, lalu unggah kembali. Kolom <code>jawaban_benar</code> diisi salah satu dari
        a/b/c/d. Kolom <code>_en</code> boleh dikosongkan seluruhnya. Baris yang gagal akan dilewati dan dilaporkan
        satu per satu — baris lainnya tetap tersimpan.
      </p>
      <a
        href="/templates/bank-soal-import-template.xlsx"
        download
        className={cn(buttonVariants({ variant: 'outline' }), 'h-11 w-fit px-5')}
      >
        Unduh Template
      </a>
      <ImporSoalForm />
    </div>
  );
}
