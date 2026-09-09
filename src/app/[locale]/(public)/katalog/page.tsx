import Image from "next/image";
import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { pick } from "@/lib/i18n/pick";

function formatRupiah(nilai: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(nilai);
}

export default async function KatalogPage() {
  const supabase = await createClient();
  const locale = await getLocale();
  const t = await getTranslations("catalog");

  // products_public, BUKAN products — angka harga produk yang disembunyikan
  // sudah NULL di sisi database (ADR-004), tidak pernah menyentuh payload apa pun.
  const { data: produk, error: errProduk } = await supabase
    .from("products_public")
    .select("id, slug, nama_id, nama_en, kategori, harga")
    .order("urutan");

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

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-bold text-warna-teks sm:text-3xl">{t("pageTitle")}</h1>
      <p className="mt-2 text-base text-warna-teks-2">{t("pageSubtitle")}</p>

      {!produk || produk.length === 0 ? (
        <p className="mt-6 rounded-xl border border-warna-latar-2 bg-warna-latar-2 p-5 text-sm text-warna-teks-2">
          {t("kosong")}
        </p>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {produk.map((p) => {
            if (p.id == null || p.slug == null) return null;
            const nama = pick(p.nama_id, p.nama_en, locale) ?? p.nama_id ?? "";
            const cover = coverByProductId.get(p.id);
            return (
              <Link
                key={p.id}
                href={`/katalog/${p.slug}`}
                className="flex flex-col gap-2 overflow-hidden rounded-xl border border-warna-latar-2 bg-warna-latar"
              >
                <div className="relative aspect-square w-full bg-warna-latar-2">
                  {cover && (
                    <Image
                      src={cover}
                      alt={nama}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  )}
                </div>
                <div className="flex flex-col gap-1 p-4 pt-1">
                  {p.kategori && (
                    <span className="w-fit rounded-full bg-warna-utama/10 px-2.5 py-0.5 text-xs font-medium text-warna-utama">
                      {p.kategori}
                    </span>
                  )}
                  <h2 className="text-base font-bold text-warna-teks">{nama}</h2>
                  <p className="text-base font-semibold text-warna-teks">
                    {p.harga != null ? formatRupiah(p.harga) : t("hargaHubungiKami")}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
