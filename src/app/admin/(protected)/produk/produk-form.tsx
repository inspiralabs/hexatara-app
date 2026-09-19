'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PlusIcon, XIcon } from 'lucide-react';
import { toast } from 'sonner';
import { ProductFormSchema, type ProductFormInput } from '@/lib/validations/produk-admin';
import { simpanProdukAction, uploadGambarProdukAction } from './actions';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
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
  const [slugDisentuh, setSlugDisentuh] = useState(mode === 'edit');
  const form = useForm<ProductFormInput>({
    resolver: zodResolver(ProductFormSchema),
    defaultValues,
  });
  const {
    control,
    handleSubmit,
    setValue,
    formState: { isSubmitting },
  } = form;

  const images = useFieldArray({ control, name: 'images' });

  async function onSubmit(data: ProductFormInput) {
    const hasil = await simpanProdukAction(mode === 'edit' ? (produkId ?? null) : null, data);
    if (!hasil.ok) {
      toast.error(hasil.pesan);
      return;
    }
    toast.success('Produk berhasil disimpan.');
    router.push('/admin/produk');
    router.refresh();
  }

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-8" noValidate>
        <section className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold text-foreground">Informasi Utama</h2>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <FormField
              control={control}
              name="nama_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama (Indonesia) *</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      onBlur={(e) => {
                        field.onBlur();
                        if (!slugDisentuh && e.target.value) setValue('slug', slugify(e.target.value));
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="nama_en"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama (Inggris)</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Slug *</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      onChange={(e) => {
                        setSlugDisentuh(true);
                        field.onChange(e);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="category_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kategori</FormLabel>
                  <FormControl>
                    <KategoriCombobox
                      items={kategoriOptions}
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Cari kategori produk…"
                    />
                  </FormControl>
                  <FormDescription>
                    Filter & badge publik. Kelola di Produk → Kategori Produk.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="harga"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Harga (Rupiah)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="urutan"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Urutan</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="rating"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rating (0.0 – 5.0)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.1" min={0} max={5} {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormDescription>Kosongkan jika belum ada rating.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={control}
            name="tampilkan_harga"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center gap-2 space-y-0">
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <FormLabel className="font-normal">
                  Tampilkan harga di halaman publik — kalau nonaktif, harga diganti &quot;Hubungi kami untuk harga&quot;
                </FormLabel>
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="is_active"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center gap-2 space-y-0">
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <FormLabel className="font-normal">Aktif — tampil di /katalog</FormLabel>
              </FormItem>
            )}
          />
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold text-foreground">Deskripsi & Spesifikasi</h2>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <FormField
              control={control}
              name="deskripsi_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Deskripsi (Indonesia)</FormLabel>
                  <FormControl>
                    <RichTextEditor value={field.value ?? ''} onChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="deskripsi_en"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Deskripsi (Inggris)</FormLabel>
                  <FormControl>
                    <RichTextEditor value={field.value ?? ''} onChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="spesifikasi_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Spesifikasi (Indonesia)</FormLabel>
                  <FormControl>
                    <RichTextEditor value={field.value ?? ''} onChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="spesifikasi_en"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Spesifikasi (Inggris)</FormLabel>
                  <FormControl>
                    <RichTextEditor value={field.value ?? ''} onChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </section>

        <section className="flex flex-col gap-4">
          <FormField
            control={control}
            name="thumbnail_url"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <ImageUploadField
                    label="Thumbnail (kartu katalog)"
                    aspectRatio={16 / 9}
                    lockSize
                    suggestedPx="1200×675px"
                    value={field.value ?? null}
                    onChange={field.onChange}
                    onUpload={async (file) => {
                      const fd = new FormData();
                      fd.append('file', file);
                      return uploadGambarProdukAction(fd);
                    }}
                  />
                </FormControl>
                <FormDescription>
                  Ditampilkan di kartu katalog dan hasil pencarian. Foto di bagian &quot;Foto Produk&quot;
                  di bawah ini khusus untuk galeri halaman detail, tidak dipakai sebagai thumbnail.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </section>

        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-foreground">Foto Produk (galeri detail)</h2>
            <Button type="button" variant="outline" size="sm" onClick={() => images.append({ url: '' })}>
              <PlusIcon className="size-4" /> Tambah
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Galeri halaman detail — crop bebas. Gunakan foto dengan latar belakang putih/polos untuk hasil terbaik.
          </p>
          {images.fields.map((f, index) => (
            <div key={f.id} className="flex flex-col gap-3 rounded-lg border border-border p-3 sm:flex-row sm:items-start">
              <FormField
                control={control}
                name={`images.${index}.url`}
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <ImageUploadField
                        label="Foto"
                        suggestedPx="1200×1200px"
                        value={field.value || null}
                        onChange={(url) => field.onChange(url ?? '')}
                        onUpload={async (file) => {
                          const fd = new FormData();
                          fd.append('file', file);
                          return uploadGambarProdukAction(fd);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => images.remove(index)}
                aria-label="Hapus foto"
                className="self-start"
              >
                <XIcon className="size-4" />
              </Button>
            </div>
          ))}
        </section>

        <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
          <Button type="submit" disabled={isSubmitting} className="h-11 px-6">
            {isSubmitting ? 'Menyimpan…' : 'Simpan'}
          </Button>
          <Button type="button" variant="outline" className="h-11 px-6" onClick={() => router.push('/admin/produk')}>
            Batal
          </Button>
        </div>
      </form>
    </Form>
  );
}
