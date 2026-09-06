import { createClient } from "@/lib/supabase/server";

export async function SaleBanner() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("sale_banners")
    .select("id, judul_id, teks_id, urgensi_id, tombol_teks_id, tombol_url, tayang_mulai, tayang_selesai")
    .eq("is_active", true);

  if (error) {
    console.error("[sale-banner] gagal memuat:", error);
    return null;
  }

  const hariIni = new Date().toISOString().slice(0, 10);
  const banner = data?.find(
    (b) =>
      (!b.tayang_mulai || b.tayang_mulai <= hariIni) &&
      (!b.tayang_selesai || b.tayang_selesai >= hariIni)
  );

  if (!banner) return null;

  return (
    <div className="bg-warna-utama px-4 py-3 text-warna-latar">
      <div className="mx-auto flex max-w-6xl flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-base font-semibold">{banner.judul_id}</p>
          {banner.teks_id && <p className="text-sm text-warna-latar/90">{banner.teks_id}</p>}
          {banner.urgensi_id && (
            <p className="text-sm font-medium text-warna-aksen">{banner.urgensi_id}</p>
          )}
        </div>
        {banner.tombol_teks_id && banner.tombol_url && (
          <a
            href={banner.tombol_url}
            className="inline-flex h-11 shrink-0 items-center justify-center rounded-lg bg-warna-aksen px-5 text-base font-semibold text-warna-teks"
          >
            {banner.tombol_teks_id}
          </a>
        )}
      </div>
    </div>
  );
}
