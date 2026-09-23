import { notFound } from "next/navigation";

/**
 * next-intl: not-found.tsx di [locale] hanya tampil kalau notFound() dipanggil.
 * Catch-all ini menangkap path ngawur (mis. /halaman-tidak-ada) supaya 404 custom aktif.
 */
export default function CatchAllUnknownLocalePath() {
  notFound();
}
