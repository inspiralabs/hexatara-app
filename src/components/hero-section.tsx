import Image from "next/image";
import { GraduationCap, ShoppingBag } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export async function HeroSection() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("hero_slides")
    .select("id, judul_id, subjudul_id, gambar_url, cta_teks_id, cta_url")
    .eq("is_active", true)
    .order("urutan", { ascending: true })
    .limit(1);

  if (error) console.error("[hero] gagal memuat:", error);
  const slide = data?.[0];

  return (
    <section className="w-full">
      {/* Dua penawaran inti — teks tetap, tidak bergantung isi database — supaya
          "hexatara menyelenggarakan pelatihan drone DAN jual drone" langsung
          terlihat tanpa scroll di 375px (PRD §1.3/§6.1), apa pun isi hero_slides. */}
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-3 px-4 py-6 sm:gap-6 sm:py-10">
        <div className="flex flex-col gap-2 rounded-xl border border-warna-latar-2 bg-warna-latar p-4 sm:p-6">
          <GraduationCap className="size-6 text-warna-utama sm:size-8" aria-hidden="true" />
          <h2 className="text-base font-bold leading-tight text-warna-teks sm:text-xl">
            Pelatihan Pilot Drone Bersertifikat
          </h2>
          <p className="hidden text-sm text-warna-teks-2 sm:block">
            Sertifikasi RPC resmi, kelas bulanan bersama instruktur berpengalaman.
          </p>
          <a
            href="#jadwal"
            className="mt-auto inline-flex h-11 w-fit items-center justify-center rounded-lg bg-warna-aksen px-4 text-sm font-semibold text-warna-teks sm:text-base"
          >
            Lihat Jadwal
          </a>
        </div>

        <div className="flex flex-col gap-2 rounded-xl border border-warna-latar-2 bg-warna-latar p-4 sm:p-6">
          <ShoppingBag className="size-6 text-warna-utama sm:size-8" aria-hidden="true" />
          <h2 className="text-base font-bold leading-tight text-warna-teks sm:text-xl">
            Jual Drone Profesional Autel
          </h2>
          <p className="hidden text-sm text-warna-teks-2 sm:block">
            Drone untuk kebutuhan survei, pemetaan, dan industri.
          </p>
          <a
            href="/katalog"
            className="mt-auto inline-flex h-11 w-fit items-center justify-center rounded-lg bg-warna-aksen px-4 text-sm font-semibold text-warna-teks sm:text-base"
          >
            Lihat Katalog
          </a>
        </div>
      </div>

      {slide && (
        <div className="mx-auto max-w-6xl px-4 pb-6 sm:pb-10">
          <div className="overflow-hidden rounded-xl bg-warna-utama sm:flex sm:items-center">
            {slide.gambar_url && (
              <div className="relative aspect-video w-full sm:w-1/2">
                <Image
                  src={slide.gambar_url}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, 50vw"
                />
              </div>
            )}
            <div className="flex flex-col gap-2 p-6 text-warna-latar sm:w-1/2">
              <h3 className="text-xl font-bold sm:text-2xl">{slide.judul_id}</h3>
              {slide.subjudul_id && (
                <p className="text-base text-warna-latar/90">{slide.subjudul_id}</p>
              )}
              {slide.cta_teks_id && slide.cta_url && (
                <a
                  href={slide.cta_url}
                  className="mt-2 inline-flex h-11 w-fit items-center justify-center rounded-lg bg-warna-aksen px-5 text-base font-semibold text-warna-teks"
                >
                  {slide.cta_teks_id}
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
