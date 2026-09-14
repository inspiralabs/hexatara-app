'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  CheckCircle2,
  Download,
  FileIcon,
  FileSpreadsheetIcon,
  FileTextIcon,
  ListChecks,
  Lock,
  PresentationIcon,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { bacaProgresSesi, tandaiBabSelesaiSesi } from '@/lib/materi/session-progress';
import { QuizFinishScreen, type QuizOption, type QuizQuestion } from '@/app/[locale]/(public)/kuis/quiz-engine';
import { EmbeddedQuiz, type JawabanKuis } from './embedded-quiz';
import { selesaikanBabAction } from './actions';

export type BabFile = {
  id: number;
  judul: string;
  deskripsi: string | null;
  urlFile: string;
};

export type Bab = {
  id: number;
  urutan: number;
  judul: string;
  konten: string;
  videoUrl: string | null;
  gambarUrl: string | null;
  files: BabFile[];
};

const SCROLL_EPSILON = 24;

function ekstensiDariUrl(url: string) {
  const path = url.split('?')[0] ?? '';
  const bagian = path.split('.');
  return (bagian[bagian.length - 1] ?? '').toLowerCase();
}

function IkonTipeFile({ url }: { url: string }) {
  const ext = ekstensiDariUrl(url);
  const Icon =
    ext === 'pdf'
      ? FileTextIcon
      : ext === 'xls' || ext === 'xlsx'
        ? FileSpreadsheetIcon
        : ext === 'ppt' || ext === 'pptx'
          ? PresentationIcon
          : ext === 'doc' || ext === 'docx'
            ? FileTextIcon
            : FileIcon;

  return (
    <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
      <Icon className="size-6" aria-hidden />
    </div>
  );
}

export function CourseReader({
  materialId,
  materialJudul,
  chapters,
  initialSelesaiIds,
  sudahLogin,
  kuisSelesai,
  questions,
}: {
  materialId: number;
  materialJudul: string;
  chapters: Bab[];
  initialSelesaiIds: number[];
  sudahLogin: boolean;
  kuisSelesai: boolean;
  questions: QuizQuestion[];
}) {
  const t = useTranslations('kelas');
  const [viewMode, setViewMode] = useState<'materi' | 'kuis'>('materi');
  const [selesai, setSelesai] = useState(() => new Set(initialSelesaiIds));
  const [activeId, setActiveId] = useState(
    chapters.find((b) => !initialSelesaiIds.includes(b.id))?.id ?? chapters[0]!.id
  );
  const [sudahBacaSampaiAkhir, setSudahBacaSampaiAkhir] = useState(false);
  const [pending, setPending] = useState(false);
  const [pesanError, setPesanError] = useState<string | null>(null);
  const [sidebarTerbuka, setSidebarTerbuka] = useState(false);
  const [jawabanKuis, setJawabanKuis] = useState<JawabanKuis>({});
  const [activeQuestionId, setActiveQuestionId] = useState(questions[0]?.id ?? 0);
  const [kuisDisubmitLokal, setKuisDisubmitLokal] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const kuisSudahSelesai = kuisDisubmitLokal || kuisSelesai;

  // Progress anonim disimpan sessionStorage (tiga halaman berbeda: materi -> kuis
  // -> daftar), tidak bisa dibaca saat render server — hidrasi sekali di client.
  useEffect(() => {
    if (sudahLogin) return;
    const sesi = bacaProgresSesi();
    if (sesi && sesi.materialId === materialId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelesai(new Set(sesi.chapterIds));
    }
  }, [sudahLogin, materialId]);

  // Deteksi "sudah dibaca sampai akhir": event `scroll` TIDAK PERNAH terpicu
  // kalau konten bab tidak menghasilkan overflow (bab pendek, muat tanpa
  // scrollbar) — jadi selain listen ke onScroll, kondisi ini juga dicek
  // proaktif saat bab aktif berganti dan saat video/gambar selesai load
  // (keduanya bisa mengubah tinggi kontainer setelah render pertama).
  const cekPosisiScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const tidakBisaScroll = el.scrollHeight <= el.clientHeight + SCROLL_EPSILON;
    const sudahDiBawah = el.scrollTop + el.clientHeight >= el.scrollHeight - SCROLL_EPSILON;
    if (tidakBisaScroll || sudahDiBawah) setSudahBacaSampaiAkhir(true);
  }, []);

  useEffect(() => {
    cekPosisiScroll();
  }, [activeId, cekPosisiScroll]);

  function pindahBab(id: number) {
    setViewMode('materi');
    setActiveId(id);
    setSudahBacaSampaiAkhir(false);
    scrollRef.current?.scrollTo({ top: 0 });
  }

  const activeIndex = chapters.findIndex((b) => b.id === activeId);
  const active = chapters[activeIndex]!;
  const isLast = activeIndex === chapters.length - 1;
  const semuaBabSelesai = chapters.every((b) => selesai.has(b.id));
  const semuaSoalTerjawab = questions.length > 0 && questions.every((q) => jawabanKuis[q.id] !== undefined);

  // Progress bar gabungan bab + soal (§12.5.3 revisi poin 7) — total selalu
  // (bab + soal) sejak awal, bukan cuma bertambah begitu tab Kuis dibuka,
  // supaya angkanya tidak tiba-tiba turun saat user pindah ke tab Kuis.
  const totalLangkah = chapters.length + questions.length;
  const langkahSelesai = selesai.size + Object.keys(jawabanKuis).length;

  async function handleLanjutBab() {
    setPesanError(null);
    if (!selesai.has(active.id)) {
      if (sudahLogin) {
        setPending(true);
        const hasil = await selesaikanBabAction(materialId, active.id);
        setPending(false);
        if (!hasil.ok) {
          setPesanError(hasil.pesan);
          return;
        }
      } else {
        tandaiBabSelesaiSesi(materialId, active.id);
      }
      setSelesai((s) => new Set(s).add(active.id));
    }
    if (isLast) {
      setViewMode('kuis');
    } else {
      pindahBab(chapters[activeIndex + 1]!.id);
    }
  }

  function handlePilihOpsiKuis(questionId: number, opsi: QuizOption) {
    setJawabanKuis((prev) => {
      if (prev[questionId]?.benar) return prev; // sama seperti `if (benar) return` di QuizQuestionCard/QuizEngine
      return { ...prev, [questionId]: { dipilihId: opsi.id, benar: opsi.isCorrect } };
    });
  }

  function handleLanjutSoal() {
    if (semuaSoalTerjawab) {
      setKuisDisubmitLokal(true);
      return;
    }
    const idx = questions.findIndex((q) => q.id === activeQuestionId);
    const idxBerikutnya = (idx + 1) % questions.length;
    setActiveQuestionId(questions[idxBerikutnya]!.id);
  }

  function daftarBab(tutupSetelahPilih: boolean) {
    return (
      <>
        <div className="mb-3 h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full bg-emerald-600 transition-[width] dark:bg-emerald-500"
            style={{ width: totalLangkah > 0 ? `${(langkahSelesai / totalLangkah) * 100}%` : '0%' }}
          />
        </div>
        <p className="mb-3 text-xs text-muted-foreground">
          {t('progres', { selesai: langkahSelesai, total: totalLangkah })}
        </p>

        <p className="mb-1 px-1 text-xs font-semibold text-muted-foreground">{t('tabMateri')}</p>
        <nav className="flex flex-col gap-1">
          {chapters.map((bab, idx) => {
            const done = selesai.has(bab.id);
            const unlocked = idx === 0 || chapters.slice(0, idx).every((b) => selesai.has(b.id));
            const isActive = viewMode === 'materi' && bab.id === activeId;
            return (
              <button
                key={bab.id}
                type="button"
                disabled={!unlocked}
                onClick={() => {
                  if (!unlocked) return;
                  pindahBab(bab.id);
                  if (tutupSetelahPilih) setSidebarTerbuka(false);
                }}
                className={cn(
                  'flex min-h-11 items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50',
                  isActive
                    ? 'bg-accent font-semibold text-accent-foreground'
                    : 'text-foreground hover:bg-muted'
                )}
              >
                {done ? (
                  <CheckCircle2 className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                ) : !unlocked ? (
                  <Lock className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                ) : (
                  <span className="size-4 shrink-0" />
                )}
                <span>{bab.judul}</span>
              </button>
            );
          })}
        </nav>

        <div className="mt-3 flex flex-col gap-2 border-t border-border pt-3">
          {semuaBabSelesai ? (
            <button
              type="button"
              onClick={() => {
                setViewMode('kuis');
                if (tutupSetelahPilih) setSidebarTerbuka(false);
              }}
              className={cn(
                'flex min-h-11 items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition-colors',
                viewMode === 'kuis' ? 'bg-accent text-accent-foreground' : 'bg-primary text-primary-foreground'
              )}
            >
              {t('kuisMenu')}
            </button>
          ) : (
            <span
              title={t('kuisTerkunci')}
              className="flex min-h-11 cursor-not-allowed items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-muted-foreground opacity-50"
            >
              <Lock className="size-4 shrink-0" aria-hidden="true" />
              {t('kuisMenu')}
            </span>
          )}

          {questions.length > 0 && (
            <div className="flex flex-wrap gap-1.5 px-1">
              {questions.map((q, i) => {
                const terjawab = jawabanKuis[q.id] !== undefined;
                const aktif = viewMode === 'kuis' && q.id === activeQuestionId;
                return (
                  <button
                    key={q.id}
                    type="button"
                    disabled={!semuaBabSelesai}
                    onClick={() => {
                      if (!semuaBabSelesai) return;
                      setViewMode('kuis');
                      setActiveQuestionId(q.id);
                      if (tutupSetelahPilih) setSidebarTerbuka(false);
                    }}
                    className={cn(
                      'flex size-8 items-center justify-center rounded-md border text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40',
                      terjawab
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border text-muted-foreground',
                      aktif && 'ring-2 ring-ring ring-offset-1 ring-offset-background'
                    )}
                  >
                    {i + 1}
                  </button>
                );
              })}
            </div>
          )}

          <Link href="/" className={cn(buttonVariants(), 'min-h-11')}>
            {t('beranda')}
          </Link>
        </div>
      </>
    );
  }

  return (
    <div className="flex min-h-full flex-1 flex-col bg-background">
      {/* Trigger sidebar mobile — di desktop sidebar sudah persisten (lihat aside di bawah) */}
      <div className="flex items-center gap-2 border-b border-border bg-muted/40 px-4 py-3 md:hidden">
        <Sheet open={sidebarTerbuka} onOpenChange={setSidebarTerbuka}>
          <SheetTrigger render={<Button variant="outline" size="sm" className="min-h-11 gap-2" />}>
            <ListChecks className="size-4" aria-hidden="true" />
            {t('daftarBab')}
          </SheetTrigger>
          <SheetContent side="left">
            <SheetHeader>
              <SheetTitle>{materialJudul}</SheetTitle>
            </SheetHeader>
            <div className="px-4 pb-4">{daftarBab(true)}</div>
          </SheetContent>
        </Sheet>
        <span className="truncate text-sm font-semibold text-foreground">{materialJudul}</span>
      </div>

      <div className="flex flex-1 flex-col md:flex-row">
        <aside className="hidden md:flex md:w-72 md:shrink-0 md:flex-col md:border-r md:border-border md:bg-muted/30 md:p-4">
          <h1 className="mb-3 text-base font-semibold text-foreground">{materialJudul}</h1>
          {daftarBab(false)}
        </aside>

        <main className="flex flex-1 flex-col">
          {viewMode === 'kuis' ? (
            <div className="flex flex-1 flex-col">
              <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-8">
                {kuisSudahSelesai ? (
                  <div className="mx-auto max-w-2xl">
                    <QuizFinishScreen sudahLogin={sudahLogin} />
                  </div>
                ) : (
                  <EmbeddedQuiz
                    questions={questions}
                    jawaban={jawabanKuis}
                    activeQuestionId={activeQuestionId}
                    onPilihSoal={setActiveQuestionId}
                    onPilihOpsi={handlePilihOpsiKuis}
                  />
                )}
              </div>

              {!kuisSudahSelesai && (
                <div className="border-t border-border bg-background px-4 py-4 sm:px-8">
                  <div className="flex md:justify-end">
                    <Button type="button" onClick={handleLanjutSoal} className="h-11 px-6">
                      {semuaSoalTerjawab ? t('submitJawaban') : t('lanjutSoal')}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Tabs defaultValue="materi" className="flex flex-1 flex-col">
              <div className="border-b border-border px-4 pt-3 sm:px-8">
                <TabsList variant="line">
                  <TabsTrigger value="materi">{t('tabMateri')}</TabsTrigger>
                  <TabsTrigger value="file">
                    {t('tabFile')}
                    {active.files.length > 0 ? ` (${active.files.length})` : ''}
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="materi" className="flex flex-1 flex-col">
                <div ref={scrollRef} onScroll={cekPosisiScroll} className="flex-1 overflow-y-auto px-4 py-6 sm:px-8">
                  <div className="mx-auto max-w-2xl">
                    <h2 className="text-xl font-semibold text-foreground sm:text-2xl">{active.judul}</h2>

                    {active.videoUrl && (
                      <div className="relative mt-4 aspect-video w-full overflow-hidden rounded-lg bg-foreground">
                        <iframe
                          src={active.videoUrl}
                          title={active.judul}
                          onLoad={cekPosisiScroll}
                          className="absolute inset-0 size-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                    )}

                    {/* konten diisi lewat Tiptap di Admin Panel (ENGINEERING §5.8) — HTML dari
                        Admin, bukan input publik, jadi dangerouslySetInnerHTML aman di sini. */}
                    <div
                      className="mt-4 space-y-3 text-base leading-relaxed text-muted-foreground [&_a]:text-primary [&_a]:underline [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-foreground [&_ol]:list-decimal [&_ol]:pl-5 [&_strong]:font-semibold [&_strong]:text-foreground [&_ul]:list-disc [&_ul]:pl-5"
                      dangerouslySetInnerHTML={{ __html: active.konten }}
                    />

                    {active.gambarUrl && (
                      // eslint-disable-next-line @next/next/no-img-element -- URL bebas dari Admin (bisa domain apa saja), next/image butuh remotePatterns per host
                      <img src={active.gambarUrl} alt="" onLoad={cekPosisiScroll} className="mt-4 w-full rounded-lg" />
                    )}
                  </div>
                </div>

                {!(isLast && kuisSudahSelesai) && (
                  <div className="border-t border-border bg-background px-4 py-4 sm:px-8">
                    {pesanError && <p className="mb-2 text-sm text-destructive md:text-right">{pesanError}</p>}
                    {!sudahBacaSampaiAkhir && (
                      <p className="mb-2 text-sm text-muted-foreground md:text-right">{t('bacaSampaiAkhir')}</p>
                    )}
                    <div className="flex md:justify-end">
                      <Button
                        type="button"
                        disabled={!sudahBacaSampaiAkhir || pending}
                        onClick={handleLanjutBab}
                        className="h-11 px-6"
                      >
                        {isLast ? t('lanjutKuis') : t('lanjutBab')}
                      </Button>
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="file" className="flex-1 overflow-y-auto px-4 py-6 sm:px-8">
                <div className="mx-auto max-w-2xl">
                  {active.files.length === 0 ? (
                    <p className="rounded-lg border border-border p-4 text-center text-sm text-muted-foreground">
                      {t('fileKosong')}
                    </p>
                  ) : (
                    <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {active.files.map((file) => (
                        <li key={file.id} className="flex items-start gap-3 rounded-lg border border-border p-4">
                          <IkonTipeFile url={file.urlFile} />
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-medium text-foreground">{file.judul}</p>
                            {file.deskripsi ? (
                              <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">{file.deskripsi}</p>
                            ) : null}
                            <a
                              href={file.urlFile}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'mt-3 min-h-11 gap-1.5')}
                            >
                              <Download className="size-4" aria-hidden="true" />
                              {t('unduh')}
                            </a>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          )}
        </main>
      </div>
    </div>
  );
}
