import { requireAdmin } from '@/lib/auth/guard';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ImporForm } from './impor-form';

export default async function AdminSertifikatImporPage() {
  await requireAdmin();

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold text-foreground">Impor Massal Sertifikat</h1>
      <p className="text-sm text-muted-foreground">
        Unduh template, isi datanya, lalu unggah kembali. Baris yang gagal akan dilewati dan dilaporkan satu per
        satu — baris lainnya tetap tersimpan.
      </p>
      <a
        href="/templates/sertifikat-import-template.xlsx"
        download
        className={cn(buttonVariants({ variant: 'outline' }), 'h-11 w-fit px-5')}
      >
        Unduh Template
      </a>
      <ImporForm />
    </div>
  );
}
