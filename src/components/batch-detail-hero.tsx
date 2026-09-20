'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { PublicImageLightbox } from '@/components/public-image-lightbox';

export function BatchDetailHero({
  gambarDetailUrl,
  heroGambarUrl,
}: {
  gambarDetailUrl: string | null;
  heroGambarUrl: string | null;
}) {
  const t = useTranslations('common');
  const src = gambarDetailUrl || heroGambarUrl;
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

  if (!src) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setLightboxSrc(src)}
        className="relative mt-6 block w-full overflow-hidden rounded-xl"
        aria-label={t('enlargeImage')}
      >
        <Image
          src={src}
          alt=""
          width={1200}
          height={800}
          priority
          className={
            gambarDetailUrl ? 'h-auto w-full object-contain' : 'aspect-video w-full object-cover'
          }
          sizes="(max-width: 768px) 100vw, 768px"
        />
      </button>
      <PublicImageLightbox src={lightboxSrc} onClose={() => setLightboxSrc(null)} />
    </>
  );
}
