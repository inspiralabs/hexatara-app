import { Link } from "@/i18n/navigation";
import { formatRupiah } from "@/lib/batch";
import { pick } from "@/lib/i18n/pick";
import { ContentCard } from "@/components/content-card";
import { publicBadgeKategori, publicCtaSecondary } from "@/lib/public-ui";
import type { Database } from "@/types/database";

export type ProdukCardProduk = Pick<
  Database["public"]["Views"]["products_public"]["Row"],
  "id" | "slug" | "nama_id" | "nama_en" | "kategori" | "harga" | "rating"
> & { cover?: string | null };

export function ProdukCard({
  produk,
  locale,
  hargaHubungiKami,
  detailLabel,
}: {
  produk: ProdukCardProduk;
  locale: string;
  hargaHubungiKami: string;
  detailLabel: string;
}) {
  const nama = pick(produk.nama_id, produk.nama_en, locale) ?? produk.nama_id ?? "";

  return (
    <ContentCard
      variant="public"
      image={produk.cover ? { src: produk.cover, alt: nama } : null}
      badges={
        produk.kategori ? <span className={publicBadgeKategori}>{produk.kategori}</span> : undefined
      }
      title={nama}
      rating={produk.rating}
      price={produk.harga != null ? formatRupiah(produk.harga) : hargaHubungiKami}
      cta={
        produk.slug ? (
          <Link href={`/katalog/${produk.slug}`} className={publicCtaSecondary}>
            {detailLabel}
          </Link>
        ) : undefined
      }
    />
  );
}
