'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { z } from 'zod';
import {
  AdminNotifyEmailSchema,
  HargaUpgradeSchema,
  KontakPublikSchema,
  RekeningSchema,
} from '@/lib/validations/pengaturan-admin';
import type { HargaUpgrade, KontakSettings, RekeningSettings } from '@/lib/site-settings';
import {
  simpanAdminNotifyEmailAction,
  simpanHargaUpgradeAction,
  simpanKontakAction,
  simpanRekeningAction,
} from './actions';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

type RekeningInput = z.infer<typeof RekeningSchema>;
type KontakInput = z.input<typeof KontakPublikSchema>;
type NotifyInput = z.infer<typeof AdminNotifyEmailSchema>;

export function PengaturanForms({
  rekening,
  kontak,
  notifyEmail,
  harga,
}: {
  rekening: RekeningSettings;
  kontak: KontakSettings;
  notifyEmail: string;
  harga: HargaUpgrade;
}) {
  return (
    <div className="flex flex-col gap-6">
      <RekeningForm defaults={rekening} />
      <KontakForm defaults={kontak} />
      <NotifyForm defaults={notifyEmail} />
      <HargaForm defaults={harga} />
    </div>
  );
}

function RekeningForm({ defaults }: { defaults: RekeningSettings }) {
  const [pending, setPending] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RekeningInput>({
    resolver: zodResolver(RekeningSchema),
    defaultValues: {
      bank: defaults.bank ?? '',
      nomor: defaults.nomor ?? '',
      atas_nama: defaults.atas_nama ?? '',
    },
  });

  async function onSubmit(data: RekeningInput) {
    setPending(true);
    const hasil = await simpanRekeningAction(data);
    setPending(false);
    if (!hasil.ok) {
      toast.error(hasil.pesan);
      return;
    }
    toast.success('Rekening disimpan');
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Rekening bank</CardTitle>
        <CardDescription>Ditampilkan ke pengguna saat instruksi transfer upgrade.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 sm:grid-cols-3" noValidate>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="bank">Bank</Label>
            <Input id="bank" {...register('bank')} />
            {errors.bank && <p className="text-sm text-destructive">{errors.bank.message}</p>}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="nomor">Nomor rekening</Label>
            <Input id="nomor" {...register('nomor')} />
            {errors.nomor && <p className="text-sm text-destructive">{errors.nomor.message}</p>}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="atas_nama">Atas nama</Label>
            <Input id="atas_nama" {...register('atas_nama')} />
            {errors.atas_nama && (
              <p className="text-sm text-destructive">{errors.atas_nama.message}</p>
            )}
          </div>
          <div className="sm:col-span-3">
            <Button type="submit" disabled={pending}>
              {pending ? 'Menyimpan…' : 'Simpan rekening'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function KontakForm({ defaults }: { defaults: KontakSettings }) {
  const [pending, setPending] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<KontakInput>({
    resolver: zodResolver(KontakPublikSchema),
    defaultValues: {
      wa: defaults.wa ?? '',
      email: defaults.email ?? '',
      instagram: defaults.instagram ?? '',
    },
  });

  async function onSubmit(data: KontakInput) {
    setPending(true);
    const hasil = await simpanKontakAction(data);
    setPending(false);
    if (!hasil.ok) {
      toast.error(hasil.pesan);
      return;
    }
    toast.success('Kontak publik disimpan');
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Kontak publik</CardTitle>
        <CardDescription>
          WhatsApp dipakai floating button & footer. Format: 62… tanpa +.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 sm:grid-cols-3" noValidate>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="wa">WhatsApp</Label>
            <Input id="wa" placeholder="62812…" {...register('wa')} />
            {errors.wa && <p className="text-sm text-destructive">{errors.wa.message}</p>}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email_kontak">Email</Label>
            <Input id="email_kontak" type="email" {...register('email')} />
            {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="instagram">Instagram URL</Label>
            <Input id="instagram" placeholder="https://instagram.com/…" {...register('instagram')} />
          </div>
          <div className="sm:col-span-3">
            <Button type="submit" disabled={pending}>
              {pending ? 'Menyimpan…' : 'Simpan kontak'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function NotifyForm({ defaults }: { defaults: string }) {
  const [pending, setPending] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<NotifyInput>({
    resolver: zodResolver(AdminNotifyEmailSchema),
    defaultValues: { email: defaults },
  });

  async function onSubmit(data: NotifyInput) {
    setPending(true);
    const hasil = await simpanAdminNotifyEmailAction(data);
    setPending(false);
    if (!hasil.ok) {
      toast.error(hasil.pesan);
      return;
    }
    toast.success('Email notifikasi disimpan');
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Email notifikasi Admin</CardTitle>
        <CardDescription>Tujuan email lead baru. Fallback ke ADMIN_NOTIFY_EMAIL jika kosong.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 sm:max-w-md" noValidate>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="notify_email">Email</Label>
            <Input id="notify_email" type="email" {...register('email')} />
            {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
          </div>
          <Button type="submit" disabled={pending} className="w-fit">
            {pending ? 'Menyimpan…' : 'Simpan email'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function HargaForm({ defaults }: { defaults: HargaUpgrade }) {
  const [pending, setPending] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(HargaUpgradeSchema),
    defaultValues: defaults,
  });

  async function onSubmit(data: z.output<typeof HargaUpgradeSchema>) {
    setPending(true);
    const hasil = await simpanHargaUpgradeAction(data);
    setPending(false);
    if (!hasil.ok) {
      toast.error(hasil.pesan);
      return;
    }
    toast.success('Harga upgrade disimpan');
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Harga upgrade sertifikat</CardTitle>
        <CardDescription>
          Nominal Rupiah. Default dari constants.ts dipakai jika belum pernah disimpan.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 sm:grid-cols-3" noValidate>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="cert_only">Sertifikat saja</Label>
            <Input id="cert_only" type="number" min={1} step={1} {...register('cert_only')} />
            {errors.cert_only && (
              <p className="text-sm text-destructive">{errors.cert_only.message}</p>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="cert_merch">Sertifikat + merchandise</Label>
            <Input id="cert_merch" type="number" min={1} step={1} {...register('cert_merch')} />
            {errors.cert_merch && (
              <p className="text-sm text-destructive">{errors.cert_merch.message}</p>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="merch_addon">Tambah merchandise</Label>
            <Input id="merch_addon" type="number" min={1} step={1} {...register('merch_addon')} />
            {errors.merch_addon && (
              <p className="text-sm text-destructive">{errors.merch_addon.message}</p>
            )}
          </div>
          <div className="sm:col-span-3">
            <Button type="submit" disabled={pending}>
              {pending ? 'Menyimpan…' : 'Simpan harga'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
