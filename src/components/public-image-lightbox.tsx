'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';

/** Overlay perbesar gambar — pola sama pendaftaran-batch-detail (backdrop button + Escape). */
export function PublicImageLightbox({
  src,
  onClose,
  label,
}: {
  src: string | null;
  onClose: () => void;
  label?: string;
}) {
  const t = useTranslations('common');
  const dialogLabel = label ?? t('enlargeImage');
  useEffect(() => {
    if (!src) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [src, onClose]);

  if (!src) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={dialogLabel}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
    >
      <button
        type="button"
        aria-label={t('closePreview')}
        className="absolute inset-0 cursor-default"
        onClick={onClose}
      />
      {/* eslint-disable-next-line @next/next/no-img-element -- URL storage publik, next/image tidak perlu di overlay */}
      <img
        src={src}
        alt=""
        className="relative max-h-[90vh] max-w-[95vw] rounded-lg object-contain"
      />
      <button
        type="button"
        onClick={onClose}
        className="absolute right-4 top-4 rounded-full bg-black/60 px-3 py-1.5 text-sm text-white hover:bg-black/80"
      >
        {t('closeAriaLabel')}
      </button>
    </div>
  );
}
