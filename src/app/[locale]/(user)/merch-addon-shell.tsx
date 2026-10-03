'use client';

import { useState, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { PesananUpgradeForm, type ProdukMerchandiseForm } from './pesanan-upgrade-form';
import type { HargaUpgrade } from '@/lib/site-settings';

export function MerchAddonShell({
  judul,
  bisaPesanLagi,
  harga,
  merchandise,
  children,
}: {
  judul: string;
  bisaPesanLagi: boolean;
  harga: HargaUpgrade;
  merchandise: ProdukMerchandiseForm[];
  children: ReactNode;
}) {
  const [buka, setBuka] = useState(false);
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-base font-semibold text-foreground">{judul}</h2>
        {bisaPesanLagi && !buka ? (
          <Button type="button" className="h-11 px-5" onClick={() => setBuka(true)}>
            Pesan Merchandise Lagi
          </Button>
        ) : null}
      </div>
      <div className="mt-3">
        {children}
        {buka ? (
          <div className="mt-4">
            <PesananUpgradeForm paketOptions={['merch_addon']} harga={harga} merchandise={merchandise} />
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function MerchPageShell({
  bisaPesanLagi,
  harga,
  merchandise,
  children,
}: {
  bisaPesanLagi: boolean;
  harga: HargaUpgrade;
  merchandise: ProdukMerchandiseForm[];
  children: ReactNode;
}) {
  const [buka, setBuka] = useState(false);
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-bold text-warna-teks sm:text-3xl">Tambah Merchandise</h1>
        {bisaPesanLagi && !buka ? (
          <Button type="button" className="h-11 px-5" onClick={() => setBuka(true)}>
            Pesan Merchandise Lagi
          </Button>
        ) : null}
      </div>
      <div className="mt-6">
        {children}
        {buka ? (
          <div className="mt-4">
            <PesananUpgradeForm paketOptions={['merch_addon']} harga={harga} merchandise={merchandise} />
          </div>
        ) : null}
      </div>
    </div>
  );
}
