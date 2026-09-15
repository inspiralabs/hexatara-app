import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { pick } from "@/lib/i18n/pick";
import { ContentCard } from "@/components/content-card";

function formatRupiah(nilai: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(nilai);
}

export async function ProdukSection() {
  const supabase = await createClient();
  const locale = await getLocale();
  const t = await getTranslations("landing");
  const tCatalog = await getTranslations("catalog");

  const { data: produk, error } = await supabase
    .from("products_public")
    .select("id, slug, nama_id, nama_en, kategori, harga")
    .order("urutan");

  if (error) console.error("[produk-section] gagal memuat produk:", error);
  if (!produk || produk.length === 0) return null;

  const ids = produk.map((p) => p.id).filter((id): id is number => id != null);
  const { data: gambar, error: errGambar } =
    ids.length > 0
      ? await supabase.from("product_images").select("product_id, url, urutan").in("product_id", ids).order("urutan")
      : { data: [], error: null };

  if (errGambar) console.error("[produk-section] gagal memuat gambar:", errGambar);

  const coverByProductId = new Map<number, string>();
  for (const g of gambar ?? []) {
    if (!coverByProductId.has(g.product_id)) coverByProductId.set(g.product_id, g.url);
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-16 md:py-24">
      <h2 className="text-xl font-bold text-foreground sm:text-2xl">{t("produkHeading")}</h2>
      <p className="mt-2 text-base text-muted-foreground">{t("produkSubheading")}</p>

      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {produk.map((p) => {
          if (p.id == null || p.slug == null) return null;
          const nama = pick(p.nama_id, p.nama_en, locale) ?? p.nama_id ?? "";
          const cover = coverByProductId.get(p.id);
          return (
            <ContentCard
              key={p.id}
              image={cover ? { src: cover, alt: nama } : undefined}
              badges={
                p.kategori && (
                  <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary-foreground">
                    {p.kategori}
                  </span>
                )
              }
              title={nama}
              price={p.harga != null ? formatRupiah(p.harga) : tCatalog("hargaHubungiKami")}
              cta={
                <Link
                  href={`/katalog/${p.slug}`}
                  className="inline-flex h-11 items-center justify-center rounded-lg border border-foreground px-5 text-base font-semibold text-foreground"
                >
                  {tCatalog("lihatDetail")}
                </Link>
              }
            />
          );
        })}
      </div>

      <div className="mt-8 flex justify-center">
        <Link
          href="/katalog"
          className="inline-flex h-11 items-center justify-center rounded-lg bg-primary px-6 text-base font-semibold text-primary-foreground shadow-float hover:shadow-float-hover [transition:var(--transition-hover)]"
        >
          {t("lihatSemuaProduk")}
        </Link>
      </div>
    </section>
  );
}
