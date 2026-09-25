import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { CheckCircle2Icon } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { formatRupiah, formatTanggalBatch, splitHtmlByHeadings } from "@/lib/batch";
import { pick } from "@/lib/i18n/pick";
import { getKontakPelatihan, getWhatsappAdmin } from "@/lib/site-settings";
import { pageMetadata, plainDescription } from "@/lib/seo/page-metadata";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InstrukturSection } from "@/components/instruktur-section";
import { BatchDetailHero } from "@/components/batch-detail-hero";
import { PublicHeroMist } from "@/components/public-hero-mist";
import {
  publicBadgeKategori,
  publicCtaPrimary,
  publicCtaSecondary,
  publicSectionHeading,
  publicStatusBatchClass,
} from "@/lib/public-ui";
import { PelatihanCard } from "../pelatihan-card";
import { DaftarBatchDialog } from "./daftar-batch-dialog";
import { getPrefillPendaftaranBatch } from "./daftar-batch-actions";

const KONTEN_HTML_CLASS =
  "mt-2 space-y-3 text-base text-muted-foreground [&_a]:underline [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-foreground [&_ol]:list-decimal [&_ol]:pl-5 [&_strong]:font-semibold [&_ul]:list-disc [&_ul]:pl-5";

const cardHeading = "font-heading text-lg font-semibold tracking-tight text-foreground";

const SUGGEST_SELECT =
  "id, slug, judul_id, judul_en, lokasi_id, lokasi_en, deskripsi_id, deskripsi_en, harga, status, rating, hero_gambar_url, tanggal_mulai, tanggal_selesai, batch_categories(nama_id, nama_en)";

function buildWaPelatihanLink(nomor: string | undefined, pesan: string) {
  if (!nomor) return null;
  return `https://wa.me/${nomor}?text=${encodeURIComponent(pesan)}`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const t = await getTranslations({ locale, namespace: "seo" });
  const supabase = await createClient();
  const { data: batch } = await supabase
    .from("batches")
    .select("judul_id, judul_en, deskripsi_id, deskripsi_en")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  const title =
    (batch ? pick(batch.judul_id, batch.judul_en, locale) : null) ??
    t("pelatihanDetailFallbackTitle");
  const description =
    plainDescription(
      batch ? pick(batch.deskripsi_id, batch.deskripsi_en, locale) : null,
    ) || t("pelatihanDetailFallbackDescription");

  return pageMetadata({
    locale,
    path: `/pelatihan/${slug}`,
    title,
    description,
  });
}

export default async function BatchDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();
  const locale = await getLocale();
  const t = await getTranslations("batch");
  const tPelatihan = await getTranslations("pelatihan");

  const { data: batch, error: batchError } = await supabase
    .from("batches")
    .select(
      "id, slug, judul_id, judul_en, category_id, lokasi_id, lokasi_en, alamat, harga, status, tanggal_mulai, tanggal_selesai, deskripsi_id, deskripsi_en, silabus_id, silabus_en, hero_gambar_url, gambar_detail_url, rating, batch_categories(nama_id, nama_en)"
    )
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  if (batchError) console.error("[batch-detail] gagal memuat batch:", batchError);
  if (!batch) notFound();

  const [
    { data: benefits },
    { data: requirements },
    { data: equipment },
    { data: faqs },
    { data: gallery },
  ] = await Promise.all([
    supabase.from("batch_benefits").select("id, ikon, teks_id, teks_en").eq("batch_id", batch.id).order("urutan"),
    supabase
      .from("batch_requirements")
      .select("id, ikon, teks_id, teks_en")
      .eq("batch_id", batch.id)
      .order("urutan"),
    supabase.from("batch_equipment").select("id, teks_id, teks_en").eq("batch_id", batch.id).order("urutan"),
    supabase.from("batch_faqs").select("id, tanya_id, tanya_en, jawab_id, jawab_en").eq("batch_id", batch.id).order("urutan"),
    supabase.from("batch_gallery").select("id, gambar_url, caption_id, caption_en").eq("batch_id", batch.id).order("urutan"),
  ]);

  // Suggest: lewat category_id saja; sembunyikan jika kosong (bukan acak).
  let suggestions: Parameters<typeof PelatihanCard>[0]["batch"][] | null = null;

  if (batch.category_id) {
    const { data } = await supabase
      .from("batches")
      .select(SUGGEST_SELECT)
      .eq("category_id", batch.category_id)
      .eq("is_active", true)
      .neq("id", batch.id)
      .order("tanggal_mulai", { ascending: true })
      .limit(3);
    if (data && data.length > 0) suggestions = data;
  }

  const kontakPelatihan = await getKontakPelatihan();
  const waUmum = await getWhatsappAdmin();
  const tanggal = formatTanggalBatch(batch.tanggal_mulai, batch.tanggal_selesai, locale);
  const judul = pick(batch.judul_id, batch.judul_en, locale) ?? batch.judul_id;
  const kategori = pick(
    batch.batch_categories?.nama_id ?? null,
    batch.batch_categories?.nama_en ?? null,
    locale,
  );
  const lokasi = pick(batch.lokasi_id, batch.lokasi_en, locale);
  const deskripsi = pick(batch.deskripsi_id, batch.deskripsi_en, locale);
  const silabus = pick(batch.silabus_id, batch.silabus_en, locale);
  const waRegulerLink = buildWaPelatihanLink(
    kontakPelatihan.wa_reguler?.trim() || waUmum || undefined,
    t("waAskBatchNamed", { name: "Admin", judul }),
  );
  const waPrivateLink = buildWaPelatihanLink(
    kontakPelatihan.wa_private?.trim() || undefined,
    t("waAskBatchNamed", { name: "Abiyyi", judul }),
  );
  const silabusItems = silabus?.trim() ? splitHtmlByHeadings(silabus) : [];
  const pendaftaran = await getPrefillPendaftaranBatch();
  const tampilSyaratFasilitas =
    (requirements && requirements.length > 0) || (benefits && benefits.length > 0);

  return (
    <div className="bg-background pb-10">
      <PublicHeroMist className="border-b border-border">
        <div className="mx-auto max-w-4xl px-4 py-8 md:py-12">
          <div className="flex flex-wrap items-center gap-2">
            {kategori && <span className={publicBadgeKategori}>{kategori}</span>}
            <span className={publicStatusBatchClass[batch.status]}>{t(`status.${batch.status}`)}</span>
          </div>
          <h1 className={`mt-3 ${publicSectionHeading}`}>{judul}</h1>
          <BatchDetailHero
            gambarDetailUrl={batch.gambar_detail_url}
            heroGambarUrl={batch.hero_gambar_url}
          />
        </div>
      </PublicHeroMist>

      <div className="mx-auto max-w-4xl px-4">
        {benefits && benefits.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-6">
            {benefits.map((b) => (
              <span
                key={b.id}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-sm text-foreground"
              >
                {b.ikon && <span aria-hidden="true">{b.ikon}</span>}
                {pick(b.teks_id, b.teks_en, locale)}
              </span>
            ))}
          </div>
        )}

        {/* Deskripsi (tab/blok) + Silabus sebagai akordion */}
        {(deskripsi?.trim() || silabus?.trim()) && (
          <div className="pt-8">
            {deskripsi?.trim() && silabus?.trim() ? (
              <Tabs defaultValue="deskripsi">
                <TabsList>
                  <TabsTrigger value="deskripsi">{t("descriptionTab")}</TabsTrigger>
                  <TabsTrigger value="silabus">{t("syllabusTab")}</TabsTrigger>
                </TabsList>
                <TabsContent value="deskripsi">
                  <div className={KONTEN_HTML_CLASS} dangerouslySetInnerHTML={{ __html: deskripsi }} />
                </TabsContent>
                <TabsContent value="silabus">
                  <SilabusAccordion
                    items={silabusItems}
                    fallbackHtml={silabus}
                    fallbackTitle={t("syllabusTab")}
                  />
                </TabsContent>
              </Tabs>
            ) : deskripsi?.trim() ? (
              <div>
                <h2 className={publicSectionHeading}>{t("descriptionTab")}</h2>
                <div className={KONTEN_HTML_CLASS} dangerouslySetInnerHTML={{ __html: deskripsi }} />
              </div>
            ) : (
              <div>
                <h2 className={publicSectionHeading}>{t("syllabusTab")}</h2>
                <SilabusAccordion
                  items={silabusItems}
                  fallbackHtml={silabus!}
                  fallbackTitle={t("syllabusTab")}
                />
              </div>
            )}
          </div>
        )}

        {/* Jadwal dominan full-width → Peralatan → Dukungan */}
        <div className="grid grid-cols-1 gap-4 pt-8 sm:grid-cols-2">
          <div className="rounded-xl border border-border bg-card p-5 shadow-none sm:col-span-2 sm:p-6">
            <h2 className={cardHeading}>{t("scheduleInvestmentHeading")}</h2>
            <dl className="mt-3 space-y-1.5 text-sm text-muted-foreground sm:columns-2 sm:gap-8">
              {tanggal && (
                <div className="break-inside-avoid">
                  <dt className="inline font-medium text-foreground">{t("timeLabel")}</dt>
                  <dd className="inline">{tanggal}</dd>
                </div>
              )}
              {lokasi && (
                <div className="break-inside-avoid">
                  <dt className="inline font-medium text-foreground">{t("locationLabel")}</dt>
                  <dd className="inline">{lokasi}</dd>
                </div>
              )}
              {batch.alamat && (
                <div className="break-inside-avoid">
                  <dt className="inline font-medium text-foreground">{t("addressLabel")}</dt>
                  <dd className="inline">{batch.alamat}</dd>
                </div>
              )}
            </dl>
            {batch.harga != null && (
              <p className="mt-3 text-2xl font-bold text-primary sm:text-3xl">{formatRupiah(batch.harga)}</p>
            )}
            {batch.status !== "closed" && (
              <DaftarBatchDialog
                batchId={batch.id}
                slug={slug}
                loggedIn={pendaftaran.loggedIn}
                prefill={pendaftaran.prefill}
              />
            )}
          </div>

          {tampilSyaratFasilitas && (
            <div className="rounded-xl border border-border bg-card p-5 shadow-none sm:col-span-2 sm:p-6">
              <div className="grid gap-6 sm:grid-cols-2">
                {requirements && requirements.length > 0 && (
                  <div>
                    <h2 className={cardHeading}>{t("requirementsHeading")}</h2>
                    <ul className="mt-3 space-y-2">
                      {requirements.map((item) => (
                        <li key={item.id} className="flex items-start gap-2 text-sm text-muted-foreground">
                          {item.ikon ? (
                            <span aria-hidden="true" className="mt-0.5 shrink-0">
                              {item.ikon}
                            </span>
                          ) : (
                            <CheckCircle2Icon className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                          )}
                          <span>{pick(item.teks_id, item.teks_en, locale)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {benefits && benefits.length > 0 && (
                  <div>
                    <h2 className={cardHeading}>{t("facilitiesHeading")}</h2>
                    <ul className="mt-3 space-y-2">
                      {benefits.map((item) => (
                        <li key={item.id} className="flex items-start gap-2 text-sm text-muted-foreground">
                          {item.ikon ? (
                            <span aria-hidden="true" className="mt-0.5 shrink-0">
                              {item.ikon}
                            </span>
                          ) : (
                            <CheckCircle2Icon className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                          )}
                          <span>{pick(item.teks_id, item.teks_en, locale)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {equipment && equipment.length > 0 && (
            <div className="rounded-xl border border-border bg-card p-5 shadow-none">
              <h2 className={cardHeading}>{t("equipmentHeading")}</h2>
              <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-muted-foreground">
                {equipment.map((item) => (
                  <li key={item.id}>{pick(item.teks_id, item.teks_en, locale)}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="rounded-xl border border-border bg-card p-5 shadow-none">
            <h2 className={cardHeading}>{t("supportHeading")}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{t("supportDescription")}</p>
            {waRegulerLink && (
              <a
                href={waRegulerLink}
                target="_blank"
                rel="noopener noreferrer"
                className={`mt-4 w-full ${publicCtaSecondary}`}
              >
                {t("waRegulerLabel")}
              </a>
            )}
          </div>
        </div>

        {faqs && faqs.length > 0 && (
          <div className="pt-10">
            <h2 className={publicSectionHeading}>{t("faqHeading")}</h2>
            <Accordion className="mt-4 rounded-xl border border-border bg-card px-4 shadow-none">
              {faqs.map((faq) => (
                <AccordionItem key={faq.id} value={String(faq.id)} className="border-border last:border-b-0">
                  <AccordionTrigger className="py-4 text-base font-medium text-foreground hover:no-underline">
                    {pick(faq.tanya_id, faq.tanya_en, locale)}
                  </AccordionTrigger>
                  <AccordionContent className="pb-4 text-base text-muted-foreground">
                    {pick(faq.jawab_id, faq.jawab_en, locale)}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        )}

        {gallery && gallery.length > 0 && (
          <div className="pt-10">
            <h2 className={publicSectionHeading}>{t("galleryHeading")}</h2>
            <Carousel className="mt-4">
              <CarouselContent>
                {gallery.map((item) => {
                  const caption = pick(item.caption_id, item.caption_en, locale);
                  return (
                    <CarouselItem key={item.id} className="sm:basis-1/2">
                      <div className="relative aspect-video overflow-hidden rounded-xl">
                        <Image
                          src={item.gambar_url}
                          alt={caption ?? ""}
                          fill
                          className="object-cover"
                          sizes="(max-width: 640px) 100vw, 50vw"
                        />
                      </div>
                      {caption && <p className="mt-2 text-sm text-muted-foreground">{caption}</p>}
                    </CarouselItem>
                  );
                })}
              </CarouselContent>
              <CarouselPrevious className="hidden sm:flex" />
              <CarouselNext className="hidden sm:flex" />
            </Carousel>
          </div>
        )}

        <div className="mt-10 rounded-xl border border-border bg-card p-5">
          <h2 className={cardHeading}>{t("certificateInfoHeading")}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{t("certificateInfoBody")}</p>
        </div>
      </div>

      <InstrukturSection />

      {suggestions && suggestions.length > 0 && (
        <div className="mx-auto max-w-6xl px-4 pb-10">
          <h2 className={publicSectionHeading}>{t("suggestHeading")}</h2>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {suggestions.map((s) => (
              <PelatihanCard
                key={s.id}
                batch={s}
                locale={locale}
                statusLabel={t(`status.${s.status}`)}
                detailLabel={tPelatihan("lihatDetail")}
              />
            ))}
          </div>
        </div>
      )}

      <div className="mx-auto max-w-4xl px-4 pb-10">
        <div className="flex flex-col items-center gap-4 rounded-xl border border-border bg-card p-8 text-center sm:p-12">
          <h2 className={publicSectionHeading}>{t("finalCtaHeading")}</h2>
          <p className="max-w-xl text-base text-muted-foreground">{t("finalCtaDesc")}</p>
          {waPrivateLink && (
            <a
              href={waPrivateLink}
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

function SilabusAccordion({
  items,
  fallbackHtml,
  fallbackTitle,
}: {
  items: { title: string; body: string }[];
  fallbackHtml: string;
  fallbackTitle: string;
}) {
  const entries =
    items.length > 0
      ? items.map((item, i) => ({
          value: `silabus-${i}`,
          title: item.title,
          body: item.body,
        }))
      : [{ value: "silabus-0", title: fallbackTitle, body: fallbackHtml }];

  // Pola visual sama FaqAccordion (Beranda /faq)
  return (
    <Accordion className="mt-2 rounded-xl border border-border bg-card px-4 shadow-none">
      {entries.map((item) => (
        <AccordionItem key={item.value} value={item.value} className="border-border last:border-b-0">
          <AccordionTrigger className="py-4 text-base font-medium text-foreground hover:no-underline">
            {item.title}
          </AccordionTrigger>
          <AccordionContent className="pb-4 text-base text-muted-foreground">
            <div className={KONTEN_HTML_CLASS} dangerouslySetInnerHTML={{ __html: item.body }} />
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
