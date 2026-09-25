import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { pick } from "@/lib/i18n/pick";
import { PublicHeroMist } from "@/components/public-hero-mist";
import { publicCtaPrimary, publicSectionHeading } from "@/lib/public-ui";
import { pageMetadata } from "@/lib/seo/page-metadata";
import { getWhatsappAdmin } from "@/lib/site-settings";
import { ProdukCard } from "./produk-card";
import { FilterBar } from "./filter-bar";
import { SORT_VALUES, type ProdukSort } from "./sort-options";

function isSort(value: string | undefined): value is ProdukSort {
  return SORT_VALUES.includes(value as ProdukSort);
}

function buildWaKonsultasiLink(nomor: string | undefined, pesan: string) {
  if (!nomor) return null;
  return `https://wa.me/${nomor}?text=${encodeURIComponent(pesan)}`;
}

function buildWaBulkLink(nomor: string | undefined, pesan: string) {
  if (!nomor) return null;
  return `https://wa.me/${nomor}?text=${encodeURIComponent(pesan)}`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo" });
  return pageMetadata({
    locale,
    path: "/katalog",
    title: t("katalogTitle"),
    description: t("katalogDescription"),
  });
}

export default async function KatalogPage({
  searchParams,
}: {
  searchParams: Promise<{ kategori?: string; sort?: string }>;
}) {
  const { kategori, sort } = await searchParams;
  const kategoriId = kategori;
  const sortValue = isSort(sort) ? sort : "terbaru";

  const supabase = await createClient();
  const locale = await getLocale();
  const t = await getTranslations("catalog");

  const { data: kategoriList, error: kategoriError } = await supabase
    .from("product_categories")
    .select("id, nama_id, nama_en")
    .eq("is_active", true)
    .order("urutan", { ascending: true });

  if (kategoriError) console.error("[katalog] gagal memuat kategori:", kategoriError);

  // products_public, BUKAN products — angka harga produk yang disembunyikan
  // sudah NULL di sisi database (ADR-004), tidak pernah menyentuh payload apa pun.
  let query = supabase
    .from("products_public")
    .select("id, slug, nama_id, nama_en, category_nama_id, category_nama_en, category_id, harga, rating, created_at, thumbnail_url");

  if (kategoriId) query = query.eq("category_id", kategoriId);

  if (sortValue === "hargaAsc") {
    query = query.order("harga", { ascending: true, nullsFirst: false });
  } else if (sortValue === "hargaDesc") {
    query = query.order("harga", { ascending: false, nullsFirst: false });
  } else {
    query = query.order("created_at", { ascending: false });
  }

  const { data: produk, error: errProduk } = await query;

  if (errProduk) console.error("[katalog] gagal memuat produk:", errProduk);

  const ids = (produk ?? []).map((p) => p.id).filter((id): id is number => id != null);

  // product_images punya policy baca publik sendiri (beda dari products) —
  // query langsung ke tabel ini bukan bug. Dua query paralel, digabung di JS,
  // pola sama dengan /kuis (soal + opsi).
  const { data: gambar, error: errGambar } =
    ids.length > 0
      ? await supabase.from("product_images").select("product_id, url, urutan").in("product_id", ids).order("urutan")
      : { data: [], error: null };

  if (errGambar) console.error("[katalog] gagal memuat gambar:", errGambar);

  const coverByProductId = new Map<number, string>();
  for (const g of gambar ?? []) {
    if (!coverByProductId.has(g.product_id)) coverByProductId.set(g.product_id, g.url);
  }

  const nomorWa = (await getWhatsappAdmin()) ?? undefined;
  const waKonsultasiLink = buildWaKonsultasiLink(nomorWa, t("waConsult"));
  const waBulkLink = buildWaBulkLink(nomorWa, t("waBulk"));
  const kategoriOptions = (kategoriList ?? []).map((k) => ({
    value: k.id,
    label: pick(k.nama_id, k.nama_en, locale) ?? k.nama_id,
  }));

  return (
    <div className="bg-background pb-16">
      <PublicHeroMist className="border-b border-border">
        <div className="mx-auto max-w-4xl px-4 py-12 text-center md:py-16">
          <h1 className={publicSectionHeading}>{t("heroTitle")}</h1>
          <p className="mx-auto mt-3 max-w-xl text-base text-muted-foreground">{t("heroDesc")}</p>
          {waKonsultasiLink && (
            <a
              href={waKonsultasiLink}
              target="_blank"
              rel="noopener noreferrer"
              className={`mt-6 ${publicCtaPrimary}`}
            >
              {t("heroCta")}
            </a>
          )}
        </div>
      </PublicHeroMist>

      <div className="mx-auto max-w-6xl px-4 py-10 md:py-16">
        <h2 className={publicSectionHeading}>{t("pageTitle")}</h2>
        <p className="mt-2 text-base text-muted-foreground">{t("pageSubtitle")}</p>

        <div className="mt-6">
          <FilterBar kategoriOptions={kategoriOptions} kategoriValue={kategoriId} sortValue={sortValue} />
        </div>

        {!produk || produk.length === 0 ? (
          <p className="mt-6 rounded-xl border border-border bg-card p-5 text-sm text-muted-foreground">
            {t("kosong")}
          </p>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {produk.map((p) => {
              if (p.id == null) return null;
              return (
                <ProdukCard
                  key={p.id}
                  produk={{ ...p, cover: coverByProductId.get(p.id) }}
                  locale={locale}
                  hargaHubungiKami={t("hargaHubungiKami")}
                  detailLabel={t("lihatDetail")}
                />
              );
            })}
          </div>
        )}

        <div className="mt-16 flex flex-col items-center gap-4 rounded-xl border border-border bg-card p-8 text-center sm:p-12">
          <h2 className={publicSectionHeading}>{t("bulkCtaHeading")}</h2>
          <p className="max-w-xl text-base text-muted-foreground">{t("bulkCtaDesc")}</p>
          {waBulkLink && (
            <a
              href={waBulkLink}
              target="_blank"
              rel="noopener noreferrer"
              className={`mt-2 ${publicCtaPrimary}`}
            >
              {t("bulkCtaButton")}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
