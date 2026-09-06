import Image from "next/image";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { STATUS_BATCH_LABEL, formatRupiah, formatTanggalBatch } from "@/lib/batch";
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
import { DaftarMinatDialog } from "./daftar-minat-dialog";

const KONTEN_HTML_CLASS =
  "mt-2 space-y-3 text-base text-warna-teks-2 [&_a]:underline [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-warna-teks [&_ol]:list-decimal [&_ol]:pl-5 [&_strong]:font-semibold [&_ul]:list-disc [&_ul]:pl-5";

function buildWaTanyaLink(nomor: string | undefined, judul: string) {
  if (!nomor) return null;
  const pesan = `Halo Admin Hexatara, saya ingin bertanya tentang batch "${judul}".`;
  return `https://wa.me/${nomor}?text=${encodeURIComponent(pesan)}`;
}

export default async function BatchDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: batch, error: batchError } = await supabase
    .from("batches")
    .select(
      "id, slug, judul_id, kategori_id, lokasi_id, alamat, harga, status, tanggal_mulai, tanggal_selesai, deskripsi_id, silabus_id, hero_gambar_url"
    )
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  if (batchError) console.error("[batch-detail] gagal memuat batch:", batchError);
  if (!batch) notFound();

  const [{ data: benefits }, { data: equipment }, { data: faqs }, { data: gallery }] = await Promise.all([
    supabase.from("batch_benefits").select("id, ikon, teks_id").eq("batch_id", batch.id).order("urutan"),
    supabase.from("batch_equipment").select("id, teks_id").eq("batch_id", batch.id).order("urutan"),
    supabase.from("batch_faqs").select("id, tanya_id, jawab_id").eq("batch_id", batch.id).order("urutan"),
    supabase.from("batch_gallery").select("id, gambar_url, caption_id").eq("batch_id", batch.id).order("urutan"),
  ]);

  const nomorWa = process.env.NEXT_PUBLIC_WA_ADMIN;
  const status = STATUS_BATCH_LABEL[batch.status];
  const tanggal = formatTanggalBatch(batch.tanggal_mulai, batch.tanggal_selesai);
  const waTanyaLink = buildWaTanyaLink(nomorWa, batch.judul_id);

  const tabItems = [
    batch.deskripsi_id?.trim()
      ? { value: "deskripsi", label: "Deskripsi", html: batch.deskripsi_id }
      : null,
    batch.silabus_id?.trim() ? { value: "silabus", label: "Silabus", html: batch.silabus_id } : null,
  ].filter((item): item is { value: string; label: string; html: string } => item !== null);

  return (
    <div className="pb-10">
      {/* 1. Hero judul */}
      <section className="border-b border-warna-latar-2 bg-warna-latar-2">
        <div className="mx-auto max-w-4xl px-4 py-8">
          <div className="flex flex-wrap items-center gap-2">
            {batch.kategori_id && (
              <span className="rounded-full bg-warna-utama/10 px-2.5 py-0.5 text-xs font-medium text-warna-utama">
                {batch.kategori_id}
              </span>
            )}
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${status.className}`}>
              {status.label}
            </span>
          </div>
          <h1 className="mt-3 text-2xl font-bold text-warna-teks sm:text-3xl">{batch.judul_id}</h1>
          {batch.hero_gambar_url && (
            <div className="relative mt-6 aspect-video w-full overflow-hidden rounded-xl">
              <Image
                src={batch.hero_gambar_url}
                alt=""
                fill
                priority
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 768px"
              />
            </div>
          )}
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-4">
        {/* 2. Benefit pills */}
        {benefits && benefits.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-6">
            {benefits.map((b) => (
              <span
                key={b.id}
                className="inline-flex items-center gap-1.5 rounded-full border border-warna-latar-2 bg-warna-latar px-3 py-1.5 text-sm text-warna-teks"
              >
                {b.ikon && <span aria-hidden="true">{b.ikon}</span>}
                {b.teks_id}
              </span>
            ))}
          </div>
        )}

        {/* 3. Tab Deskripsi + Silabus */}
        {tabItems.length > 0 && (
          <div className="pt-8">
            <Tabs defaultValue={tabItems[0].value}>
              <TabsList>
                {tabItems.map((tab) => (
                  <TabsTrigger key={tab.value} value={tab.value}>
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
              {tabItems.map((tab) => (
                <TabsContent key={tab.value} value={tab.value}>
                  {/* HTML dari Tiptap di Admin Panel (ENGINEERING §5.8) — hanya Admin
                      yang mengisi, dangerouslySetInnerHTML aman di sini. */}
                  <div className={KONTEN_HTML_CLASS} dangerouslySetInnerHTML={{ __html: tab.html }} />
                </TabsContent>
              ))}
            </Tabs>
          </div>
        )}

        {/* 4–6. Jadwal & Investasi / Dukungan Peserta / Peralatan Belajar */}
        <div className="grid grid-cols-1 gap-4 pt-8 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-xl border border-warna-latar-2 bg-warna-latar p-5">
            <h2 className="text-lg font-bold text-warna-teks">Jadwal & Investasi</h2>
            <dl className="mt-3 space-y-1.5 text-sm text-warna-teks-2">
              {tanggal && (
                <div>
                  <dt className="inline font-medium text-warna-teks">Waktu: </dt>
                  <dd className="inline">{tanggal}</dd>
                </div>
              )}
              {batch.lokasi_id && (
                <div>
                  <dt className="inline font-medium text-warna-teks">Lokasi: </dt>
                  <dd className="inline">{batch.lokasi_id}</dd>
                </div>
              )}
              {batch.alamat && (
                <div>
                  <dt className="inline font-medium text-warna-teks">Alamat: </dt>
                  <dd className="inline">{batch.alamat}</dd>
                </div>
              )}
            </dl>
            {batch.harga != null && (
              <p className="mt-3 text-xl font-bold text-warna-teks">{formatRupiah(batch.harga)}</p>
            )}
            {batch.status !== "closed" && <DaftarMinatDialog batchId={batch.id} />}
          </div>

          <div className="rounded-xl border border-warna-latar-2 bg-warna-latar p-5">
            <h2 className="text-lg font-bold text-warna-teks">Dukungan Peserta</h2>
            <p className="mt-2 text-sm text-warna-teks-2">
              Ada pertanyaan sebelum mendaftar? Hubungi Admin langsung lewat WhatsApp.
            </p>
            {waTanyaLink && (
              <a
                href={waTanyaLink}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex h-11 w-full items-center justify-center rounded-lg border border-warna-utama px-5 text-base font-semibold text-warna-utama"
              >
                Hubungi Admin
              </a>
            )}
          </div>

          {equipment && equipment.length > 0 && (
            <div className="rounded-xl border border-warna-latar-2 bg-warna-latar p-5">
              <h2 className="text-lg font-bold text-warna-teks">Peralatan Belajar</h2>
              <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-warna-teks-2">
                {equipment.map((item) => (
                  <li key={item.id}>{item.teks_id}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* 7a. FAQ */}
        {faqs && faqs.length > 0 && (
          <div className="pt-10">
            <h2 className="text-xl font-bold text-warna-teks">Pertanyaan Umum</h2>
            <Accordion className="mt-4">
              {faqs.map((faq) => (
                <AccordionItem key={faq.id} value={String(faq.id)}>
                  <AccordionTrigger className="text-base text-warna-teks">{faq.tanya_id}</AccordionTrigger>
                  <AccordionContent className="text-warna-teks-2">{faq.jawab_id}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        )}

        {/* 7b. Galeri dokumentasi */}
        {gallery && gallery.length > 0 && (
          <div className="pt-10">
            <h2 className="text-xl font-bold text-warna-teks">Galeri Dokumentasi</h2>
            <Carousel className="mt-4">
              <CarouselContent>
                {gallery.map((item) => (
                  <CarouselItem key={item.id} className="sm:basis-1/2">
                    <div className="relative aspect-video overflow-hidden rounded-xl">
                      <Image
                        src={item.gambar_url}
                        alt={item.caption_id ?? ""}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 100vw, 50vw"
                      />
                    </div>
                    {item.caption_id && <p className="mt-2 text-sm text-warna-teks-2">{item.caption_id}</p>}
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="hidden sm:flex" />
              <CarouselNext className="hidden sm:flex" />
            </Carousel>
          </div>
        )}
      </div>
    </div>
  );
}
