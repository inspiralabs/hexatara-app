'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PlusIcon, XIcon } from 'lucide-react';
import { toast } from 'sonner';
import { BatchFormSchema, type BatchFormInput } from '@/lib/validations/batch-admin';
import { salinDariBatchAction, simpanBatchAction } from './actions';
import { uploadGambarAdminAction } from '../actions';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { DatePickerField } from '@/components/admin/date-picker-field';
import { RichTextEditor } from '@/components/admin/rich-text-editor';
import { ImageUploadField } from '@/components/image-upload-field';
import { KategoriCombobox, type KategoriOption } from '@/components/admin/kategori-combobox';

const STATUS_OPTIONS: { value: BatchFormInput['status']; label: string }[] = [
  { value: 'upcoming', label: 'Akan Datang' },
  { value: 'open', label: 'Pendaftaran Dibuka' },
  { value: 'closed', label: 'Ditutup' },
];

export type SumberBatchOption = {
  value: string;
  label: string;
};

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function BatchForm({
  mode,
  batchId,
  defaultValues,
  kategoriOptions,
  sumberBatchOptions = [],
}: {
  mode: 'create' | 'edit';
  batchId?: number;
  defaultValues: BatchFormInput;
  kategoriOptions: KategoriOption[];
  sumberBatchOptions?: SumberBatchOption[];
}) {
  const router = useRouter();
  const [slugDisentuh, setSlugDisentuh] = useState(mode === 'edit');
  const [sumberId, setSumberId] = useState<string | null>(null);
  const [salinPending, startSalin] = useTransition();
  const form = useForm<BatchFormInput>({
    resolver: zodResolver(BatchFormSchema),
    defaultValues,
  });
  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { isSubmitting },
  } = form;

  const benefits = useFieldArray({ control, name: 'benefits' });
  const requirements = useFieldArray({ control, name: 'requirements' });
  const equipment = useFieldArray({ control, name: 'equipment' });
  const faqs = useFieldArray({ control, name: 'faqs' });
  const gallery = useFieldArray({ control, name: 'gallery' });

  async function onSubmit(data: BatchFormInput) {
    const hasil = await simpanBatchAction(mode === 'edit' ? (batchId ?? null) : null, data);
    if (!hasil.ok) {
      toast.error(hasil.pesan);
      return;
    }
    toast.success('Batch berhasil disimpan.');
    router.push('/admin/batch');
    router.refresh();
  }

  function salinDari(batchIdSumber: string | null) {
    setSumberId(batchIdSumber);
    if (!batchIdSumber) return;
    const id = Number.parseInt(batchIdSumber, 10);
    if (!Number.isInteger(id)) return;

    startSalin(async () => {
      const hasil = await salinDariBatchAction(id);
      if (!hasil.ok) {
        toast.error(hasil.pesan);
        return;
      }
      reset(hasil.data);
      setSlugDisentuh(false);
      toast.success('Konten batch sumber diisi ke form. Lengkapi judul, slug, tanggal, lalu simpan.');
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-8" noValidate>
        {mode === 'create' && sumberBatchOptions.length > 0 && (
          <section className="flex flex-col gap-2 rounded-lg border border-border bg-card p-4">
            <Label htmlFor="salin-batch">Salin dari Batch Lain</Label>
            <p className="text-sm text-muted-foreground">
              Mengisi form dari batch sumber (bukan menyimpan). Judul, slug, tanggal, status, dan
              poster tetap kosong — lengkapi lalu simpan seperti biasa.
            </p>
            <Select
              items={[
                { value: 'none', label: 'Pilih batch sumber…' },
                ...sumberBatchOptions,
              ]}
              value={sumberId ?? 'none'}
              onValueChange={(v) => salinDari(!v || v === 'none' ? null : v)}
              disabled={salinPending}
            >
              <SelectTrigger
                id="salin-batch"
                className="h-11 w-full sm:w-fit sm:max-w-[min(100%,40rem)] *:data-[slot=select-value]:line-clamp-none"
              >
                <SelectValue placeholder="Pilih batch sumber…" />
              </SelectTrigger>
              <SelectContent className="w-max min-w-(--anchor-width) max-w-[min(100vw-2rem,40rem)]">
                <SelectItem value="none">Pilih batch sumber…</SelectItem>
                {sumberBatchOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {salinPending && (
              <p className="text-sm text-muted-foreground">Menyalin konten…</p>
            )}
          </section>
        )}

        <section className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold text-foreground">Informasi Utama</h2>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <FormField
              control={control}
              name="judul_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Judul (Indonesia) *</FormLabel>
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
              name="judul_en"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Judul (Inggris)</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={control}
            name="slug"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Slug URL *</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    onChange={(e) => {
                      setSlugDisentuh(true);
                      field.onChange(e);
                    }}
                  />
                </FormControl>
                <FormDescription>Dipakai di alamat halaman: /batch/slug-ini</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <FormField
              control={control}
              name="kategori_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kategori (Indonesia)</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="kategori_en"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kategori (Inggris)</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="category_id"
              render={({ field }) => (
                <FormItem className="lg:col-span-2">
                  <FormLabel>Kategori (dari daftar kategori)</FormLabel>
                  <FormControl>
                    <KategoriCombobox
                      items={kategoriOptions}
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Cari kategori pelatihan…"
                    />
                  </FormControl>
                  <FormDescription>
                    Dipakai untuk filter kategori di halaman publik. Kelola daftar kategori di menu Batch → Kategori
                    Pelatihan.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="lokasi_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lokasi (Indonesia)</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="lokasi_en"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lokasi (Inggris)</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={control}
            name="alamat"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Alamat</FormLabel>
                <FormControl>
                  <Textarea rows={2} {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              control={control}
              name="harga"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Harga (Rp)</FormLabel>
                  <FormControl>
                    <Input type="number" min={0} {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status *</FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="h-11 w-full">
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

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              control={control}
              name="tanggal_mulai"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <DatePickerField label="Tanggal Mulai" value={field.value ?? null} onChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="tanggal_selesai"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <DatePickerField label="Tanggal Selesai" value={field.value ?? null} onChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={control}
            name="is_active"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center gap-2 space-y-0">
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <FormLabel className="font-normal">Tampilkan di halaman publik</FormLabel>
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="hero_gambar_url"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <ImageUploadField
                    label="Thumbnail (kartu daftar pelatihan)"
                    aspectRatio={16 / 9}
                    lockSize
                    suggestedPx="1920×1080px"
                    value={field.value ?? null}
                    onChange={field.onChange}
                    onUpload={async (file) => {
                      const fd = new FormData();
                      fd.append('file', file);
                      return uploadGambarAdminAction(fd);
                    }}
                  />
                </FormControl>
                <FormDescription>
                  Dipotong 16:9 — dipakai di kartu daftar pelatihan dan sebagai cadangan halaman detail.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="gambar_detail_url"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <ImageUploadField
                    label="Gambar Detail (ditampilkan utuh di halaman pelatihan)"
                    skipCrop
                    previewFit="contain"
                    value={field.value ?? null}
                    onChange={field.onChange}
                    onUpload={async (file) => {
                      const fd = new FormData();
                      fd.append('file', file);
                      return uploadGambarAdminAction(fd);
                    }}
                  />
                </FormControl>
                <FormDescription>
                  Gambar ini TIDAK dipotong otomatis — cocok untuk poster/infografis yang bentuknya
                  memanjang. Thumbnail di atas tetap dipakai untuk kartu daftar pelatihan.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold text-foreground">Deskripsi & Silabus</h2>
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
              name="silabus_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Silabus (Indonesia)</FormLabel>
                  <FormControl>
                    <RichTextEditor value={field.value ?? ''} onChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="silabus_en"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Silabus (Inggris)</FormLabel>
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
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-foreground">Benefit</h2>
            <Button type="button" variant="outline" size="sm" onClick={() => benefits.append({ teks_id: '', teks_en: '' })}>
              <PlusIcon className="size-4" /> Tambah
            </Button>
          </div>
          {benefits.fields.map((f, index) => (
            <div key={f.id} className="grid grid-cols-1 gap-3 rounded-lg border border-border p-3 sm:grid-cols-[1fr_1fr_auto]">
              <FormField
                control={control}
                name={`benefits.${index}.teks_id`}
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input placeholder="Teks (Indonesia)" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name={`benefits.${index}.teks_en`}
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input placeholder="Teks (Inggris)" {...field} value={field.value ?? ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => benefits.remove(index)}
                aria-label="Hapus benefit"
              >
                <XIcon className="size-4" />
              </Button>
            </div>
          ))}
        </section>

        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-foreground">Syarat Peserta</h2>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => requirements.append({ teks_id: '', teks_en: '' })}
            >
              <PlusIcon className="size-4" /> Tambah
            </Button>
          </div>
          {requirements.fields.map((f, index) => (
            <div
              key={f.id}
              className="grid grid-cols-1 gap-3 rounded-lg border border-border p-3 sm:grid-cols-[1fr_1fr_auto]"
            >
              <FormField
                control={control}
                name={`requirements.${index}.teks_id`}
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input placeholder="Teks (Indonesia)" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name={`requirements.${index}.teks_en`}
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input placeholder="Teks (Inggris)" {...field} value={field.value ?? ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => requirements.remove(index)}
                aria-label="Hapus syarat"
              >
                <XIcon className="size-4" />
              </Button>
            </div>
          ))}
        </section>

        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-foreground">Peralatan Belajar</h2>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => equipment.append({ teks_id: '', teks_en: '' })}
            >
              <PlusIcon className="size-4" /> Tambah
            </Button>
          </div>
          {equipment.fields.map((f, index) => (
            <div key={f.id} className="grid grid-cols-1 gap-3 rounded-lg border border-border p-3 sm:grid-cols-[1fr_1fr_auto]">
              <FormField
                control={control}
                name={`equipment.${index}.teks_id`}
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input placeholder="Teks (Indonesia)" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name={`equipment.${index}.teks_en`}
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input placeholder="Teks (Inggris)" {...field} value={field.value ?? ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => equipment.remove(index)}
                aria-label="Hapus peralatan"
              >
                <XIcon className="size-4" />
              </Button>
            </div>
          ))}
        </section>

        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-foreground">FAQ</h2>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => faqs.append({ tanya_id: '', tanya_en: '', jawab_id: '', jawab_en: '' })}
            >
              <PlusIcon className="size-4" /> Tambah
            </Button>
          </div>
          {faqs.fields.map((f, index) => (
            <div key={f.id} className="flex flex-col gap-3 rounded-lg border border-border p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="grid flex-1 grid-cols-1 gap-3 lg:grid-cols-2">
                  <FormField
                    control={control}
                    name={`faqs.${index}.tanya_id`}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input placeholder="Pertanyaan (Indonesia)" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={control}
                    name={`faqs.${index}.tanya_en`}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input placeholder="Pertanyaan (Inggris)" {...field} value={field.value ?? ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={control}
                    name={`faqs.${index}.jawab_id`}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Textarea rows={2} placeholder="Jawaban (Indonesia)" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={control}
                    name={`faqs.${index}.jawab_en`}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Textarea rows={2} placeholder="Jawaban (Inggris)" {...field} value={field.value ?? ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => faqs.remove(index)}
                  aria-label="Hapus FAQ"
                  className="shrink-0"
                >
                  <XIcon className="size-4" />
                </Button>
              </div>
            </div>
          ))}
        </section>

        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-foreground">Galeri Dokumentasi</h2>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => gallery.append({ gambar_url: '', caption_id: '', caption_en: '' })}
            >
              <PlusIcon className="size-4" /> Tambah
            </Button>
          </div>
          {gallery.fields.map((f, index) => (
            <div key={f.id} className="flex flex-col gap-3 rounded-lg border border-border p-3 sm:flex-row sm:items-start">
              <FormField
                control={control}
                name={`gallery.${index}.gambar_url`}
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
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
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex flex-1 flex-col gap-3">
                <FormField
                  control={control}
                  name={`gallery.${index}.caption_id`}
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input placeholder="Keterangan (Indonesia)" {...field} value={field.value ?? ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name={`gallery.${index}.caption_en`}
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input placeholder="Keterangan (Inggris)" {...field} value={field.value ?? ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => gallery.remove(index)}
                aria-label="Hapus foto galeri"
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
          <Button type="button" variant="outline" className="h-11 px-6" onClick={() => router.push('/admin/batch')}>
            Batal
          </Button>
        </div>
      </form>
    </Form>
  );
}
