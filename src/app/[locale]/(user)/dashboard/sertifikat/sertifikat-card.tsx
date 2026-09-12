'use client';

import { useState } from 'react';
import { CheckCircle2, Lock } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { unduhSertifikatPreviewAction, lihatSertifikatAction } from '../actions';

type Props =
  | { status: 'preview'; namaLengkap: string }
  | { status: 'aktif'; namaLengkap: string; certificateId: string; nomorSertifikat: string; jenisLabel: string };

// Klik kartu = preview LANGSUNG di modal (iframe PDF native browser, tanpa
// library viewer baru) — bukan navigasi unduh penuh seperti sebelumnya.
// Label reuse dari namespace `dashboard` yang sudah ada (readyToFly,
// previewDescription, qrLocked, qrAktif) — kartu ini adalah SertifikatCard
// F03.9 yang sudah dwibahasa, bukan konten baru, jadi tidak ikut simplifikasi
// ID-only halaman-halaman baru lainnya.
export function SertifikatCard(props: Props) {
  const t = useTranslations('dashboard');
  const [pending, setPending] = useState(false);
  const [pesanError, setPesanError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const aktif = props.status === 'aktif';

  async function lihat() {
    setPending(true);
    setPesanError(null);
    const hasil = aktif ? await lihatSertifikatAction(props.certificateId) : await unduhSertifikatPreviewAction();
    setPending(false);
    if (!hasil.ok) {
      setPesanError(hasil.pesan);
      return;
    }
    setPreviewUrl(hasil.url);
  }

  return (
    <>
      <div className="flex flex-col overflow-hidden rounded-xl border border-warna-latar-2 bg-warna-latar shadow-float hover:-translate-y-0.5 hover:shadow-float-hover [transition:var(--transition-hover)]">
        <div className="flex items-start justify-between gap-4 p-6">
          <div>
            <span className="inline-flex items-center rounded-full bg-warna-aksen/10 px-2.5 py-0.5 text-xs font-semibold text-warna-aksen">
              {aktif ? props.jenisLabel : t('readyToFly')}
            </span>
            <h2 className="mt-2 text-xl font-bold text-warna-teks">{props.namaLengkap}</h2>
            {aktif ? (
              <p className="mt-1 text-sm text-warna-teks-2">
                {t('nomorSertifikat')}: <span className="font-medium text-warna-teks">{props.nomorSertifikat}</span>
              </p>
            ) : (
              <p className="mt-1 text-sm text-warna-teks-2">{t('previewDescription')}</p>
            )}
          </div>

          <div className="flex shrink-0 flex-col items-center gap-1 rounded-lg bg-warna-latar-2 p-3 text-center">
            {aktif ? (
              <>
                <CheckCircle2 className="size-6 text-warna-sukses" aria-hidden="true" />
                <span className="max-w-[6rem] text-[10px] leading-tight text-warna-teks-2">{t('qrAktif')}</span>
              </>
            ) : (
              <>
                <Lock className="size-6 text-warna-teks-2" aria-hidden="true" />
                <span className="max-w-[6rem] text-[10px] leading-tight text-warna-teks-2">{t('qrLocked')}</span>
              </>
            )}
          </div>
        </div>

        {pesanError && <p className="px-6 pb-2 text-sm text-destructive">{pesanError}</p>}

        <div className="flex flex-wrap gap-3 border-t border-warna-latar-2 p-4">
          <button
            type="button"
            onClick={lihat}
            disabled={pending}
            className="inline-flex h-11 items-center justify-center rounded-lg bg-warna-aksen px-5 text-base font-semibold text-warna-teks disabled:opacity-50"
          >
            {pending ? t('memproses') : t('lihatSertifikat')}
          </button>
        </div>
      </div>

      <Dialog open={previewUrl != null} onOpenChange={(open) => !open && setPreviewUrl(null)}>
        <DialogContent className="flex h-[85vh] flex-col sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>{aktif ? props.jenisLabel : t('readyToFly')}</DialogTitle>
          </DialogHeader>
          {previewUrl && (
            <iframe src={previewUrl} title={t('lihatSertifikat')} className="min-h-0 flex-1 rounded-md border border-warna-latar-2" />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
