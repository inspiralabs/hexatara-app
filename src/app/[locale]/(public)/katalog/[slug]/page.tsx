import Image from "next/image";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { pick } from "@/lib/i18n/pick";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const KONTEN_HTML_CLASS =
  "mt-2 space-y-3 text-base text-warna-teks-2 [&_a]:underline [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-warna-teks [&_ol]:list-decimal [&_ol]:pl-5 [&_strong]:font-semibold [&_ul]:list-disc [&_ul]:pl-5";

function formatRupiah(nilai: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(nilai);
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
    .select("id, slug, nama_id, nama_en, deskripsi_id, deskripsi_en, spesifikasi_id, spesifikasi_en, kategori, harga")
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

  const nama = pick(produk.nama_id, produk.nama_en, locale) ?? produk.nama_id ?? "";
  const deskripsi = pick(produk.deskripsi_id, produk.deskripsi_en, locale);
  const spesifikasi = pick(produk.spesifikasi_id, produk.spesifikasi_en, locale);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Link href="/katalog" className="text-sm text-warna-utama underline">
        &larr; {t("backToCatalog")}
      </Link>

      {gambar && gambar.length > 0 && (
        <Carousel className="mt-4">
          <CarouselContent>
            {gambar.map((g) => (
              <CarouselItem key={g.id}>
                <div className="relative aspect-square overflow-hidden rounded-xl bg-warna-latar-2">
                  <Image src={g.url} alt={nama} fill className="object-cover" sizes="(max-width: 768px) 100vw, 768px" />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          {gambar.length > 1 && (
            <>
              <CarouselPrevious className="hidden sm:flex" />
              <CarouselNext className="hidden sm:flex" />
            </>
          )}
        </Carousel>
      )}

      <div className="mt-6 flex flex-col gap-2">
        {produk.kategori && (
          <span className="w-fit rounded-full bg-warna-utama/10 px-2.5 py-0.5 text-xs font-medium text-warna-utama">
            {produk.kategori}
          </span>
        )}
        <h1 className="text-2xl font-bold text-warna-teks sm:text-3xl">{nama}</h1>
        <p className="text-xl font-bold text-warna-teks">
          {produk.harga != null ? formatRupiah(produk.harga) : t("hargaHubungiKami")}
        </p>
      </div>

      {deskripsi?.trim() && (
        <div className="mt-8">
          <h2 className="text-lg font-bold text-warna-teks">{t("descriptionHeading")}</h2>
          <div className={KONTEN_HTML_CLASS} dangerouslySetInnerHTML={{ __html: deskripsi }} />
        </div>
      )}

      {spesifikasi?.trim() && (
        <div className="mt-8">
          <h2 className="text-lg font-bold text-warna-teks">{t("specHeading")}</h2>
          <p className="mt-2 whitespace-pre-line text-base text-warna-teks-2">{spesifikasi}</p>
        </div>
      )}
    </div>
  );
}
