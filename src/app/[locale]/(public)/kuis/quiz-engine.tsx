'use client';

import { useState } from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { selesaikanKuisLoginAction } from './actions';

export type QuizOption = {
  id: number;
  label: string;
  isCorrect: boolean;
  penjelasan: string | null;
};

export type QuizQuestion = {
  id: number;
  pertanyaan: string;
  options: QuizOption[];
};

// Kartu satu soal — dipakai QuizEngine (linear, /kuis) DAN EmbeddedQuiz
// (bebas-lompat, di dalam LMS §12.5.3). Logika benar/salah/terkunci/penjelasan
// PERSIS sama di kedua tempat, cuma parent yang menentukan navigasinya.
export function QuizQuestionCard({
  soal,
  dipilih,
  benar,
  onPilih,
}: {
  soal: QuizQuestion;
  dipilih: number | null;
  benar: boolean;
  onPilih: (opsi: QuizOption) => void;
}) {
  return (
    <div className="rounded-xl border border-warna-latar-2 bg-warna-latar p-5">
      <h2 className="text-lg font-bold text-warna-teks">{soal.pertanyaan}</h2>

      <div className="mt-4 flex flex-col gap-2">
        {soal.options.map((opsi) => {
          const dipilihIni = dipilih === opsi.id;
          const salahDipilih = dipilihIni && !opsi.isCorrect;
          const benarDipilih = dipilihIni && opsi.isCorrect;

          return (
            <div key={opsi.id}>
              <button
                type="button"
                onClick={() => onPilih(opsi)}
                disabled={benar}
                className={`flex w-full items-center gap-2 rounded-lg border p-3 text-left text-base disabled:cursor-not-allowed ${
                  benarDipilih
                    ? 'border-warna-sukses bg-warna-sukses/10 text-warna-teks'
                    : salahDipilih
                      ? 'border-warna-bahaya bg-warna-bahaya/10 text-warna-teks'
                      : 'border-warna-latar-2 text-warna-teks disabled:opacity-60'
                }`}
              >
                {benarDipilih && <CheckCircle2 className="size-5 shrink-0 text-warna-sukses" aria-hidden="true" />}
                {salahDipilih && <XCircle className="size-5 shrink-0 text-warna-bahaya" aria-hidden="true" />}
                <span>{opsi.label}</span>
              </button>
              {salahDipilih && opsi.penjelasan && (
                <p className="mt-1.5 px-1 text-sm text-warna-teks-2">{opsi.penjelasan}</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Layar "Dapatkan Sertifikat" setelah kuis selesai — dipakai QuizEngine
// (/kuis) DAN layar penyelesaian kuis di dalam LMS (§12.5.3 revisi kuis).
// Alur F03.4 existing, tidak berubah: anonim -> /daftar, login -> Server Action.
export function QuizFinishScreen({ sudahLogin = false }: { sudahLogin?: boolean }) {
  const t = useTranslations('quiz');
  const tombolClassName =
    'mt-4 inline-flex h-11 items-center justify-center rounded-lg bg-warna-aksen px-6 text-base font-semibold text-warna-teks';
  return (
    <div className="mt-6 rounded-xl border border-warna-sukses/30 bg-warna-sukses/5 p-6 text-center">
      <p className="text-lg font-bold text-warna-sukses">{t('selesai')}</p>
      {sudahLogin ? (
        <form action={selesaikanKuisLoginAction}>
          <button type="submit" className={tombolClassName}>
            {t('dapatkanSertifikat')}
          </button>
        </form>
      ) : (
        <Link href="/daftar?kuisSelesai=1" className={tombolClassName}>
          {t('dapatkanSertifikat')}
        </Link>
      )}
    </div>
  );
}

export function QuizEngine({
  questions,
  sudahLogin = false,
}: {
  questions: QuizQuestion[];
  sudahLogin?: boolean;
}) {
  const t = useTranslations('quiz');
  const [index, setIndex] = useState(0);
  const [dipilih, setDipilih] = useState<number | null>(null);
  const [benar, setBenar] = useState(false);

  if (index >= questions.length) {
    return <QuizFinishScreen sudahLogin={sudahLogin} />;
  }

  const soal = questions[index]!;

  function pilihOpsi(opsi: QuizOption) {
    if (benar) return; // soal sudah terkunci
    setDipilih(opsi.id);
    if (opsi.isCorrect) setBenar(true);
  }

  function lanjut() {
    setIndex((i) => i + 1);
    setDipilih(null);
    setBenar(false);
  }

  return (
    <div className="mt-6 flex flex-col gap-4">
      <p className="text-sm font-medium text-warna-teks-2">
        {t('progres', { sekarang: index + 1, total: questions.length })}
      </p>

      <QuizQuestionCard soal={soal} dipilih={dipilih} benar={benar} onPilih={pilihOpsi} />

      {benar && (
        <button
          type="button"
          onClick={lanjut}
          className="inline-flex h-11 w-fit items-center justify-center rounded-lg bg-warna-aksen px-6 text-base font-semibold text-warna-teks"
        >
          {t('lanjut')}
        </button>
      )}
    </div>
  );
}
