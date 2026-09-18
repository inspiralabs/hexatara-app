# Prompt Cursor — F10.3: Perbaikan Bug Kuis LMS (jawaban salah lolos submit) + Ulangi Ujian

> Acuan: `ENGINEERING.md` ADR-023 (Bagian 10), `PRD.md` §5.1f dan §9e (khusus 9e.5), `feature-registry.md` Sprint 9.
> Sprint 9 / Modul 10 (ADR-023). Tidak butuh SQL, satu file utama. Root cause sudah ditemukan lewat riset kode — perbaikan ini presisi, jangan menulis ulang komponen kuis yang sudah benar.
>
> Governance yang tetap berlaku penuh (CLAUDE.md/PRD.md §13.1): larangan #4 ("jangan tambah ambang kelulusan kuis") TIDAK relevan di sini — perbaikan ini MENGEMBALIKAN ambang yang sudah dimaksud sejak awal (100% benar), bukan menambah ambang baru. JANGAN menambah dependency baru tanpa izin eksplisit.

## 0. Konteks yang WAJIB dipahami dulu sebelum mengubah kode

Baca dulu file-file ini secara utuh:

- `src/app/[locale]/(kelas)/materi/[id]/course-reader.tsx` — file utama yang diubah, terutama baris ~143 (`semuaSoalTerjawab`), fungsi `handlePilihOpsiKuis` (~176) dan `handleLanjutSoal` (~184).
- `src/app/[locale]/(public)/kuis/quiz-engine.tsx` — `QuizQuestionCard`/`QuizEngine`/`QuizFinishScreen`, dipakai bersama oleh `/kuis` (linear, SUDAH BENAR) dan LMS (`EmbeddedQuiz`, tempat bug-nya). JANGAN diubah kecuali benar-benar perlu — kartu soalnya sudah benar.
- `src/app/[locale]/(kelas)/materi/[id]/embedded-quiz.tsx` — komponen kuis di dalam LMS, murni render + teruskan event, TIDAK perlu diubah (lihat penjelasan di Bagian 3 prompt ini).
- `messages/id.json` (dan `messages/en.json` kalau ada) — cek namespace terjemahan yang dipakai `course-reader.tsx` sebelum menambah string baru.

---

## Konteks — SUDAH DITELUSURI, jangan diasumsikan ulang

Ada DUA komponen kuis di proyek ini, berbagi kartu soal yang sama (`QuizQuestionCard` di `src/app/[locale]/(public)/kuis/quiz-engine.tsx`):

1. **`QuizEngine`** (dipakai di `/kuis`, kuis linear standalone) — SUDAH BENAR. Tombol "Lanjut" hanya muncul kalau `benar === true` (lihat `{benar && <Button onClick={lanjut}>...}` di `quiz-engine.tsx`), jadi tidak mungkin pindah soal tanpa jawaban benar dulu.
2. **`EmbeddedQuiz`** (dipakai DI DALAM LMS, `src/app/[locale]/(kelas)/materi/[id]/embedded-quiz.tsx`) — kartu soalnya SAMA (`QuizQuestionCard`), TAPI navigasi/submit ditentukan oleh PARENT-nya, `course-reader.tsx`, BUKAN oleh `EmbeddedQuiz` sendiri.

**Root cause pasti, di `src/app/[locale]/(kelas)/materi/[id]/course-reader.tsx` baris 143:**

```tsx
const semuaSoalTerjawab = questions.length > 0 && questions.every((q) => jawabanKuis[q.id] !== undefined);
```

Ini mengecek "soal punya entri jawaban" (ada di object, apa pun isinya), BUKAN "soal dijawab BENAR". Kombinasikan dengan `handlePilihOpsiKuis` (baris ~176):

```tsx
function handlePilihOpsiKuis(questionId: number, opsi: QuizOption) {
  setJawabanKuis((prev) => {
    if (prev[questionId]?.benar) return prev;
    return { ...prev, [questionId]: { dipilihId: opsi.id, benar: opsi.isCorrect } };
  });
}
```

Kalau user pilih jawaban SALAH sekali lalu tidak mencoba lagi, `jawabanKuis[q.id]` tetap terisi (`{ dipilihId, benar: false }`) — `semuaSoalTerjawab` jadi `true` walau jawabannya salah. Ini yang menyebabkan tombol "Dapatkan Sertifikat" muncul meski ada jawaban salah, persis laporan Alif.

**Catatan penting:** `QuizQuestionCard` sendiri SUDAH mengunci pilihan setelah benar (`disabled={benar}` di tombol opsi) — begini yang berjalan benar SAAT user memang menjawab benar. Masalahnya murni di logika "boleh submit" di `course-reader.tsx`, bukan di kartu soal.

---

## Perbaikan

### 1. Ganti kondisi "boleh submit" jadi "semua terjawab BENAR"

Di `course-reader.tsx` baris 143, ganti:

```tsx
const semuaSoalTerjawab = questions.length > 0 && questions.every((q) => jawabanKuis[q.id] !== undefined);
```

jadi:

```tsx
const semuaSoalTerjawabBenar = questions.length > 0 && questions.every((q) => jawabanKuis[q.id]?.benar === true);
const semuaSoalSudahDicoba = questions.length > 0 && questions.every((q) => jawabanKuis[q.id] !== undefined);
```

Cari SEMUA pemakaian `semuaSoalTerjawab` di file ini (minimal 2 titik yang sudah ditemukan: baris progress bar `totalLangkah`/`langkahSelesai`, dan `handleLanjutSoal`) dan sesuaikan:
- Di `handleLanjutSoal` (baris ~184), ganti pengecekan submit dari `semuaSoalTerjawab` jadi `semuaSoalTerjawabBenar`.
- Progress bar (`langkahSelesai = selesai.size + Object.keys(jawabanKuis).length`) TETAP pakai jumlah soal yang SUDAH DICOBA (bukan yang benar) — ini murni indikator "sudah sampai mana", bukan gate kelulusan, biarkan seperti semula supaya progress bar tidak terasa mundur saat user mencoba ulang.

### 2. Tampilkan pesan + tombol "Ulangi Ujian" kalau ada jawaban salah saat mencoba submit

Di `handleLanjutSoal`, tambahkan cabang baru: kalau user sudah mencoba SEMUA soal (`semuaSoalSudahDicoba`) TAPI belum semua benar (`!semuaSoalTerjawabBenar`), JANGAN langsung set `kuisDisubmitLokal` — tampilkan state baru yang memberi tahu ada jawaban salah dan tawarkan "Ulangi Ujian":

```tsx
function handleLanjutSoal() {
  if (semuaSoalTerjawabBenar) {
    setKuisDisubmitLokal(true);
    return;
  }
  if (semuaSoalSudahDicoba) {
    setBelumSemuaBenar(true);
    return;
  }
  const idx = questions.findIndex((q) => q.id === activeQuestionId);
  const idxBerikutnya = (idx + 1) % questions.length;
  setActiveQuestionId(questions[idxBerikutnya]!.id);
}

function handleUlangiUjian() {
  setJawabanKuis({});
  setBelumSemuaBenar(false);
  setActiveQuestionId(questions[0]!.id);
}
```

Tambahkan state baru `const [belumSemuaBenar, setBelumSemuaBenar] = useState(false);` dekat state `kuisDisubmitLokal` yang sudah ada.

Cari bagian render kuis (sekitar `viewMode === 'kuis'`, dekat `EmbeddedQuiz`/`QuizFinishScreen`) dan tambahkan blok baru: kalau `belumSemuaBenar === true`, tampilkan pesan singkat ("Masih ada jawaban yang belum tepat. Coba tinjau ulang soal yang ditandai, lalu ulangi.") dan tombol "Ulangi Ujian" yang memanggil `handleUlangiUjian()`. Boleh ditampilkan sebagai overlay/panel sederhana di atas `EmbeddedQuiz` yang sedang aktif, atau sebagai state terpisah mirip `QuizFinishScreen` — pilih pendekatan yang paling konsisten dengan gaya visual file ini (rounded border, warna semantik `destructive`/kuning peringatan, BUKAN merah penuh supaya tidak terasa seperti error sistem).

**PENTING — jangan reset progres materi.** `handleUlangiUjian()` di atas HANYA mengosongkan `jawabanKuis` — TIDAK menyentuh state `selesai` (progres bab materi). Ini keputusan yang sudah dikonfirmasi Alif: kalau ada jawaban salah, user cukup mengulang KUIS, bukan membaca ulang semua bab materi (dua state itu memang sudah terpisah di kode, tidak perlu disatukan).

Tambahkan string terjemahan baru yang dibutuhkan ke `messages/id.json` (dan padanan Inggris kalau ada `messages/en.json`) di bawah namespace `quiz` atau namespace yang dipakai `course-reader.tsx` — cek dulu namespace mana yang dipakai (`useTranslations('...')` di atas file ini) supaya konsisten, jangan bikin namespace baru sembarangan. Contoh key: `belumSemuaBenar`, `ulangiUjian`.

### 3. Cek `EmbeddedQuiz` tidak perlu diubah

`embedded-quiz.tsx` sendiri TIDAK perlu diubah — dia sudah benar hanya merender kartu soal dan meneruskan event, logic "boleh lanjut/submit" memang seharusnya di parent (`course-reader.tsx`) karena parent yang tahu semua soal + kapan submit terjadi.

---

## Sebelum melapor selesai

1. `pnpm tsc --noEmit`, `pnpm lint`, `pnpm build` bersih.
2. Uji manual: masuk LMS sebagai user (login), selesaikan semua bab, masuk tab Kuis, jawab SATU soal dengan pilihan SALAH — pastikan TIDAK bisa lanjut/submit tanpa jawaban benar dulu (soal itu tetap harus dicoba ulang sampai benar, sesuai perilaku `QuizQuestionCard` yang sudah ada, `disabled={benar}` mengunci pilihan setelah benar dipilih).
3. Uji skenario yang jadi laporan Alif secara spesifik: coba jawab semua soal, salah satu SENGAJA dibiarkan salah (jangan klik ulang), coba klik "lanjut" di soal terakhir — pastikan MUNCUL pesan "belum semua benar" + tombol "Ulangi Ujian", BUKAN langsung tombol "Dapatkan Sertifikat".
4. Klik "Ulangi Ujian" — pastikan kuis kembali ke soal nomor 1 dengan semua jawaban kosong, TAPI progres bab materi (checklist bab di sidebar) TETAP hijau/selesai, tidak ikut ter-reset.
5. Jawab ulang semua soal dengan benar — pastikan tombol "Dapatkan Sertifikat" baru muncul setelah SEMUA jawaban benar, dan alur klaim sertifikat (F03.4, tidak berubah) tetap jalan seperti sebelumnya.
6. Uji juga `/kuis` (linear, standalone) tetap berjalan seperti sebelumnya — TIDAK boleh ada regresi di sana karena `QuizQuestionCard` dipakai bersama.
7. Diuji di viewport 375px.
8. Laporkan ke Alif dengan langkah reproduksi yang dipakai untuk verifikasi (jawab 1 soal salah tanpa retry → cek tombol yang muncul).
9. Sesuai `CLAUDE.md` (Urutan kerja wajib, butir 6): **JANGAN tandai F10.3 DONE di `feature-registry.md` sampai Alif eksplisit mengonfirmasi sudah menguji sendiri di browser.** Begitu dikonfirmasi, update baris F10.3 — status DONE, kolom Berkas diisi file yang benar-benar diubah, kolom Diuji/Bukti diisi ringkasan hasil uji Alif.
