import { requireAdmin } from '@/lib/auth/guard';
import { createClient } from '@/lib/supabase/server';
import { getMateriId } from '@/lib/materi/singleton';
import { MateriForm } from './materi-form';
import { BabList } from './bab-list';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import type { MateriFormInput } from '@/lib/validations/materi-admin';

const DEFAULT_VALUES: MateriFormInput = {
  judul_id: '',
  judul_en: '',
  deskripsi_id: '',
  deskripsi_en: '',
  file_url: '',
  poster_url: '',
  is_active: true,
};

export default async function AdminMateriPage() {
  // Layout sudah memanggil requireAdmin(), tapi Server Component ini memanggil
  // lagi secara eksplisit sesuai ENGINEERING §4.1 — bukan cuma diandalkan dari layout.
  await requireAdmin();

  const materialId = await getMateriId();

  if (materialId == null) {
    return (
      <div className="flex flex-col gap-4">
        <h1 className="text-xl font-bold text-warna-teks">Materi</h1>
        <p className="text-sm text-warna-teks-2">
          Lengkapi pengaturan kartu halaman Materi dulu — ini cuma sekali, sebelum bisa menambah Materi.
        </p>
        <MateriForm mode="create" defaultValues={DEFAULT_VALUES} />
      </div>
    );
  }

  const supabase = await createClient();
  const { data: materi } = await supabase.from('materials').select('*').eq('id', materialId).maybeSingle();
  const { data: bab, error: errBab } = await supabase
    .from('material_chapters')
    .select('id, judul_id')
    .eq('material_id', materialId)
    .order('urutan');
  if (errBab) console.error('[admin-materi] gagal memuat daftar materi:', errBab);

  const defaultValues: MateriFormInput = materi
    ? {
        judul_id: materi.judul_id,
        judul_en: materi.judul_en ?? '',
        deskripsi_id: materi.deskripsi_id ?? '',
        deskripsi_en: materi.deskripsi_en ?? '',
        file_url: materi.file_url,
        poster_url: materi.poster_url ?? '',
        is_active: materi.is_active,
      }
    : DEFAULT_VALUES;

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-bold text-warna-teks">Materi</h1>

      <Accordion defaultValue={[]}>
        <AccordionItem value="pengaturan" className="rounded-lg border border-warna-latar-2 px-4">
          <AccordionTrigger className="hover:no-underline">Pengaturan Kartu Materi</AccordionTrigger>
          <AccordionContent>
            <MateriForm mode="edit" materiId={materialId} defaultValues={defaultValues} />
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <BabList materialId={materialId} bab={bab ?? []} />
    </div>
  );
}
