'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  CompanyProfileFormSchema,
  type CompanyProfileFormInput,
} from '@/lib/validations/company-profile-admin';
import { simpanCompanyProfileAction } from './company-profile-actions';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RichTextEditor } from '@/components/admin/rich-text-editor';
import { ImageUploadField } from '@/components/image-upload-field';
import { uploadGambarAdminAction } from '../actions';
import type { Database } from '@/types/database';

type CompanyProfile = Database['public']['Tables']['company_profile']['Row'];

function Field({ label, htmlFor, children }: { label: string; htmlFor: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
    </div>
  );
}

export function CompanyProfileForm({ profile }: { profile: CompanyProfile }) {
  const [pesanError, setPesanError] = useState<string | null>(null);
  const [pesanSukses, setPesanSukses] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<CompanyProfileFormInput>({
    resolver: zodResolver(CompanyProfileFormSchema),
    defaultValues: {
      judul_id: profile.judul_id,
      judul_en: profile.judul_en ?? '',
      konten_id: profile.konten_id,
      konten_en: profile.konten_en ?? '',
      gambar_url: profile.gambar_url ?? '',
    },
  });

  async function onSubmit(data: CompanyProfileFormInput) {
    setPesanError(null);
    setPesanSukses(null);
    const hasil = await simpanCompanyProfileAction(data);
    if (!hasil.ok) {
      setPesanError(hasil.pesan);
      return;
    }
    setPesanSukses('Company profile tersimpan.');
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 pt-4" noValidate>
      {pesanError && (
        <Alert variant="destructive">
          <AlertDescription>{pesanError}</AlertDescription>
        </Alert>
      )}
      {pesanSukses && (
        <Alert>
          <AlertDescription>{pesanSukses}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label="Judul (Indonesia) *" htmlFor="judul_id">
          <Input id="judul_id" {...register('judul_id')} />
          {errors.judul_id && <p className="text-sm text-destructive">{errors.judul_id.message}</p>}
        </Field>
        <Field label="Judul (Inggris)" htmlFor="judul_en">
          <Input id="judul_en" {...register('judul_en')} />
        </Field>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label="Konten (Indonesia) *" htmlFor="konten_id">
          <Controller
            control={control}
            name="konten_id"
            render={({ field }) => <RichTextEditor value={field.value ?? ''} onChange={field.onChange} />}
          />
          {errors.konten_id && <p className="text-sm text-destructive">{errors.konten_id.message}</p>}
        </Field>
        <Field label="Konten (Inggris)" htmlFor="konten_en">
          <Controller
            control={control}
            name="konten_en"
            render={({ field }) => <RichTextEditor value={field.value ?? ''} onChange={field.onChange} />}
          />
        </Field>
      </div>

      <Controller
        control={control}
        name="gambar_url"
        render={({ field }) => (
          <ImageUploadField
            label="Gambar (opsional)"
            aspectRatio={16 / 9}
            suggestedPx="1600×900px"
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

      <div className="pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex h-11 items-center justify-center rounded-lg bg-warna-aksen px-6 text-base font-semibold text-warna-teks disabled:opacity-50"
        >
          {isSubmitting ? 'Menyimpan…' : 'Simpan'}
        </button>
      </div>
    </form>
  );
}
