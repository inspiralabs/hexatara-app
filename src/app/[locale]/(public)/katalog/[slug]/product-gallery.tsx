'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { cn } from 'cn';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from '@/components/ui/carousel';

export function ProductGallery({ images, alt }: { images: { id: number; url: string }[]; alt: string }) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

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
    return <div className="aspect-square w-full rounded-xl bg-muted" />;
  }

  return (
    <div>
      <Carousel setApi={setApi} opts={{ align: 'start' }}>
        <CarouselContent>
          {images.map((img) => (
            <CarouselItem key={img.id}>
              <div className="relative aspect-square overflow-hidden rounded-xl bg-muted">
                <Image src={img.url} alt={alt} fill priority className="object-cover" sizes="(max-width: 768px) 100vw, 768px" />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        {images.length > 1 && (
          <>
            <CarouselPrevious className="hidden sm:flex" />
            <CarouselNext className="hidden sm:flex" />
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
                'relative aspect-square overflow-hidden rounded-lg bg-muted ring-2 ring-offset-2',
                '[transition:var(--transition-hover)] hover:opacity-80',
                current === index ? 'ring-foreground' : 'ring-transparent'
              )}
              aria-label={`Gambar ${index + 1}`}
              aria-current={current === index}
            >
              <Image src={img.url} alt="" fill className="object-cover" sizes="25vw" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
