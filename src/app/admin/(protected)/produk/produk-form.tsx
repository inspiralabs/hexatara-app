'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PlusIcon, XIcon } from 'lucide-react';
import { toast } from 'sonner';
import { ProductFormSchema, type ProductFormInput } from '@/lib/validations/produk-admin';
import { simpanProdukAction, uploadGambarProdukAction } from './actions';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RichTextEditor } from '@/components/admin/rich-text-editor';
import { ImageUploadField } from '@/components/image-upload-field';
import { KategoriCombobox, type KategoriOption } from '@/components/admin/kategori-combobox';

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

export function ProdukForm({
  mode,
  produkId,
  defaultValues,
  kategoriOptions,
}: {
  mode: 'create' | 'edit';
  produkId?: number;
  defaultValues: ProductFormInput;
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
  } = useForm<ProductFormInput>({
    resolver: zodResolver(ProductFormSchema),
    defaultValues,
  });

  const images = useFieldArray({ control, name: 'images' });

  async function onSubmit(data: ProductFormInput) {
    setPesanError(null);
    const hasil = await simpanProdukAction(mode === 'edit' ? (produkId ?? null) : null, data);
    if (!hasil.ok) {
      setPesanError(hasil.pesan);
      toast.error(hasil.pesan);
      return;
    }
    toast.success('Produk berhasil disimpan.');
    router.push('/admin/produk');
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
          <div>
            <Field label="Nama (Indonesia) *" htmlFor="nama_id">
              <Input
                id="nama_id"
                {...register('nama_id', {
                  onBlur: (e) => {
                    if (!slugDisentuh && e.target.value) setValue('slug', slugify(e.target.value));
                  },
                })}
              />
            </Field>
            {errors.nama_id && <p className="mt-1 text-sm text-destructive">{errors.nama_id.message}</p>}
          </div>
          <Field label="Nama (Inggris)" htmlFor="nama_en">
            <Input id="nama_en" {...register('nama_en')} />
          </Field>

          <div>
            <Field label="Slug *" htmlFor="slug">
              <Input id="slug" {...register('slug', { onChange: () => setSlugDisentuh(true) })} />
            </Field>
            {errors.slug && <p className="mt-1 text-sm text-destructive">{errors.slug.message}</p>}
          </div>
          <Field label="Kategori" htmlFor="kategori">
            <Input id="kategori" placeholder="Contoh: Drone Survei" {...register('kategori')} />
          </Field>
          <Field label="Kategori (dari daftar kategori)" htmlFor="category_id">
            <Controller
              control={control}
              name="category_id"
              render={({ field }) => (
                <KategoriCombobox
                  items={kategoriOptions}
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Cari kategori produk…"
                />
              )}
            />
            <p className="text-xs text-warna-teks-2">
              Dipakai untuk filter kategori di halaman publik. Kelola daftar kategori di menu Produk &rarr; Kategori
              Produk.
            </p>
          </Field>

          <Field label="Harga (Rupiah)" htmlFor="harga">
            <Input id="harga" type="number" {...register('harga')} />
          </Field>
          <Field label="Urutan" htmlFor="urutan">
            <Input id="urutan" type="number" {...register('urutan')} />
          </Field>

          <Field label="Rating (0.0 – 5.0)" htmlFor="rating">
            <Input id="rating" type="number" step="0.1" min={0} max={5} {...register('rating')} />
            <p className="text-xs text-warna-teks-2">Kosongkan jika belum ada rating.</p>
            {errors.rating && <p className="text-sm text-destructive">{errors.rating.message}</p>}
          </Field>
        </div>

        <Controller
          control={control}
          name="tampilkan_harga"
          render={({ field }) => (
            <div className="flex items-center gap-2">
              <Switch id="tampilkan_harga" checked={field.value} onCheckedChange={field.onChange} />
              <Label htmlFor="tampilkan_harga" className="font-normal">
                Tampilkan harga di halaman publik — kalau nonaktif, harga diganti &quot;Hubungi kami untuk harga&quot;
              </Label>
            </div>
          )}
        />

        <Controller
          control={control}
          name="is_active"
          render={({ field }) => (
            <div className="flex items-center gap-2">
              <Switch id="is_active" checked={field.value} onCheckedChange={field.onChange} />
              <Label htmlFor="is_active" className="font-normal">
                Aktif — tampil di /katalog
              </Label>
            </div>
          )}
        />
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-bold text-warna-teks">Deskripsi & Spesifikasi</h2>
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

          <Field label="Spesifikasi (Indonesia)" htmlFor="spesifikasi_id">
            <Controller
              control={control}
              name="spesifikasi_id"
              render={({ field }) => <RichTextEditor value={field.value ?? ''} onChange={field.onChange} />}
            />
          </Field>
          <Field label="Spesifikasi (Inggris)" htmlFor="spesifikasi_en">
            <Controller
              control={control}
              name="spesifikasi_en"
              render={({ field }) => <RichTextEditor value={field.value ?? ''} onChange={field.onChange} />}
            />
          </Field>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-warna-teks">Foto Produk</h2>
          <button
            type="button"
            onClick={() => images.append({ url: '' })}
            className="flex h-9 items-center gap-1.5 rounded-lg border border-warna-utama px-3 text-sm font-medium text-warna-utama"
          >
            <PlusIcon className="size-4" /> Tambah
          </button>
        </div>
        {images.fields.map((f, index) => (
          <div key={f.id} className="flex flex-col gap-3 rounded-lg border border-warna-latar-2 p-3 sm:flex-row sm:items-start">
            <Controller
              control={control}
              name={`images.${index}.url`}
              render={({ field }) => (
                <ImageUploadField
                  label="Foto"
                  aspectRatio={1}
                  suggestedPx="1200×1200px"
                  value={field.value || null}
                  onChange={(url) => field.onChange(url ?? '')}
                  onUpload={async (file) => {
                    const fd = new FormData();
                    fd.append('file', file);
                    return uploadGambarProdukAction(fd);
                  }}
                />
              )}
            />
            {errors.images?.[index]?.url && (
              <p className="text-sm text-destructive">{errors.images[index]?.url?.message}</p>
            )}
            <button
              type="button"
              onClick={() => images.remove(index)}
              aria-label="Hapus foto"
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
          onClick={() => router.push('/admin/produk')}
          className="inline-flex h-11 items-center justify-center rounded-lg border border-warna-latar-2 px-6 text-base font-semibold text-warna-teks"
        >
          Batal
        </button>
      </div>
    </form>
  );
}
