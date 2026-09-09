'use client';

import { useState } from 'react';
import { Lock } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { unduhSertifikatPreviewAction } from './actions';

export function SertifikatPreviewCard({ namaLengkap }: { namaLengkap: string }) {
  const t = useTranslations('dashboard');
  const [pending, setPending] = useState(false);
  const [pesanError, setPesanError] = useState<string | null>(null);

  async function unduh() {
    setPending(true);
    setPesanError(null);
    const hasil = await unduhSertifikatPreviewAction();
    setPending(false);
    if (!hasil.ok) {
      setPesanError(hasil.pesan);
      return;
    }
    // Navigasi tab yang sama, bukan window.open() — window.open() setelah await
    // kehilangan konteks "user gesture" dan bisa diblokir popup blocker (terbukti
    // saat pengujian: kadang gagal buka tab baru tanpa pesan apa pun). Navigasi
    // biasa tidak pernah kena popup blocker.
    window.location.href = hasil.url;
  }

  return (
    <div className="rounded-xl border border-warna-latar-2 bg-warna-latar p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <span className="inline-flex items-center rounded-full bg-warna-aksen/10 px-2.5 py-0.5 text-xs font-semibold text-warna-aksen">
            {t('readyToFly')}
          </span>
          <h2 className="mt-2 text-xl font-bold text-warna-teks">{namaLengkap}</h2>
          <p className="mt-1 text-sm text-warna-teks-2">{t('previewDescription')}</p>
        </div>

        <div className="flex shrink-0 flex-col items-center gap-1 rounded-lg bg-warna-latar-2 p-3 text-center">
          <Lock className="size-6 text-warna-teks-2" aria-hidden="true" />
          <span className="max-w-[6rem] text-[10px] leading-tight text-warna-teks-2">{t('qrLocked')}</span>
        </div>
      </div>

      {pesanError && <p className="mt-4 text-sm text-destructive">{pesanError}</p>}

      <button
        type="button"
        onClick={unduh}
        disabled={pending}
        className="mt-4 inline-flex h-11 items-center justify-center rounded-lg border border-warna-utama px-5 text-base font-semibold text-warna-utama disabled:opacity-50"
      >
        {pending ? t('memproses') : t('unduhPreview')}
      </button>
    </div>
  );
}
