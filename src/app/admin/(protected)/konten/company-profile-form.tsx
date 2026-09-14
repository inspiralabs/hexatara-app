'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import {
  CompanyProfileFormSchema,
  type CompanyProfileFormInput,
} from '@/lib/validations/company-profile-admin';
import { simpanCompanyProfileAction } from './company-profile-actions';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { RichTextEditor } from '@/components/admin/rich-text-editor';
import { ImageUploadField } from '@/components/image-upload-field';
import { uploadGambarAdminAction } from '../actions';
import type { Database } from '@/types/database';

type CompanyProfile = Database['public']['Tables']['company_profile']['Row'];

export function CompanyProfileForm({ profile }: { profile: CompanyProfile }) {
  const [pesanError, setPesanError] = useState<string | null>(null);
  const [pesanSukses, setPesanSukses] = useState<string | null>(null);
  const form = useForm<CompanyProfileFormInput>({
    resolver: zodResolver(CompanyProfileFormSchema),
    defaultValues: {
      judul_id: profile.judul_id,
      judul_en: profile.judul_en ?? '',
      konten_id: profile.konten_id,
      konten_en: profile.konten_en ?? '',
      gambar_url: profile.gambar_url ?? '',
    },
  });
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = form;

  async function onSubmit(data: CompanyProfileFormInput) {
    setPesanError(null);
    setPesanSukses(null);
    const hasil = await simpanCompanyProfileAction(data);
    if (!hasil.ok) {
      setPesanError(hasil.pesan);
      toast.error(hasil.pesan);
      return;
    }
    setPesanSukses('Company profile tersimpan.');
    toast.success('Company profile berhasil disimpan.');
  }

  return (
    <Form {...form}>
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
          <FormField
            control={control}
            name="judul_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Judul (Indonesia) *</FormLabel>
                <FormControl>
                  <Input {...field} />
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

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <FormField
            control={control}
            name="konten_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Konten (Indonesia) *</FormLabel>
                <FormControl>
                  <RichTextEditor value={field.value ?? ''} onChange={field.onChange} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="konten_en"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Konten (Inggris)</FormLabel>
                <FormControl>
                  <RichTextEditor value={field.value ?? ''} onChange={field.onChange} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={control}
          name="gambar_url"
          render={({ field }) => (
            <FormItem>
              <FormControl>
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
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="pt-2">
          <Button type="submit" disabled={isSubmitting} className="h-11 px-6">
            {isSubmitting ? 'Menyimpan…' : 'Simpan'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
