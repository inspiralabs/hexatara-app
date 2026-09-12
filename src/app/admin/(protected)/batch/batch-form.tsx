'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PlusIcon, XIcon } from 'lucide-react';
import { BatchFormSchema, type BatchFormInput } from '@/lib/validations/batch-admin';
import { simpanBatchAction } from './actions';
import { uploadGambarAdminAction } from '../actions';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePickerField } from '@/components/admin/date-picker-field';
import { RichTextEditor } from '@/components/admin/rich-text-editor';
import { ImageUploadField } from '@/components/image-upload-field';
import { KategoriCombobox, type KategoriOption } from '@/components/admin/kategori-combobox';

const STATUS_OPTIONS: { value: BatchFormInput['status']; label: string }[] = [
  { value: 'upcoming', label: 'Akan Datang' },
  { value: 'open', label: 'Pendaftaran Dibuka' },
  { value: 'closed', label: 'Ditutup' },
];

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function Field({ label, htmlFor, children }: { label: string; htmlFor: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
    </div>
  );
}

export function BatchForm({
  mode,
  batchId,
  defaultValues,
  kategoriOptions,
}: {
  mode: 'create' | 'edit';
  batchId?: number;
  defaultValues: BatchFormInput;
  kategoriOptions: KategoriOption[];
}) {
  const router = useRouter();
  const [pesanError, setPesanError] = useState<string | null>(null);
  const [slugDisentuh, setSlugDisentuh] = useState(mode === 'edit');
  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<BatchFormInput>({
    resolver: zodResolver(BatchFormSchema),
    defaultValues,
  });

  const benefits = useFieldArray({ control, name: 'benefits' });
  const equipment = useFieldArray({ control, name: 'equipment' });
  const faqs = useFieldArray({ control, name: 'faqs' });
  const gallery = useFieldArray({ control, name: 'gallery' });

  async function onSubmit(data: BatchFormInput) {
    setPesanError(null);
    const hasil = await simpanBatchAction(mode === 'edit' ? (batchId ?? null) : null, data);
    if (!hasil.ok) {
      setPesanError(hasil.pesan);
      return;
    }
    router.push('/admin/batch');
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-8" noValidate>
      {pesanError && (
        <Alert variant="destructive">
          <AlertDescription>{pesanError}</AlertDescription>
        </Alert>
      )}

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-bold text-warna-teks">Informasi Utama</h2>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Field label="Judul (Indonesia) *" htmlFor="judul_id">
            <Input
              id="judul_id"
              {...register('judul_id', {
                onBlur: (e) => {
                  if (!slugDisentuh && e.target.value) setValue('slug', slugify(e.target.value));
                },
              })}
            />
            {errors.judul_id && <p className="text-sm text-destructive">{errors.judul_id.message}</p>}
          </Field>
          <Field label="Judul (Inggris)" htmlFor="judul_en">
            <Input id="judul_en" {...register('judul_en')} />
          </Field>
        </div>

        <Field label="Slug URL *" htmlFor="slug">
          <Input
            id="slug"
            {...register('slug', { onChange: () => setSlugDisentuh(true) })}
          />
          <p className="text-xs text-warna-teks-2">Dipakai di alamat halaman: /batch/slug-ini</p>
          {errors.slug && <p className="text-sm text-destructive">{errors.slug.message}</p>}
        </Field>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Field label="Kategori (Indonesia)" htmlFor="kategori_id">
            <Input id="kategori_id" {...register('kategori_id')} />
          </Field>
          <Field label="Kategori (Inggris)" htmlFor="kategori_en">
            <Input id="kategori_en" {...register('kategori_en')} />
          </Field>

          <div className="lg:col-span-2">
            <Field label="Kategori (dari daftar kategori)" htmlFor="category_id">
              <Controller
                control={control}
                name="category_id"
                render={({ field }) => (
                  <KategoriCombobox
                    items={kategoriOptions}
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Cari kategori pelatihan…"
                  />
                )}
              />
              <p className="text-xs text-warna-teks-2">
                Dipakai untuk filter kategori di halaman publik. Kelola daftar kategori di menu Batch &rarr; Kategori
                Pelatihan.
              </p>
            </Field>
          </div>

          <Field label="Lokasi (Indonesia)" htmlFor="lokasi_id">
            <Input id="lokasi_id" {...register('lokasi_id')} />
          </Field>
          <Field label="Lokasi (Inggris)" htmlFor="lokasi_en">
            <Input id="lokasi_en" {...register('lokasi_en')} />
          </Field>
        </div>

        <Field label="Alamat" htmlFor="alamat">
          <Textarea id="alamat" rows={2} {...register('alamat')} />
        </Field>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Harga (Rp)" htmlFor="harga">
            <Input id="harga" type="number" min={0} {...register('harga')} />
            {errors.harga && <p className="text-sm text-destructive">{errors.harga.message}</p>}
          </Field>

          <Field label="Status *" htmlFor="status">
            <Controller
              control={control}
              name="status"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="status" className="h-11 w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </Field>

          <Field label="Rating (0.0 – 5.0)" htmlFor="rating">
            <Input id="rating" type="number" step="0.1" min={0} max={5} {...register('rating')} />
            <p className="text-xs text-warna-teks-2">Kosongkan jika belum ada rating.</p>
            {errors.rating && <p className="text-sm text-destructive">{errors.rating.message}</p>}
          </Field>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Controller
            control={control}
            name="tanggal_mulai"
            render={({ field }) => (
              <DatePickerField label="Tanggal Mulai" value={field.value ?? null} onChange={field.onChange} />
            )}
          />
          <Controller
            control={control}
            name="tanggal_selesai"
            render={({ field }) => (
              <DatePickerField label="Tanggal Selesai" value={field.value ?? null} onChange={field.onChange} />
            )}
          />
        </div>

        <Controller
          control={control}
          name="is_active"
          render={({ field }) => (
            <div className="flex items-center gap-2">
              <Switch id="is_active" checked={field.value} onCheckedChange={field.onChange} />
              <Label htmlFor="is_active" className="font-normal">
                Tampilkan di halaman publik
              </Label>
            </div>
          )}
        />

        <Controller
          control={control}
          name="hero_gambar_url"
          render={({ field }) => (
            <ImageUploadField
              label="Gambar Hero"
              aspectRatio={16 / 9}
              suggestedPx="1920×1080px"
              value={field.value ?? null}
              onChange={field.onChange}
              onUpload={async (file) => {
                const fd = new FormData();
                fd.append('file', file);
                return uploadGambarAdminAction(fd);
              }}
            />
          )}
        />
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-bold text-warna-teks">Deskripsi & Silabus</h2>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Field label="Deskripsi (Indonesia)" htmlFor="deskripsi_id">
            <Controller
              control={control}
              name="deskripsi_id"
              render={({ field }) => <RichTextEditor value={field.value ?? ''} onChange={field.onChange} />}
            />
          </Field>
          <Field label="Deskripsi (Inggris)" htmlFor="deskripsi_en">
            <Controller
              control={control}
              name="deskripsi_en"
              render={({ field }) => <RichTextEditor value={field.value ?? ''} onChange={field.onChange} />}
            />
          </Field>

          <Field label="Silabus (Indonesia)" htmlFor="silabus_id">
            <Controller
              control={control}
              name="silabus_id"
              render={({ field }) => <RichTextEditor value={field.value ?? ''} onChange={field.onChange} />}
            />
          </Field>
          <Field label="Silabus (Inggris)" htmlFor="silabus_en">
            <Controller
              control={control}
              name="silabus_en"
              render={({ field }) => <RichTextEditor value={field.value ?? ''} onChange={field.onChange} />}
            />
          </Field>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-warna-teks">Benefit</h2>
          <button
            type="button"
            onClick={() => benefits.append({ teks_id: '', teks_en: '' })}
            className="flex h-9 items-center gap-1.5 rounded-lg border border-warna-utama px-3 text-sm font-medium text-warna-utama"
          >
            <PlusIcon className="size-4" /> Tambah
          </button>
        </div>
        {benefits.fields.map((f, index) => (
          <div key={f.id} className="grid grid-cols-1 gap-3 rounded-lg border border-warna-latar-2 p-3 sm:grid-cols-[1fr_1fr_auto]">
            <div className="flex flex-col gap-1">
              <Input placeholder="Teks (Indonesia)" {...register(`benefits.${index}.teks_id`)} />
              {errors.benefits?.[index]?.teks_id && (
                <p className="text-sm text-destructive">{errors.benefits[index]?.teks_id?.message}</p>
              )}
            </div>
            <Input placeholder="Teks (Inggris)" {...register(`benefits.${index}.teks_en`)} />
            <button
              type="button"
              onClick={() => benefits.remove(index)}
              aria-label="Hapus benefit"
              className="flex size-9 items-center justify-center rounded-lg text-warna-teks-2 hover:bg-warna-latar-2"
            >
              <XIcon className="size-4" />
            </button>
          </div>
        ))}
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-warna-teks">Peralatan Belajar</h2>
          <button
            type="button"
            onClick={() => equipment.append({ teks_id: '', teks_en: '' })}
            className="flex h-9 items-center gap-1.5 rounded-lg border border-warna-utama px-3 text-sm font-medium text-warna-utama"
          >
            <PlusIcon className="size-4" /> Tambah
          </button>
        </div>
        {equipment.fields.map((f, index) => (
          <div key={f.id} className="grid grid-cols-1 gap-3 rounded-lg border border-warna-latar-2 p-3 sm:grid-cols-[1fr_1fr_auto]">
            <div className="flex flex-col gap-1">
              <Input placeholder="Teks (Indonesia)" {...register(`equipment.${index}.teks_id`)} />
              {errors.equipment?.[index]?.teks_id && (
                <p className="text-sm text-destructive">{errors.equipment[index]?.teks_id?.message}</p>
              )}
            </div>
            <Input placeholder="Teks (Inggris)" {...register(`equipment.${index}.teks_en`)} />
            <button
              type="button"
              onClick={() => equipment.remove(index)}
              aria-label="Hapus peralatan"
              className="flex size-9 items-center justify-center rounded-lg text-warna-teks-2 hover:bg-warna-latar-2"
            >
              <XIcon className="size-4" />
            </button>
          </div>
        ))}
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-warna-teks">FAQ</h2>
          <button
            type="button"
            onClick={() => faqs.append({ tanya_id: '', tanya_en: '', jawab_id: '', jawab_en: '' })}
            className="flex h-9 items-center gap-1.5 rounded-lg border border-warna-utama px-3 text-sm font-medium text-warna-utama"
          >
            <PlusIcon className="size-4" /> Tambah
          </button>
        </div>
        {faqs.fields.map((f, index) => (
          <div key={f.id} className="flex flex-col gap-3 rounded-lg border border-warna-latar-2 p-3">
            <div className="flex items-start justify-between gap-3">
              <div className="grid flex-1 grid-cols-1 gap-3 lg:grid-cols-2">
                <div className="flex flex-col gap-1">
                  <Input placeholder="Pertanyaan (Indonesia)" {...register(`faqs.${index}.tanya_id`)} />
                  {errors.faqs?.[index]?.tanya_id && (
                    <p className="text-sm text-destructive">{errors.faqs[index]?.tanya_id?.message}</p>
                  )}
                </div>
                <Input placeholder="Pertanyaan (Inggris)" {...register(`faqs.${index}.tanya_en`)} />
                <div className="flex flex-col gap-1">
                  <Textarea rows={2} placeholder="Jawaban (Indonesia)" {...register(`faqs.${index}.jawab_id`)} />
                  {errors.faqs?.[index]?.jawab_id && (
                    <p className="text-sm text-destructive">{errors.faqs[index]?.jawab_id?.message}</p>
                  )}
                </div>
                <Textarea rows={2} placeholder="Jawaban (Inggris)" {...register(`faqs.${index}.jawab_en`)} />
              </div>
              <button
                type="button"
                onClick={() => faqs.remove(index)}
                aria-label="Hapus FAQ"
                className="flex size-9 shrink-0 items-center justify-center rounded-lg text-warna-teks-2 hover:bg-warna-latar-2"
              >
                <XIcon className="size-4" />
              </button>
            </div>
          </div>
        ))}
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-warna-teks">Galeri Dokumentasi</h2>
          <button
            type="button"
            onClick={() => gallery.append({ gambar_url: '', caption_id: '', caption_en: '' })}
            className="flex h-9 items-center gap-1.5 rounded-lg border border-warna-utama px-3 text-sm font-medium text-warna-utama"
          >
            <PlusIcon className="size-4" /> Tambah
          </button>
        </div>
        {gallery.fields.map((f, index) => (
          <div key={f.id} className="flex flex-col gap-3 rounded-lg border border-warna-latar-2 p-3 sm:flex-row sm:items-start">
            <Controller
              control={control}
              name={`gallery.${index}.gambar_url`}
              render={({ field }) => (
                <ImageUploadField
                  label="Gambar"
                  aspectRatio={16 / 9}
                  suggestedPx="1920×1080px"
                  value={field.value || null}
                  onChange={(url) => field.onChange(url ?? '')}
                  onUpload={async (file) => {
                    const fd = new FormData();
                    fd.append('file', file);
                    return uploadGambarAdminAction(fd);
                  }}
                />
              )}
            />
            <div className="flex flex-1 flex-col gap-3">
              <Input placeholder="Keterangan (Indonesia)" {...register(`gallery.${index}.caption_id`)} />
              <Input placeholder="Keterangan (Inggris)" {...register(`gallery.${index}.caption_en`)} />
              {errors.gallery?.[index]?.gambar_url && (
                <p className="text-sm text-destructive">{errors.gallery[index]?.gambar_url?.message}</p>
              )}
            </div>
            <button
              type="button"
              onClick={() => gallery.remove(index)}
              aria-label="Hapus foto galeri"
              className="flex size-9 shrink-0 items-center justify-center self-start rounded-lg text-warna-teks-2 hover:bg-warna-latar-2"
            >
              <XIcon className="size-4" />
            </button>
          </div>
        ))}
      </section>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex h-11 items-center justify-center rounded-lg bg-warna-aksen px-6 text-base font-semibold text-warna-teks disabled:opacity-50"
        >
          {isSubmitting ? 'Menyimpan…' : 'Simpan'}
        </button>
        <button
          type="button"
          onClick={() => router.push('/admin/batch')}
          className="inline-flex h-11 items-center justify-center rounded-lg border border-warna-latar-2 px-6 text-base font-semibold text-warna-teks"
        >
          Batal
        </button>
      </div>
    </form>
  );
}
