'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';

/** Badge jika foto belum portrait (lebar ≥ tinggi) — deteksi natural size di client. */
export function InstructorPortraitBadge({ src }: { src: string }) {
  const [perluPortrait, setPerluPortrait] = useState(false);

  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element -- ukuran natural, bukan tampilan */}
      <img
        src={src}
        alt=""
        className="hidden"
        onLoad={(e) => {
          const el = e.currentTarget;
          setPerluPortrait(el.naturalWidth >= el.naturalHeight);
        }}
        onError={() => setPerluPortrait(false)}
      />
      {perluPortrait ? (
        <Badge variant="outline" className="shrink-0 border-amber-600/40 bg-amber-500/10 text-amber-800">
          Perlu foto portrait
        </Badge>
      ) : null}
    </>
  );
}
