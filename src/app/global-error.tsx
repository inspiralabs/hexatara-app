"use client";

import { useEffect } from "react";
import Link from "next/link";
import "./globals.css";

/**
 * Fallback paling akhir — di luar [locale], tanpa next-intl.
 * Copy Indonesia saja (minimal).
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="id">
      <body className="flex min-h-full flex-col font-sans antialiased">
        <div className="flex flex-1 flex-col items-center justify-center bg-background px-4 py-16 text-center text-foreground">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Terjadi kesalahan
          </h1>
          <p className="mt-3 max-w-md text-base text-muted-foreground">
            Maaf, ada yang tidak beres. Silakan coba lagi. Kalau masalah berlanjut,
            hubungi Admin Hexatara.
          </p>
          <button
            type="button"
            onClick={reset}
            className="mt-8 inline-flex h-11 min-h-11 items-center justify-center rounded-md bg-primary px-6 text-base font-semibold text-primary-foreground hover:bg-primary/90"
          >
            Coba lagi
          </button>
          <Link
            href="/"
            className="mt-3 inline-flex h-11 min-h-11 items-center justify-center rounded-md border border-border bg-background px-6 text-base font-semibold text-foreground hover:bg-accent"
          >
            Kembali ke beranda
          </Link>
        </div>
      </body>
    </html>
  );
}
