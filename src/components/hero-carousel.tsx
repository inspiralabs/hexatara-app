"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

export type HeroSlideItem = {
  id: number;
  judul: string;
  subjudul: string | null;
  gambarUrl: string | null;
  ctaUrl: string | null;
};

const JEDA_OTOMATIS_MS = 5000;

// Carousel galeri hero — bukan hitung mundur (larangan PRD §13.4 itu untuk
// banner urgensi/harga). Ini transisi visual antar poster, jeda 5 detik
// dipilih supaya tetap terasa seperti galeri, bukan timer fungsional.
export function HeroCarousel({ slides }: { slides: HeroSlideItem[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, JEDA_OTOMATIS_MS);
    return () => clearInterval(timer);
  }, [index, slides.length]);

  if (slides.length === 0) return null;
  const slide = slides[index]!;

  function pindah(arah: "prev" | "next") {
    setIndex((i) => {
      if (arah === "next") return (i + 1) % slides.length;
      return (i - 1 + slides.length) % slides.length;
    });
  }

  const gambar = (
    <div className="group relative aspect-square w-full overflow-hidden rounded-xl bg-warna-latar-2 sm:aspect-4/3">
      {slide.gambarUrl && (
        <Image
          src={slide.gambarUrl}
          alt={slide.judul}
          fill
          priority
          className="object-cover [transition:var(--transition-hover)] group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, 50vw"
        />
      )}
      {/* Overlay penuh: gelap bawah → transparan atas. pointer-events-none agar
          tidak menghalangi klik CTA/gambar; panah carousel di sibling luar. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent"
      />
      {(slide.subjudul || slide.judul) && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] p-4 text-warna-latar">
          <p className="text-base font-bold sm:text-lg">{slide.judul}</p>
          {slide.subjudul && <p className="text-sm text-warna-latar/90">{slide.subjudul}</p>}
        </div>
      )}
    </div>
  );

  return (
    <div className="relative w-full">
      {slide.ctaUrl ? (
        <a href={slide.ctaUrl} aria-label={slide.judul}>
          {gambar}
        </a>
      ) : (
        gambar
      )}

      {slides.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => pindah("prev")}
            aria-label="Slide sebelumnya"
            className="absolute left-2 top-1/2 z-10 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-warna-latar/80 text-warna-teks hover:bg-warna-latar"
          >
            <ChevronLeftIcon className="size-5" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => pindah("next")}
            aria-label="Slide berikutnya"
            className="absolute right-2 top-1/2 z-10 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-warna-latar/80 text-warna-teks hover:bg-warna-latar"
          >
            <ChevronRightIcon className="size-5" aria-hidden="true" />
          </button>
          <div className="mt-3 flex justify-center gap-1.5">
            {slides.map((s, i) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Ke slide ${i + 1}`}
                className={`h-1.5 rounded-full [transition:var(--transition-hover)] ${
                  i === index ? "w-6 bg-warna-utama" : "w-1.5 bg-warna-latar-2"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
