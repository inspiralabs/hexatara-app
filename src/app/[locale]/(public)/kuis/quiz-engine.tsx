'use client';

import { useState } from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
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
    <div className="rounded-xl border border-border bg-card p-5">
      <h2 className="text-lg font-semibold text-foreground">{soal.pertanyaan}</h2>

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
                className={cn(
                  'flex w-full items-center gap-2 rounded-lg border p-3 text-left text-base disabled:cursor-not-allowed',
                  benarDipilih
                    ? 'border-emerald-600/40 bg-emerald-500/10 text-foreground'
                    : salahDipilih
                      ? 'border-destructive/40 bg-destructive/10 text-foreground'
                      : 'border-border text-foreground disabled:opacity-60'
                )}
              >
                {benarDipilih && (
                  <CheckCircle2 className="size-5 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                )}
                {salahDipilih && <XCircle className="size-5 shrink-0 text-destructive" aria-hidden="true" />}
                <span>{opsi.label}</span>
              </button>
              {salahDipilih && opsi.penjelasan && (
                <p className="mt-1.5 px-1 text-sm text-muted-foreground">{opsi.penjelasan}</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Layar selesai setelah kuis — dipakai QuizEngine (/kuis) DAN LMS (§12.5.3).
// Anonim → /daftar. Login pertama kali → Server Action (isi free_track_selesai_at
// idempotent). Login yang SUDAH punya free_track → "Lihat Sertifikat" ke dashboard
// (satu akun satu free_track; ulang kuis tidak invent nomor baru).
export function QuizFinishScreen({
  sudahLogin = false,
  sudahPunyaSertifikat = false,
}: {
  sudahLogin?: boolean;
  sudahPunyaSertifikat?: boolean;
}) {
  const t = useTranslations('quiz');
  const tombolClassName = cn(buttonVariants(), 'mt-4 h-11 px-6');

  if (sudahLogin && sudahPunyaSertifikat) {
    return (
      <div className="mt-6 rounded-xl border border-emerald-600/30 bg-emerald-500/5 p-6 text-center">
        <p className="text-lg font-semibold text-emerald-700 dark:text-emerald-400">{t('selesai')}</p>
        <p className="mt-3 text-sm text-muted-foreground">{t('sudahPunyaSertifikatInfo')}</p>
        <Link href="/dashboard/sertifikat" className={tombolClassName}>
          {t('lihatSertifikat')}
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-6 rounded-xl border border-emerald-600/30 bg-emerald-500/5 p-6 text-center">
      <p className="text-lg font-semibold text-emerald-700 dark:text-emerald-400">{t('selesai')}</p>
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
  sudahPunyaSertifikat = false,
}: {
  questions: QuizQuestion[];
  sudahLogin?: boolean;
  sudahPunyaSertifikat?: boolean;
}) {
  const t = useTranslations('quiz');
  const [index, setIndex] = useState(0);
  const [dipilih, setDipilih] = useState<number | null>(null);
  const [benar, setBenar] = useState(false);

  if (index >= questions.length) {
    return (
      <QuizFinishScreen sudahLogin={sudahLogin} sudahPunyaSertifikat={sudahPunyaSertifikat} />
    );
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
      <p className="text-sm font-medium text-muted-foreground">
        {t('progres', { sekarang: index + 1, total: questions.length })}
      </p>

      <QuizQuestionCard soal={soal} dipilih={dipilih} benar={benar} onPilih={pilihOpsi} />

      {benar && (
        <Button type="button" onClick={lanjut} className="h-11 w-fit px-6">
          {t('lanjut')}
        </Button>
      )}
    </div>
  );
}
