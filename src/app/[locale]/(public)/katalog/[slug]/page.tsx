import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatRupiah } from "@/lib/batch";
import { pick } from "@/lib/i18n/pick";
import { StarRating } from "@/components/star-rating";
import { ProductGallery } from "./product-gallery";
import { ProdukCard } from "../produk-card";
import { QuoteDialog } from "./quote-dialog";

const KONTEN_HTML_CLASS =
  "mt-2 space-y-3 text-base text-warna-teks-2 [&_a]:underline [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-warna-teks [&_ol]:list-decimal [&_ol]:pl-5 [&_strong]:font-semibold [&_ul]:list-disc [&_ul]:pl-5";

function buildWaProdukLink(nomor: string | undefined, namaProduk: string) {
  if (!nomor) return null;
  const pesan = `Halo Admin Hexatara, saya ingin bertanya tentang produk "${namaProduk}".`;
  return `https://wa.me/${nomor}?text=${encodeURIComponent(pesan)}`;
}

export default async function KatalogDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();
  const locale = await getLocale();
  const t = await getTranslations("catalog");

  // products_public, BUKAN products — lihat catatan yang sama di katalog/page.tsx.
  const { data: produk, error: errProduk } = await supabase
    .from("products_public")
    .select(
      "id, slug, nama_id, nama_en, deskripsi_id, deskripsi_en, spesifikasi_id, spesifikasi_en, kategori, category_id, harga, rating"
    )
    .eq("slug", slug)
    .maybeSingle();

  if (errProduk) console.error("[katalog-detail] gagal memuat produk:", errProduk);
  if (!produk || produk.id == null) notFound();

  const { data: gambar, error: errGambar } = await supabase
    .from("product_images")
    .select("id, url")
    .eq("product_id", produk.id)
    .order("urutan");

  if (errGambar) console.error("[katalog-detail] gagal memuat gambar:", errGambar);

  // Suggest produk lain — kategori sama, exclude diri sendiri. Kalau produk ini
  // belum punya category_id (F06.4 belum jalan, ADR-012), section disembunyikan
  // daripada fallback ke produk acak — pola sama dengan suggest Pelatihan.
  const { data: suggestions } = produk.category_id
    ? await supabase
        .from("products_public")
        .select("id, slug, nama_id, nama_en, kategori, harga, rating")
        .eq("category_id", produk.category_id)
        .neq("id", produk.id)
        .order("created_at", { ascending: false })
        .limit(3)
    : { data: null };

  const suggestionIds = (suggestions ?? []).map((s) => s.id).filter((id): id is number => id != null);
  const { data: suggestionGambar } =
    suggestionIds.length > 0
      ? await supabase.from("product_images").select("product_id, url, urutan").in("product_id", suggestionIds).order("urutan")
      : { data: [] };

  const suggestionCoverById = new Map<number, string>();
  for (const g of suggestionGambar ?? []) {
    if (!suggestionCoverById.has(g.product_id)) suggestionCoverById.set(g.product_id, g.url);
  }

  const nama = pick(produk.nama_id, produk.nama_en, locale) ?? produk.nama_id ?? "";
  const deskripsi = pick(produk.deskripsi_id, produk.deskripsi_en, locale);
  const spesifikasi = pick(produk.spesifikasi_id, produk.spesifikasi_en, locale);
  const waLink = buildWaProdukLink(process.env.NEXT_PUBLIC_WA_ADMIN, nama);

  return (
    <div className="pb-16">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <Link href="/katalog" className="text-sm text-warna-utama underline">
          &larr; {t("backToCatalog")}
        </Link>

        <div className="mt-4 grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Kiri: galeri */}
          <ProductGallery images={gambar ?? []} alt={nama} />

          {/* Kanan: info */}
          <div className="flex flex-col gap-3">
            {produk.kategori && (
              <span className="w-fit rounded-full bg-warna-utama/10 px-2.5 py-0.5 text-xs font-medium text-warna-utama">
                {produk.kategori}
              </span>
            )}
            <h1 className="text-2xl font-bold text-warna-teks sm:text-3xl">{nama}</h1>
            <StarRating rating={produk.rating} />

            {deskripsi?.trim() && (
              <div>
                <h2 className="text-lg font-bold text-warna-teks">{t("descriptionHeading")}</h2>
                <div className={KONTEN_HTML_CLASS} dangerouslySetInnerHTML={{ __html: deskripsi }} />
              </div>
            )}

            {spesifikasi?.trim() && (
              <div>
                <h2 className="text-lg font-bold text-warna-teks">{t("specHeading")}</h2>
                {/* HTML dari Tiptap di Admin Panel (F04.6, ENGINEERING §5.8) — hanya Admin
                    yang mengisi, dangerouslySetInnerHTML aman di sini. */}
                <div className={KONTEN_HTML_CLASS} dangerouslySetInnerHTML={{ __html: spesifikasi }} />
              </div>
            )}

            <p className="mt-2 text-3xl font-bold text-warna-teks">
              {produk.harga != null ? formatRupiah(produk.harga) : t("hargaHubungiKami")}
            </p>

            <div className="flex flex-col gap-2 sm:flex-row">
              {waLink && (
                <a
                  href={waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-11 flex-1 items-center justify-center rounded-lg border border-warna-utama px-5 text-base font-semibold text-warna-utama [transition:var(--transition-hover)] hover:bg-warna-utama/5"
                >
                  {t("contactWhatsapp")}
                </a>
              )}
              <QuoteDialog productId={produk.id} />
            </div>
          </div>
        </div>
      </div>

      {/* Suggest produk lain */}
      {suggestions && suggestions.length > 0 && (
        <div className="mx-auto max-w-6xl px-4 pb-4">
          <h2 className="text-xl font-bold text-warna-teks sm:text-2xl">{t("suggestHeading")}</h2>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {suggestions.map((s) => {
              if (s.id == null) return null;
              return (
                <ProdukCard
                  key={s.id}
                  produk={{ ...s, cover: suggestionCoverById.get(s.id) }}
                  locale={locale}
                  hargaHubungiKami={t("hargaHubungiKami")}
                  detailLabel={t("lihatDetail")}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* CTA tanya lebih lanjut */}
      <div className="mx-auto max-w-4xl px-4 pt-6">
        <div className="flex flex-col items-center gap-4 rounded-xl border border-warna-latar-2 bg-warna-latar-2 p-8 text-center sm:p-12">
          <h2 className="text-xl font-bold text-warna-teks sm:text-2xl">{t("finalCtaHeading")}</h2>
          <p className="max-w-xl text-base text-warna-teks-2">{t("finalCtaDesc")}</p>
          {waLink && (
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex h-11 items-center justify-center rounded-lg bg-warna-aksen px-6 text-base font-semibold text-warna-teks shadow-float hover:shadow-float-hover [transition:var(--transition-hover)]"
            >
              {t("finalCtaButton")}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
