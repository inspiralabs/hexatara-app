import { getLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { pick } from "@/lib/i18n/pick";

export async function SaleBanner() {
  const supabase = await createClient();
  const locale = await getLocale();
  const { data, error } = await supabase
    .from("sale_banners")
    .select(
      "id, judul_id, judul_en, teks_id, teks_en, urgensi_id, urgensi_en, tombol_teks_id, tombol_teks_en, tombol_url, tayang_mulai, tayang_selesai"
    )
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

  const judul = pick(banner.judul_id, banner.judul_en, locale);
  const teks = pick(banner.teks_id, banner.teks_en, locale);
  const urgensi = pick(banner.urgensi_id, banner.urgensi_en, locale);
  const tombolTeks = pick(banner.tombol_teks_id, banner.tombol_teks_en, locale);

  return (
    <div className="bg-primary px-4 py-3 text-background">
      <div className="mx-auto flex max-w-6xl flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-base font-semibold">{judul}</p>
          {teks && <p className="text-sm text-background/90">{teks}</p>}
          {urgensi && <p className="text-sm font-medium text-foreground">{urgensi}</p>}
        </div>
        {tombolTeks && banner.tombol_url && (
          <a
            href={banner.tombol_url}
            className="inline-flex h-11 shrink-0 items-center justify-center rounded-lg bg-primary px-5 text-base font-semibold text-primary-foreground"
          >
            {tombolTeks}
          </a>
        )}
      </div>
    </div>
  );
}
