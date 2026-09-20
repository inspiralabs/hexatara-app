import { notFound } from 'next/navigation';
import { requireAdmin } from '@/lib/auth/guard';
import { createClient } from '@/lib/supabase/server';
import { BatchForm } from '../batch-form';
import type { BatchFormInput } from '@/lib/validations/batch-admin';

export default async function AdminBatchUbahPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();

  const { id } = await params;
  const batchId = Number(id);
  if (!Number.isInteger(batchId)) notFound();

  const supabase = await createClient();
  const { data: batch } = await supabase.from('batches').select('*').eq('id', batchId).maybeSingle();
  if (!batch) notFound();

  const [
    { data: benefits },
    { data: requirements },
    { data: equipment },
    { data: faqs },
    { data: gallery },
    { data: kategoriList },
  ] = await Promise.all([
    supabase.from('batch_benefits').select('teks_id, teks_en, ikon').eq('batch_id', batchId).order('urutan'),
    supabase
      .from('batch_requirements')
      .select('teks_id, teks_en, ikon')
      .eq('batch_id', batchId)
      .order('urutan'),
    supabase.from('batch_equipment').select('teks_id, teks_en').eq('batch_id', batchId).order('urutan'),
    supabase.from('batch_faqs').select('tanya_id, tanya_en, jawab_id, jawab_en').eq('batch_id', batchId).order('urutan'),
    supabase.from('batch_gallery').select('gambar_url, caption_id, caption_en').eq('batch_id', batchId).order('urutan'),
    supabase.from('batch_categories').select('id, nama_id').order('urutan', { ascending: true }),
  ]);

  // Admin Panel Bahasa Indonesia saja (ENGINEERING.md §6.3) — label combobox
  // pakai nama_id langsung, tidak perlu pick() dwibahasa di sini.
  const kategoriOptions = (kategoriList ?? []).map((k) => ({ value: k.id, label: k.nama_id }));

  const defaultValues: BatchFormInput = {
    judul_id: batch.judul_id,
    judul_en: batch.judul_en ?? '',
    slug: batch.slug,
    category_id: batch.category_id,
    rating: batch.rating ?? '',
    lokasi_id: batch.lokasi_id ?? '',
    lokasi_en: batch.lokasi_en ?? '',
    alamat: batch.alamat ?? '',
    harga: batch.harga ?? '',
    status: batch.status,
    is_active: batch.is_active,
    hero_gambar_url: batch.hero_gambar_url ?? '',
    gambar_detail_url: batch.gambar_detail_url ?? '',
    deskripsi_id: batch.deskripsi_id ?? '',
    deskripsi_en: batch.deskripsi_en ?? '',
    silabus_id: batch.silabus_id ?? '',
    silabus_en: batch.silabus_en ?? '',
    tanggal_mulai: batch.tanggal_mulai,
    tanggal_selesai: batch.tanggal_selesai,
    benefits: (benefits ?? []).map((b) => ({ teks_id: b.teks_id, teks_en: b.teks_en ?? '', ikon: b.ikon ?? '' })),
    requirements: (requirements ?? []).map((r) => ({
      teks_id: r.teks_id,
      teks_en: r.teks_en ?? '',
      ikon: r.ikon ?? '',
    })),
    equipment: (equipment ?? []).map((e) => ({ teks_id: e.teks_id, teks_en: e.teks_en ?? '' })),
    faqs: (faqs ?? []).map((f) => ({
      tanya_id: f.tanya_id,
      tanya_en: f.tanya_en ?? '',
      jawab_id: f.jawab_id,
      jawab_en: f.jawab_en ?? '',
    })),
    gallery: (gallery ?? []).map((g) => ({
      gambar_url: g.gambar_url,
      caption_id: g.caption_id ?? '',
      caption_en: g.caption_en ?? '',
    })),
  };

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold text-foreground">Ubah Batch</h1>
      <BatchForm mode="edit" batchId={batch.id} defaultValues={defaultValues} kategoriOptions={kategoriOptions} />
    </div>
  );
}
