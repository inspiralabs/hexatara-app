import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { formatRupiah } from "@/lib/batch";
import { pick } from "@/lib/i18n/pick";
import { StarRating } from "@/components/star-rating";
import {
  publicBadgeKategori,
  publicCtaPrimary,
  publicCtaSecondary,
  publicSectionHeading,
} from "@/lib/public-ui";
import { ProductGallery } from "./product-gallery";
import { ProdukCard } from "../produk-card";
import { QuoteDialog } from "./quote-dialog";

const KONTEN_HTML_CLASS =
  "mt-2 space-y-3 text-base text-muted-foreground [&_a]:underline [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-foreground [&_ol]:list-decimal [&_ol]:pl-5 [&_strong]:font-semibold [&_ul]:list-disc [&_ul]:pl-5";

const cardHeading = "font-heading text-lg font-semibold tracking-tight text-foreground";

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
    <div className="bg-background pb-16">
      <div className="mx-auto max-w-6xl px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <ProductGallery images={gambar ?? []} alt={nama} />

          <div className="flex flex-col gap-3">
            {produk.kategori && <span className={publicBadgeKategori}>{produk.kategori}</span>}
            <h1 className={publicSectionHeading}>{nama}</h1>
            <StarRating rating={produk.rating} />

            {deskripsi?.trim() && (
              <div>
                <h2 className={cardHeading}>{t("descriptionHeading")}</h2>
                <div className={KONTEN_HTML_CLASS} dangerouslySetInnerHTML={{ __html: deskripsi }} />
              </div>
            )}

            {spesifikasi?.trim() && (
              <div>
                <h2 className={cardHeading}>{t("specHeading")}</h2>
                {/* HTML dari Tiptap di Admin Panel (F04.6, ENGINEERING §5.8) — hanya Admin
                    yang mengisi, dangerouslySetInnerHTML aman di sini. */}
                <div className={KONTEN_HTML_CLASS} dangerouslySetInnerHTML={{ __html: spesifikasi }} />
              </div>
            )}

            <p className="mt-2 text-2xl font-bold text-primary sm:text-3xl">
              {produk.harga != null ? formatRupiah(produk.harga) : t("hargaHubungiKami")}
            </p>

            <div className="flex flex-col gap-2 sm:flex-row">
              {waLink && (
                <a
                  href={waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex-1 ${publicCtaSecondary}`}
                >
                  {t("contactWhatsapp")}
                </a>
              )}
              <QuoteDialog productId={produk.id} />
            </div>
          </div>
        </div>
      </div>

      {suggestions && suggestions.length > 0 && (
        <div className="mx-auto max-w-6xl px-4 pb-4">
          <h2 className={publicSectionHeading}>{t("suggestHeading")}</h2>
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

      <div className="mx-auto max-w-4xl px-4 pt-6">
        <div className="flex flex-col items-center gap-4 rounded-xl border border-border bg-card p-8 text-center sm:p-12">
          <h2 className={publicSectionHeading}>{t("finalCtaHeading")}</h2>
          <p className="max-w-xl text-base text-muted-foreground">{t("finalCtaDesc")}</p>
          {waLink && (
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className={`mt-2 ${publicCtaPrimary}`}
            >
              {t("finalCtaButton")}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
