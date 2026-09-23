import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { getOptionalUser } from "@/lib/auth/guard";
import { pick } from "@/lib/i18n/pick";
import { pageMetadata } from "@/lib/seo/page-metadata";
import { QuizEngine, type QuizQuestion } from "./quiz-engine";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo" });
  return pageMetadata({
    locale,
    path: "/kuis",
    title: t("kuisTitle"),
    description: t("kuisDescription"),
  });
}

export default async function KuisPage() {
  const supabase = await createClient();
  const locale = await getLocale();
  const t = await getTranslations("quiz");
  const claims = await getOptionalUser();

  // Dua query paralel (bukan nested embed PostgREST) — pola yang sama dipakai
  // halaman detail batch. is_correct & penjelasan opsi SENGAJA publik (lihat
  // PANDUAN.md §3.3.10): kuis correctable tanpa kegagalan, tidak ada yang bisa
  // dicurangi, jadi seluruh data soal aman diberikan sekali di sini — logika
  // cek-jawaban berjalan penuh di client, tanpa Server Action per klik.
  const [{ data: soal, error: errSoal }, { data: opsi, error: errOpsi }] = await Promise.all([
    supabase
      .from("quiz_questions")
      .select("id, pertanyaan_id, pertanyaan_en")
      .eq("is_active", true)
      .order("urutan"),
    supabase
      .from("quiz_options")
      .select("id, question_id, label_id, label_en, is_correct, penjelasan_id, penjelasan_en")
      .order("urutan"),
  ]);

  if (errSoal) console.error("[kuis] gagal memuat soal:", errSoal);
  if (errOpsi) console.error("[kuis] gagal memuat opsi:", errOpsi);

  const questions: QuizQuestion[] = (soal ?? []).map((s) => ({
    id: s.id,
    pertanyaan: pick(s.pertanyaan_id, s.pertanyaan_en, locale) ?? s.pertanyaan_id,
    options: (opsi ?? [])
      .filter((o) => o.question_id === s.id)
      .map((o) => ({
        id: o.id,
        label: pick(o.label_id, o.label_en, locale) ?? o.label_id,
        isCorrect: o.is_correct,
        penjelasan: pick(o.penjelasan_id, o.penjelasan_en, locale),
      })),
  }));

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-semibold text-foreground sm:text-3xl">{t("pageTitle")}</h1>
      <p className="mt-2 text-base text-muted-foreground">{t("pageSubtitle")}</p>

      {questions.length === 0 ? (
        <p className="mt-6 rounded-xl border border-border bg-muted/40 p-5 text-sm text-muted-foreground">
          {t("kosong")}
        </p>
      ) : (
        <QuizEngine questions={questions} sudahLogin={claims != null} />
      )}
    </div>
  );
}
