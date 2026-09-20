import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { pick } from "@/lib/i18n/pick";
import { getMateriHeroHref } from "@/lib/materi";
import { PublicHeroMist } from "@/components/public-hero-mist";
import { publicCtaPrimary, publicSectionHeading } from "@/lib/public-ui";
import { PelatihanCard } from "./pelatihan-card";
import { FilterBar } from "./filter-bar";
import { SORT_VALUES, type PelatihanSort } from "./sort-options";

const STATUS_VALUES = ["upcoming", "open", "closed"] as const;
type StatusFilter = (typeof STATUS_VALUES)[number];

function isStatusFilter(value: string | undefined): value is StatusFilter {
  return STATUS_VALUES.includes(value as StatusFilter);
}

function isSort(value: string | undefined): value is PelatihanSort {
  return SORT_VALUES.includes(value as PelatihanSort);
}

function buildWaCustomLink(nomor: string | undefined) {
  if (!nomor) return null;
  const pesan =
    "Halo Admin Hexatara, saya ingin bertanya soal pelatihan custom/khusus untuk tim atau instansi saya.";
  return `https://wa.me/${nomor}?text=${encodeURIComponent(pesan)}`;
}

export default async function PelatihanPage({
  searchParams,
}: {
  searchParams: Promise<{ kategori?: string; status?: string; sort?: string }>;
}) {
  const { kategori, status, sort } = await searchParams;
  const kategoriId = kategori;
  const statusFilter = isStatusFilter(status) ? status : undefined;
  const sortValue = isSort(sort) ? sort : "tanggalTerdekat";

  const supabase = await createClient();
  const locale = await getLocale();
  const t = await getTranslations("pelatihan");
  const tBatch = await getTranslations("batch");

  const { data: kategoriList, error: kategoriError } = await supabase
    .from("batch_categories")
    .select("id, nama_id, nama_en")
    .eq("is_active", true)
    .order("urutan", { ascending: true });

  if (kategoriError) console.error("[pelatihan] gagal memuat kategori:", kategoriError);

  let query = supabase
    .from("batches")
    .select(
      "id, slug, judul_id, judul_en, lokasi_id, lokasi_en, deskripsi_id, deskripsi_en, harga, status, rating, hero_gambar_url, tanggal_mulai, tanggal_selesai, created_at, batch_categories(nama_id, nama_en)"
    )
    .eq("is_active", true);

  if (kategoriId) query = query.eq("category_id", kategoriId);
  if (statusFilter) query = query.eq("status", statusFilter);

  if (sortValue === "terbaru") {
    query = query.order("created_at", { ascending: false });
  } else if (sortValue === "hargaAsc") {
    query = query.order("harga", { ascending: true, nullsFirst: false });
  } else if (sortValue === "hargaDesc") {
    query = query.order("harga", { ascending: false, nullsFirst: false });
  } else {
    query = query.order("tanggal_mulai", { ascending: true, nullsFirst: false });
  }

  const { data, error } = await query;

  if (error) console.error("[pelatihan] gagal memuat:", error);

  const waCustomLink = buildWaCustomLink(process.env.NEXT_PUBLIC_WA_ADMIN);
  const materiHref = await getMateriHeroHref();
  const kategoriOptions = (kategoriList ?? []).map((k) => ({
    value: k.id,
    label: pick(k.nama_id, k.nama_en, locale) ?? k.nama_id,
  }));

  return (
    <div className="bg-background pb-16">
      {/* Hero freemium */}
      <PublicHeroMist className="border-b border-border">
        <div className="mx-auto max-w-4xl px-4 py-12 text-center md:py-16">
          <h1 className={publicSectionHeading}>{t("freemiumHeroTitle")}</h1>
          <p className="mx-auto mt-3 max-w-xl text-base text-muted-foreground">{t("freemiumHeroDesc")}</p>
          {materiHref && (
            <Link href={materiHref} className={`mt-6 ${publicCtaPrimary}`}>
              {t("freemiumHeroCta")}
            </Link>
          )}
        </div>
      </PublicHeroMist>

      <div className="mx-auto max-w-6xl px-4 py-10 md:py-16">
        <h2 className={publicSectionHeading}>{t("pageTitle")}</h2>
        <p className="mt-2 text-base text-muted-foreground">{t("pageSubtitle")}</p>

        <div className="mt-6">
          <FilterBar
            kategoriOptions={kategoriOptions}
            kategoriValue={kategoriId}
            statusValue={statusFilter}
            sortValue={sortValue}
          />
        </div>

        {!data || data.length === 0 ? (
          <p className="mt-6 rounded-xl border border-border bg-card p-5 text-sm text-muted-foreground">
            {t("kosong")}
          </p>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.map((batch) => (
              <PelatihanCard
                key={batch.id}
                batch={batch}
                locale={locale}
                statusLabel={tBatch(`status.${batch.status}`)}
                detailLabel={t("lihatDetail")}
              />
            ))}
          </div>
        )}

        <div className="mt-16 flex flex-col items-center gap-4 rounded-xl border border-border bg-card p-8 text-center sm:p-12">
          <h2 className={publicSectionHeading}>{t("customCtaHeading")}</h2>
          <p className="max-w-xl text-base text-muted-foreground">{t("customCtaDesc")}</p>
          {waCustomLink && (
            <a
              href={waCustomLink}
              target="_blank"
              rel="noopener noreferrer"
              className={`mt-2 ${publicCtaPrimary}`}
            >
              {t("customCtaButton")}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
