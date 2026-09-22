'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { cn } from 'cn';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from '@/components/ui/carousel';
import { PublicImageLightbox } from '@/components/public-image-lightbox';

export function ProductGallery({ images, alt }: { images: { id: number; url: string }[]; alt: string }) {
  const t = useTranslations('common');
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

  useEffect(() => {
    if (!api) return;
    const onSelect = () => setCurrent(api.selectedScrollSnap());
    onSelect();
    api.on('select', onSelect);
    return () => {
      api.off('select', onSelect);
    };
  }, [api]);

  if (images.length === 0) {
    return <div className="aspect-square w-full rounded-xl bg-white" />;
  }

  return (
    <div>
      <Carousel setApi={setApi} opts={{ align: 'start' }}>
        <CarouselContent>
          {images.map((img, index) => (
            <CarouselItem key={img.id}>
              <button
                type="button"
                onClick={() => setLightboxSrc(img.url)}
                className="relative aspect-square w-full overflow-hidden rounded-xl bg-white"
                aria-label={t('enlargeImage')}
              >
                <Image
                  src={img.url}
                  alt={alt}
                  fill
                  priority={index === 0}
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, 768px"
                />
              </button>
            </CarouselItem>
          ))}
        </CarouselContent>
        {images.length > 1 && (
          <>
            <CarouselPrevious className="left-3 hidden sm:flex" />
            <CarouselNext className="right-3 hidden sm:flex" />
          </>
        )}
      </Carousel>

      {images.length > 1 && (
        <div className="mt-3 grid grid-cols-4 gap-3">
          {images.slice(0, 4).map((img, index) => (
            <button
              key={img.id}
              type="button"
              onClick={() => api?.scrollTo(index)}
              className={cn(
                'relative aspect-square overflow-hidden rounded-lg bg-white ring-2 ring-offset-2',
                '[transition:var(--transition-hover)] hover:opacity-80',
                current === index ? 'ring-foreground' : 'ring-transparent'
              )}
              aria-label={`Gambar ${index + 1}`}
              aria-current={current === index}
            >
              <Image src={img.url} alt="" fill className="object-contain" sizes="25vw" />
            </button>
          ))}
        </div>
      )}

      <PublicImageLightbox src={lightboxSrc} onClose={() => setLightboxSrc(null)} />
    </div>
  );
}
