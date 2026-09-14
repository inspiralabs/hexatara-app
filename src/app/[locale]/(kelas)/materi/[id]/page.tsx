import { notFound } from "next/navigation";
import Image from "next/image";
import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { getOptionalUser } from "@/lib/auth/guard";
import { pick } from "@/lib/i18n/pick";
import { CourseReader } from "./course-reader";

export default async function MateriCoursePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const materialId = Number(id);
  if (!Number.isInteger(materialId)) notFound();

  const supabase = await createClient();
  const locale = await getLocale();
  const t = await getTranslations("kelas");
  const claims = await getOptionalUser();

  const { data: material } = await supabase
    .from("materials")
    .select("id, judul_id, judul_en")
    .eq("id", materialId)
    .eq("is_active", true)
    .maybeSingle();

  if (!material) notFound();

  const { data: babData, error: errBab } = await supabase
    .from("material_chapters")
    .select("id, urutan, judul_id, judul_en, konten_id, konten_en, video_url, gambar_url")
    .eq("material_id", materialId)
    .order("urutan");

  if (errBab) console.error("[materi/course] gagal memuat bab:", errBab);

  const chapterIds = (babData ?? []).map((b) => b.id);
  const { data: filesData, error: errFiles } =
    chapterIds.length > 0
      ? await supabase
          .from("material_chapter_files")
          .select("id, chapter_id, judul_id, judul_en, deskripsi_id, deskripsi_en, url_file")
          .in("chapter_id", chapterIds)
          .order("urutan")
      : { data: [], error: null };

  if (errFiles) console.error("[materi/course] gagal memuat lampiran file:", errFiles);

  // Soal kuis (F03.2) — dipakai sebagai tab "Kuis" di dalam LMS (§12.5.3 revisi).
  // Query sama persis seperti /kuis/page.tsx, sengaja tidak diekstrak ke lib
  // bersama karena tidak ada halaman lain di proyek ini yang melakukan itu
  // (semua fetch inline per halaman, ENGINEERING §9 — konsisten > abstraksi baru).
  const [{ data: soalData, error: errSoal }, { data: opsiData, error: errOpsi }] = await Promise.all([
    supabase.from("quiz_questions").select("id, pertanyaan_id, pertanyaan_en").eq("is_active", true).order("urutan"),
    supabase
      .from("quiz_options")
      .select("id, question_id, label_id, label_en, is_correct, penjelasan_id, penjelasan_en")
      .order("urutan"),
  ]);

  if (errSoal) console.error("[materi/course] gagal memuat soal kuis:", errSoal);
  if (errOpsi) console.error("[materi/course] gagal memuat opsi kuis:", errOpsi);

  const questions = (soalData ?? []).map((s) => ({
    id: s.id,
    pertanyaan: pick(s.pertanyaan_id, s.pertanyaan_en, locale) ?? s.pertanyaan_id,
    options: (opsiData ?? [])
      .filter((o) => o.question_id === s.id)
      .map((o) => ({
        id: o.id,
        label: pick(o.label_id, o.label_en, locale) ?? o.label_id,
        isCorrect: o.is_correct,
        penjelasan: pick(o.penjelasan_id, o.penjelasan_en, locale),
      })),
  }));

  const chapters = (babData ?? []).map((b) => ({
    id: b.id,
    urutan: b.urutan,
    judul: pick(b.judul_id, b.judul_en, locale) ?? b.judul_id,
    konten: pick(b.konten_id, b.konten_en, locale) ?? b.konten_id,
    videoUrl: b.video_url,
    gambarUrl: b.gambar_url,
    files: (filesData ?? [])
      .filter((f) => f.chapter_id === b.id)
      .map((f) => ({
        id: f.id,
        judul: pick(f.judul_id, f.judul_en, locale) ?? f.judul_id,
        deskripsi: pick(f.deskripsi_id, f.deskripsi_en, locale),
        urlFile: f.url_file,
      })),
  }));

  let initialSelesaiIds: number[] = [];
  let kuisSelesai = false;
  if (claims) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("free_track_selesai_at")
      .eq("id", claims.sub)
      .maybeSingle();
    kuisSelesai = profile?.free_track_selesai_at != null;

    if (chapters.length > 0) {
      const { data: progress } = await supabase
        .from("material_progress")
        .select("chapter_id")
        .eq("user_id", claims.sub)
        .eq("is_selesai", true)
        .in(
          "chapter_id",
          chapters.map((c) => c.id)
        );
      initialSelesaiIds = (progress ?? []).map((p) => p.chapter_id);
    }
  }

  const judulMateri = pick(material.judul_id, material.judul_en, locale) ?? material.judul_id;

  return (
    <div className="flex min-h-full flex-1 flex-col bg-background">
      <div className="flex items-center gap-3 border-b border-border bg-primary px-4 py-3 text-primary-foreground">
        <Link href="/" className="flex shrink-0 items-center gap-2 text-base font-bold">
          <Image src="/hexatara-logo.png" alt="Hexatara" width={28} height={28} className="h-7 w-7" priority />
          <span className="hidden sm:inline">Hexatara</span>
        </Link>
        <span className="flex-1 text-center text-sm font-semibold sm:text-base">{t("headerBadge")}</span>
      </div>

      {chapters.length === 0 ? (
        <div className="mx-auto max-w-md px-4 py-16 text-center">
          <p className="text-base text-muted-foreground">{t("kosongBab")}</p>
          <Link
            href="/pelatihan"
            className="mt-4 inline-block text-sm font-semibold text-primary underline underline-offset-4"
          >
            {t("kembali")}
          </Link>
        </div>
      ) : (
        <CourseReader
          materialId={materialId}
          materialJudul={judulMateri}
          chapters={chapters}
          initialSelesaiIds={initialSelesaiIds}
          sudahLogin={claims != null}
          kuisSelesai={kuisSelesai}
          questions={questions}
        />
      )}
    </div>
  );
}
