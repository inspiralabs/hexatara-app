import { QuizQuestionCard, type QuizOption, type QuizQuestion } from '@/app/[locale]/(public)/kuis/quiz-engine';

export type JawabanKuis = Record<number, { dipilihId: number; benar: boolean }>;

// Kuis di dalam LMS (§12.5.3 revisi) — bebas lompat antar soal lewat kotak
// nomor, beda dari QuizEngine yang linear di /kuis. Logika per-soal (benar/
// salah/terkunci/penjelasan) TIDAK ditulis ulang di sini — dipakai langsung
// dari QuizQuestionCard yang sama dengan /kuis.
export function EmbeddedQuiz({
  questions,
  jawaban,
  activeQuestionId,
  onPilihSoal,
  onPilihOpsi,
}: {
  questions: QuizQuestion[];
  jawaban: JawabanKuis;
  activeQuestionId: number;
  onPilihSoal: (id: number) => void;
  onPilihOpsi: (questionId: number, opsi: QuizOption) => void;
}) {
  const soal = questions.find((q) => q.id === activeQuestionId) ?? questions[0]!;
  const entry = jawaban[soal.id];

  return (
    <div className="mx-auto max-w-2xl">
      <div className="flex flex-wrap gap-2">
        {questions.map((q, i) => {
          const terjawab = jawaban[q.id] !== undefined;
          const aktif = q.id === activeQuestionId;
          return (
            <button
              key={q.id}
              type="button"
              onClick={() => onPilihSoal(q.id)}
              className={`flex size-10 shrink-0 items-center justify-center rounded-lg border text-sm font-semibold [transition:var(--transition-hover)] ${
                terjawab
                  ? 'border-warna-aksen bg-warna-aksen text-warna-teks'
                  : 'border-warna-latar-2 text-warna-teks-2'
              } ${aktif ? 'ring-2 ring-warna-utama ring-offset-2' : ''}`}
            >
              {i + 1}
            </button>
          );
        })}
      </div>

      <div className="mt-4">
        <QuizQuestionCard
          soal={soal}
          dipilih={entry?.dipilihId ?? null}
          benar={entry?.benar ?? false}
          onPilih={(opsi) => onPilihOpsi(soal.id, opsi)}
        />
      </div>
    </div>
  );
}
