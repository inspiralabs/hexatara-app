import { getLocale, getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { pick } from "@/lib/i18n/pick";
import { ProdukCard } from "./produk-card";
import { FilterBar } from "./filter-bar";
import { SORT_VALUES, type ProdukSort } from "./sort-options";

function isSort(value: string | undefined): value is ProdukSort {
  return SORT_VALUES.includes(value as ProdukSort);
}

function buildWaKonsultasiLink(nomor: string | undefined) {
  if (!nomor) return null;
  const pesan =
    "Halo Admin Hexatara, saya ingin konsultasi soal produk drone Autel untuk kebutuhan bisnis/instansi saya.";
  return `https://wa.me/${nomor}?text=${encodeURIComponent(pesan)}`;
}

function buildWaBulkLink(nomor: string | undefined) {
  if (!nomor) return null;
  const pesan = "Halo Admin Hexatara, saya ingin bertanya soal pembelian partai besar drone Autel.";
  return `https://wa.me/${nomor}?text=${encodeURIComponent(pesan)}`;
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
    .select("id, slug, nama_id, nama_en, kategori, category_id, harga, rating, created_at");

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

  const nomorWa = process.env.NEXT_PUBLIC_WA_ADMIN;
  const waKonsultasiLink = buildWaKonsultasiLink(nomorWa);
  const waBulkLink = buildWaBulkLink(nomorWa);
  const kategoriOptions = (kategoriList ?? []).map((k) => ({
    value: k.id,
    label: pick(k.nama_id, k.nama_en, locale) ?? k.nama_id,
  }));

  return (
    <div className="pb-16">
      {/* Hero produk Autel */}
      <section className="border-b border-warna-latar-2 bg-warna-latar-2">
        <div className="mx-auto max-w-4xl px-4 py-12 text-center">
          <h1 className="text-2xl font-bold text-warna-teks sm:text-3xl">{t("heroTitle")}</h1>
          <p className="mx-auto mt-3 max-w-xl text-base text-warna-teks-2">{t("heroDesc")}</p>
          {waKonsultasiLink && (
            <a
              href={waKonsultasiLink}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex h-11 items-center justify-center rounded-lg bg-warna-aksen px-6 text-base font-semibold text-warna-teks shadow-float hover:shadow-float-hover [transition:var(--transition-hover)]"
            >
              {t("heroCta")}
            </a>
          )}
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-10">
        <h2 className="text-xl font-bold text-warna-teks sm:text-2xl">{t("pageTitle")}</h2>
        <p className="mt-2 text-base text-warna-teks-2">{t("pageSubtitle")}</p>

        {/* Filter + sort */}
        <div className="mt-6">
          <FilterBar kategoriOptions={kategoriOptions} kategoriValue={kategoriId} sortValue={sortValue} />
        </div>

        {/* Grid */}
        {!produk || produk.length === 0 ? (
          <p className="mt-6 rounded-xl border border-warna-latar-2 bg-warna-latar-2 p-5 text-sm text-warna-teks-2">
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

        {/* CTA partai besar / masih bingung memilih */}
        <div className="mt-16 flex flex-col items-center gap-4 rounded-xl border border-warna-latar-2 bg-warna-latar-2 p-8 text-center sm:p-12">
          <h2 className="text-xl font-bold text-warna-teks sm:text-2xl">{t("bulkCtaHeading")}</h2>
          <p className="max-w-xl text-base text-warna-teks-2">{t("bulkCtaDesc")}</p>
          {waBulkLink && (
            <a
              href={waBulkLink}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex h-11 items-center justify-center rounded-lg bg-warna-aksen px-6 text-base font-semibold text-warna-teks shadow-float hover:shadow-float-hover [transition:var(--transition-hover)]"
            >
              {t("bulkCtaButton")}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
